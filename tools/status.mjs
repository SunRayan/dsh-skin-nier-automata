#!/usr/bin/env node
/**
 * 一行命令看清「现在到底是什么情况」——只读，不动任何文件。
 *
 * 解决的问题：这个工程的状态分散在四处（源码产物、令牌门禁、profile 清单、
 * 已装副本），每次交接都要手工比对一遍，还容易漏掉「已装副本是旧的」这种
 * 静默问题（pnpm 不会提示）。这个脚本把它们收拢成一张表 + 一个结论。
 *
 * 用法：
 *   node tools/status.mjs                 # 默认 desktop profile
 *   node tools/status.mjs --profile web
 *   node tools/status.mjs --json          # 机器可读，便于挂到别的脚本里
 *
 * 退出码：0 = 一切正常；1 = 有需要处理的问题（看最后的「结论」）。
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const NAME = manifest.name;
const VERSION = manifest.version;

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const value = (n, fb) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fb;
};

const PROFILE = value("profile", "desktop");
const JSON_OUT = flag("json");
const DSH_HOME = process.env.DSH_HOME ?? join(homedir(), ".dsh");
const PROFILE_DIR = join(DSH_HOME, "profiles", PROFILE);
const INSTALLED = join(PROFILE_DIR, "node_modules", NAME);
const VENDOR_TGZ = join(PROFILE_DIR, "vendor", `${NAME}-${VERSION}.tgz`);
const TARBALL = join(ROOT, `${NAME}-${VERSION}.tgz`);
const BUDGET_KB = 600;

const tty = process.stdout.isTTY && !JSON_OUT;
const paint = (c) => (s) => (tty ? `\u001b[${c}m${s}\u001b[0m` : s);
const dim = paint("2");
const bold = paint("1");
const green = paint("32");
const red = paint("31");
const yellow = paint("33");

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const kb = (bytes) => Math.round(bytes / 1024);
const lstatSafe = (p) => {
  try {
    return lstatSync(p);
  } catch {
    return undefined;
  }
};

const problems = [];
const notes = [];

// ---------------------------------------------------------------- 1. 源码

const clientPath = join(ROOT, "lib", "client.js");
const src = {
  version: VERSION,
  clientBytes: existsSync(clientPath) ? statSync(clientPath).size : 0,
  tarballBytes: existsSync(TARBALL) ? statSync(TARBALL).size : 0,
  tarballMtime: existsSync(TARBALL) ? statSync(TARBALL).mtime.toISOString() : null,
  clientMtime: existsSync(clientPath) ? statSync(clientPath).mtime.toISOString() : null,
};
if (!src.clientBytes) problems.push("lib/client.js 不存在 → 跑 node tools/install.mjs 或 python tools/build-client.py");
if (!src.tarballBytes) problems.push(`${NAME}-${VERSION}.tgz 不存在 → 跑 npm pack`);

// 产物比源模板旧 → 忘了构建
const templatePath = join(ROOT, "src", "client.template.js");
if (existsSync(templatePath) && src.clientMtime) {
  if (statSync(templatePath).mtimeMs > statSync(clientPath).mtimeMs + 1000) {
    problems.push("src/client.template.js 比 lib/client.js 新 → 改了模板但没重新构建");
  }
}
// tgz 比产物旧 → 忘了打包
if (src.tarballBytes && src.clientMtime) {
  if (statSync(clientPath).mtimeMs > statSync(TARBALL).mtimeMs + 1000) {
    problems.push("lib/client.js 比 .tgz 新 → 忘了 npm pack");
  }
}

// ---------------------------------------------------------------- 2. 门禁

let gate;
if (existsSync(join(ROOT, "tools", "verify-tokens.mjs")) && src.clientBytes) {
  const r = spawnSync("node", ["tools/verify-tokens.mjs"], { cwd: ROOT, encoding: "utf8", shell: true });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const pick = (key) => {
    const m = out.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : undefined;
  };
  gate = {
    pass: r.status === 0,
    overrides: pick("skin overrides"),
    uncovered: pick("uncovered"),
    unknown: pick("unknown to platform"),
  };
  if (!gate.pass) problems.push("令牌门禁未通过 → 只允许覆盖既有 --dsw-* 令牌，不能新增 key");
  const check = spawnSync("node", ["--check", "lib/client.js"], { cwd: ROOT, encoding: "utf8", shell: true });
  gate.syntax = check.status === 0;
  if (!gate.syntax) problems.push("lib/client.js 语法错误 → node --check 看具体行");
}

// ---------------------------------------------------------------- 3. profile 清单

const profileManifestPath = join(PROFILE_DIR, "package.json");
const profile = { exists: existsSync(profileManifestPath), dependency: null, inBundles: false };
if (profile.exists) {
  const p = JSON.parse(readFileSync(profileManifestPath, "utf8"));
  profile.dependency = p.dependencies?.[NAME] ?? null;
  profile.inBundles = (p.dsh?.profile?.bundles ?? []).includes(NAME);
  if (!profile.dependency) problems.push(`profile ${PROFILE} 的 dependencies 里没有 ${NAME} → 重跑 node tools/install.mjs`);
  else if (!profile.inBundles) problems.push(`依赖在，但 dsh.profile.bundles 没登记 → 插件不会被加载，重跑安装脚本`);
} else {
  problems.push(`profile ${PROFILE} 不存在：${PROFILE_DIR} → 先启动一次 DSH 让它初始化`);
}

// lockfile 与 package.json 是否对得上。
// 对不上时 pnpm 会以 ERR_PNPM_OUTDATED_LOCKFILE 让**整个** profile 装不动，
// 而离线安装可以自己把这条记录补齐 —— 所以这里只报不修，给出明确动作。
//
// 注意：这里必须**真的解析**这个文件，不能只 grep 包名。install.mjs 是前插写入，
// 升级后 lockfile 里会同时留着新旧两套记录；YAML 对重复键取最后一个，于是 pnpm
// 仍在解析旧版本，而 grep 照样命中、pnpm install 也不报错。实测踩过这个坑。
const lockPath = join(PROFILE_DIR, "pnpm-lock.yaml");
const lock = { exists: existsSync(lockPath), parsed: false, hasEntry: false, stale: [] };
if (lock.exists) {
  const jar = (s) => String(s).split(/[\\/]/).pop();
  const wantJar = profile.dependency ? jar(profile.dependency) : null;
  let doc = null;
  try {
    const req = createRequire(join(PROFILE_DIR, "package.json"));
    doc = req("js-yaml").load(readFileSync(lockPath, "utf8"));
    lock.parsed = true;
  } catch (e) {
    lock.error = e.message.split("\n")[0];
  }
  if (doc) {
    const entry = doc?.importers?.["."]?.dependencies?.[NAME];
    lock.hasEntry = Boolean(entry);
    if (wantJar && entry && jar(entry.specifier) !== wantJar) {
      lock.stale.push(`importer 指向 ${jar(entry.specifier)}，package.json 要 ${wantJar}`);
    }
    for (const section of ["packages", "snapshots"]) {
      const recs = Object.keys(doc?.[section] ?? {}).filter((k) => k.startsWith(`${NAME}@file:`));
      const wrong = recs.filter((k) => wantJar && jar(k) !== wantJar);
      if (wrong.length) lock.stale.push(`${section} 里有旧记录 ${wrong.map(jar).join(", ")}`);
      if (recs.length - wrong.length !== 1) {
        lock.stale.push(`${section} 里本包记录 ${recs.length - wrong.length} 条，应为 1 条`);
      }
    }
  }
  if (lock.error) {
    problems.push(`lockfile 解析失败（${lock.error}）→ 多半是重复键，跑 python tools/fix-lock.py`);
  } else if (profile.dependency && !lock.hasEntry) {
    problems.push("lockfile 里没有本包记录（package.json 与 lock 脱钩）→ 重跑安装脚本，它会自动补齐");
  } else if (lock.stale.length) {
    problems.push(`lockfile 有陈旧记录：${lock.stale.join("；")} → 跑 python tools/fix-lock.py`);
  }
}

// ---------------------------------------------------------------- 4. 已装副本
const installed = { path: INSTALLED, exists: false, symlink: false, symlinkTarget: null, files: [], stale: [] };
const installedStat = lstatSafe(INSTALLED);
if (installedStat) {
  installed.exists = true;
  installed.symlink = installedStat.isSymbolicLink();
  if (installed.symlink) {
    // 悬空软链是「装过但主题消失」的经典症状
    try {
      installed.symlinkTarget = realpathSync(INSTALLED);
    } catch {
      installed.symlinkTarget = null;
      problems.push(`node_modules/${NAME} 是悬空软链（源目录被移动过）→ 重跑 node tools/install.mjs`);
    }
  }
  // 把 package.json#files 展开成具体文件：`lib` 是**目录**，只查它存不存在
  // 等于没查 —— 之前正是这样漏掉了 lib/client.js（皮肤的全部样式都在里面）。
  const walk = (rel) => {
    const abs = join(INSTALLED, rel);
    if (!existsSync(abs)) return [{ rel, state: "missing" }];
    if (!statSync(abs).isDirectory()) {
      const same = sha256(abs) === sha256(join(ROOT, rel));
      return [{ rel, state: same ? "same" : "stale" }];
    }
    return readdirSync(abs)
      .sort()
      .flatMap((child) => walk(`${rel}/${child}`));
  };

  for (const rel of manifest.files ?? []) {
    for (const f of walk(rel)) {
      installed.files.push(f);
      if (f.state !== "same") installed.stale.push(f.rel);
    }
  }
  if (installed.stale.length) {
    problems.push(`已装副本有 ${installed.stale.length} 个文件与源不一致（${installed.stale.join(", ")}）→ 重跑安装脚本`);
  }
} else {
  problems.push(`node_modules/${NAME} 不存在 → 没装，或 link 的源目录被移动过（reconcile 清掉了）`);
}

// ---------------------------------------------------------------- 5. vendor

const vendor = { path: VENDOR_TGZ, exists: existsSync(VENDOR_TGZ), sameAsSource: false };
if (vendor.exists && src.tarballBytes) {
  vendor.sameAsSource = sha256(VENDOR_TGZ) === sha256(TARBALL);
  if (!vendor.sameAsSource) problems.push("profile/vendor 里的 tgz 与工程里的 tgz 不一致 → 重跑安装脚本");
}

// ---------------------------------------------------------------- 6. bundle 契约
//
// 「已装好」不等于「会被加载」。DSH 只认这三处：
//   package.json#dsh.bundle.patch 指向的补丁文件要存在，
//   补丁里的 insert.name 要等于包名（客户端模块按**包名**解析，不是路径），
//   package.json#dsh.client 要声明注入目标。
// 这里只读文件、不跑 pnpm —— `dsh plugin` 会把参数转发给 pnpm，
// 一跑就可能去拉别的插件的 GitHub latest，反而制造不稳定。

const bundle = { patch: null, patchExists: false, insertName: null, nameMatches: false, inject: null };
if (installed.exists) {
  const installedManifestPath = join(INSTALLED, "package.json");
  if (existsSync(installedManifestPath)) {
    let im = null;
    try {
      im = JSON.parse(readFileSync(installedManifestPath, "utf8"));
    } catch {
      problems.push("已装副本的 package.json 无法解析 → 重装");
    }
    if (im) {
      bundle.patch = im.dsh?.bundle?.patch ?? null;
      bundle.inject = im.dsh?.client?.inject ?? null;
      if (!bundle.patch) {
        problems.push("已装副本的 package.json 缺 dsh.bundle.patch → 不会被当作 bundle 加载");
      } else {
        const patchPath = join(INSTALLED, bundle.patch);
        bundle.patchExists = existsSync(patchPath);
        if (!bundle.patchExists) {
          problems.push(`dsh.bundle.patch 指向的 ${bundle.patch} 不存在 → 插件不会加载`);
        } else {
          const m = readFileSync(patchPath, "utf8").match(/name:\s*'([^']+)'/);
          bundle.insertName = m ? m[1] : null;
          bundle.nameMatches = bundle.insertName === NAME;
          if (!bundle.nameMatches) {
            problems.push(
              `cordis.patch.yml 的 insert.name (${bundle.insertName ?? "未找到"}) ≠ 包名 ${NAME} → 客户端模块解析不到`,
            );
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------- 输出

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      { name: NAME, profileName: PROFILE, src, gate, profile, lock, installed, bundle, vendor, problems, notes },
      null,
      2,
    ),
  );
  process.exit(problems.length ? 1 : 0);
}

console.log(`${bold(NAME)} ${dim(`v${VERSION}`)}  ·  profile ${bold(PROFILE)}`);
console.log(dim(`  工程  ${ROOT}`));
console.log(dim(`  已装  ${INSTALLED}`));

const line = (label, valueText, mark) => {
  const m = mark === "ok" ? green("OK  ") : mark === "bad" ? red("FAIL") : dim("·   ");
  console.log(`  ${m} ${label.padEnd(22)} ${valueText}`);
};

console.log(`\n${bold("源码产物")}`);
if (src.clientBytes) {
  const pct = Math.round((kb(src.clientBytes) / BUDGET_KB) * 100);
  line("lib/client.js", `${kb(src.clientBytes)} KB（预算 ${BUDGET_KB} KB，占 ${pct}%）`, pct > 100 ? "bad" : "ok");
}
if (src.tarballBytes) line(`${NAME}-${VERSION}.tgz`, `${kb(src.tarballBytes)} KB`, "ok");

if (gate) {
  console.log(`\n${bold("构建门禁")}`);
  line("令牌覆盖", `${gate.overrides ?? "?"}  ${dim(`uncovered ${gate.uncovered ?? "?"} · unknown ${gate.unknown ?? "?"}`)}`, gate.pass ? "ok" : "bad");
  line("语法 node --check", gate.syntax ? "通过" : "失败", gate.syntax ? "ok" : "bad");
}

console.log(`\n${bold("profile 清单")}`);
line("dependencies", profile.dependency ?? dim("（无）"), profile.dependency ? "ok" : "bad");
line("dsh.profile.bundles", profile.inBundles ? "已登记" : "未登记", profile.inBundles ? "ok" : "bad");
const lockOk = lock.parsed && lock.hasEntry && lock.stale.length === 0;
line(
  "pnpm-lock.yaml",
  lock.error
    ? `解析失败：${lock.error}`
    : !lock.hasEntry
      ? "缺本包记录（与 dependencies 脱钩）"
      : lock.stale.length
        ? `陈旧：${lock.stale[0]}${lock.stale.length > 1 ? ` 等 ${lock.stale.length} 项` : ""}`
        : "已解析，记录与本包一致",
  lockOk ? "ok" : lock.exists && profile.dependency ? "bad" : "skip",
);

console.log(`\n${bold("bundle 契约")}`);
line("dsh.bundle.patch", bundle.patch ? `${bundle.patch}${bundle.patchExists ? "" : "（缺失）"}` : "未声明", bundle.patchExists ? "ok" : "bad");
line("insert.name = 包名", bundle.nameMatches ? bundle.insertName : `${bundle.insertName ?? "?"} ≠ ${NAME}`, bundle.nameMatches ? "ok" : "bad");
line("dsh.client.inject", Array.isArray(bundle.inject) ? bundle.inject.join(", ") : "未声明", Array.isArray(bundle.inject) && bundle.inject.length ? "ok" : "bad");

console.log(`\n${bold("已装副本")}`);
if (!installed.exists) {
  line("node_modules/" + NAME, "不存在", "bad");
} else {
  line("形态", installed.symlink ? `软链 → ${installed.symlinkTarget ?? "（悬空）"}` : "真目录", installed.symlink ? "bad" : "ok");
  for (const f of installed.files) {
    line(f.rel, f.state === "same" ? "与源一致" : "与源不一致", f.state === "same" ? "ok" : "bad");
  }
  line("vendor tgz", vendor.exists ? (vendor.sameAsSource ? "与工程一致" : "与工程不一致") : "不存在", vendor.exists && vendor.sameAsSource ? "ok" : "bad");
}

console.log(`\n${bold("结论")}`);
if (problems.length === 0) {
  console.log(`  ${green("一切正常")} ${dim("—— 重启 DSH 即可看到当前版本（bundles 只在启动时读取）")}`);
} else {
  for (const p of problems) console.log(`  ${red("·")} ${p}`);
  console.log(dim(`\n  一条命令修好：${relative(process.cwd(), join(ROOT, "tools", "install.mjs")) || "tools/install.mjs"}`));
}
process.exit(problems.length ? 1 : 0);
