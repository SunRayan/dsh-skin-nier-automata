#!/usr/bin/env node
/**
 * 一键安装 / 修复：构建 → 门禁 → 打包 → 装进 DSH profile → 校验。
 *
 * 为什么需要它：`dsh plugin add` 只负责把依赖写进 profile，**不会**替你构建、
 * 也不会在包内容变化时刷新已装副本。而 `link:` 安装一旦源目录被移动，
 * 下一次 pnpm 操作就会把依赖连同 `dsh.profile.bundles` 里的条目一起清掉
 * （reconcile 只保留「依赖存在且能解析到 dsh.bundle」的条目）——
 * 表现就是主题**静默消失**，没有任何报错。这个脚本把这条链路补全，
 * 并且可以在任何时候重跑：它是幂等的。
 *
 * 用法：
 *   node tools/install.mjs                 # 默认：打包后装进 desktop profile（推荐）
 *   node tools/install.mjs --link          # 开发模式：符号链接到源码目录，改完只需 build + 刷新
 *   node tools/install.mjs --no-build      # 跳过构建/打包，用现有的 .tgz
 *   node tools/install.mjs --profile web   # 装进别的 profile
 *   node tools/install.mjs --dry-run       # 只打印计划，不动磁盘
 *   node tools/install.mjs --force         # 装完强制 `dsh plugin install --force`
 *   node tools/install.mjs --pnpm          # 强制走官方 dsh plugin add（默认走离线安装：不联网、约 3 秒）
 *   node tools/install.mjs --dsh <路径>    # 手动指定 dsh.cmd
 *
 * 退出码：0 = 装好且校验通过；1 = 任一步失败（失败即停，不静默继续）。
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const NAME = manifest.name;
const VERSION = manifest.version;

// ---------------------------------------------------------------- 参数

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const PROFILE = value("profile", "desktop");
const LINK = flag("link");
const NO_BUILD = flag("no-build");
const DRY = flag("dry-run");
const FORCE = flag("force");
// --pnpm：强制走官方 `dsh plugin add` 路径（慢、要联网）。默认在条件满足时走快速刷新。
const USE_PNPM = flag("pnpm");

// ---------------------------------------------------------------- 输出

const tty = process.stdout.isTTY;
const paint = (code) => (s) => (tty ? `\u001b[${code}m${s}\u001b[0m` : s);
const dim = paint("2");
const bold = paint("1");
const red = paint("31");
const green = paint("32");
const yellow = paint("33");

let step = 0;
const total = NO_BUILD ? 3 : 6;

function head(title) {
  step += 1;
  console.log(`\n${bold(`[${step}/${total}]`)} ${title}`);
}
function ok(msg) {
  console.log(`      ${green("OK")} ${msg}`);
}
function info(msg) {
  console.log(`      ${dim(msg)}`);
}
function warn(msg) {
  console.log(`      ${yellow("!")} ${msg}`);
}
function die(msg, hint) {
  console.error(`\n${red("安装失败")} ${msg}`);
  if (hint) console.error(dim(`  ${hint}`));
  process.exit(1);
}

// ---------------------------------------------------------------- 命令执行

/** 用一条命令行跑子进程（Windows 上 .cmd 必须走 shell，路径带空格要自己加引号）。 */
function run(command, args, { capture = false, env = {}, cwd = ROOT } = {}) {
  const quote = (s) => (/[\s"]/.test(s) ? `"${s.replaceAll('"', '\\"')}"` : s);
  const line = [quote(command), ...args.map(quote)].join(" ");
  const result = spawnSync(line, {
    cwd,
    shell: true,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    env: { ...process.env, ...env },
  });
  return {
    code: result.status ?? 1,
    out: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim(),
  };
}

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// ---------------------------------------------------------------- 环境探测

const DSH_HOME = process.env.DSH_HOME ?? join(homedir(), ".dsh");
const PROFILE_DIR = join(DSH_HOME, "profiles", PROFILE);

/** 定位 dsh CLI：环境变量 → PATH → 桌面版安装目录（按常见顺序）。 */
function findDsh() {
  const exe = process.platform === "win32" ? "dsh.cmd" : "dsh";
  const roots = [
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Programs", "DeepSeek Harness"),
    process.env.ProgramFiles && join(process.env.ProgramFiles, "DeepSeek Harness"),
    "/Applications/DeepSeek Harness.app/Contents/Resources",
  ].filter(Boolean);
  const candidates = [
    value("dsh"),
    process.env.DSH_CLI,
    "dsh",
    ...roots.flatMap((root) => [
      join(root, "resources", "runtime", "cli", "bin", exe),
      join(root, "resources", "app", "runtime", "cli", "bin", exe),
      join(root, "runtime", "cli", "bin", exe),
    ]),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate !== "dsh" && !existsSync(candidate)) continue;
    const probe = run(candidate, ["--version"], { capture: true });
    if (probe.code === 0) return { path: candidate, version: probe.out.split("\n").pop().trim() };
  }
  return undefined;
}

/** 定位带 Pillow 的 python：DSH 运行时自带的那个永远优先。 */
function findPython() {
  const candidates = [
    process.env.DSH_PYTHON,
    join(DSH_HOME, "dsh-runtimes", "dsh-primary-runtime", "dependencies", "python", "python.exe"),
    "python",
    "py",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate !== "python" && candidate !== "py" && !existsSync(candidate)) continue;
    const probe = run(candidate, ["-c", "import PIL"], { capture: true });
    if (probe.code === 0) {
      const version = run(candidate, ["--version"], { capture: true }).out;
      return { path: candidate, version };
    }
  }
  return undefined;
}

// ---------------------------------------------------------------- 主流程

console.log(`${bold("dsh-skin-nier-automata")} ${dim(`v${VERSION}`)}  →  profile ${bold(PROFILE)}`);
info(`源目录   ${ROOT}`);
info(`profile  ${PROFILE_DIR}`);
info(`安装方式 ${LINK ? "link（符号链接，开发用）" : "tgz（拷贝到 profile/vendor，推荐）"}`);
if (DRY) warn("dry-run：只打印计划，不执行");

if (!existsSync(join(PROFILE_DIR, "package.json"))) {
  die(`profile ${PROFILE} 不存在：${PROFILE_DIR}`, "先启动一次 DeepSeek Harness 让它初始化 profile，再完全退出。");
}

// 1. 定位 dsh CLI
head("定位 dsh CLI");
const dsh = findDsh();
if (!dsh) die("找不到 dsh 命令", "用 --dsh 指定，或设置环境变量 DSH_CLI 指向 dsh.cmd。");
ok(`${dsh.path}  ${dim(dsh.version)}`);

// 2. 定位 python（仅构建需要）
let python;
if (!NO_BUILD) {
  head("定位 python（构建需要 Pillow）");
  python = findPython();
  if (!python) {
    die(
      "找不到带 Pillow 的 python",
      "用环境变量 DSH_PYTHON 指定；或加 --no-build 直接使用现有的 lib/client.js 与 .tgz。",
    );
  }
  ok(`${python.path}  ${dim(python.version)}`);
}

// 3. 构建 + 门禁
if (!NO_BUILD) {
  head("构建客户端 + 令牌门禁");
  if (DRY) {
    info(`将执行：${python.path} tools/build-client.py`);
  } else {
    const built = run(python.path, ["tools/build-client.py"]);
    if (built.code !== 0) die("构建失败（tools/build-client.py）", "看上面的 python 报错；缺 Pillow 就用 DSH 运行时的 python。");
    ok("lib/client.js 已重建");

    const gate = run("node", ["tools/verify-tokens.mjs"], { capture: true });
    if (gate.code !== 0) {
      die("令牌门禁未通过", "只允许覆盖平台既有的 --dsw-* 令牌；新增 UI 走自注入样式。");
    }
    // 门禁输出形如「uncovered: 0 []」——把两行关键结论带出来
    for (const line of gate.out.split("\n")) {
      if (/^(uncovered|unknown to platform|declared tokens)/.test(line.trim())) info(line.trim());
    }
    ok("89/89 令牌全部覆盖，0 未知");

    const syntax = run("node", ["--check", "lib/client.js"], { capture: true });
    if (syntax.code !== 0) die("lib/client.js 语法错误", syntax.out);
    ok("语法校验通过");
  }
}

// 4. 打包
const tarball = join(ROOT, `${NAME}-${VERSION}.tgz`);
if (!NO_BUILD) {
  head("打包");
  if (DRY) {
    info(`将执行：npm pack → ${NAME}-${VERSION}.tgz`);
  } else {
    rmSync(tarball, { force: true });
    const packed = run("npm", ["pack"], { capture: true });
    if (packed.code !== 0) die("npm pack 失败", packed.out);
    if (!existsSync(tarball)) die(`没有生成 ${NAME}-${VERSION}.tgz`, packed.out);
    const kb = Math.round(statSync(tarball).size / 1024);
    ok(`${NAME}-${VERSION}.tgz  ${dim(`${kb} KB`)}`);
  }
} else {
  if (!existsSync(tarball)) die(`--no-build 但找不到 ${NAME}-${VERSION}.tgz`, "去掉 --no-build 重新构建。");
}

// 5. 安装
head("安装到 profile");

// 5a. 处理 node_modules 里的软链。三种情况都要先摘掉再装：
//   - 悬空（源目录被移动过）→ pnpm 可能直接报错而不是覆盖；
//   - 指向旧位置（换了目录名）；
//   - 当前要用 tgz 装，但里面还是 link 模式的链（pnpm 认为依赖已满足，不会替换）。
// 不摘掉的话，最后会停在「manifest 写 file:，node_modules 却是软链」的错位状态。
const installedDir = join(PROFILE_DIR, "node_modules", NAME);
const installedStat = lstatSafe(installedDir);
if (installedStat?.isSymbolicLink()) {
  const target = safeRealpath(installedDir);
  const stale = !target;
  const wrongTarget = Boolean(target) && (!LINK || resolve(target) !== resolve(ROOT));
  if (stale || wrongTarget) {
    if (!DRY) rmSync(installedDir, { force: true, recursive: true });
    warn(stale ? `清掉悬空软链 node_modules/${NAME}` : `清掉软链（指向 ${target}）`);
  }
}

// 5b. 决定安装 spec
let spec;
if (LINK) {
  spec = `link:${ROOT}`;
  info(`spec: ${spec}`);
} else {
  const vendorDir = join(PROFILE_DIR, "vendor");
  const vendorTgz = join(vendorDir, `${NAME}-${VERSION}.tgz`);
  info(`spec: file:${vendorTgz}`);
  if (!DRY) {
    // vendor 里只留当前版本，避免旧 tgz 堆积
    if (existsSync(vendorDir)) {
      for (const file of readdirSync(vendorDir)) {
        if (file.startsWith(`${NAME}-`) && file.endsWith(".tgz") && file !== `${NAME}-${VERSION}.tgz`) {
          rmSync(join(vendorDir, file), { force: true });
        }
      }
    }
    mkdirp(vendorDir);
    copyFileSync(tarball, vendorTgz);
    ok("已拷贝到 profile/vendor（安装路径与源码目录解耦）");
  }
  spec = `file:${vendorTgz}`;
}

if (DRY) {
  info(`将执行：dsh plugin --profile ${PROFILE} add ${spec}`);
} else {
  // ---------------------------------------------------------------- 离线安装
  // 为什么需要它：任何一次 `dsh plugin add/remove` 都会让 pnpm 重解析**整个**
  // profile 的依赖图。这个 profile 里 `dsh-purge-community` 依赖 GitHub Releases
  // 的 `latest` URL —— 上游一发新版本，lockfile 里钉的 integrity 就过期，
  // pnpm 会以 ERR_PNPM_TARBALL_INTEGRITY 反复重试（实测卡 4 分钟仍失败），
  // 于是「只想更新一个皮肤」变成整个 profile 都装不动。
  //
  // 而这个包是纯客户端插件、零依赖，profile 又是 `nodeLinker: hoisted`
  // （node_modules 是平铺的真目录，不是软链）。所以「装上 / 刷新」本来就只是
  // 四件纯本地的事：放 tarball、解包进 node_modules、写 profile 清单、补 lockfile。
  // 全程不碰依赖图，也就不碰网络。条件不满足时自动回退到官方路径。
  const fastDone = !LINK && !USE_PNPM && offlineInstall();
  if (!fastDone) {
    // 走到这里说明离线路径用不了（首次安装 / 软链状态 / lock 结构不认识），
    // 必须让 pnpm 重解析。但 pnpm 可能因为**别的**插件取包失败而中途退出，
    // 那时 profile 会停在「依赖已删、新包没装上」—— 皮肤就此消失（实测踩过）。
    // 所以先把三样东西拍快照，失败就原样回滚。
    const existing = join(PROFILE_DIR, "node_modules", NAME);
    const manifestPath = join(PROFILE_DIR, "package.json");
    const lockPath = join(PROFILE_DIR, "pnpm-lock.yaml");
    const snap = {
      manifest: existsSync(manifestPath) ? readFileSync(manifestPath) : null,
      lock: existsSync(lockPath) ? readFileSync(lockPath) : null,
      pkg: null,
    };
    if (!LINK && existsSync(existing)) {
      snap.pkg = `${existing}.__rollback`;
      rmSync(snap.pkg, { recursive: true, force: true });
      try {
        renameSync(existing, snap.pkg);
      } catch {
        snap.pkg = null; // 被占用就不备份，保持原样
      }
    }
    const rollback = (why) => {
      if (snap.manifest) writeFileSync(manifestPath, snap.manifest);
      if (snap.lock) writeFileSync(lockPath, snap.lock);
      if (snap.pkg) {
        rmSync(existing, { recursive: true, force: true });
        try {
          renameSync(snap.pkg, existing);
        } catch {
          /* 还不了就只能提示用户重跑 */
        }
      }
      die(why, "已回滚到安装前的状态（皮肤没有被这次失败带走）。");
    };

    // pnpm 对「同一个 file: spec + 同一个版本号」会直接 `Already up to date` 跳过，
    // 即使 tarball 内容已经变了（`--force` 也一样，它只重装不重解析）。
    // 唯一可靠的做法是先 remove 再 add —— 这样 spec 会被重新解析。
    if (!LINK && snap.manifest) {
      const wasInstalled = JSON.parse(snap.manifest.toString("utf8")).dependencies?.[NAME];
      if (wasInstalled) run(dsh.path, ["plugin", "--profile", PROFILE, "remove", NAME]);
    }

    const added = run(dsh.path, ["plugin", "--profile", PROFILE, "add", spec]);
    if (added.code !== 0) {
      rollback(
        "dsh plugin add 失败\n" +
          "     常见原因：profile 正被运行中的应用占用（先完全退出 DSH），或 pnpm 不在 PATH。\n" +
          "     若报 ERR_PNPM_TARBALL_INTEGRITY / fetch failed，是 profile 里别的插件（如 dsh-purge-community）\n" +
          "     依赖了 GitHub 的 latest URL 且上游已更新 —— 见 INSTALL.md「诊断」一节。",
      );
    }
    if (snap.pkg) rmSync(snap.pkg, { recursive: true, force: true });
    ok("依赖已写入 profile/package.json 并完成 pnpm 安装");

    // pnpm 有时会沿用上一次 `--link` 的解析结果（lockfile 里 specifier 是 file:、
    // version 却是 link:），装完 node_modules 里仍是一个软链。再走一次 remove + add
    // 让它彻底重解析 —— 否则会停在「manifest 写 file:、实际却是软链」的错位状态。
    if (!LINK && lstatSafe(join(PROFILE_DIR, "node_modules", NAME))?.isSymbolicLink()) {
      warn("pnpm 沿用了旧的 link 解析，remove 后重新 add…");
      run(dsh.path, ["plugin", "--profile", PROFILE, "remove", NAME]);
      const retried = run(dsh.path, ["plugin", "--profile", PROFILE, "add", spec]);
      if (retried.code !== 0) die("重新安装失败（remove + add）");
      ok("已按 file: 重新解析安装");
    }

    if (FORCE) {
      info("--force：强制重装 profile 依赖…");
      const forced = run(dsh.path, ["plugin", "--profile", PROFILE, "install", "--force"]);
      if (forced.code !== 0) die("强制重装失败（dsh plugin install --force）");
      ok("已强制重装");
    }
  }
}

// 6. 校验
head("校验安装结果");
if (DRY) {
  info("dry-run 跳过校验");
  console.log(`\n${green("计划可执行。")} 去掉 --dry-run 即真正安装。\n`);
  process.exit(0);
}

let failures = [];

const profileManifest = JSON.parse(readFileSync(join(PROFILE_DIR, "package.json"), "utf8"));
const dependency = profileManifest.dependencies?.[NAME];
const bundles = profileManifest.dsh?.profile?.bundles ?? [];

if (!dependency) failures.push(`profile/package.json 的 dependencies 里没有 ${NAME}`);

// dsh CLI 的 reconcile 会自动登记 bundle；万一没有（旧版 CLI / 手工 pnpm），这里补上。
if (!bundles.includes(NAME)) {
  const next = {
    ...profileManifest,
    dsh: {
      ...profileManifest.dsh,
      profile: { ...profileManifest.dsh?.profile, bundles: [...bundles, NAME] },
    },
  };
  writeFileSync(join(PROFILE_DIR, "package.json"), `${JSON.stringify(next, undefined, 2)}\n`);
  warn(`dsh.profile.bundles 缺 ${NAME}，已补登记`);
} else {
  ok(`dsh.profile.bundles 已包含 ${NAME}`);
}

const target = join(PROFILE_DIR, "node_modules", NAME);
if (!existsSync(join(target, "package.json"))) {
  failures.push(`node_modules/${NAME} 不存在或不完整`);
} else {
  const installedVersion = JSON.parse(readFileSync(join(target, "package.json"), "utf8")).version;
  if (installedVersion !== VERSION) {
    failures.push(`已装版本 ${installedVersion} ≠ 源版本 ${VERSION}`);
  } else {
    ok(`已装版本 ${installedVersion}`);
  }

  // 内容一致性：逐个比对 package.json#files 声明的产物。
  if (!LINK) {
    const diff = compareShipped(target);
    if (diff.length === 0) {
      const size = Math.round(statSync(join(target, "lib", "client.js")).size / 1024);
      ok(`已装副本与源逐文件一致（lib/client.js ${size} KB）`);
    } else {
      for (const line of diff) failures.push(`已装副本与源不一致：${line}`);
    }
  }

  if (!existsSync(join(target, "cordis.patch.yml"))) failures.push("已装副本缺 cordis.patch.yml");
}
// 软链状态检查：这是「装过但主题消失」和「换了安装方式却还指着旧目录」的根源
if (lstatSafe(target)?.isSymbolicLink()) {
  const real = safeRealpath(target);
  if (!LINK) {
    failures.push(`node_modules/${NAME} 仍是软链（→ ${real ?? "目标已失效"}），与 file: 安装不一致`);
  } else if (!real) {
    failures.push(`node_modules/${NAME} 是悬空软链，源目录已移动`);
  }
}

if (failures.length > 0) {
  console.error(`\n${red("校验未通过：")}`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(dim(`\n修复建议：node tools/install.mjs${FORCE ? "" : " --force"}`));
  process.exit(1);
}

console.log(`\n${green(bold("装好了。"))}`);
console.log(`  插件 id    ${NAME}`);
console.log(`  客户端产物 /plugins/${NAME}/client.js`);
console.log(`  ${yellow("下一步")}    完全退出并重新打开 DeepSeek Harness（bundles 在启动时读取）`);
if (LINK) {
  console.log(dim("  link 模式  改完 src/ 后只需重跑构建再刷新页面；只有移动了项目目录才需要重跑本脚本。"));
}
console.log("");

// ---------------------------------------------------------------- 小工具

function lstatSafe(path) {
  try {
    return lstatSync(path);
  } catch {
    return undefined;
  }
}

function safeRealpath(path) {
  try {
    return realpathSync(path);
  } catch {
    return undefined;
  }
}

/** package.json#files 声明的产物清单（相对路径，含 package.json 本身）。 */
function shippedFiles() {
  const out = new Set(["package.json"]);
  const walk = (rel) => {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return;
    if (statSync(abs).isDirectory()) {
      for (const child of readdirSync(abs)) walk(`${rel}/${child}`);
    } else {
      out.add(rel);
    }
  };
  for (const entry of manifest.files ?? []) walk(entry);
  return [...out];
}

/** 逐文件比对已装副本与源，返回差异描述列表（空数组 = 完全一致）。 */
function compareShipped(dir) {
  const diffs = [];
  for (const rel of shippedFiles()) {
    const installed = join(dir, rel);
    const source = join(ROOT, rel);
    if (!existsSync(installed)) {
      diffs.push(`缺 ${rel}`);
    } else if (!existsSync(source)) {
      diffs.push(`源缺 ${rel}`);
    } else if (sha256(installed) !== sha256(source)) {
      diffs.push(`内容不同 ${rel}`);
    }
  }
  return diffs;
}

function mkdirp(dir) {
  mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------- 离线安装

/** 正则转义。用 function 声明而不是 const，这样在主流程调用时已经可用。 */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * pnpm 为 `file:` tarball 记录的 integrity 就是**该 tarball 字节的 sha512**。
 * （已用 profile 里现成的 `dsh-our-free-model` 条目核对过：逐字节吻合。）
 */
function tarballIntegrity(file) {
  return `sha512-${createHash("sha512").update(readFileSync(file)).digest("base64")}`;
}

/**
 * 在 lockfile 里补齐本包的三条记录（importer / packages / snapshots）。
 *
 * 形状照 profile 里已有的 `dsh-our-free-model` 逐字符对齐：本包零依赖，
 * `file:` 依赖在 lockfile 里就是固定的三行。
 * 不补的话 profile/package.json 会与 lockfile 脱钩 —— 下次任何人跑
 * `pnpm install --frozen-lockfile` 都会 ERR_PNPM_OUTDATED_LOCKFILE 整体失败。
 *
 * 返回 false 表示结构不认识（已跳过写入，不影响运行，下次 pnpm 会自己补）。
 */
function patchLockfile(lockPath, vendorTgz) {
  const original = readFileSync(lockPath, "utf8");
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const rel = `vendor/${NAME}-${VERSION}.tgz`;
  const key = `${NAME}@file:${rel}`;
  const digest = tarballIntegrity(vendorTgz);

  // 情况 A：已有记录 —— 只改 integrity，其它字段原样保留
  const existing = new RegExp(
    `(${escapeRe(key)}:\\s*\\r?\\n\\s*resolution: \\{integrity: )(sha512-[^,]+)(, tarball: file:${escapeRe(rel)}\\})`,
  );
  if (existing.test(original)) {
    const next = original.replace(existing, `$1${digest}$3`);
    if (next !== original) writeFileSync(lockPath, next);
    return true;
  }

  // 情况 B：没有记录 —— 三处一起补。任何一处锚点找不到就整体放弃，交回 pnpm
  const absSpec = `file:${vendorTgz.replace(/\\/g, "/")}`;
  const importerBlock = [
    `      ${NAME}:`,
    `        specifier: ${absSpec}`,
    `        version: file:${rel}`,
    "",
  ].join(eol);
  const packageBlock = [
    `  ${key}:`,
    `    resolution: {integrity: ${digest}, tarball: file:${rel}}`,
    `    version: ${VERSION}`,
    "",
  ].join(eol);
  const snapshotBlock = [`  ${key}: {}`, ""].join(eol);

  let next = original;
  const anchors = [
    [/(\n  \.:\r?\n    dependencies:\r?\n)/, (m) => m + importerBlock],
    [/(\npackages:\r?\n)/, (m) => m + packageBlock],
    [/(\nsnapshots:\r?\n)/, (m) => m + snapshotBlock],
  ];
  for (const [re, build] of anchors) {
    if (!re.test(next)) return false;
    next = next.replace(re, build);
  }

  writeFileSync(lockPath, next);
  return true;
}

/**
 * 完全不经过 pnpm 的安装 / 刷新。
 *
 * 背景：这个 profile 里 `dsh-purge-community` 钉的是 GitHub Releases 的 `latest`
 * URL，上游一更新、或网络一抖，**任何**一次 pnpm 重解析都会整包失败；更糟的是
 * 失败发生在 `dsh plugin remove` 之后，等于把本来好用的皮肤一起删掉（实测踩过）。
 * 而本包零依赖、profile 又是 hoisted 平铺布局，所以「装上 / 刷新」本来就只是
 * 四件纯本地的事：放 tarball、解包进 node_modules、写 profile 清单、补 lockfile。
 *
 * 全程不联网、不碰依赖图。任何一步不成立就返回 false，由调用方回退官方路径。
 * 返回 true 之前一定做过逐文件比对（宁可慢，不可错）。
 */
function offlineInstall() {
  const vendorDir = join(PROFILE_DIR, "vendor");
  const vendorTgz = join(vendorDir, `${NAME}-${VERSION}.tgz`);
  const target = join(PROFILE_DIR, "node_modules", NAME);
  const lockPath = join(PROFILE_DIR, "pnpm-lock.yaml");
  const profileManifestPath = join(PROFILE_DIR, "package.json");
  const base = `${NAME}-${VERSION}.tgz`;

  let profileManifest = null;
  try {
    profileManifest = JSON.parse(readFileSync(profileManifestPath, "utf8"));
  } catch {
    /* 没有 profile 清单 = 环境不完整，交给官方路径去建 */
  }
  if (!profileManifest || !existsSync(lockPath)) return false;

  // 软链 = `--link` 安装留下的形态，交回官方路径纠正，别在这里混装
  const targetStat = lstatSafe(target);
  if (targetStat?.isSymbolicLink()) return false;

  // 内容与 tarball 都已经是最新的，就什么都不做（幂等，重跑不产生写入）
  if (
    targetStat &&
    compareShipped(target).length === 0 &&
    existsSync(vendorTgz) &&
    sha256(vendorTgz) === sha256(tarball)
  ) {
    info("已装副本与源一致，跳过刷新");
    return true;
  }

  // 1) 更新 vendor 里的 tgz
  mkdirp(vendorDir);
  copyFileSync(tarball, vendorTgz);
  info(`vendor 已更新 ${dim(`${Math.round(statSync(vendorTgz).size / 1024)} KB`)}`);

  // 2) 解包到暂存目录，复核通过后再整体换上（失败不会把已装目录搞成空的）
  //
  // 这里有两个只有 Windows 才会踩的坑，都必须绕开：
  //  a. GNU tar 把 `C:\...` 里的冒号当成远程主机（`host:path`），报
  //     `tar (child): Cannot connect to C: resolve failed`、退出码 2。
  //     解法不是加引号，而是把归档名降级成**裸文件名**、用 cwd 指到 vendor 目录，
  //     参数里就不再出现冒号；GNU tar 与 Windows 自带的 bsdtar 都认这条路径。
  //  b. MSYS 版 tar 会把路径里的 `\` 当转义符吃掉（`C:\Users` → `C:Users`），
  //     于是 `-C` 报 Cannot open。所以传给它的路径一律转成正斜杠。
  const staging = `${target}.__staging`;
  rmSync(staging, { recursive: true, force: true });
  mkdirp(staging);
  const extracted = run("tar", ["-xzf", base, "-C", staging.replace(/\\/g, "/"), "--strip-components=1"], {
    capture: true,
    cwd: vendorDir,
  });
  if (extracted.code !== 0) {
    rmSync(staging, { recursive: true, force: true });
    // 带上 stderr：上一次正是把它吞掉了，才排查了半天空目录
    warn(`解包失败（tar 退出码 ${extracted.code}），回退到 pnpm 安装`);
    if (extracted.out) warn(dim(extracted.out.split("\n").slice(0, 3).join(" / ")));
    return false;
  }

  // 3) 先在暂存目录上复核，不一致就丢掉暂存，已装副本原样不动
  const diff = compareShipped(staging);
  if (diff.length > 0) {
    rmSync(staging, { recursive: true, force: true });
    warn(`解包结果与源有 ${diff.length} 处差异，回退到 pnpm 安装`);
    warn(dim(diff.slice(0, 3).join(" / ")));
    return false;
  }

  // 4) 原子替换：删旧 → 换新。到这一步已经确定内容正确
  rmSync(target, { recursive: true, force: true });
  try {
    renameSync(staging, target);
  } catch {
    // 跨设备/占用时 rename 会失败，退化成拷贝
    mkdirp(target);
    for (const rel of shippedFiles()) {
      const dest = join(target, rel);
      mkdirp(dirname(dest));
      copyFileSync(join(staging, rel), dest);
    }
    rmSync(staging, { recursive: true, force: true });
  }

  // 5) 写 profile/package.json：依赖登记 + bundle 登记（reconcile 只认这两处）
  const bundles = profileManifest.dsh?.profile?.bundles ?? [];
  const nextManifest = {
    ...profileManifest,
    dependencies: {
      ...profileManifest.dependencies,
      [NAME]: `file:${vendorTgz.replace(/\\/g, "/")}`,
    },
    dsh: {
      ...profileManifest.dsh,
      profile: {
        ...profileManifest.dsh?.profile,
        bundles: bundles.includes(NAME) ? bundles : [...bundles, NAME],
      },
    },
  };
  writeFileSync(profileManifestPath, `${JSON.stringify(nextManifest, undefined, 2)}\n`);

  // 6) 补 lockfile，避免下次 pnpm 判定 lock 过期（失败也只是少一条记录，不影响运行）
  if (!patchLockfile(lockPath, vendorTgz)) {
    warn("lockfile 结构不认识，已跳过补写（不影响运行，下次 pnpm 会自己补）");
  }

  ok("已离线安装（未触发 pnpm、不联网、不碰依赖图）");
  return true;
}
