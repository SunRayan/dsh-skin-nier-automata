#!/usr/bin/env python3
"""Repair stale `file:` records in a pnpm lockfile after a version bump.

Why this exists
---------------
`tools/install.mjs` *prepends* the new importer entry and the new `packages`
record to the lockfile. The records for the previous version stay where they
were, so after an upgrade the same file holds two records for one dependency:

    importers:
      .:
        dependencies:
          dsh-skin-nier-automata:            # new, 2.0.0
            version: file:vendor/...-2.0.0.tgz
          ...
          dsh-skin-nier-automata:            # old, 1.1.0, still here
            version: file:vendor/...-1.1.0.tgz

YAML resolves duplicate mapping keys to the *last* one, so pnpm keeps
resolving the old tarball. Nothing complains: `pnpm install` is happy and a
grep for the package name finds it. You think you upgraded; you did not.

What it does
------------
Reads `package.json` to learn which tarball each `file:` dependency should
point at, then drops every lockfile record that disagrees — in `importers`,
`packages` and `snapshots`. Records are located by content, never by line
number, and every line of a candidate block is checked before it is removed.
Any surprise aborts with exit 1 and writes nothing.

Usage
-----
    python tools/fix-lock.py [--dir <profile dir>] [--check] [--verbose]

Defaults to the desktop DSH profile. `--check` reports without writing.
"""

import argparse
import json
import os
import re
import sys

DEFAULT_DIR = os.path.expanduser("~/.dsh/profiles/desktop")

# `  name@file:vendor/name-1.2.3.tgz:` at two spaces (packages/snapshots)
# `      name:` at six spaces (importer dependencies)
RE_IMPORTER_KEY = re.compile(r"^ {6}([A-Za-z0-9@][^:]*):$")
RE_FILE_RECORD = re.compile(r"^ {2}([A-Za-z0-9@][^:]*?)@(file:[^:]+):(.*)$")


def die(msg):
    sys.exit("abort: " + msg)


def wanted_versions(manifest):
    """Map dependency name -> the `file:` specifier package.json asks for."""
    out = {}
    for section in ("dependencies", "devDependencies", "optionalDependencies"):
        for name, spec in (manifest.get(section) or {}).items():
            if isinstance(spec, str) and spec.startswith("file:"):
                out[name] = spec
    return out


def tarball(spec):
    """The identifying part of a `file:` specifier — the tarball's basename.

    package.json writes an absolute path (`file:C:/Users/.../vendor/x-2.0.0.tgz`)
    while the lockfile's `packages:` and `snapshots:` keys are relative to the
    profile (`file:vendor/x-2.0.0.tgz`). Comparing the raw strings would call
    the correct record stale and delete it, so compare what actually identifies
    the artifact.
    """
    return spec.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]


def find_blocks(lines, pattern):
    """Yield (start, end, name, spec) for every line matching `pattern`.

    `end` is exclusive and covers the indented continuation lines belonging to
    the record. `spec` is the second capture group, or None when the pattern
    has only one.
    """
    for i, line in enumerate(lines):
        m = pattern.match(line)
        if not m:
            continue
        indent = len(line) - len(line.lstrip())
        end = i + 1
        while end < len(lines):
            nxt = lines[end]
            if nxt.strip() == "":
                break
            if len(nxt) - len(nxt.lstrip()) <= indent:
                break
            end += 1
        spec = m.group(2) if m.lastindex and m.lastindex >= 2 else None
        yield i, end, m.group(1), spec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=DEFAULT_DIR, help="profile directory")
    ap.add_argument("--check", action="store_true", help="report only")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    lock_path = os.path.join(args.dir, "pnpm-lock.yaml")
    pkg_path = os.path.join(args.dir, "package.json")
    for p in (lock_path, pkg_path):
        if not os.path.isfile(p):
            die("not found: %s" % p)

    with open(pkg_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    wanted = wanted_versions(manifest)
    if not wanted:
        print("no `file:` dependencies in package.json — nothing to reconcile")
        return

    with open(lock_path, encoding="utf-8") as fh:
        lines = fh.read().split("\n")

    drop = set()
    changes = []

    # ---- importers: one key per dependency, pointing at the wanted specifier
    # Split the file at `packages:` so importer keys are only matched in the
    # importer region; `packages:` and `snapshots:` keys are indented by two.
    try:
        packages_at = next(i for i, l in enumerate(lines) if l == "packages:")
    except StopIteration:
        die("no `packages:` section")

    seen = {}
    for start, end, name, _ in find_blocks(lines[:packages_at], RE_IMPORTER_KEY):
        if name not in wanted:
            continue
        block = lines[start:end]
        spec = next((l.split("specifier:", 1)[1].strip()
                     for l in block if "specifier:" in l), None)
        if spec is None:
            die("importer block for %s has no specifier (line %d)" % (name, start + 1))
        if spec == wanted[name]:
            seen[name] = start
        else:
            changes.append("importer  %-32s drop %s" % (name, spec))
            drop.update(range(start, end))

    for name in wanted:
        if name not in seen:
            die("no importer entry for %s matches package.json" % name)

    # ---- packages + snapshots: one record per (name, tarball)
    for start, end, name, spec in find_blocks(lines, RE_FILE_RECORD):
        if name not in wanted:
            continue
        if tarball(spec) == tarball(wanted[name]):
            continue
        changes.append("record    %-32s drop %s" % (name, tarball(spec)))
        drop.update(range(start, end))
        # and the blank separator directly above, so removal leaves no gap
        if start > 0 and lines[start - 1].strip() == "":
            drop.add(start - 1)

    if not changes:
        print("lockfile already consistent with package.json")
        return

    for c in changes:
        print("  " + c)
    if args.verbose:
        print("  %d lines marked for removal" % len(drop))

    if args.check:
        print("\n--check: %d stale record(s), nothing written" % len(changes))
        sys.exit(1)

    out = [l for i, l in enumerate(lines) if i not in drop]
    # collapse runs of blank lines that removal can leave behind
    collapsed = []
    for l in out:
        if l.strip() == "" and collapsed and collapsed[-1].strip() == "":
            continue
        collapsed.append(l)
    text = "\n".join(collapsed)

    # ---- guards: the file must still say exactly what package.json says
    records = [l for l in text.split("\n") if RE_FILE_RECORD.match(l)]
    for name, spec in wanted.items():
        jar = tarball(spec)
        keys = text.count("      %s:" % name)
        if keys != 1:
            die("%s has %d importer keys after cleanup, expected 1" % (name, keys))
        mine = [l for l in records
                if RE_FILE_RECORD.match(l).group(1) == name]
        if len(mine) != 2:
            die("%s has %d file records after cleanup, expected 2 "
                "(one in packages, one in snapshots): %s"
                % (name, len(mine), mine))
        wrong = [l for l in mine
                 if tarball(RE_FILE_RECORD.match(l).group(2)) != jar]
        if wrong:
            die("%s kept a record for the wrong tarball: %s" % (name, wrong))

    with open(lock_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print("\nremoved %d line(s) -> %s" % (len(drop), lock_path))
    print("next: confirm it still parses —")
    print('  node tools/check-lock.mjs "%s"' % lock_path)

if __name__ == "__main__":
    main()
