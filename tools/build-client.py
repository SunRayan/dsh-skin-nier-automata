#!/usr/bin/env python
"""Generate lib/client.js from src/client.template.js.

The plugin client bundle is the *only* file DSH serves for a client plugin
(`/plugins/<id>/client.js` — there is no static-asset route). This theme ships
**no image assets at all**: the ruined skyline is a CSS mask, the HUD is borders
and text, and the two wallpaper slots take reader-supplied pictures at runtime
(stored in localStorage, never uploaded). So the bundle is pure code + CSS, and
this script is just: copy, guard against leftover placeholders, measure.

That is a deliberate product decision, not a shortcut — see README §版权. Any
third-party artwork inlined here would have to be redistributed under this
project's MIT license, which its authors cannot grant.

Run:  python tools/build-client.py
"""

from __future__ import annotations

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "src", "client.template.js")
OUTPUT = os.path.join(ROOT, "lib", "client.js")

# Pure code + CSS. The old four-image build sat at 655 KB; if this creeps past
# 200 KB something big has been inlined again and needs a deliberate decision.
BUDGET_KB = 200

PLACEHOLDER = re.compile(r"__[A-Z][A-Z0-9_]+__")


def main() -> int:
    with open(TEMPLATE, encoding="utf-8") as handle:
        source = handle.read()

    leftovers = sorted(set(PLACEHOLDER.findall(source)))
    if leftovers:
        sys.exit(
            "template still has build placeholders: %s\n"
            "Nothing is inlined any more — remove them from src/client.template.js."
            % ", ".join(leftovers)
        )

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(source)

    bundle_kb = os.path.getsize(OUTPUT) / 1024
    print(f"  no image assets inlined (CSS scene + reader-supplied wallpapers)")
    print(f"  bundle {bundle_kb:.0f} KB -> lib/client.js  (budget {BUDGET_KB} KB)")

    if bundle_kb > BUDGET_KB:
        print("  ! over budget — something got inlined; check the template")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
