#!/usr/bin/env node
/**
 * Validate a DSH profile's pnpm lockfile.
 *
 * Checks, in order:
 *   1. js-yaml can parse it at all (a stray duplicate key makes pnpm throw
 *      `duplicated mapping key`, and nothing else in the toolchain notices)
 *   2. every `file:` dependency in package.json has exactly one importer entry
 *      pointing at the tarball package.json names
 *   3. that tarball has exactly one `packages:` record and one `snapshots:`
 *      record, and no record survives for a different version of the same name
 *
 * Usage:
 *   node tools/check-lock.mjs [profile dir]     # default: ~/.dsh/profiles/desktop
 *
 * Exit 0 = consistent, 1 = broken, 2 = could not run the check.
 */

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? join(homedir(), ".dsh", "profiles", "desktop"));
const lockPath = join(dir, "pnpm-lock.yaml");
const pkgPath = join(dir, "package.json");

// js-yaml lives in the profile's own node_modules (dshmarket depends on it).
// That is the same copy that threw the error we are guarding against. When
// checking some other directory, fall back to the default profile's copy.
const defaultDir = join(homedir(), ".dsh", "profiles", "desktop");
let yaml;
for (const base of [dir, defaultDir]) {
    try {
        yaml = createRequire(join(base, "package.json"))("js-yaml");
        break;
    } catch { /* try the next one */ }
}
if (!yaml) {
    console.error(`cannot load js-yaml from ${dir} or ${defaultDir}`);
    console.error("run this from a machine with DSH installed, or npm i js-yaml");
    process.exit(2);
}

const problems = [];
const fail = (m) => problems.push(m);
const jar = (s) => s.split(/[\\/]/).pop();

let lock;
try {
    lock = yaml.load(readFileSync(lockPath, "utf8"));
} catch (e) {
    console.error(`FAIL  ${lockPath}`);
    console.error(`      ${e.message.split("\n")[0]}`);
    process.exit(1);
}

const manifest = JSON.parse(readFileSync(pkgPath, "utf8"));
const wanted = Object.entries(manifest.dependencies ?? {})
    .filter(([, spec]) => typeof spec === "string" && spec.startsWith("file:"));

const deps = lock?.importers?.["."]?.dependencies ?? {};
const packages = lock?.packages ?? {};
const snapshots = lock?.snapshots ?? {};

for (const [name, spec] of wanted) {
    const entry = deps[name];
    if (!entry) {
        fail(`${name}: missing from importers['.'].dependencies`);
        continue;
    }
    if (jar(entry.specifier) !== jar(spec)) {
        fail(`${name}: importer wants ${jar(entry.specifier)}, package.json wants ${jar(spec)}`);
    }
    const pkgKey = Object.keys(packages).filter((k) => k.startsWith(name + "@file:"));
    const snapKey = Object.keys(snapshots).filter((k) => k.startsWith(name + "@file:"));
    if (pkgKey.length !== 1) {
        fail(`${name}: ${pkgKey.length} packages records, expected 1 — ${pkgKey.join(", ")}`);
    }
    if (snapKey.length !== 1) {
        fail(`${name}: ${snapKey.length} snapshots records, expected 1 — ${snapKey.join(", ")}`);
    }
    for (const k of [...pkgKey, ...snapKey]) {
        if (jar(k) !== jar(spec)) fail(`${name}: stale record ${k}`);
    }
}

if (problems.length) {
    console.error(`FAIL  ${lockPath}`);
    for (const p of problems) console.error("      " + p);
    console.error("\nrepair with:  python tools/fix-lock.py");
    process.exit(1);
}

const n = Object.keys(deps).length;
const stale = Object.keys(packages).filter((k) => /-1\./.test(k)).length;
console.log(`OK    ${lockPath}`);
console.log(`      ${n} dependencies, ${Object.keys(packages).length} packages, ` +
    `${Object.keys(snapshots).length} snapshots`);
for (const [name, spec] of wanted) {
    console.log(`      ${name} -> ${jar(spec)}`);
}
if (stale) console.log(`      note: ${stale} record(s) look like an old 1.x — check by hand`);
