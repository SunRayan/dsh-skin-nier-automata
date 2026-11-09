window.__ModuleLoader__.load({
	id: "dsh-skin-nier-automata",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		//#region palette
		/**
		 * Skin identity. Also the override-layer source key, so the layer this
		 * plugin stacks is attributable in `exportInspectTokens()` output.
		 */
		const SOURCE = "dsh-skin-nier-automata";

		/**
		 * One override-layer value. Both palette modes are mandatory — the theme
		 * service rejects bare strings so a token can never go illegible when the
		 * user flips the color scheme.
		 * @param {string} light - value used while the light base palette is active.
		 * @param {string} dark - value used while the dark base palette is active.
		 */
		const p = (light, dark) => ({ light, dark });

		/**
		 * Alias-layer overrides: all 89 `--dsw-alias-*` / `--dsw-specific-*` tokens
		 * the platform palette declares, re-tuned to the NieR: Automata reference
		 * stills in D:\十一照片\11\4 (cool graphite #0e0e0f→#49484f, industrial
		 * steel #151820→#5a6072, ice white #e8edf6, blade specular #a3aec8).
		 * Dark is the primary reading; light is the snowfield variant.
		 */
		const TOKENS = {
			"--dsw-alias-bg-base": p("rgba(233, 229, 220, 0.90)", "rgba(17, 20, 25, 0.62)"),
			"--dsw-alias-bg-layer-1": p("rgba(241, 237, 228, 0.92)", "rgba(24, 28, 34, 0.74)"),
			"--dsw-alias-bg-layer-2": p("rgba(248, 246, 240, 0.95)", "rgba(30, 35, 42, 0.82)"),
			"--dsw-alias-bg-layer-3": p("rgba(252, 250, 245, 0.96)", "rgba(34, 39, 46, 0.9)"),
			"--dsw-alias-bg-mask-1": p("rgba(14, 16, 20, 0.24)", "rgba(0, 0, 0, 0.55)"),
			"--dsw-alias-bg-mask-2": p("rgba(14, 16, 20, 0.12)", "rgba(0, 0, 0, 0.28)"),
			"--dsw-alias-bg-mask-3": p("rgba(14, 16, 20, 0.48)", "rgba(0, 0, 0, 0.55)"),
			"--dsw-alias-bg-mask-photo": p("rgba(10, 12, 16, 0.9)", "rgba(6, 7, 9, 0.9)"),
			"--dsw-alias-bg-mask-drop": p("rgba(255, 255, 255, 0.72)", "rgba(20, 22, 26, 0.72)"),
			"--dsw-alias-bg-module-platform": p("rgba(241, 237, 228, 0.92)", "rgba(20, 23, 27, 0.74)"),
			"--dsw-alias-bg-multi-select": p("rgba(241, 237, 228, 0.92)", "rgba(26, 30, 35, 0.82)"),
			"--dsw-alias-bg-overlay": p("#ddd8cd", "#34383f"),
			"--dsw-alias-bg-skeleton": p("rgba(16, 20, 26, 0.05)", "rgba(200, 214, 232, 0.06)"),
			"--dsw-alias-border-inverted2": p("rgba(20, 26, 34, 0.08)", "rgba(255, 255, 255, 0.08)"),
			"--dsw-alias-border-inverted": p("rgba(20, 26, 34, 0.06)", "rgba(255, 255, 255, 0.06)"),
			"--dsw-alias-border-l1": p("rgba(20, 26, 34, 0.05)", "rgba(200, 214, 232, 0.06)"),
			"--dsw-alias-border-l2-darkmode-thin": p("rgba(20, 26, 34, 0.08)", "rgba(200, 214, 232, 0.07)"),
			"--dsw-alias-border-l2": p("rgba(20, 26, 34, 0.12)", "rgba(200, 214, 232, 0.12)"),
			"--dsw-alias-border-l3": p("rgba(20, 26, 34, 0.17)", "rgba(200, 214, 232, 0.16)"),
			"--dsw-alias-border-l4": p("rgba(20, 26, 34, 0.18)", "rgba(200, 214, 232, 0.22)"),
			"--dsw-alias-brand-primary-invert": p("#f7f9fc", "#0f1013"),
			"--dsw-alias-brand-primary-new-colorprimary-new-color": p("#9aa3ad", "#aeb6c0"),
			"--dsw-alias-brand-primary": p("#12151a", "#e6ebf2"),
			"--dsw-alias-brand-text": p("#12151a", "#e6ebf2"),
			"--dsw-alias-button-contrast-fill": p("#4c5561", "#e6ebf2"),
			"--dsw-alias-button-elevated-fill": p("rgba(255, 255, 255, 0.94)", "rgba(34, 39, 46, 0.92)"),
			"--dsw-alias-button-floating-fill": p("rgba(255, 255, 255, 0.92)", "rgba(26, 30, 35, 0.84)"),
			"--dsw-alias-button-floating-hover": p("#eef1f7", "#262a31"),
			"--dsw-alias-button-ghost-active-border": p("#8a929c", "#4a525d"),
			"--dsw-alias-button-ghost-active-fill": p("#e8ecf3", "#2a2f37"),
			"--dsw-alias-button-ghost-active-hover": p("#e1e6ef", "#333942"),
			"--dsw-alias-button-info-fill": p("#4a525e", "#a7afbb"),
			"--dsw-alias-button-info-hover": p("#3a414b", "#c2c9d3"),
			"--dsw-alias-button-primary-dimmed": p("#e8ecf3", "#23272e"),
			"--dsw-alias-button-primary-fill": p("#12151a", "#e6ebf2"),
			"--dsw-alias-button-primary-hover": p("#2b323b", "#cdd5e0"),
			"--dsw-alias-button-tool-bar-fill-invisible": p("rgba(31, 31, 31, 0.36)", "rgba(31, 31, 31, 0.36)"),
			"--dsw-alias-button-tool-bar-fill": p("rgba(84, 85, 87, 0.5)", "rgba(84, 85, 87, 0.5)"),
			"--dsw-alias-button-tool-bar-hover": p("rgba(84, 85, 87, 0.6)", "rgba(84, 85, 87, 0.6)"),
			"--dsw-alias-interactive-bg-active": p("rgba(20, 26, 34, 0.09)", "rgba(200, 214, 232, 0.12)"),
			"--dsw-alias-interactive-bg-hover-accent": p("rgba(163, 38, 46, 0.12)", "rgba(210, 69, 78, 0.18)"),
			"--dsw-alias-interactive-bg-hover-danger": p("rgba(143, 32, 40, 0.07)", "rgba(240, 101, 108, 0.16)"),
			"--dsw-alias-interactive-bg-hover-solid": p("#eef1f7", "#23272e"),
			"--dsw-alias-interactive-bg-hover": p("rgba(20, 26, 34, 0.05)", "rgba(200, 214, 232, 0.07)"),
			"--dsw-alias-label-caption": p("#8a929c", "#6d7684"),
			"--dsw-alias-label-dimmed": p("#cfd6df", "#3a4048"),
			"--dsw-alias-label-primary-bluish": p("#1b2a3d", "#dfe7f2"),
			"--dsw-alias-label-primary-dimmed": p("#232a33", "#cfd6e0"),
			"--dsw-alias-label-primary-foreground": p("#f7f9fc", "#0f1013"),
			"--dsw-alias-label-primary-inverted": p("#ffffff", "#23272e"),
			"--dsw-alias-label-primary": p("#12151a", "#e4e9f0"),
			"--dsw-alias-label-secondary": p("#4c5561", "#a9b2c0"),
			"--dsw-alias-label-tertiary": p("#6b7480", "#8b95a4"),
			"--dsw-alias-markdown-citation": p("#eef1f7", "#23272e"),
			"--dsw-alias-markdown-code-block-banner": p("rgba(223, 229, 238, 0.93)", "rgba(19, 22, 26, 0.9)"),
			"--dsw-alias-markdown-code-block": p("rgba(233, 237, 244, 0.93)", "rgba(8, 9, 10, 0.9)"),
			"--dsw-alias-markdown-code-segment-selected": p("#ffffff", "#2b3038"),
			"--dsw-alias-markdown-code-segment-unselected": p("#eef1f7", "#08090a"),
			"--dsw-alias-markdown-inline-code": p("#e2e8f1", "#23272e"),
			"--dsw-alias-markdown-placeholder": p("#eef1f7", "#1c1f24"),
			"--dsw-alias-markdown-tag": p("#e8ecf3", "#23272e"),
			"--dsw-alias-scrollbar-bg-l1": p("#d3dae3", "#2b3038"),
			"--dsw-alias-scrollbar-bg-l2": p("#d3dae3", "#2b3038"),
			"--dsw-alias-scrollbar-hover-l1": p("#c0c9d4", "#3b424c"),
			"--dsw-alias-scrollbar-hover-l2": p("#c0c9d4", "#3b424c"),
			"--dsw-alias-state-business-primary": p("#a3262e", "#dc4b54"),
			"--dsw-alias-state-business-tertiary": p("#f2e5e3", "#2c1f20"),
			"--dsw-alias-state-error-primary": p("#8f2028", "#f0656c"),
			"--dsw-alias-state-error-secondary": p("#ab4a48", "#cf5a5c"),
			"--dsw-alias-state-success-primary": p("#204236", "#6f9c80"),
			"--dsw-alias-state-success-secondary": p("#3b6a54", "#6c927c"),
			"--dsw-alias-state-success-tertiary": p("#e5ece8", "#1e2623"),
			"--dsw-alias-state-warn-label": p("#a04b47", "#b98b87"),
			"--dsw-alias-state-warn-primary": p("#a8534f", "#a87370"),
			"--dsw-alias-state-warn-secondary": p("#bb7069", "#9d7470"),
			"--dsw-alias-state-warn-tertiary": p("#f2e9e6", "#2a2322"),
			"--dsw-alias-toast-bg": p("rgba(43, 50, 59, 0.95)", "rgba(42, 47, 55, 0.95)"),
			"--dsw-alias-tooltip-bg": p("rgba(43, 50, 59, 0.95)", "rgba(42, 47, 55, 0.95)"),
			"--dsw-specific-bubble-highlight": p("#d3dfee", "#262b33"),
			"--dsw-specific-bubble": p("rgba(230, 236, 245, 0.9)", "rgba(20, 23, 27, 0.76)"),
			"--dsw-specific-input-major": p("rgba(255, 255, 255, 0.92)", "rgba(22, 25, 30, 0.82)"),
			"--dsw-specific-login-input": p("rgba(247, 249, 252, 0.92)", "rgba(16, 18, 22, 0.86)"),
			"--dsw-specific-menu": p("#e1e6ef", "#23272e"),
			"--dsw-specific-selector": p("#e8ecf3", "#23272e"),
			"--dsw-specific-sidebar-fill": p("rgba(228, 233, 241, 0.86)", "rgba(13, 15, 18, 0.84)"),
			"--dsw-specific-sidebar-nav-item-active-accent": p("#d5dfec", "#2f3742"),
			"--dsw-specific-sidebar-nav-item-active": p("#e1e6ef", "#262b33"),
			"--dsw-specific-sidebar-nav-item-hover": p("#e8ecf3", "#1d2126"),
			"--dsw-specific-tip": p("#eef1f7", "#1c1f24")
		};
		//#endregion

		//#region scene



		/**
		 * Ruined skyline, authored as blocks and turned into a *mask* rather than a
		 * painted image. Masking instead of drawing means the silhouette takes its
		 * colour from CSS, so one ~1 KB asset serves both schemes at any size —
		 * a second bitmap would have cost another 150 KB of base64.
		 * Each block is `[x, width, roofY, collapsedRoof?]` in a 1200x420 space.
		 */
		/**
		 * Ruined skyline as a CSS `mask-image` URL — composed to *frame* the
		 * character instead of sitting behind her: the tall landmarks (Babel
		 * tower, broken highway, crane) live in the mid band, the right edge
		 * stays low so the scene dissolves behind her via the frame's right fade.
		 * SKYLINE_BLOCKS are the collapsed mid-cluster, each `[x, w, roofY, collapsed]`
		 * in a 1200x420 space.
		 */
		const SKYLINE_BLOCKS = [
			[560, 50, 300, 1], [616, 44, 276, 1], [666, 52, 320, 1], [722, 46, 258, 1]
		];

		const CITY_MASK = (() => {
			let d = "";
			/* Babel tower — stepped silhouette, the left/mid anchor. */
			d += "M150 420V214l18-6V182l20-6V156l20-5V134l18-5V112h52V134l-16 5V156l22 6V182l20 6V214l18 6V420Z";
			d += "M214 112V68h5V112Z"; /* remnant mast on top */
			/* Crane — mast + arm + counterweight + brace. */
			d += "M286 116h9v212h-9Z";
			d += "M262 124h56v9h-56Z";
			d += "M262 124h12v18h-12Z";
			d += "M295 124L315 133L315 142L295 133Z";
			/* Broken highway — diagonal beam + two pillars. */
			d += "M380 252L640 300L640 318L380 270Z";
			d += "M444 300h12v120h-12Z";
			d += "M568 320h12v100h-12Z";
			/* Collapsed mid cluster — broken (zig-zag) roofs. */
			for (const [x, w, roof] of SKYLINE_BLOCKS) {
				d += "M" + x + " 420V" + roof;
				d += "l" + Math.round(w * 0.3) + " -12l" + Math.round(w * 0.24) + " 16l" + Math.round(w * 0.46) + " -8";
				d += "V420Z";
			}
			/* Low horizon: left stub and right ridge (right side fades behind her). */
			d += "M0 420V404h150V420Z";
			d += "M1000 420V398h90V388h110V402h120V420Z";
			const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 420' preserveAspectRatio='none'>"
				+ "<path fill='#fff' d='" + d + "'/></svg>";
			return "url(\"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "\")";
		})();

		/** Slow dust drifting through the beam — five is enough to read as air. */
		const MOTES = (() => {
			const seeds = [[0.54, 0.74, 0, 46], [0.66, 0.9, 11, 52], [0.78, 0.63, 21, 41], [0.87, 0.81, 31, 49], [0.62, 0.52, 5, 56]];
			let out = "";
			for (const [left, top, delay, dur] of seeds) {
				out += '<span class="nier-mote" style="left:' + (left * 100).toFixed(1) + "%;top:" + (top * 100).toFixed(1)
					+ "%;animation-delay:-" + delay + "s;animation-duration:" + dur + 's"></span>';
			}
			return out;
		})();

		/**
		 * The scene sits *behind* the character and *in front of* the app's own
		 * content, which is the only place a decorative layer can go without
		 * repainting the platform's surfaces.
		 *
		 * The whole point of this block is that it must never read as a pasted
		 * rectangle. Three separate mechanisms do that work:
		 *
		 * 1. The frame is masked with one elliptical radial gradient centred on the
		 *    bottom-right corner and sized `100% 100%`, so its alpha is already 0 at
		 *    every edge — left, top, and the diagonal. Nothing can cut.
		 * 2. The skyline band is nested inside a second, linear left-fade mask, and
		 *    each layer carries its own vertical gradient to transparent. Masks
		 *    multiply down the tree, so the horizon dissolves instead of ending.
		 * 3. Colours are low-alpha washes pulled from the same palette as the
		 *    tokens, so the fade lands on the app's own background colour rather
		 *    than on a neighbouring hue.
		 *
		 * Motion is additive: `--nier-px/py` are set by `mountParallax` from the
		 * pointer position, and the scene and figure read them at different rates
		 * (16px vs 6px), which is what produces depth. Idle animation is CSS-only.
		 */
		const SCENE_CSS = [
		/* ---- frame ------------------------------------------------------- */
		"#dsh-skin-nier-scene{position:fixed;right:0;bottom:0;width:min(calc(100vw - 420px),1400px);",
		"height:min(100vh,1200px);z-index:0;pointer-events:none;",
		/* Light: pale haze, the skyline as a soft grey-blue wash. */
"--nier-sky:radial-gradient(96% 42% at 70% 58%,rgba(150,158,168,.40),transparent 76%),",
"radial-gradient(58% 30% at 92% 64%,rgba(128,137,148,.30),transparent 72%),",
"radial-gradient(120% 80% at 100% 100%,rgba(120,127,137,.34),transparent 82%);",
"--nier-city:rgba(74,82,92,.60);--nier-city-far:rgba(96,104,114,.48);--nier-fog:rgba(170,177,186,.46);",
"--nier-ground:rgba(120,127,137,.16);--nier-glow:rgba(150,157,166,.42);",
		"transform:translate3d(calc(var(--nier-px,0)*16px),calc(var(--nier-py,0)*9px),0);",
		"transition:transform .8s cubic-bezier(.22,.61,.36,1),filter .6s ease;",
		/* Horizontal half of the blend: opaque at the right edge, gone at the left. */
		"-webkit-mask-image:linear-gradient(to left,#000 0,#000 34%,rgba(0,0,0,.55) 64%,transparent 100%);",
		"mask-image:linear-gradient(to left,#000 0,#000 34%,rgba(0,0,0,.55) 64%,transparent 100%)}",
		/* Dark: moonlit horizon behind the ruins, so the silhouette has something
		 * to read against. Without this the skyline is black on black. */
		"body[data-ds-dark-theme] #dsh-skin-nier-scene{",
"--nier-sky:radial-gradient(96% 42% at 70% 58%,rgba(84,94,110,.52),transparent 76%),",
"radial-gradient(58% 30% at 92% 64%,rgba(92,102,118,.30),transparent 72%),",
"radial-gradient(120% 80% at 100% 108%,rgba(6,8,11,.72),transparent 82%);",
"--nier-city:rgba(118,128,146,.96);--nier-city-far:rgba(72,80,96,.92);--nier-fog:rgba(150,158,170,.18);",
"--nier-ground:rgba(92,100,116,.20);--nier-glow:rgba(130,138,150,.34)}",
		/* Vertical half of the blend. Two nested linear masks multiply, so both
		 * the left edge and the top edge are guaranteed to reach alpha 0 — the
		 * scene has no boundary to show, at any viewport size. */
		".nier-plane{position:absolute;inset:0;pointer-events:none;",
		"-webkit-mask-image:linear-gradient(to top,#000 0,#000 40%,rgba(0,0,0,.58) 68%,transparent 100%);",
		"mask-image:linear-gradient(to top,#000 0,#000 40%,rgba(0,0,0,.58) 68%,transparent 100%)}",
		"#dsh-skin-nier-scene .nier-plane>*{position:absolute;pointer-events:none}",
		/* Mid-tone haze: a low-intensity cool wash from the top-right corner. Without
		 * it the canvas sat at L*4.6 with 92% of pixels under L*10, so the figure had
		 * nothing to read against and her black dress merged into the background.
		 * Sits at z:-2, under the sky/fog wash, and inherits the scene's own masks —
		 * no new stacking layer, no new token. */
		"#dsh-skin-nier-scene::before{content:'';position:absolute;inset:0;z-index:-2;pointer-events:none;",
		"background:radial-gradient(72% 54% at 76% 18%,rgba(110,117,126,.16),transparent 66%)}",

		/* ---- wallpaper base: NieR ruin wash, masked into the right
		 * gutter. Lives INSIDE #dsh-skin-nier-scene, so the scene's own left/top
		 * masks keep it out of the reading column entirely — never above host
		 * text. z:-1 seats it beneath the sky/fog wash for a depth read. */
		".nier-wallpaper{position:absolute;inset:0;pointer-events:none;z-index:-1;background:",
		"radial-gradient(80% 52% at 78% 30%,rgba(120,127,137,.20),transparent 60%),",
		"radial-gradient(42% 22% at 86% 64%,rgba(163,38,46,.10),transparent 70%),",
		"linear-gradient(to top,rgba(16,20,28,.94) 0%,rgba(28,34,44,.55) 34%,rgba(40,46,56,.18) 62%,transparent 86%)}",
		/* The wash is authored for a dark field: a 94 %-black ground wash
		 * reads as depth on black and as a photocopier smudge on paper. Light mode
		 * keeps the same three gradients at roughly a ninth of the strength, so the
		 * gutter still has a floor and a faint warm bloom, but the sheet stays paper. */
		"body:not([data-ds-dark-theme]) .nier-wallpaper{background:",
		"radial-gradient(80% 52% at 78% 30%,rgba(120,127,137,.07),transparent 62%),",
		"radial-gradient(42% 22% at 86% 64%,rgba(163,38,46,.05),transparent 70%),",
		"linear-gradient(to top,rgba(28,34,44,.10) 0%,rgba(40,46,56,.05) 34%,transparent 70%)}",

		/* ---- air: the moon halo and the horizon wash ---------------------- */
		".nier-sky{inset:0;background:var(--nier-sky)}",

		/* ---- skyline: nested masks, so the fade is guaranteed -------------
		 * Two depth planes from one asset. The far plane is the same mask
		 * scaled down and pushed toward the corner, then blurred and lifted
		 * toward the haze colour — that is aerial perspective, and it is what
		 * stops a single plane from reading as a bar chart. */
		".nier-city{left:0;right:0;bottom:0;pointer-events:none;",
		"-webkit-mask-image:linear-gradient(to left,transparent 0,#000 8%);",
		"mask-image:linear-gradient(to left,transparent 0,#000 8%)}",
		".nier-city>i{position:absolute;inset:0;display:block;",
		"background:linear-gradient(to top,var(--nier-city) 0%,var(--nier-city) 74%,transparent 100%);",
		"-webkit-mask-image:" + CITY_MASK + ";mask-image:" + CITY_MASK + ";",
		"-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;",
		"-webkit-mask-position:100% 100%;mask-position:100% 100%}",
		".nier-city.far{height:42%;bottom:9%;opacity:.82;filter:blur(1.3px)}",
		".nier-city.far>i{-webkit-mask-size:82% 60%;mask-size:82% 60%;",
		"background:linear-gradient(to top,var(--nier-city-far) 0%,var(--nier-city-far) 80%,transparent 100%)}",
		".nier-city.near{height:60%}",
		".nier-city.near>i{-webkit-mask-size:124% 64%;mask-size:124% 64%}",
		/* Lit windows. The parent's mask clips this too, so the dots can only
		 * ever land inside a building silhouette — no manual placement. */
		".nier-city>i::after{content:'';position:absolute;inset:0;",
		"background-image:radial-gradient(circle at 3px 4px,rgba(214,200,172,.30) .9px,transparent 1.4px);",
		"background-size:23px 31px;opacity:.5}",
		".nier-city.far>i::after{background-size:19px 25px;opacity:.16;",
		"background-image:radial-gradient(circle at 2px 3px,rgba(176,32,42,.22) .8px,transparent 1.2px)}",
		/* YoRHa red mechanical eyes — a few fixed points with a subtle glow,
		 * so the ruins read as watched by machine life rather than dead. */
		".nier-eye{position:absolute;width:3px;height:3px;border-radius:50%;background:#b0202a;",
		"box-shadow:0 0 5px 1px rgba(176,32,42,.5);pointer-events:none;opacity:.85}",

		/* ---- ground haze -------------------------------------------------- */
		".nier-ground{left:10%;right:-4%;bottom:-2%;height:28%;",
		"background:radial-gradient(60% 100% at 62% 100%,var(--nier-ground),transparent 74%)}",
		/* ---- Pod lock-on reticle: static, zero ongoing paint, very low opacity - */
		".nier-ring{right:8%;bottom:10%;width:min(44vh,500px);aspect-ratio:1;border-radius:50%;",
		"border:1px solid rgba(230,235,242,.06);box-shadow:inset 0 0 0 1px rgba(176,32,42,.05);",
		"opacity:.6;pointer-events:none}",
		".nier-ring::before{content:'';position:absolute;inset:13%;border-radius:50%;",
		"border:1px solid rgba(230,235,242,.05)}",
		".nier-ring::after{content:'';position:absolute;left:50%;top:-3px;width:1px;height:7px;",
		"background:rgba(176,32,42,.3);transform:translateX(-50%)}",

		/* ---- fog: haze between the planes, then two drifting bands -------- */
		".nier-fog{inset:0;opacity:.5;background:linear-gradient(to top,transparent 30%,var(--nier-fog) 48%,transparent 68%)}",
		".nier-fog.haze{opacity:.34;background:linear-gradient(to top,transparent 8%,var(--nier-fog) 26%,transparent 44%)}",
			".nier-fog.f1{animation:nier-fog-a 74s ease-in-out infinite alternate}",
			".nier-fog.f2{animation:nier-fog-b 96s ease-in-out infinite alternate;opacity:.28}",
			".nier-mote{width:2px;height:2px;border-radius:50%;background:var(--nier-glow);opacity:0;",
			"animation-name:nier-mote;animation-timing-function:linear;animation-iteration-count:infinite}",

			
		
		
		
			

			
			"@keyframes nier-fog-a{from{transform:translate3d(-5%,0,0)}to{transform:translate3d(5%,0,0)}}",
			"@keyframes nier-fog-b{from{transform:translate3d(4%,0,0)}to{transform:translate3d(-4%,0,0)}}",
		"@keyframes nier-mote{0%{opacity:0;transform:translate3d(0,0,0)}",
		"12%{opacity:.5}70%{opacity:.22}100%{opacity:0;transform:translate3d(-58px,-78px,0)}}",

			/* ---- guards ------------------------------------------------------- */
			"@media (prefers-reduced-motion:reduce){",
			"#dsh-skin-nier-scene{transform:none!important;transition:none!important}",
			".nier-fog,.nier-mote{animation:none!important}}",
			"@media (max-width:1180px){#dsh-skin-nier-scene,#dsh-skin-nier-hud{display:none}}",
		/* Pause every CSS animator when the tab is hidden so nothing is painted
		 * off-screen — the parallax handler toggles `nier-paused` on visibility. */
		"body.nier-paused .nier-fog.f1,",
		"body.nier-paused .nier-fog.f2,body.nier-paused .nier-mote{",
		"animation-play-state:paused!important}"
		].join("");

		/**
		 * Build the scene layers. Re-applying
		 * (HMR, profile reload) must not stack copies, so stale nodes are dropped
		 * first — the same guard `mountStyle` uses.
		 * @returns the mounted nodes, so the disposer can take them back out.
		 */
		function mountScene() {
			for (const stale of document.querySelectorAll("#dsh-skin-nier-scene")) stale.remove();

			const scene = document.createElement("div");
			scene.id = "dsh-skin-nier-scene";
			scene.setAttribute("aria-hidden", "true");
		scene.innerHTML = '<div class="nier-plane">'
			+ '<div class="nier-wallpaper"></div>'
			+ '<div class="nier-sky"></div>'
			/* The skyline is the scene's only real subject now that no artwork
			 * ships: it is a mask over a CSS gradient, so it costs no bytes and
			 * carries no third-party rights. Two planes give aerial perspective. */
			+ '<div class="nier-city far"><i></i></div><div class="nier-city near"><i></i></div>'
			+ '<div class="nier-ring"></div>'
			+ '<div class="nier-fog haze"></div>'
			+ '<div class="nier-fog f1"></div><div class="nier-fog f2"></div>'
			+ '<div class="nier-fog band"></div>' + MOTES
			+ '</div>'
			+ '<span class="nier-eye" style="left:17%;top:54%"></span>'
			+ '<span class="nier-eye" style="left:31%;top:50%"></span>'
			+ '<span class="nier-eye" style="left:47%;top:66%"></span>';
			document.body.appendChild(scene);


		/* NieR HUD frame: corner brackets + status readout. Static, non-interactive,
		 * removed on dispose with the rest of the skin. */
		const hud = document.createElement("div");
		hud.id = "dsh-skin-nier-hud";
		hud.setAttribute("aria-hidden", "true");
		hud.innerHTML = '<i class="nier-bracket tl"></i><i class="nier-bracket tr"></i>'
			+ '<i class="nier-bracket bl"></i><i class="nier-bracket br"></i>'
			+ '<i class="nier-rim top"></i><i class="nier-rim bottom"></i>' + '<span class="nier-hud-status">YO-RHA // SYS.ONLINE</span>';
		document.body.appendChild(hud);


			return [scene, hud];
		}

		/**
		 * Pointer parallax. Writes two unit-range custom properties on `<html>` and
		 * lets CSS decide how far each layer moves — the scene reads 16px, the
		 * figure 6px. Movement is rAF-coalesced so a fast mouse cannot outrun the
		 * compositor, and it is skipped entirely under `prefers-reduced-motion`.
		 * @returns a disposer that removes the listeners and the properties.
		 */
	function mountParallax() {
		/* Skip the listeners (and the off-screen paint work) entirely when there
		 * is no parallax benefit: reduced motion, a coarse/touch pointer (no
		 * hover), or a narrow viewport where the figure is hidden anyway. */
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
		if (window.matchMedia("(pointer: coarse)").matches) return () => {};
		if (window.matchMedia("(max-width: 1180px)").matches) return () => {};
		const root = document.documentElement;
			let frame = 0;
			let x = 0;
			let y = 0;

			const flush = () => {
				frame = 0;
				root.style.setProperty("--nier-px", x.toFixed(4));
				root.style.setProperty("--nier-py", y.toFixed(4));
			};
			const schedule = () => {
				if (!frame) frame = requestAnimationFrame(flush);
			};
			const onMove = (event) => {
				x = (event.clientX / window.innerWidth - 0.5) * 2;
				y = (event.clientY / window.innerHeight - 0.5) * 2;
				schedule();
			};
			const reset = () => {
				x = 0;
				y = 0;
				schedule();
			};

		window.addEventListener("pointermove", onMove, { passive: true });
		document.addEventListener("pointerleave", reset);
		window.addEventListener("blur", reset);

		/* Pause every skin animation when the tab is backgrounded so the GPU is
		 * not painting a hidden scene/figure, and reset parallax state. */
		const onVis = () => {
			document.body.classList.toggle("nier-paused", document.hidden);
			if (document.hidden) reset();
		};
		document.addEventListener("visibilitychange", onVis);
		onVis();

		return () => {
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerleave", reset);
			window.removeEventListener("blur", reset);
			document.removeEventListener("visibilitychange", onVis);
			if (frame) cancelAnimationFrame(frame);
			root.style.removeProperty("--nier-px");
			root.style.removeProperty("--nier-py");
			document.body.classList.remove("nier-paused");
		};
		}
		//#endregion

		//#region dynamic particles
		/**
		 * Dynamic particle field — a NieR-flavoured take on the "real motion" live
		 * wallpaper idea (whale / Harness Whale Wallpaper). Drifting ash with the
		 * occasional red ember, painted on a Canvas2D layer that lives *inside* the
		 * scene plane, so it inherits the scene's pointer parallax for free.
		 *
		 * Guardrails mirror the reference plugin so it never costs more than the
		 * scene it decorates: DPR capped at 1.5; the rAF loop stops when the tab is
		 * hidden or the viewport drops below 1180px (where the scene is
		 * `display:none`); and nothing paints under `prefers-reduced-motion`.
		 * @returns a disposer that cancels the loop and removes the canvas.
		 */
		function mountParticles() {
			const scene = document.getElementById("dsh-skin-nier-scene");
			const plane = scene && scene.querySelector(".nier-plane");
			if (!scene || !plane) return () => {};
			const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const canvas = document.createElement("canvas");
			canvas.className = "nier-particles";
			canvas.setAttribute("aria-hidden", "true");
			plane.insertBefore(canvas, plane.querySelector(".nier-ring"));
			const ctx2d = canvas.getContext("2d");
			let w = 0, h = 0, dpr = 1, parts = [], raf = 0, running = false, COUNT = 0;
			/* One density. The field reads as air, not as a setting, so the
			 * four-tier knob went away together with the dock button that cycled it. */
			const pickCount = () => {
				const m = Math.min(window.innerWidth, window.innerHeight);
				return Math.round(100 * (m < 700 ? 0.55 : m < 1200 ? 0.8 : 1));
			};
			function seed() {
				parts = [];
				for (let i = 0; i < COUNT; i++) {
					const ember = Math.random() < 0.12;
					parts.push({
						x: Math.random() * w, y: Math.random() * h,
						r: ember ? 1.2 + Math.random() * 1.4 : 0.6 + Math.random() * 1.5,
						vy: -(0.12 + Math.random() * 0.32),
						vx: (Math.random() - 0.5) * 0.16,
						a: 0.18 + Math.random() * 0.5,
						ph: Math.random() * Math.PI * 2,
						ember: ember
					});
				}
			}
			function resize() {
				const r = scene.getBoundingClientRect();
				dpr = Math.min(window.devicePixelRatio || 1, 1.5);
				w = Math.max(1, Math.floor(r.width));
				h = Math.max(1, Math.floor(r.height));
				canvas.width = Math.floor(w * dpr);
				canvas.height = Math.floor(h * dpr);
				canvas.style.width = w + "px";
				canvas.style.height = h + "px";
				ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
				COUNT = pickCount();
				seed();
			}
			function step() {
				raf = 0;
				if (document.hidden) { running = false; return; }
				ctx2d.clearRect(0, 0, w, h);
				for (const p of parts) {
					p.ph += 0.012;
					p.x += p.vx + Math.sin(p.ph) * 0.12;
					p.y += p.vy;
					if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
					if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4;
					ctx2d.beginPath();
					ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
					ctx2d.fillStyle = p.ember ? "rgba(176,32,42," + p.a + ")" : "rgba(206,212,220," + p.a + ")";
					ctx2d.fill();
				}
				raf = requestAnimationFrame(step);
			}
			function start() { if (reduce || running || !COUNT) return; running = true; raf = requestAnimationFrame(step); }
			function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
			const mq = window.matchMedia("(max-width: 1180px)");
			const onMq = () => { if (mq.matches) stop(); else start(); };
			const onVis = () => { if (document.hidden) stop(); else start(); };
			let io = null;
			if ("IntersectionObserver" in window) {
				io = new IntersectionObserver((ents) => {
					for (const e of ents) { if (e.isIntersecting) start(); else stop(); }
				}, { threshold: 0.02 });
				io.observe(canvas);
			}
			resize();
			window.addEventListener("resize", resize);
			if (mq.addEventListener) mq.addEventListener("change", onMq); else window.addEventListener("resize", onMq);
			document.addEventListener("visibilitychange", onVis);
			start();

			return () => {
				stop();
				window.removeEventListener("resize", resize);
				document.removeEventListener("visibilitychange", onVis);
				if (io) io.disconnect();
				if (mq.removeEventListener) mq.removeEventListener("change", onMq); else window.removeEventListener("resize", onMq);
				if (canvas.parentNode) canvas.remove();
			};
		}
		//#endregion

		let audioApi = null;
		//#region audio (Web Audio synth — zero asset files; borrowed from dsh-theme-firefly)
		/**
		 * NieR-flavoured system audio, synthesised live with the Web Audio API so
		 * the package ships no audio files. Default OFF; the browser autoplay
		 * policy means sound only starts after a user gesture, so we unlock the
		 * context on the first interaction. A later control bar toggles
		 * `nier-audio` and dispatches `nier:audio` ("on" | "off").
		 * @returns a disposer.
		 */
		function mountAudio() {
			const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
			let on = lsGet("nier-audio") === "on";
			let ctx = null, master = null;
			const unlock = () => { if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {}); };
			const ensure = () => {
				if (ctx && ctx.state === "closed") { ctx = null; master = null; }
				if (ctx) return ctx;
				try {
					const AC = window.AudioContext || window.webkitAudioContext;
					if (!AC) return null;
					ctx = new AC();
					master = ctx.createGain();
					master.gain.value = 0.06;
					master.connect(ctx.destination);
				} catch (e) { ctx = null; }
				return ctx;
			};
			const tone = (freq, dur, type, when, gain) => {
				const c = ensure(); if (!c) return;
				const t = c.currentTime + (when || 0);
				const o = c.createOscillator(), g = c.createGain();
				o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
				g.gain.setValueAtTime(0.0001, t);
				g.gain.exponentialRampToValueAtTime(gain || 0.5, t + 0.008);
				g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
				o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
			};
			const noise = (dur, when, gain) => {
				const c = ensure(); if (!c) return;
				const t = c.currentTime + (when || 0);
				const n = Math.floor(c.sampleRate * dur);
				const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
				for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
				const src = c.createBufferSource(); src.buffer = buf;
				const g = c.createGain(); g.gain.value = gain || 0.3;
				const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1200;
				src.connect(f); f.connect(g); g.connect(master); src.start(t);
			};
			const api = {
				bootChime() { if (!on) return; unlock(); tone(110, 0.5, "square", 0, 0.5); tone(165, 0.5, "square", 0.02, 0.32); tone(55, 0.7, "sine", 0, 0.6); noise(0.18, 0, 0.25); },
				tick() { if (!on) return; unlock(); tone(880, 0.03, "square", 0, 0.16); },
				setEnabled(v) { on = !!v; if (on) unlock(); },
				isEnabled() { return on; }
			};
			const onAudioEvent = (ev) => { if (ev && ev.detail) api.setEnabled(ev.detail === "on"); };
			window.addEventListener("nier:audio", onAudioEvent);
			if (on) {
				const unlockOnce = () => { unlock(); };
				window.addEventListener("pointerdown", unlockOnce, { once: true });
				window.addEventListener("keydown", unlockOnce, { once: true });
			}
			audioApi = api;
			return () => { window.removeEventListener("nier:audio", onAudioEvent); if (ctx) { try { ctx.close(); } catch (e) {} } };
		}
		//#endregion

		//#region boot screen
		/**
		 * NieR-style boot overlay. Reuses the single `CHARACTER` data URL already
		 * in the bundle (no second copy — so the package does not grow), plays a
		 * self-check log + segmented progress, then destroys its own DOM node so
		 * nothing paints once the app is usable.
		 *
		 * Guard contract, same as the scene: `prefers-reduced-motion` collapses to
		 * a static terminal frame that clears after ~0.8s; any key / click skips.
		 * @returns a disposer that removes the overlay and its listeners.
		 */
		function mountBoot() {
			const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const boot = document.createElement("div");
			boot.id = "dsh-skin-nier-boot";
			boot.setAttribute("aria-hidden", "true");
			boot.innerHTML =
				'<div class="nier-boot-frame">'
				+ '<i class="cb tl"></i><i class="cb tr"></i><i class="cb bl"></i><i class="cb br"></i>'
				+ '</div>'
				+ '<div class="nier-boot-log" id="nier-boot-log"></div>'
				+ '<div class="nier-boot-prompt"><span class="tri">&#9654;</span> PRESS ANY BUTTON</div>'
			+ '<div class="nier-boot-brand">'
			+ '<div class="nier-boot-reticle"><span class="ring"></span><span class="ring inner"></span><i class="mark"></i><i class="gap"></i></div>'
			+ '<span class="alert">&#9632;</span>'
			+ '<div class="nier-boot-name">DEEPSEEK</div>'
			+ '<div class="nier-boot-sub">UNIT 2B · ARCHIVE 02 · LINK STABLE</div></div>'
			+ '<div class="nier-boot-type" id="nier-boot-type"></div>'
				+ '<div class="nier-boot-load"><span class="lbl">NOW LOADING</span>'
				+ '<div class="nier-boot-bar"><i id="nier-boot-fill"></i></div>'
				+ '<span class="nier-boot-pct" id="nier-boot-pct">00%</span></div>'
				+ '<div class="nier-boot-vig"></div>'
				+ '<div class="nier-boot-scan"></div>'
				+ '<div class="nier-boot-trans"></div>'
				+ '<div class="nier-boot-gate" id="nier-boot-gate">'
				+ '<div class="g-ttl">SYSTEM PERMISSION VERIFY</div>'
				+ '<div class="g-cta">[ TAP TO PROCEED ]</div>'
				+ '<div class="g-sub">// YO-RHA UNIT 2B · DEEPSEEK NEURAL LINK</div></div>';
			document.body.appendChild(boot);

			const log = boot.querySelector("#nier-boot-log");
			const lines = [
				['YO-RHA OS', 'INIT'],
				['NEURAL LINK', 'OK'],
				['WEAPON SYS', 'READY'],
				['POD 042', 'SYNC'],
				['DEEPSEEK CORE', 'LINKED']
			];
			lines.forEach((pair, i) => {
				const d = document.createElement("div");
				d.className = "ln";
				d.innerHTML = '<span class="k">' + pair[0] + '</span><span class="dots"></span><span class="v">' + pair[1] + '</span>';
				d.style.animationDelay = (0.3 + i * 0.26) + "s";
				log.appendChild(d);
			});

			/* Live typewriter status — types one boot stage at a time, like a
			 * terminal receiving data (borrowed from dsh-startup-screen's
			 * typewriter subtitle). Complements the static checklist above. */
			const typeEl = boot.querySelector("#nier-boot-type");
			const stages = ["INITIALIZING YO-RHA OS", "MOUNTING NEURAL CORE", "SYNCING POD 042", "LINKING DEEPSEEK", "SYSTEM ONLINE"];
			let si = 0, ci = 0, typeTimer = 0;
			function typeRender() {
				const s = stages[si];
				typeEl.innerHTML = '<span class="ar">&gt; </span>' + s.slice(0, ci) + '<span class="car">&#9612;</span>';
			}
			function typeTick() {
				const s = stages[si];
				if (ci <= s.length) { typeRender(); ci++; typeTimer = setTimeout(typeTick, 20); }
				else if (si < stages.length - 1) { si++; ci = 0; if (audioApi) audioApi.tick(); typeTimer = setTimeout(typeTick, 160); }
			}
			function typeFinish() {
				if (typeTimer) { clearTimeout(typeTimer); typeTimer = 0; }
				typeEl.innerHTML = '<span class="ar">&gt; </span>' + stages[stages.length - 1] + '<span class="car">&#9612;</span>';
			}

			const fill = boot.querySelector("#nier-boot-fill");
			const pct = boot.querySelector("#nier-boot-pct");
			let prog = 0, t0 = null, finished = false, raf = 0;
			const dur = reduce ? 400 : 2600;

			function frame(ts) {
				if (!t0) t0 = ts;
				const k = Math.min(1, (ts - t0) / dur);
				const p = Math.floor(k * 100);
				if (p !== prog) {
					prog = p;
					pct.textContent = (p < 10 ? "0" : "") + p + "%";
					fill.style.width = p + "%";
				}
				if (k < 1) raf = requestAnimationFrame(frame); else finish();
			}
			function finish() {
				if (finished) return; finished = true;
				pct.textContent = "READY";
				typeFinish();
				setTimeout(close, reduce ? 400 : 520);
			}
			function close() {
				boot.classList.add("reveal");
				setTimeout(() => { boot.classList.add("done"); }, 280);
				setTimeout(() => { if (boot.parentNode) boot.remove(); }, 930);
			}
			function skip() {
				if (finished) return; finished = true;
				log.querySelectorAll(".ln").forEach(l => { l.style.opacity = "1"; l.style.transform = "none"; });
				fill.style.width = "100%"; pct.textContent = "READY";
				typeFinish();
				close();
			}
			const gate = boot.querySelector("#nier-boot-gate");
			let gating = false, started = false, gateTimer = 0, beginTimer = 0, watchdog = 0;
			function begin() {
				if (started) return;
				started = true; gating = false;
				if (gateTimer) { clearTimeout(gateTimer); gateTimer = 0; }
				boot.classList.remove("gating");
				void boot.offsetWidth; /* restart CSS entrance animations */
				beginTimer = setTimeout(typeTick, 200);
				raf = requestAnimationFrame(frame);
				if (audioApi) audioApi.bootChime();
			}
			function onInteract() { if (gating) begin(); else skip(); }
			function clear() {
				if (watchdog) { clearTimeout(watchdog); watchdog = 0; }
				if (boot.parentNode) boot.remove();
			}

			/* Hard failsafe. The sequence above is a chain of timers: if any single
			 * callback throws (a missing node, a denied API), the chain breaks and a
			 * full-screen opaque overlay would sit on top of the app forever — which
			 * looks exactly like a hang. This watchdog guarantees removal regardless
			 * of what the animation did. Cheap insurance for a decorative layer. */
			watchdog = setTimeout(clear, 20000);

			if (reduce) {
				log.querySelectorAll(".ln").forEach(l => { l.style.opacity = "1"; l.style.transform = "none"; });
				fill.style.width = "100%"; pct.textContent = "100%";
				typeEl.innerHTML = '<span class="ar">&gt; </span>SYSTEM ONLINE<span class="car">&#9612;</span>';
				setTimeout(clear, 900);
				return clear;
			}
			/* Interactive self-check gate: tap / any key to begin, 4s auto-start. */
			gating = true;
			boot.classList.add("gating");
			window.addEventListener("keydown", onInteract);
			boot.addEventListener("click", onInteract);
			gateTimer = setTimeout(begin, 4000);
			return () => {
				if (raf) cancelAnimationFrame(raf);
				if (beginTimer) clearTimeout(beginTimer);
				if (gateTimer) clearTimeout(gateTimer);
				if (watchdog) clearTimeout(watchdog);
				if (boot.parentNode) boot.remove();
				window.removeEventListener("keydown", onInteract);
				boot.removeEventListener("click", onInteract);
			};
		}
		//#endregion

		//#region control dock (HUD — audio / wallpaper / replay)
		/**
		 * Bottom-corner control dock. Draggable; persists its position. Each button
		 * drives the already-wired channels:
		 *   A — toggle Web Audio synth via `nier:audio` (mountAudio listens)
		 *   W — open the wallpaper panel
		 *   R — replay the boot sequence (via the passed `replay` callback)
		 * Matte gunmetal + a single red corner tab — never a glassy highlight.
		 * @param {function} replay - re-launches the boot overlay.
		 * @returns a disposer.
		 */
		/**
		 * Reader-supplied wallpaper: a full-bleed backdrop plus a 2:3 plate in the
		 * old A2 corner, both persisted in localStorage.
		 *
		 * Uploads are re-encoded on a canvas before storage. localStorage is a
		 * ~5 MB budget shared with the host, and a raw 12 MP JPEG would blow it,
		 * so each slot has a base64 ceiling and a quality ladder that steps down
		 * until it fits. Anything that still does not fit is refused out loud
		 * rather than silently dropped.
		 * @returns {{panel: HTMLElement, dispose: function}|null}
		 */
		function mountWallpaper() {
			const K_MAIN = "nier-wp-main", K_PLATE = "nier-wp-plate", K_VEIL = "nier-wp-veil";
			/* base64 characters, not bytes: localStorage counts UTF-16 units */
			const CAP = { main: 900000, plate: 240000 };
			const MAXW = { main: 2560, plate: 800 };
			const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
			const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
			const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

			const layer = document.createElement("div");
			layer.id = "dsh-skin-nier-wp";
			layer.setAttribute("aria-hidden", "true");
			document.body.appendChild(layer);

			const veil = document.createElement("div");
			veil.id = "dsh-skin-nier-wpveil";
			veil.setAttribute("aria-hidden", "true");
			document.body.appendChild(veil);

			const plate = document.createElement("div");
			plate.id = "dsh-skin-nier-plate";
			plate.setAttribute("aria-hidden", "true");
			document.body.appendChild(plate);

			/* Belt and braces for the rule set below: the CSS clears every shell layer
			 * we could find in app.asar, but a host upgrade can add another one and the
			 * photo would go flat again with no error anywhere. So while a photo is on,
			 * walk the content spine (#root → frame → column → page root → …) and clear
			 * any opaque box that still covers the viewport. Stops as soon as the child
			 * is no longer full-size, and never touches position:fixed (that is where
			 * dialogs live — they must stay opaque). Everything it writes is recorded
			 * so switching the photo off puts the host back exactly as it was. */
			const swept = [];
			const sweepShell = () => {
				const w = innerWidth * innerHeight * 0.5;
				let el = document.querySelector("#root > *");
				for (let depth = 0; el && depth < 8; depth++) {
					const cs = getComputedStyle(el);
					if (cs.position !== "fixed" && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
						if (!swept.some((s) => s.el === el)) swept.push({ el, bg: el.style.backgroundColor });
						el.style.backgroundColor = "transparent";
					}
					let next = null, best = 0;
					for (const child of el.children) {
						const r = child.getBoundingClientRect();
						const area = r.width * r.height;
						if (area > best) { best = area; next = child; }
					}
					if (best < w) break;
					el = next;
				}
			};
			const unsweep = () => {
				while (swept.length) {
					const s = swept.pop();
					s.el.style.backgroundColor = s.bg;
				}
			};

			const paintMain = (url) => {
				if (url) {
					layer.style.backgroundImage = 'url("' + url + '")';
					document.body.classList.add("nier-wp-user");
					sweepShell();
				} else {
					layer.style.backgroundImage = "none";
					document.body.classList.remove("nier-wp-user");
					unsweep();
				}
			};
			const paintPlate = (url) => {
				plate.style.backgroundImage = url ? 'url("' + url + '")' : "none";
				plate.classList.toggle("on", !!url);
			};
			const paintVeil = (v) => document.documentElement.style.setProperty("--nier-veil", (v / 100).toFixed(2));
			/* Only a real data URL counts as a picture. "off" and a missing key
			 * both resolve to null — the build ships no images, so a slot is
			 * either the reader's own picture or nothing at all. */
			const real = (u) => (typeof u === "string" && u.indexOf("data:image/") === 0 ? u : null);
			const mainValue = () => real(lsGet(K_MAIN));
			const plateValue = () => real(lsGet(K_PLATE));

			const panel = document.createElement("div");
			panel.id = "nier-wp-panel";
			panel.hidden = true;
			panel.innerHTML =
				'<div class="wp-h">Wallpaper</div>'
				+ '<div class="wp-row"><span class="wp-k">主背景</span>'
				+ '<button data-wp="main-pick">选择</button>'
				+ '<button data-wp="main-off">关</button></div>'
				+ '<div class="wp-row"><span class="wp-k">左下图版</span>'
				+ '<button data-wp="plate-pick">选择</button>'
				+ '<button data-wp="plate-off">关</button></div>'
				+ '<div class="wp-row"><span class="wp-k">遮罩</span>'
				+ '<input type="range" min="0" max="85" step="5" data-wp="veil"><span class="wp-v">70%</span></div>'
				+ '<p class="wp-hint">主背景 2560×1440（16:9）<br>图版 800×1200（2:3）<br>JPG / PNG / WebP · 单张 ≤12 MB</p>'
				+ '<p class="wp-msg" hidden></p>';
			const q = (sel) => panel.querySelector(sel);
			const range = q('input[data-wp="veil"]');
			const readout = q(".wp-v");
			const msgBox = q(".wp-msg");
			const say = (text) => { msgBox.textContent = text || ""; msgBox.hidden = !text; };

			let onChange = null;
			function sync() {
				q('[data-wp="main-off"]').disabled = !real(lsGet(K_MAIN));
				q('[data-wp="plate-off"]').disabled = !real(lsGet(K_PLATE));
				if (onChange) onChange();
			}

			/** Downscale + re-encode until the data URL fits the slot's ceiling. */
			async function encode(file, kind) {
				if (!/^image\//.test(file.type || "")) throw new Error("这不是图片文件");
				if (file.size > 12 * 1024 * 1024) throw new Error("文件超过 12 MB");
				if (!window.createImageBitmap) throw new Error("当前浏览器不支持本地解码");
				let bmp;
				try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
				catch (e) { throw new Error("这张图无法解码（HEIC 等格式浏览器不支持）"); }
				const scale = Math.min(1, MAXW[kind] / bmp.width);
				const w = Math.max(1, Math.round(bmp.width * scale));
				const h = Math.max(1, Math.round(bmp.height * scale));
				const cv = document.createElement("canvas");
				cv.width = w; cv.height = h;
				const cx = cv.getContext("2d");
				cx.imageSmoothingEnabled = true;
				cx.imageSmoothingQuality = "high";
				cx.drawImage(bmp, 0, 0, w, h);
				if (bmp.close) bmp.close();
				const tries = [["image/webp", .78], ["image/webp", .64], ["image/webp", .52],
					["image/jpeg", .74], ["image/jpeg", .6]];
				for (const [mime, quality] of tries) {
					const url = cv.toDataURL(mime, quality);
					if (url.indexOf("data:" + mime) !== 0) continue;
					if (url.length <= CAP[kind]) return url;
				}
				throw new Error("压缩后仍超出存储上限，换一张更小的图");
			}

			/* One hidden input kept in the DOM and reused. A detached input does not
			 * reliably open the picker, and reusing it avoids leaking a node per pick. */
			const fileInput = document.createElement("input");
			fileInput.type = "file";
			fileInput.accept = "image/png,image/jpeg,image/webp,image/avif";
			fileInput.hidden = true;
			panel.appendChild(fileInput);
			let pickKind = "main";

			fileInput.addEventListener("change", async () => {
				const file = fileInput.files && fileInput.files[0];
				if (!file) return;
				const kind = pickKind;
				say("处理中…");
				try {
					const url = await encode(file, kind);
					const key = kind === "main" ? K_MAIN : K_PLATE;
					if (!lsSet(key, url)) throw new Error("浏览器存储已满，先清除另一张再试");
					if (kind === "main") paintMain(url); else paintPlate(url);
					say("");
					sync();
				} catch (error) {
					say(error && error.message ? error.message : "处理失败");
				}
			});

			function pick(kind) {
				pickKind = kind;
				try { fileInput.value = ""; } catch (e) {}
				fileInput.click();
			}

			panel.addEventListener("click", (e) => {
				const btn = e.target.closest("button[data-wp]");
				if (!btn) return;
				const act = btn.dataset.wp;
				if (act === "main-pick") return pick("main");
				if (act === "plate-pick") return pick("plate");
				if (act === "main-off") { lsDel(K_MAIN); paintMain(null); say(""); return sync(); }
				if (act === "plate-off") { lsDel(K_PLATE); paintPlate(null); say(""); return sync(); }
			});

			range.addEventListener("input", () => {
				const v = Number(range.value) || 0;
				paintVeil(v);
				lsSet(K_VEIL, String(v));
				readout.textContent = v + "%";
			});

			/* Only write --nier-veil once the reader has actually moved the slider.
			 * Leaving it unset lets the per-mode CSS defaults (55 dark / 62 light)
			 * apply and re-resolve on every theme switch. */
			const rawVeil = lsGet(K_VEIL);
			const modeVeil = () => (document.body.hasAttribute("data-ds-dark-theme") ? 70 : 74);
			const veilVal = rawVeil === null ? modeVeil() : Math.max(0, Math.min(85, Number(rawVeil) || 0));
			range.value = String(veilVal);
			readout.textContent = veilVal + "%";
			if (rawVeil !== null) paintVeil(veilVal);
			/* While the veil is on AUTO the CSS default is what actually paints, and
			 * it differs per mode — so the slider has to follow the theme, otherwise
			 * it sits on the value that was computed at mount time. */
			let themeWatch = null;
			if (window.MutationObserver) {
				themeWatch = new MutationObserver(() => {
					if (lsGet(K_VEIL) !== null) return;
					const v = modeVeil();
					range.value = String(v);
					readout.textContent = v + "%";
				});
				try { themeWatch.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] }); }
				catch (e) { themeWatch = null; }
			}
			paintMain(mainValue());
			paintPlate(plateValue());
			sync();

			return {
				panel,
				set onChange(fn) { onChange = fn; },
				dispose() {
					try { if (themeWatch) themeWatch.disconnect(); } catch (e) {}
					try { document.body.classList.remove("nier-wp-user"); } catch (e) {}
					try { document.documentElement.style.removeProperty("--nier-veil"); } catch (e) {}
					for (const node of [layer, veil, plate]) { try { if (node.parentNode) node.parentNode.removeChild(node); } catch (e) {} }
				}
			};
		}

		function mountDock(replay, wp) {
			const dock = document.createElement("div");
			dock.id = "dsh-skin-nier-dock";
			dock.setAttribute("aria-hidden", "true");
			const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
			const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
			dock.innerHTML =
				'<button class="d-btn" data-act="a" title="系统音效">A</button>'
				+ '<button class="d-btn" data-act="w" title="壁纸">W</button>'
				+ '<button class="d-btn" data-act="r" title="重播开屏">R</button>';
			if (wp && wp.panel) dock.appendChild(wp.panel);
			/* The panel owns the state; the dock only renders it. */
			if (wp) wp.onChange = update;
			const btns = {};
			dock.querySelectorAll(".d-btn").forEach(b => { btns[b.dataset.act] = b; });
			function update() {
				const a = lsGet("nier-audio") === "on" ? "on" : "off";
				const mainPref = lsGet("nier-wp-main");
				const w = document.body.classList.contains("nier-wp-user") ? "user" : "none";
				btns.a.textContent = "A:" + (a === "on" ? "ON" : "X");
				/* A/B render as 寄/月: "W:A" stops meaning anything once the sets
				 * have names, and the dock only has room for one glyph. */
				btns.w.textContent = "W:" + (w === "user" ? "U" : "-");
				btns.a.classList.toggle("on", a === "on");
			}
			function toggleAudio() {
				const on = lsGet("nier-audio") === "on";
				const next = on ? "off" : "on";
				lsSet("nier-audio", next);
				window.dispatchEvent(new CustomEvent("nier:audio", { detail: next }));
				update();
			}
			function togglePanel() {
				if (!wp || !wp.panel) return;
				wp.panel.hidden = !wp.panel.hidden;
				btns.w.classList.toggle("on", !wp.panel.hidden);
			}
			let moved = false;
			dock.addEventListener("click", (e) => {
				if (moved) { moved = false; return; }
				const act = e.target.closest(".d-btn");
				if (!act) return;
				const a = act.dataset.act;
				if (a === "a") toggleAudio();
				else if (a === "w") togglePanel();
				else if (a === "r" && replay) replay();
			});
			/* Drag: switch from right/bottom anchoring to left/top once grabbed. */
			let dx = 0, dy = 0, dragging = false;
			const onDown = (e) => {
				/* Clicks inside the wallpaper panel must not drag the dock. */
				if (e.target.closest && e.target.closest("#nier-wp-panel")) return;
				dragging = true; moved = false; dock.classList.add("drag");
				const r = dock.getBoundingClientRect();
				dx = e.clientX - r.left; dy = e.clientY - r.top;
				dock.style.right = "auto"; dock.style.bottom = "auto";
				dock.style.left = r.left + "px"; dock.style.top = r.top + "px";
				e.preventDefault();
			};
			const onMove = (e) => {
				if (!dragging) return;
				let x = e.clientX - dx, y = e.clientY - dy;
				x = Math.max(0, Math.min(x, window.innerWidth - dock.offsetWidth));
				y = Math.max(0, Math.min(y, window.innerHeight - dock.offsetHeight));
				dock.style.left = x + "px"; dock.style.top = y + "px";
				if (Math.abs(e.movementX) + Math.abs(e.movementY) > 3) moved = true;
			};
			const onUp = () => {
				if (!dragging) return; dragging = false; dock.classList.remove("drag");
				lsSet("nier-dock-pos", JSON.stringify({ left: dock.style.left, top: dock.style.top }));
			};
			try {
				const saved = lsGet("nier-dock-pos");
				if (saved) { const p = JSON.parse(saved); dock.style.right = "auto"; dock.style.bottom = "auto"; dock.style.left = p.left; dock.style.top = p.top; }
			} catch (e) {}
			dock.addEventListener("mousedown", onDown);
			window.addEventListener("mousemove", onMove);
			window.addEventListener("mouseup", onUp);
			document.body.appendChild(dock);
			update();
			return () => {
				dock.removeEventListener("mousedown", onDown);
				window.removeEventListener("mousemove", onMove);
				window.removeEventListener("mouseup", onUp);
				if (dock.parentNode) dock.remove();
			};
		}
		//#endregion

		//#region decorative stylesheet
		/**
		 * Purely additive styling — no layout, sizing, or stacking changes that
		 * could fight the platform's own CSS. Everything colour-bearing reads the
		 * alias tokens above, so the sheet follows the active scheme by itself.
		 */
		const STYLE_TEXT = [
			SCENE_CSS,
			/* ---- dynamic particle field (Canvas2D; whale-style "real motion" guardrails) -- */
			".nier-particles{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.92;transition:opacity .9s ease}",
			/* ---- typography (Phase 1: skeleton only) ------------------------
			 * NieR reads as a technical gothic with wide tracking, but its real
			 * face (FOT-Rodin) is proprietary. Route B: headings/labels ride
			 * Bahnschrift — a DIN-like tech face shipped with Windows — while
			 * body copy stays on Segoe so long prose remains readable. Code and
			 * readouts use the mono stack. Everything here is a CSS variable the
			 * platform already consumes, so the 89-token contract is untouched. */
			":root{",
			"--dsw-font-family:'Segoe UI','PingFang SC','Microsoft YaHei','Hiragino Sans GB','Helvetica Neue',Arial,sans-serif;",
			"--ds-font-family-code:'Cascadia Mono','Cascadia Code','SF Mono','JetBrains Mono',Consolas,'Liberation Mono',Menlo,'PingFang SC','Microsoft YaHei',monospace;",
			"--nier-display:'Bahnschrift','DIN Alternate','Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;",
			"}",
			":root{",
			"--nier-space-1:2px;--nier-space-2:4px;--nier-space-3:8px;--nier-space-4:12px;",
			"--nier-space-5:16px;--nier-space-6:24px;--nier-space-7:32px;--nier-space-8:48px;",
			"--nier-type-1:10px;--nier-type-2:11px;--nier-type-3:12px;--nier-type-4:13px;--nier-type-5:14px;",
			"--nier-type-6:16px;--nier-type-7:20px;--nier-type-8:28px;--nier-type-9:40px;",
			"--nier-track-0:0;--nier-track-1:.02em;--nier-track-2:.06em;--nier-track-3:.12em;--nier-track-4:.24em;",
			"--nier-weight-body:400;--nier-weight-label:500;--nier-radius:0;--nier-radius-micro:2px;",
			"--nier-motion-1:80ms;--nier-motion-2:140ms;--nier-motion-3:240ms;--nier-motion-4:400ms;",
			"--nier-ease:cubic-bezier(.2,.6,.2,1);",
			"--nier-hairline:rgba(26,28,31,.22);--nier-elev-1:0 1px 0 rgba(26,28,31,.08);",
			"--nier-elev-2:0 1px 0 rgba(26,28,31,.08),0 6px 16px rgba(26,28,31,.10);",
			"--nier-inset:inset 0 1px 0 rgba(255,255,255,.55);--nier-focus-gap:2px;",
			/* 方案A: interaction is ink, red is reserved for identity + alerts. */
			"--nier-ink-link:#1c1f24;--nier-underline:rgba(28,31,36,.42);--nier-focus:rgba(28,31,36,.85);",
			"}",
			"body[data-ds-dark-theme]{",
			"--nier-hairline:rgba(230,235,242,.22);--nier-elev-1:0 1px 0 rgba(0,0,0,.5);",
			"--nier-elev-2:0 1px 0 rgba(0,0,0,.55),0 6px 16px rgba(0,0,0,.42);",
			"--nier-inset:inset 0 1px 0 rgba(255,255,255,.06);",
			"--nier-ink-link:#e6ebf2;--nier-underline:rgba(230,235,242,.46);--nier-focus:rgba(230,235,242,.90);",
			"}",
			"body{font-family:var(--dsw-font-family);font-variant-numeric:tabular-nums}",
			/* Headings: lighter weight + wide tracking read as system headers,
			 * not prose. Only heading elements — body copy is left alone. */
			"h1,h2,h3,h4,h5,h6{font-family:var(--nier-display);font-weight:var(--nier-weight-body);letter-spacing:var(--nier-track-1)}",
			":root{--dsw-font-markdown-h1-font-family:var(--nier-display);--dsw-font-markdown-h1-font-weight:400;",
			"--dsw-font-markdown-h2-font-family:var(--nier-display);--dsw-font-markdown-h2-font-weight:400;",
			"--dsw-font-markdown-h3-font-family:var(--nier-display);--dsw-font-markdown-h3-font-weight:500;",
			"--dsw-font-markdown-h4-font-family:var(--nier-display);",
			"--dsw-font-markdown-h5-font-family:var(--nier-display);--dsw-font-markdown-h6-font-family:var(--nier-display)}",
			/* ---- Phase 2: rectilinear chrome + crisp focus -------------------
			 * Component classes here are CSS-module hashes (e.g. _8HJdBW_themeCube)
			 * so class-targeting is not portable. What IS stable: the six
			 * --dsl-*radius tokens, native elements, ARIA roles and the motion
			 * tokens. We zero the clean hooks and square native controls while
			 * sparing likely-circular chips (avatars, round icon buttons). */
			":root{--dsl-code-block-border-radius:0;--dsl-diff-radius:0;--dsl-read-radius:0;",
			"--dsl-search-radius:0;--dsl-terminal-radius:0;--dsl-web-radius:0;",
			"--ds-transition-duration:var(--nier-motion-2);--ds-transition-duration-fast:var(--nier-motion-1);--ds-transition-duration-slow:var(--nier-motion-3)}",
			"body button:not([class*='avatar' i]):not([class*='circle' i]):not([class*='round' i]):not([class*='pill' i]):not([class*='switch' i]):not([class*='toggle' i]):not([style*='50%']),",
			"body input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']),body textarea,body select,",
			"body [role='button']:not([class*='avatar' i]):not([class*='circle' i]):not([class*='round' i]):not([class*='switch' i]):not([class*='toggle' i]),",
			"body [role='tab'],body [role='menuitem'],body [role='option']{border-radius:0!important}",
			/* ---- Phase 3: label voice --------------------------------------
			 * NieR buttons read as tracked, uppercase system labels. Applied to
			 * native <button> only (short, controlled copy); [role=button] just
			 * gets tracking so a clickable card's inner prose is not shouted. */
			"/* T1-a CJK: the old global .06em/uppercase button rule is retired -- it inserted ~0.8px",
			"   between every Han glyph. The tracked Latin voice now lives on skin-owned labels only. */",
			":lang(zh) h1,:lang(zh) h2,:lang(zh) h3,:lang(zh) h4,:lang(zh) h5,:lang(zh) h6,",
			":lang(zh) [role='button'],[lang|='zh'] h1,[lang|='zh'] h2,[lang|='zh'] h3,",
			"[lang|='zh'] h4,[lang|='zh'] h5,[lang|='zh'] h6,[lang|='zh'] [role='button']{letter-spacing:0}",
			"body [role='button']{letter-spacing:var(--nier-track-1)}",
			/* Selection reads as a blade highlight. */
			"body ::selection{background:rgba(176,32,42,.22);color:inherit}",
			"body[data-ds-dark-theme] ::selection{background:rgba(210,69,78,.28);color:inherit}",
			/* Focus rings: one hairline in the blade accent, never a glow. */
			"body *:focus-visible{outline:1px solid var(--nier-focus);outline-offset:var(--nier-focus-gap)}",
			/* 方案A: red leaves the interaction layer. In NieR's own UI the interactive
			 * elements are white/grey and red belongs to alerts and the YoRHa mark.
			 * Specificity: the platform sets colour on ._markdown_xxx a (0,1,1) and its
			 * :hover/:focus-visible at (0,2,1), so the `html body` prefix is what wins
			 * without !important. The persistent underline is the affordance that the
			 * colour used to provide -- scoped to prose so card-links stay clean. */
			"body a{color:var(--nier-ink-link)}",
			"html body [class*='markdown' i] a{color:var(--nier-ink-link);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px;text-decoration-color:var(--nier-underline)}",
			"html body [class*='markdown' i] a:hover,html body [class*='markdown' i] a:focus{text-decoration-color:var(--nier-ink-link)}",
			"html body [class*='markdown' i] a:focus-visible{box-shadow:none}",
			/* T1-c state shape redundancy: geometry-only edits on the platform's own
			   state dot. That dot is aria-hidden and always paired with a text label,
			   and its box is sized by the caller -- so no layout can shift here. */
			"body [class*='_dot_']:before,body [class*='_dot_']:after{border-radius:0}",
			"body [class*='_dot_'][data-state='done']:after{top:12%;right:12%;bottom:12%;left:12%}",
			"body [class*='_dot_'][data-state='warning']:before{opacity:.06}",
			"body [class*='_dot_'][data-state='warning']:after{top:8%;right:8%;bottom:8%;left:8%;background:transparent;border:1px solid currentColor}",
			"body [class*='_dot_'][data-state='error']:after{top:15%;right:15%;bottom:15%;left:15%;transform:rotate(45deg)}",
			"body [class*='_dot_']:not([data-state]):before,body [class*='_dot_'][data-state='idle']:before{opacity:.05}",
			"body [class*='_dot_']:not([data-state]):after,body [class*='_dot_'][data-state='idle']:after{top:44%;right:8%;bottom:44%;left:8%;border-radius:0;opacity:.75}",
			/* The ongoing matrix is the only cyan-blue left in the UI; rebind it. */
			"body [class*='_matrix_']{--dsh-state-ongoing:var(--dsw-alias-state-business-primary)}",
			/* NieR HUD: corner brackets + monospace status readout, non-interactive. */
			"#dsh-skin-nier-hud{position:fixed;inset:0;pointer-events:none;z-index:9998}",
			".nier-bracket{position:absolute;width:16px;height:16px;border:0 solid rgba(230,235,242,.30)}",
			".nier-bracket.tl{top:12px;left:12px;border-top-width:1px;border-left-width:1px}",
			".nier-bracket.tr{top:12px;right:12px;border-top-width:1px;border-right-width:1px}",
			".nier-bracket.bl{bottom:12px;left:12px;border-bottom-width:1px;border-left-width:1px}",
			".nier-bracket.br{bottom:12px;right:12px;border-bottom-width:1px;border-right-width:1px}",
			"body[data-ds-dark-theme] .nier-bracket{border-color:rgba(230,235,242,.22)}",
			".nier-hud-status{position:absolute;left:32px;bottom:12px;font:var(--nier-weight-label) var(--nier-hud-size)/1 ui-monospace,Menlo,Consolas,monospace;",
			"letter-spacing:var(--nier-track-3);color:rgba(176,32,42,.42);user-select:none;text-transform:uppercase}",
			/* CRT scanlines over the whole surface — decorative, non-interactive. */
			"body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;",
			"background-image:repeating-linear-gradient(to bottom,rgba(20,26,34,.018) 0 1px,transparent 1px 4px)}",
			"body[data-ds-dark-theme]::after{",
			"background-image:repeating-linear-gradient(to bottom,rgba(255,255,255,.012) 0 1px,transparent 1px 4px)}",
			/* Square scrollbar: the UI's rectilinear language, not rounded pills. */
			"body ::-webkit-scrollbar{width:10px;height:10px}",
			"body ::-webkit-scrollbar-track{background:transparent}",
			"body ::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l1);",
			"border:3px solid transparent;background-clip:content-box;border-radius:0}",
			"body ::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l1);",
			"border:3px solid transparent;background-clip:content-box}",
			"body ::-webkit-scrollbar-corner{background:transparent}",
"/* ===== NieR world-language pass (additive, declared after the base scene rules) ===== */",
"#dsh-skin-nier-scene{--nier-sky:radial-gradient(96% 42% at 70% 58%,rgba(150,158,168,.30),transparent 76%),radial-gradient(58% 30% at 92% 64%,rgba(128,137,148,.22),transparent 72%),radial-gradient(120% 80% at 100% 100%,rgba(120,127,137,.30),transparent 82%);--nier-city:rgba(74,82,92,.50);--nier-city-far:rgba(96,104,114,.42);--nier-fog:rgba(170,177,186,.34);--nier-ground:rgba(120,127,137,.12);--nier-glow:rgba(150,157,166,.32)}",
"body[data-ds-dark-theme] #dsh-skin-nier-scene{--nier-sky:radial-gradient(96% 42% at 70% 58%,rgba(40,46,56,.40),transparent 76%),radial-gradient(58% 30% at 92% 64%,rgba(54,60,70,.26),transparent 72%),radial-gradient(120% 80% at 100% 100%,rgba(4,8,12,.95),transparent 82%);--nier-city:rgba(30,36,46,.92);--nier-city-far:rgba(12,16,22,.90);--nier-fog:rgba(120,127,137,.16);--nier-ground:rgba(60,66,76,.14);--nier-glow:rgba(110,117,127,.34)}",
".nier-fog.band{opacity:.42;background:linear-gradient(to top,transparent 34%,rgba(120,127,137,.10) 52%,transparent 66%)}",
".nier-rim{position:absolute;left:0;right:0;height:1px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(230,235,242,.14) 22%,rgba(230,235,242,.22) 50%,rgba(230,235,242,.14) 78%,transparent)}",
".nier-rim.top{top:0}.nier-rim.bottom{bottom:0}",
"body[data-ds-dark-theme] .nier-rim{background:linear-gradient(90deg,transparent,rgba(230,235,242,.10) 22%,rgba(230,235,242,.20) 50%,rgba(230,235,242,.10) 78%,transparent)}",

"/* ===== NieR boot screen (additive, self-disposing overlay) ===== */",
"#dsh-skin-nier-boot{position:fixed;inset:0;z-index:10000;background:#000;color:#e8e8ea;font-family:'Cascadia Mono','Cascadia Code','Consolas',monospace;overflow:hidden;animation:nier-boot-fade .5s ease both}",
"#dsh-skin-nier-boot.done{animation:nier-boot-out .6s ease forwards}",
"#dsh-skin-nier-boot .cb{position:absolute;width:40px;height:40px;border:2px solid #a3262e;z-index:40;pointer-events:none}",
"#dsh-skin-nier-boot .cb.tl{top:24px;left:24px;border-right:0;border-bottom:0}",
"#dsh-skin-nier-boot .cb.tr{top:24px;right:24px;border-left:0;border-bottom:0}",
"#dsh-skin-nier-boot .cb.bl{bottom:24px;left:24px;border-right:0;border-top:0}",
"#dsh-skin-nier-boot .cb.br{bottom:24px;right:24px;border-left:0;border-top:0}",
"#dsh-skin-nier-boot .nier-boot-frame::before,#dsh-skin-nier-boot .nier-boot-frame::after{content:'';position:absolute;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22) 12%,rgba(255,255,255,.22) 88%,transparent)}",
"#dsh-skin-nier-boot .nier-boot-frame::before{top:84px}",
"#dsh-skin-nier-boot .nier-boot-frame::after{bottom:96px}",
".nier-boot-log{position:absolute;top:104px;left:48px;width:min(360px,46vw);z-index:20;border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.4);padding:16px 20px;font-size:14px;letter-spacing:var(--nier-track-1)}",
".nier-boot-log .log-h{color:#d2454e;font-weight:var(--nier-weight-label);letter-spacing:var(--nier-track-3);font-size:12px;display:flex;align-items:center;gap:9px;margin-bottom:12px;border-bottom:1px solid rgba(163,38,46,.35);padding-bottom:8px}",
".nier-boot-log .log-h .dot{width:6px;height:6px;background:#a3262e}",
".nier-boot-log .ln{position:relative;display:flex;align-items:baseline;gap:6px;line-height:1.8;color:#9aa0a6;opacity:0;transform:translateX(-6px);animation:nier-boot-ln var(--nier-motion-3) ease forwards}",
/* Absolute inside the 20px left padding: never a flex item, so the key text
   cannot shift by one pixel. It fades in with its parent row for free. */
".nier-boot-log .ln::before{content:'';position:absolute;left:-12px;top:50%;width:5px;height:5px;margin-top:-2.5px;background:#a3262e}",
".nier-boot-log .ln .k{color:#b9bec4;white-space:nowrap}",
".nier-boot-log .ln .dots{flex:1;border-bottom:1px dotted rgba(255,255,255,.28);transform:translateY(-3px);min-width:14px}",
".nier-boot-log .ln .v{color:#e8e8ea;white-space:nowrap;font-weight:600}",
".nier-boot-prompt{position:absolute;top:108px;right:48px;z-index:20;color:#a3262e;font-size:12px;letter-spacing:.16em;display:flex;align-items:center;gap:8px;animation:nier-boot-blink 1.1s steps(1) infinite}",
".nier-boot-prompt .tri{font-size:10px}",
/* Lifted above the self-check veil (z:60) so the official logomark + wordmark
 * stay crisp and un-dimmed during the gate, then remain in place after begin(). */
".nier-boot-brand{position:absolute;left:50%;bottom:13vh;transform:translateX(-50%);z-index:70;pointer-events:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 18px}",
".nier-boot-brand .alert{position:absolute;left:50%;top:-26px;transform:translateX(-50%);color:#a3262e;font-size:13px;letter-spacing:.4em;margin:0;animation:nier-boot-warn 1.4s ease-in-out infinite}",
".nier-boot-name{font-family:'Bahnschrift','DIN Alternate','Segoe UI',sans-serif;font-weight:700;font-size:clamp(34px,5.6vw,68px);letter-spacing:.3em;color:#f3f3f3;padding-left:.3em;text-shadow:1px 0 rgba(163,38,46,.55),-1px 0 rgba(163,38,46,.35);animation:nier-boot-glitch 4.2s steps(1) infinite}",
"#dsh-skin-nier-boot .nier-boot-name{border-bottom:0;padding-bottom:0}",
".nier-boot-sub{width:100%;text-align:center;font-size:12px;letter-spacing:.22em;color:rgba(198,204,212,.78);margin-top:16px;padding-top:12px;border-top:1px solid rgba(163,38,46,.45)}",
".nier-boot-load{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:25;display:flex;align-items:center;gap:14px;font-size:12px;letter-spacing:.22em;color:#9aa0a6}",
".nier-boot-load .lbl{white-space:nowrap}",
/* T1-c: 8 discrete cells. At 6px tall only 4px sat inside the border, where the
   old 7px stripe pattern was completely lost; 8px lets cell and rule coexist. */
".nier-boot-bar{width:min(360px,44vw);height:8px;border:1px solid rgba(255,255,255,.45);position:relative;overflow:hidden;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.085) 0 calc(12.5% - 2px),transparent calc(12.5% - 2px) 12.5%)}",
/* Gutters ride on top of the fill as an overlay, so i's width:% keeps its meaning. */
".nier-boot-bar::after{content:'';position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(90deg,transparent 0 calc(12.5% - 2px),#000 calc(12.5% - 2px) 12.5%)}",
".nier-boot-bar i{position:absolute;left:0;top:0;bottom:0;width:0%;background:#a3262e;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset -1px 0 0 rgba(255,255,255,.62);transition:width var(--nier-motion-3) linear}",
".nier-boot-pct{color:#e8e8ea;min-width:46px;text-align:right;font-variant-numeric:tabular-nums}",
".nier-boot-vig{position:absolute;inset:0;z-index:28;pointer-events:none;background:radial-gradient(120% 90% at 50% 42%,transparent 55%,rgba(0,0,0,.7) 100%)}",
".nier-boot-scan{position:absolute;inset:0;z-index:30;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.08) 0 1px,transparent 1px 4px);mix-blend-mode:multiply;opacity:.5}",
".nier-boot-scan::after{content:'';position:absolute;left:0;right:0;height:120px;background:linear-gradient(180deg,transparent,rgba(163,38,46,.08),transparent);animation:nier-boot-sweep 5.5s linear infinite}",
"#dsh-skin-nier-boot .nier-boot-trans{position:absolute;inset:0;z-index:40;pointer-events:none;opacity:0;background:linear-gradient(90deg,transparent 0 47%,rgba(163,38,46,.12) 50%,transparent 53% 100%);mix-blend-mode:screen}",
"#dsh-skin-nier-boot.reveal .nier-boot-trans{animation:nier-boot-reveal .28s steps(3,end) 1}",
"#dsh-skin-nier-boot.reveal .nier-boot-frame{animation:nier-boot-glitch .14s steps(2) 1}",
"@keyframes nier-boot-reveal{0%{opacity:0;clip-path:inset(0 0 100% 0)}40%{opacity:1}100%{opacity:0;clip-path:inset(0 0 0 0)}}",
"@keyframes nier-boot-fade{from{opacity:0}to{opacity:1}}",
"@keyframes nier-boot-out{to{opacity:0;visibility:hidden}}",
"@keyframes nier-boot-ln{to{opacity:1;transform:none}}",
"@keyframes nier-boot-blink{50%{opacity:.25}}",
"@keyframes nier-boot-warn{0%,100%{opacity:1}50%{opacity:.35}}",
"@keyframes nier-boot-sweep{0%{top:-120px}100%{top:100%}}",
"@keyframes nier-boot-glitch{0%,93%,100%{text-shadow:2px 0 #a3262e,-2px 0 rgba(163,38,46,.5)}94%{text-shadow:-3px 0 #a3262e,3px 0 rgba(163,38,46,.5);transform:translateX(2px)}97%{text-shadow:3px 0 #a3262e,-3px 0 rgba(163,38,46,.5);transform:translateX(-2px)}}",
"/* Ring reticle — slowly orbiting lock-on, gap held at the bottom (YoRHa HUD). */",
".nier-boot-reticle{position:absolute;left:50%;top:50%;width:300px;height:300px;transform:translate(-50%,-50%);z-index:-1;pointer-events:none}",
".nier-boot-reticle .ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(230,235,242,.16)}",
".nier-boot-reticle .ring.inner{inset:26px;border-color:rgba(230,235,242,.10)}",
".nier-boot-reticle .gap{position:absolute;left:calc(50% - 21px);bottom:-1px;width:42px;height:8px;background:#000}",
".nier-boot-reticle .mark{position:absolute;left:calc(50% - 1.5px);top:-1px;width:3px;height:11px;background:#a3262e;box-shadow:0 0 7px rgba(163,38,46,.7);transform-origin:50% 151px;animation:nier-boot-spin 24s linear infinite}",
"@keyframes nier-boot-spin{to{transform:rotate(360deg)}}",
"/* Live typewriter status — terminal receiving data, complementing the checklist. */",
".nier-boot-type{position:absolute;top:300px;left:48px;z-index:20;font-family:inherit;font-size:var(--nier-readout);letter-spacing:var(--nier-track-1);color:#aeb6c0;min-height:18px}",
".nier-boot-type .ar{color:#a3262e;font-weight:700}",
".nier-boot-type .car{color:#a3262e;animation:nier-boot-blink 1s steps(1) infinite}",
"@media (prefers-reduced-motion:reduce){",
"#dsh-skin-nier-boot,#dsh-skin-nier-boot .nier-boot-name,#dsh-skin-nier-boot .nier-boot-prompt,#dsh-skin-nier-boot .nier-boot-brand .alert,#dsh-skin-nier-boot .nier-boot-scan::after,#dsh-skin-nier-boot .nier-boot-log .ln,.nier-boot-reticle .mark,.nier-boot-type .car,.nier-boot-trans{animation:none!important}",
"#dsh-skin-nier-boot .nier-boot-log .ln{opacity:1!important;transform:none!important}}",
"/* YoRHa control dock — matte gunmetal, red corner tab (no glassy highlight). */",
"#dsh-skin-nier-dock{position:fixed;right:16px;bottom:16px;z-index:9997;display:flex;gap:0;padding:8px 4px 4px;background:rgba(16,20,26,.74);border:1px solid var(--nier-hairline);border-radius:var(--nier-radius-micro);pointer-events:auto;font:var(--nier-weight-label) var(--nier-dock-size)/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:var(--nier-track-2);color:rgba(230,235,242,.82);user-select:none;cursor:grab}",
"#dsh-skin-nier-dock.drag{cursor:grabbing}",
"#dsh-skin-nier-dock::before{content:'';position:absolute;left:0;top:0;width:4px;height:4px;background:#a3262e}",
"#dsh-skin-nier-dock::after{content:'';position:absolute;left:50%;top:3px;transform:translateX(-50%);width:18px;height:2px;background:repeating-linear-gradient(90deg,rgba(230,235,242,.38) 0 1px,transparent 1px 4px);pointer-events:none}",
"#dsh-skin-nier-dock .d-btn{padding:8px 12px;text-transform:uppercase;color:rgba(230,235,242,.7);background:transparent;border:0;cursor:pointer;transition:background var(--nier-motion-1) var(--nier-ease),color var(--nier-motion-1) var(--nier-ease);font:inherit;font-family:var(--nier-display);letter-spacing:var(--nier-track-3)}",
"#dsh-skin-nier-dock .d-btn+.d-btn{border-left:1px solid rgba(230,235,242,.16)}",
"#dsh-skin-nier-dock .d-btn:hover{background:rgba(163,38,46,.26);color:#fff}",
"#dsh-skin-nier-dock .d-btn.on{color:#d2454e;box-shadow:inset 0 -2px 0 #a3262e}",
"/* Boot gate — interactive self-check before the sequence begins. */",
"#dsh-skin-nier-boot.gating .nier-boot-log,#dsh-skin-nier-boot.gating .nier-boot-type,#dsh-skin-nier-boot.gating .nier-boot-load,#dsh-skin-nier-boot.gating .nier-boot-prompt{opacity:0!important;animation:none!important}",
"/* Keep the character visible as a silhouette behind the self-check gate (so the boot always shows the figure), then fade to full once the sequence begins. */",
"#dsh-skin-nier-boot .nier-boot-gate{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,.20);opacity:0;pointer-events:none;transition:opacity .4s ease}",
"#dsh-skin-nier-boot.gating .nier-boot-gate{opacity:1;pointer-events:auto}",
"#dsh-skin-nier-boot .nier-boot-gate .g-ttl{font-family:'Bahnschrift','DIN Alternate','Segoe UI',sans-serif;font-weight:700;letter-spacing:.34em;color:#f3f3f3;font-size:clamp(22px,4vw,40px);padding-left:.34em;text-shadow:0 2px 14px #000,0 0 6px #000,2px 0 #a3262e}",
"#dsh-skin-nier-boot .nier-boot-gate .g-cta{font-size:13px;letter-spacing:.2em;color:#d2454e;text-shadow:0 2px 10px #000,0 0 5px #000;animation:nier-boot-blink 1.1s steps(1) infinite}",
"/* T1 readability: +1px on the 22 reading-region composite shorthands. */",
"/* Must be body{}, not :root{} -- the platform declares these on body. */",
"body{",
"--dsw-font-markdown-h1:700 25px/36px var(--dsw-font-family);--dsw-font-markdown-h1-font-size:25px;--dsw-font-markdown-h1-line-height:36px;",
"--dsw-font-markdown-h2:700 23px/34px var(--dsw-font-family);--dsw-font-markdown-h2-font-size:23px;--dsw-font-markdown-h2-line-height:34px;",
"--dsw-font-markdown-h3:700 21px/32px var(--dsw-font-family);--dsw-font-markdown-h3-font-size:21px;--dsw-font-markdown-h3-line-height:32px;",
"--dsw-font-markdown-h4:600 17px/30px var(--dsw-font-family);--dsw-font-markdown-h4-font-size:17px;--dsw-font-markdown-h4-line-height:30px;",
"--dsw-font-markdown-base:17px/30px var(--dsw-font-family);--dsw-font-markdown-base-font-size:17px;--dsw-font-markdown-base-line-height:30px;",
"--dsw-font-markdown-base-strong:600 17px/30px var(--dsw-font-family);--dsw-font-markdown-base-strong-font-size:17px;--dsw-font-markdown-base-strong-line-height:30px;",
"--dsw-font-markdown-base-italic:italic 17px/30px var(--dsw-font-family);--dsw-font-markdown-base-italic-font-size:17px;--dsw-font-markdown-base-italic-line-height:30px;",
"--dsw-font-markdown-base-strong-italic:italic 600 17px/30px var(--dsw-font-family);--dsw-font-markdown-base-strong-italic-font-size:17px;--dsw-font-markdown-base-strong-italic-line-height:30px;",
"--dsw-font-markdown-table:16px/27px var(--dsw-font-family);--dsw-font-markdown-table-font-size:16px;--dsw-font-markdown-table-line-height:27px;",
"--dsw-font-markdown-table-head:500 16px/27px var(--dsw-font-family);--dsw-font-markdown-table-head-font-size:16px;--dsw-font-markdown-table-head-line-height:27px;",
"--dsw-font-markdown-small:15px/26px var(--dsw-font-family);--dsw-font-markdown-small-font-size:15px;--dsw-font-markdown-small-line-height:26px;",
"--dsw-font-markdown-small-strong:600 15px/26px var(--dsw-font-family);--dsw-font-markdown-small-strong-font-size:15px;--dsw-font-markdown-small-strong-line-height:26px;",
"--dsw-font-markdown-small-italic:italic 15px/26px var(--dsw-font-family);--dsw-font-markdown-small-italic-font-size:15px;--dsw-font-markdown-small-italic-line-height:26px;",
"--dsw-font-markdown-small-strong-italic:italic 600 15px/26px var(--dsw-font-family);--dsw-font-markdown-small-strong-italic-font-size:15px;--dsw-font-markdown-small-strong-italic-line-height:26px;",
"--dsw-font-markdown-code:15px/24px var(--ds-font-family-code);--dsw-font-markdown-code-font-size:15px;--dsw-font-markdown-code-line-height:24px;",
"--dsw-font-markdown-code-block:14px/24px var(--ds-font-family-code);--dsw-font-markdown-code-block-font-size:14px;--dsw-font-markdown-code-block-line-height:24px;",
"--dsw-font-markdown-code-block-small:13px/20px var(--ds-font-family-code);--dsw-font-markdown-code-block-small-font-size:13px;--dsw-font-markdown-code-block-small-line-height:20px;",
"--dsw-font-xl-24:600 25px/34px var(--dsw-font-family);--dsw-font-xl-24-font-size:25px;--dsw-font-xl-24-line-height:34px;",
"--dsw-font-l-20:500 21px/30px var(--dsw-font-family);--dsw-font-l-20-font-size:21px;--dsw-font-l-20-line-height:30px;",
"--dsw-font-m-18:500 17px/30px var(--dsw-font-family);--dsw-font-m-18-font-size:17px;--dsw-font-m-18-line-height:30px;",
"--dsw-font-base-16:17px/26px var(--dsw-font-family);--dsw-font-base-16-font-size:17px;--dsw-font-base-16-line-height:26px;",
"--dsw-font-base-strong-16:500 17px/26px var(--dsw-font-family);--dsw-font-base-strong-16-font-size:17px;--dsw-font-base-strong-16-line-height:26px;",
"--nier-hud-size:12px;--nier-dock-size:12px;--nier-cap-size:10.5px;--nier-readout:14px;",
"}",
"#dsh-skin-nier-boot .nier-boot-gate .g-sub{font-size:11px;letter-spacing:.24em;color:#c3c9d1;margin-top:4px;text-shadow:0 2px 10px #000,0 0 5px #000}",
/* ---- user wallpaper (dock "W") -------------------------------------------
 * Two reader-supplied slots: a full-bleed backdrop and a 2:3 plate in the old
 * A2 corner. The backdrop cannot live inside #dsh-skin-nier-scene — that node
 * is a right-gutter element (width:100vw-420px) masked toward the left, so a
 * photo inside it could never reach the left edge. It gets its own fixed layer
 * at z:-3, under the scene and under every host surface.
 *
 * Host panels are only 62-95 % opaque, so a photo alone would wreck text
 * contrast; the veil at z:-2 sits above the photo but below the UI, and its
 * strength is the one control worth exposing. */
"#dsh-skin-nier-wp{position:fixed;inset:0;z-index:-3;pointer-events:none;opacity:0;",
"background-size:cover;background-position:50% 50%;background-repeat:no-repeat;",
"transition:opacity .5s var(--nier-ease)}",
"body.nier-wp-user #dsh-skin-nier-wp{opacity:1}",
"#dsh-skin-nier-wpveil{position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:0;",
"background:#0b0e12;transition:opacity .3s var(--nier-ease)}",
"body.nier-wp-user #dsh-skin-nier-wpveil{opacity:var(--nier-veil,.70)}",
/* Paper needs a stronger wash than ink does: a mid-tone photo under 45 % of
 * #efece5 left body text at ~3.8:1, below AA. The default lives in CSS, not in
 * JS, so switching theme re-resolves it instead of freezing the value that was
 * computed at mount time. */
"body:not([data-ds-dark-theme]).nier-wp-user #dsh-skin-nier-wpveil{opacity:var(--nier-veil,.74)}",
"body:not([data-ds-dark-theme]) #dsh-skin-nier-wpveil{background:#efece5}",
/* A photo behind the ruin skyline reads as a sticker, and the preset's own
 * ground wash would double-darken the veil. Both step aside for reader art. */
"body.nier-wp-user .nier-wallpaper{background:none}",
"body.nier-wp-user .nier-city{opacity:0}",
"body.nier-wp-user #dsh-skin-nier-scene{--nier-sky:none}",
/* The photo layer is a body child at z-index:-3, so *everything* the host paints
 * inside #root sits on top of it. The shell is not one box but a stack of them,
 * each with its own background — straight out of app.asar:
 *
 *   .frame       { background: var(--dsw-alias-bg-base) }        ← Windows 上不透明
 *   [data-platform=darwin] .frame { background: 0 0 }            ← macOS 才透明（1.1.0 只看到这条）
 *   .centerCol   { background: var(--dsw-alias-bg-base) }        ← 仅 [data-windows-titlebar]
 *   .bottomRow   { background: var(--dsw-alias-bg-base) }
 *   .sidebarCol  { background: var(--dsw-specific-sidebar-fill) }
 *   .rightbarCol { background: var(--dsw-alias-bg-base) }        ← 仅 darwin
 *   ._root / ._page { background: var(--dsw-alias-bg-base) }     ← 会话页 / 插件页根节点
 *
 * Miss any one of them and the photo stays hidden while the scene it replaced has
 * already been switched off — the background goes flat, no photo and no ruins.
 * That is exactly what 1.1.0 shipped: it cleared the four columns but not .frame,
 * which wraps them all. So while a photo is on, every one of these steps aside and
 * the veil (z-index:-2, above the photo and below all content) does the dimming.
 *
 * Specificity (0,2,1) already beats the host's (0,1,0), so no !important is needed.
 * Substring match (not the full name) because the host hashes the prefix per build
 * — mP3x-q_centerCol today, something else tomorrow; the `_name` tail survives.
 * `_frame` / `_root` / `_page` are deliberately broad: they also hit plugin page
 * shells and disclosure roots, where a transparent background is what we want
 * anyway. Regression harness: preview/_repro-host.html must report VISIBLE. */
"body.nier-wp-user [class*='centerCol'],body.nier-wp-user [class*='rightbarCol'],",
"body.nier-wp-user [class*='bottomRow'],body.nier-wp-user [class*='sidebarCol'],",
"body.nier-wp-user [class*='_frame'],body.nier-wp-user [class*='_root'],",
"body.nier-wp-user [class*='_page'],body.nier-wp-user [class*='_screen'],",
"body.nier-wp-user [class*='_mainPanel']{background-color:transparent}",
/* plate: the old A2 corner, now a reader-framed 2:3 print */
"#dsh-skin-nier-plate{position:fixed;left:14px;bottom:66px;z-index:1;pointer-events:none;display:none;",
"width:clamp(148px,13vw,204px);aspect-ratio:2/3;background-size:cover;background-position:50% 50%;",
"border:1px solid rgba(230,235,242,.30);border-radius:var(--nier-radius-micro);",
"box-shadow:0 0 0 1px rgba(0,0,0,.55),0 10px 28px rgba(0,0,0,.5)}",
"#dsh-skin-nier-plate.on{display:block}",
"body:not([data-ds-dark-theme]) #dsh-skin-nier-plate{outline:7px solid #f8f6f0}",
/* panel, anchored above the dock */
"#nier-wp-panel{position:absolute;right:0;bottom:calc(100% + 8px);width:274px;",
"background:rgba(14,18,23,.96);border:1px solid var(--nier-hairline);border-radius:var(--nier-radius-micro);",
"padding:11px 12px 10px;color:rgba(230,235,242,.86);cursor:default;",
"font:var(--nier-weight-label) var(--nier-cap-size)/1.6 ui-monospace,Menlo,Consolas,monospace;",
"letter-spacing:var(--nier-track-1);box-shadow:0 14px 36px rgba(0,0,0,.5)}",
"#nier-wp-panel[hidden]{display:none}",
"#nier-wp-panel::before{content:'';position:absolute;left:0;top:0;width:4px;height:4px;background:#a3262e}",
"#nier-wp-panel .wp-h{color:rgba(230,235,242,.46);letter-spacing:var(--nier-track-3);",
"text-transform:uppercase;margin-bottom:8px}",
"#nier-wp-panel .wp-row{display:flex;align-items:center;gap:6px;margin:5px 0}",
"#nier-wp-panel .wp-k{flex:0 0 56px;color:rgba(230,235,242,.5);letter-spacing:.06em}",
"#nier-wp-panel button{padding:3px 7px;background:transparent;color:rgba(230,235,242,.78);",
"border:1px solid rgba(230,235,242,.24);border-radius:2px;cursor:pointer;font:inherit;letter-spacing:.06em;",
"transition:background var(--nier-motion-1) var(--nier-ease),border-color var(--nier-motion-1) var(--nier-ease),color var(--nier-motion-1) var(--nier-ease)}",
"#nier-wp-panel button:hover:not(:disabled){border-color:rgba(230,235,242,.5);color:#fff}",
"#nier-wp-panel button:disabled{opacity:.34;cursor:default}",
"#nier-wp-panel button[aria-pressed='true']{border-color:#a3262e;color:#e46b72}",
"#nier-wp-panel input[type=range]{flex:1 1 auto;min-width:0;height:2px;margin:0 2px;",
"-webkit-appearance:none;appearance:none;background:rgba(230,235,242,.26);outline:0;cursor:pointer}",
"#nier-wp-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:8px;height:12px;",
"background:#a3262e;border-radius:1px;cursor:pointer}",
"#nier-wp-panel .wp-v{flex:0 0 30px;text-align:right;color:rgba(230,235,242,.6)}",
"#nier-wp-panel .wp-hint{margin:9px 0 0;padding-top:8px;border-top:1px solid rgba(230,235,242,.14);",
"color:rgba(230,235,242,.4);letter-spacing:.04em;line-height:1.7}",
"#nier-wp-panel .wp-msg{margin:7px 0 0;color:#e46b72;letter-spacing:.04em;line-height:1.6}",
"#nier-wp-panel .wp-msg[hidden]{display:none}",
"@media (max-width:1180px){#dsh-skin-nier-plate{display:none!important}}"
		].join("");

		/**
		 * Install the decorative sheet, replacing any copy a previous fiber left
		 * behind (HMR / re-apply would otherwise stack duplicates).
		 * @returns the inserted style element.
		 */
		function mountStyle() {
			for (const stale of document.querySelectorAll("style[data-dsh-skin='" + SOURCE + "']")) stale.remove();
			const style = document.createElement("style");
			style.setAttribute("data-dsh-skin", SOURCE);
			style.textContent = STYLE_TEXT;
			document.head.appendChild(style);
			return style;
		}
		//#endregion

		//#region plugin body
		/** Required service: the theme registry that owns `--dsw-*` token overrides. */
		const inject = ["theme"];

		/**
		 * Client plugin body: stack the palette layer over whatever theme the user
		 * has selected (light or dark), install the decorative sheet, and stand the
		 * character in the right gutter.
		 *
		 * Stability contract — the reason every mount goes through `guard`/`keep`:
		 * this skin is decoration, so **no skin failure is allowed to become a host
		 * failure**. Each mount is isolated; if one throws (a DOM assumption broken
		 * by a future DSH version, a blocked localStorage, a denied audio context),
		 * only that piece is skipped and the rest of the skin — or none of it —
		 * still renders. Everything is released through the single `ctx.effect`
		 * disposer below, so disabling the plugin restores the platform palette and
		 * leaves no orphaned node behind.
		 * @param {object} ctx - client cordis context.
		 */
		function apply(ctx) {
			ctx.effect(() => {
			const disposers = [];
			/** Log once and keep going: the host UI must never inherit our exception. */
			const skip = (label, error) => {
				if (typeof console !== "undefined" && console.warn) {
					console.warn(`[nier-skin] ${label} 挂载失败，已跳过（皮肤降级，不影响宿主）`, error);
				}
			};
			const guard = (label, fn) => {
				try { return fn(); } catch (error) { skip(label, error); return null; }
			};
			const keep = (label, fn) => {
				const release = guard(label, fn);
				if (typeof release === "function") disposers.push(release);
				return release;
			};

			const releaseTokens = keep("令牌覆盖", () => ctx.theme.overrideTokens(SOURCE, TOKENS));
			const style = guard("样式表", mountStyle);
		const nodes = guard("场景层", mountScene) || [];
		keep("视差", mountParallax);
		keep("音效", mountAudio);
		/* Boot is tracked separately, not in `disposers`: replayBoot replaces it,
		 * so a list entry would go stale and its teardown could run twice. */
		let bootDisposer = guard("启动动画", mountBoot);
		/* Re-launch the boot overlay (dock "R" button + text easter egg). */
		function replayBoot() {
			if (bootDisposer) { try { bootDisposer(); } catch (e) {} bootDisposer = null; }
			const ex = document.getElementById("dsh-skin-nier-boot");
			if (ex && ex.parentNode) ex.remove();
			bootDisposer = guard("启动动画", mountBoot);
		}
		const wallpaper = guard("壁纸", mountWallpaper);
		keep("壁纸释放", () => wallpaper && wallpaper.dispose);
		keep("控制条", () => mountDock(replayBoot, wallpaper));
		keep("粒子", mountParticles);
		/* P2-9 text easter egg: typing POD / YORHA / 2B in any field replays the boot. */
		const onEgg = (e) => {
			try {
				const t = e.target; if (!t) return;
				const tag = (t.tagName || "").toUpperCase();
				if ((tag === "INPUT" || tag === "TEXTAREA") && /POD|YORHA|2B/i.test(t.value || "")) replayBoot();
			} catch (error) { skip("文本彩蛋", error); }
		};
		guard("文本彩蛋", () => document.addEventListener("input", onEgg));
			return () => {
				/* Teardown is best-effort too: one failing disposer must not strand
				 * the others (that is how orphaned overlays survive a reload). */
				document.removeEventListener("input", onEgg);
				if (bootDisposer) { try { bootDisposer(); } catch (e) { skip("启动动画释放", e); } }
				if (releaseTokens) try { releaseTokens(); } catch (e) { skip("令牌覆盖释放", e); }
				if (style && style.remove) try { style.remove(); } catch (e) { skip("样式表释放", e); }
				for (const release of disposers) { try { release(); } catch (e) { skip("释放", e); } }
			for (const node of nodes) { try { node.remove(); } catch (e) {} }
		};
			}, "nier-automata: palette layer + scene + figure + decorative sheet");
		}
		//#endregion

		exports.TOKENS = TOKENS;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = SOURCE;
		return module.exports;
	}
});
