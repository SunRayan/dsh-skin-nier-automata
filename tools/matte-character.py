#!/usr/bin/env python
"""Matte the character plate into a UI-ready cutout.

The generator renders a flat mid-gray field instead of a real alpha channel, so
the cutout is built here:

  1. classify pixels as "field-like" by distance from the measured field colour;
  2. flood-fill from the four borders through that class — only background that
     is actually reachable from outside is removed, so a white blade touching
     the frame never gets punched out;
  3. erode the resulting matte by one pixel (kills the blended rim that carries
     the old gray), then feather with a small blur so edges are not aliased;
  4. trim to the silhouette and write both a PNG (lossless, for editing) and a
     WebP (what the plugin bundle actually inlines).

Run:  python tools/matte-character.py
"""

from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = r"C:\Users\Admin\WorkBuddy AI\2026-11-01-23-18-36\nier-composite\Re_render_this_exact_figure_al_2026-11-01T16-01-16.png"
PNG_OUT = os.path.join(ROOT, "assets", "character.png")
WEBP_OUT = os.path.join(ROOT, "assets", "character.webp")

TOLERANCE = 20  # distance from the field colour still counted as background
BAND_PX = 3  # width of the soft boundary band
RAMP = 45.0  # distance over which the band ramps from transparent to opaque
FEATHER_PX = 0.8
MARGIN = 12  # transparent padding kept around the silhouette
# The provider stamps a label into the bottom-right corner of every render. It
# lands on empty background here, so clearing that corner of the matte is a
# straight removal rather than a retouch.
LABEL_BOX = (210, 80)  # (width, height) measured from the bottom-right corner


def field_colour(rgb: np.ndarray) -> np.ndarray:
    """Median colour of a 4px border ring — the flat field the generator drew."""
    ring = np.concatenate([
        rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3),
        rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3),
    ])
    return np.median(ring, axis=0)


def main() -> int:
    image = Image.open(SOURCE).convert("RGB")
    rgb = np.asarray(image).astype(np.int16)
    field = field_colour(rgb)
    print(f"  field colour rgb{tuple(int(v) for v in field)}")

    distance = np.linalg.norm(rgb - field, axis=2)
    field_like = (distance <= TOLERANCE).astype(np.uint8) * 255

    # Flood from every border pixel so only outside-reachable field is cleared.
    # `.copy()` matters: an image created straight by `fromarray` shares its
    # buffer, and `ImageDraw.floodfill` writes are lost on that kind of image.
    reachable = Image.fromarray(field_like, "L").copy()
    for seed in [(0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)]:
        if reachable.getpixel(seed) == 255:
            ImageDraw.floodfill(reachable, seed, 128, thresh=0)
    background = np.asarray(reachable) == 128

    # Soft matte. A hard erode would eat thin structure (the katana blade is only
    # a few pixels wide), so instead: keep the flood result as the hard core, and
    # ramp alpha only inside a narrow band straddling the silhouette edge. Inside
    # that band the colour is decontaminated — the old gray field is subtracted
    # back out — which is what kills the halo on a light background.
    foreground = ~background
    bg_dilated = Image.fromarray(background.astype(np.uint8) * 255, "L").copy().filter(ImageFilter.MaxFilter(BAND_PX * 2 + 1))
    fg_dilated = Image.fromarray(foreground.astype(np.uint8) * 255, "L").copy().filter(ImageFilter.MaxFilter(BAND_PX * 2 + 1))
    band = (np.asarray(bg_dilated) > 0) & (np.asarray(fg_dilated) > 0)

    alpha = np.where(band, np.clip(distance / RAMP, 0.0, 1.0), np.where(background, 0.0, 1.0))
    a3 = alpha[..., None]
    decontaminated = np.clip((rgb - field * (1.0 - a3)) / np.maximum(a3, 0.15), 0, 255)
    rgb = np.where(band[..., None] & (a3 > 0.02), decontaminated, rgb).astype(np.uint8)

    cut = Image.fromarray(rgb, "RGB").convert("RGBA")
    matte = Image.fromarray((alpha * 255).round().astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(FEATHER_PX))
    cut.putalpha(matte)

    box = cut.getchannel("A").getbbox()
    if box is None:
        raise SystemExit("matte is empty — tolerance too high?")
    left, top, right, bottom = box
    left, top = max(0, left - MARGIN), max(0, top - MARGIN)
    right, bottom = min(cut.width, right + MARGIN), min(cut.height, bottom + MARGIN)
    cut = cut.crop((left, top, right, bottom))

    # Clear the provider label out of the bottom-right corner. `getchannel`
    # hands back a detached copy, so the rectangle has to be drawn on that copy
    # and pushed back — drawing on `cut.getchannel("A")` inline would be a no-op.
    alpha_channel = cut.getchannel("A")
    ImageDraw.Draw(alpha_channel).rectangle(
        [cut.width - LABEL_BOX[0], cut.height - LABEL_BOX[1], cut.width, cut.height],
        fill=0,
    )
    cut.putalpha(alpha_channel.filter(ImageFilter.GaussianBlur(0.6)))

    os.makedirs(os.path.dirname(PNG_OUT), exist_ok=True)
    cut.save(PNG_OUT, "PNG", optimize=True)
    cut.save(WEBP_OUT, "WEBP", quality=88, method=6)
    print(f"  cutout {cut.width}x{cut.height}  png {os.path.getsize(PNG_OUT) / 1024:.0f} KB  webp {os.path.getsize(WEBP_OUT) / 1024:.0f} KB")

    # Sanity: the corners of the trimmed plate must be fully transparent.
    alpha = cut.getchannel("A")
    corners = [alpha.getpixel(xy) for xy in [(0, 0), (cut.width - 1, 0), (0, cut.height - 1), (cut.width - 1, cut.height - 1)]]
    print(f"  corner alpha {corners}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
