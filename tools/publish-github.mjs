#!/usr/bin/env node
/**
 * Publish this project to a new public GitHub repository using only the REST API.
 *
 * Why not `git push`: on the machine this was written for, `github.com` is
 * unreachable (the local proxy answers 502 and a direct connection times out),
 * while `api.github.com` and `codeload.github.com` work. The Git Data API is
 * reachable, so the whole publish — create repo, upload blobs, build a tree,
 * commit, create the branch, set topics — runs over api.github.com and never
 * touches the web host.
 *
 * Usage:
 *   node tools/publish-github.mjs --token-file <path> [--repo <name>] [--dry-run]
 *
 * The token file is read once and never written anywhere. Use a fine-grained
 * token with, on the target account, `Administration: write` (create the repo
 * and set topics) and `Contents: write` (push the commit). A classic token with
 * the single `repo` scope also works. Revoke it when you are done.
 *
 * The repository is created public, because the DSH marketplace entry has to
 * resolve to a publicly readable repo.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const API = "https://api.github.com";

// ---------------------------------------------------------------- arguments
function arg(name, fallback = null) {
    const i = process.argv.indexOf(`--${name}`);
    if (i === -1) return fallback;
    const next = process.argv[i + 1];
    return next && !next.startsWith("--") ? next : true;
}

const tokenFile = arg("token-file");
const dryRun = process.argv.includes("--dry-run");
if (!tokenFile && !dryRun) {
    console.error("usage: node tools/publish-github.mjs --token-file <path> [--repo <name>] [--dry-run]");
    process.exit(2);
}

const ROOT = resolve(import.meta.dirname, "..");

// ---------------------------------------------------------------- file set
// What stays out, and why. Only objective reasons — rights, privacy, build
// artifacts, transient scratch files — go on this list; anything that is merely
// "historical" is still published, because the previews document real decisions.
const EXCLUDE = [
    // Never redistribute SQUARE ENIX / PlatinumGames artwork. This is the whole
    // reason v2.0 exists, so the directory is excluded rather than trusted to
    // .gitignore alone.
    { dir: "assets", why: "third-party NieR artwork" },
    { dir: "node_modules", why: "dependencies" },
    { dir: ".git", why: "vcs metadata" },
    // Seven unreferenced screenshots of other people's DSH themes. Nothing in
    // the project links to them, so they would be published for no reason.
    { dir: "preview/community", why: "unreferenced third-party screenshots" },
    // Internal working notes. HANDOFF.md hard-codes C:/Users/<name>/... paths,
    // which would expose the local account name and directory layout.
    { file: "HANDOFF.md", why: "internal notes, contains local absolute paths" },
    // `_`-prefixed one-off scripts that edited the template in place. Kept
    // locally as a record of the edits; not part of the shipped toolchain.
    { glob: /^preview\/_patch_.*\.py$/, why: "one-off patch scripts" },
];

const SKIP_FILE = [/\.tgz$/i, /\.log$/i, /^\.DS_Store$/, /^Thumbs\.db$/];

function excluded(rel) {
    for (const rule of EXCLUDE) {
        if (rule.dir && (rel === rule.dir || rel.startsWith(rule.dir + "/"))) return rule;
        if (rule.file && rel === rule.file) return rule;
        if (rule.glob && rule.glob.test(rel)) return rule;
    }
    return null;
}

function collect(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        const rel = relative(ROOT, full).split(sep).join("/");
        // prune excluded directories before descending: walking node_modules
        // just to filter it afterwards is wasted work
        if (entry.isDirectory() && EXCLUDE.some((r) => r.dir && rel === r.dir)) continue;
        if (entry.isDirectory()) {
            collect(full, out);
        } else if (entry.isFile()) {
            if (SKIP_FILE.some((re) => re.test(entry.name))) continue;
            out.push(full);
        }
    }
    return out;
}

const all = collect(ROOT).sort();
const files = [];
const skipped = [];
for (const f of all) {
    const rel = relative(ROOT, f).split(sep).join("/");
    const rule = excluded(rel);
    if (rule) skipped.push({ rel, why: rule.why });
    else files.push(f);
}

const total = files.reduce((n, f) => n + statSync(f).size, 0);

console.log(`project : ${ROOT}`);
console.log(`files   : ${files.length}  (${(total / 1024 / 1024).toFixed(2)} MB)`);
const byReason = new Map();
for (const s of skipped) byReason.set(s.why, (byReason.get(s.why) ?? 0) + 1);
// directories are pruned before the walk, so they never reach `skipped`
for (const rule of EXCLUDE) {
    if (rule.dir && existsSync(join(ROOT, rule.dir))) {
        byReason.set(rule.why, (byReason.get(rule.why) ?? 0) + 1);
    }
}
for (const [why, n] of byReason) console.log(`skipped : ${String(n).padStart(3)} × ${why}`);
if (dryRun) {
    for (const f of files) {
        const rel = relative(ROOT, f).split(sep).join("/");
        console.log(`  ${String(statSync(f).size).padStart(9)}  ${rel}`);
    }
    console.log("\n--dry-run: nothing sent");
    process.exit(0);
}

// ---------------------------------------------------------------- http
const token = readFileSync(resolve(tokenFile), "utf8").trim();
if (!token) {
    console.error("token file is empty");
    process.exit(2);
}

async function call(method, path, body) {
    const res = await fetch(API + path, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "dsh-skin-nier-automata-publisher",
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch { /* non-JSON error body */ }
    if (!res.ok) {
        const msg = json?.message ?? text.slice(0, 300);
        const err = new Error(`${method} ${path} -> ${res.status} ${msg}`);
        err.status = res.status;
        err.body = json;
        throw err;
    }
    return json;
}

// ---------------------------------------------------------------- 1. who am I
const me = await call("GET", "/user");
const owner = me.login;
const repoName = typeof arg("repo") === "string" ? arg("repo") : "dsh-skin-nier-automata";
console.log(`account : ${owner} (${me.name ?? "no display name"})`);
console.log(`repo    : ${owner}/${repoName}`);

// ---------------------------------------------------------------- 2. repo
// Keep package.json's `repository` in step with the repo we are about to
// create. A wrong URL is worse than a missing one, so this is written from the
// value GitHub just told us rather than guessed.
const pkgPath = join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const repoUrl = `https://github.com/${owner}/${repoName}`;
const hadRepo = JSON.stringify(pkg.repository ?? null);
pkg.repository = { type: "git", url: `git+${repoUrl}.git` };
if (pkg.author === "dsh-skin-nier-automata contributors") {
    pkg.author = me.name ? `${me.name} (${owner})` : owner;
}
{
    const { writeFileSync } = await import("node:fs");
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    if (hadRepo !== JSON.stringify(pkg.repository)) {
        console.log(`package.json: repository -> ${pkg.repository.url}`);
    }
    console.log(`package.json: author     -> ${pkg.author}`);
}

let created = false;
try {
    await call("POST", "/user/repos", {
        name: repoName,
        description:
            "A NieR-inspired theme for DeepSeek Harness — graphite palette, pure-CSS ruined skyline, no third-party artwork.",
        private: false,
        has_issues: true,
        has_wiki: false,
        has_projects: false,
        auto_init: false,
    });
    created = true;
    console.log("repo    : created (public)");
} catch (e) {
    if (e.status !== 422) throw e;
    console.log("repo    : already exists, pushing into it");
}

// ---------------------------------------------------------------- 3. blobs
// Sequential rather than parallel: 60 requests is quick enough, and a burst of
// concurrent writes is the usual cause of secondary rate limits.
const blobs = [];
for (const f of files) {
    const rel = relative(ROOT, f).split(sep).join("/");
    const content = readFileSync(f).toString("base64");
    const blob = await call("POST", `/repos/${owner}/${repoName}/git/blobs`, {
        content,
        encoding: "base64",
    });
    blobs.push({ path: rel, mode: "100644", type: "blob", sha: blob.sha });
    process.stdout.write(`\r  uploaded ${blobs.length}/${files.length}   `);
}
console.log();

// ---------------------------------------------------------------- 4. commit
const tree = await call("POST", `/repos/${owner}/${repoName}/git/trees`, {
    tree: blobs,
});

const message = [
    "v2.0.0 — zero-asset rebuild for marketplace submission",
    "",
    "The 1.1.0 bundle was 85% third-party NieR artwork (SQUARE ENIX /",
    "PlatinumGames) shipped under an MIT licence the project cannot grant.",
    "v2.0 ships no images at all: the scene is a CSS gradient plus a masked",
    "skyline, and both wallpaper slots take a picture the reader uploads",
    "themselves, kept in localStorage. Bundle 655 KB -> 91 KB.",
    "",
    "Also removed three controls that had no effect: the RUIN and SNOW",
    "presets (which destroyed the reader's wallpaper on click) and the dock's",
    "particle key.",
].join("\n");

const commit = await call("POST", `/repos/${owner}/${repoName}/git/commits`, {
    message,
    tree: tree.sha,
    parents: [],
});

// A brand-new empty repo has no ref to patch, so create it.
try {
    await call("POST", `/repos/${owner}/${repoName}/git/refs`, {
        ref: "refs/heads/main",
        sha: commit.sha,
    });
    console.log(`commit  : ${commit.sha.slice(0, 7)} -> refs/heads/main (created)`);
} catch (e) {
    if (e.status !== 422) throw e;
    await call("PATCH", `/repos/${owner}/${repoName}/git/refs/heads/main`, {
        sha: commit.sha,
        force: true,
    });
    console.log(`commit  : ${commit.sha.slice(0, 7)} -> refs/heads/main (updated)`);
}

// The marketplace CI checks for this topic, and the repo has to be at least a
// day old before an entry is accepted, so the clock starts now.
await call("PUT", `/repos/${owner}/${repoName}/topics`, {
    names: ["dsh-plugin", "dsh-theme", "theme", "deepseek-harness", "nier"],
});
console.log("topics  : dsh-plugin, dsh-theme, theme, deepseek-harness, nier");

// Default branch only matters if GitHub guessed a different one.
try {
    await call("PATCH", `/repos/${owner}/${repoName}`, { default_branch: "main" });
} catch { /* harmless: already main */ }

console.log(`\ndone    : ${repoUrl}`);
if (created) console.log("note    : the marketplace requires the repo to be >= 1 day old");
