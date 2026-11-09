- [x] I added **one file** at `data/plugins/SunRayan__dsh-skin-nier-automata.yml` — that single file is the whole submission.
- [x] My repo's `package.json` declares **`dsh.bundle`** (`dsh.bundle.patch: ./cordis.patch.yml`, plus `dsh.client` for the browser half).
- [x] My repo is at least **1 day old** — created 2026-11-09T16:58:01Z.
- [x] `category: theme` — it is a UI theme.
- [x] Description states what the plugin does, no superlatives.
- [x] My repo has the `dsh-plugin` topic.

A NieR-inspired theme for DeepSeek Harness. All 89 theme tokens are retuned to a
graphite palette with ice-white type, and light and dark are two separate
palettes rather than one with an inversion filter. The scene behind the UI is
pure CSS: a ruined skyline drawn as an SVG path used as a `mask-image` over a
gradient, in two parallax planes, with drifting ash, CRT scanlines and a boot
sequence. Because the skyline is a mask rather than a picture, it costs no image
bytes.

The theme ships no artwork at all. The two wallpaper slots — one full-bleed, one
a small plate — take a picture the reader uploads themselves, which is kept in
`localStorage` and never leaves the machine. That is deliberate: the earlier
version bundled third-party game art, and this one does not.

Both wallpapers are optional; with neither set the CSS scene shows through. The
bundle is 91 KB with no runtime dependencies. A 20-assertion stability harness
ships in the repo (`tools/stability-test.html`) covering a missing theme service,
a throwing theme service, and a denied `requestAnimationFrame`; the theme
degrades and leaves no nodes behind in every case.
