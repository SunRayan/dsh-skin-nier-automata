#!/usr/bin/env node
/**
 * Live probe against a running DSH instance.
 *
 * Connects to a headless browser over CDP, reloads the app with cache bypass
 * (so the freshly built `/plugins/<id>/client.js` is fetched), then reports what
 * the skin actually did in a real browser: whether the decorative <img> mounted,
 * its resolved geometry, whether it overlaps the reading column, and the
 * computed value of a handful of alias tokens.
 *
 * Usage:
 *   node tools/live-probe.mjs [--cdp 9224] [--url http://127.0.0.1:17651/]
 *                             [--width 1600] [--height 1000] [--scheme dark]
 *                             [--shot out.jpg] [--no-reload]
 */

import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);

const CDP_PORT = Number(arg("cdp", 9224));
const URL_MATCH = arg("url", "127.0.0.1");
const WIDTH = Number(arg("width", 1600));
const HEIGHT = Number(arg("height", 1000));
const SCHEME = arg("scheme", "dark");
const SHOT = arg("shot", null);
// --clip x,y,w,h[,scale] — magnified crop, handy for judging edge quality
const CLIP = arg("clip", null);
const RELOAD = !flag("no-reload");

/** Minimal CDP client over the browser's page target. */
async function connect() {
	const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
	const pages = list.filter((t) => t.type === "page");
	const page = pages.find((t) => t.url.includes(URL_MATCH));
	if (!page) {
		throw new Error(
			`no page matching "${URL_MATCH}" — open targets:\n` +
				pages.map((t) => `  ${t.url}`).join("\n"),
		);
	}
	console.log(`  target ${page.url}`);
	const socket = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((res, rej) => {
		socket.onopen = res;
		socket.onerror = () => rej(new Error("cdp socket failed"));
	});

	let id = 0;
	const pending = new Map();
	const events = [];
	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		if (msg.id && pending.has(msg.id)) {
			const { resolve, reject } = pending.get(msg.id);
			pending.delete(msg.id);
			msg.error ? reject(new Error(`${msg.error.message} (${msg.error.code})`)) : resolve(msg.result);
		} else if (msg.method) {
			events.push(msg);
		}
	};

	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const msgId = ++id;
			pending.set(msgId, { resolve, reject });
			socket.send(JSON.stringify({ id: msgId, method, params }));
			setTimeout(() => {
				if (pending.has(msgId)) {
					pending.delete(msgId);
					reject(new Error(`${method} timed out`));
				}
			}, 45000);
		});

	return { send, close: () => socket.close() };
}

const evaluate = async (cdp, expression) => {
	const { result } = await cdp.send("Runtime.evaluate", {
		expression,
		returnByValue: true,
		awaitPromise: true,
	});
	if (result.subtype === "error") throw new Error(result.description);
	return result.value;
};

const PROBE = `(() => {
	const img = document.getElementById("dsh-skin-nier-character");
	const root = document.querySelector("[class*='chat'], main, #root, body > div") || document.body;
	const style = img && getComputedStyle(img);
	const box = img && img.getBoundingClientRect();

	// Widest visible text column: the element with the most characters that is
	// actually laid out. Used to tell whether the figure eats the reading area.
	let column = null;
	let best = 0;
	for (const el of document.querySelectorAll("main *, [class*='conversation'] *, [class*='message'] *")) {
		const rect = el.getBoundingClientRect();
		if (rect.width < 320 || rect.height < 80) continue;
		const chars = (el.textContent || "").length;
		if (chars > best) { best = chars; column = rect; }
	}

	const probe = (name) => {
		const v = getComputedStyle(document.body).getPropertyValue(name).trim();
		return v || "(unset)";
	};

	return {
		mounted: !!img,
		naturalWidth: img ? img.naturalWidth : 0,
		naturalHeight: img ? img.naturalHeight : 0,
		complete: img ? img.complete : false,
		display: style ? style.display : null,
		opacity: style ? style.opacity : null,
		pointerEvents: style ? style.pointerEvents : null,
		zIndex: style ? style.zIndex : null,
		mask: style ? (style.maskImage || style.webkitMaskImage) : null,
		box: box ? { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height), right: Math.round(box.right), bottom: Math.round(box.bottom) } : null,
		viewport: { w: innerWidth, h: innerHeight },
		column: column ? { x: Math.round(column.x), w: Math.round(column.width), right: Math.round(column.right) } : null,
		overlapPx: (box && column) ? Math.max(0, Math.round(box.right - column.left)) : null,
		darkAttr: document.body.hasAttribute("data-ds-dark-theme"),
		tokens: {
			"bg-base": probe("--dsw-alias-bg-base"),
			"label-primary": probe("--dsw-alias-label-primary"),
			"brand-primary": probe("--dsw-alias-brand-primary"),
			"sidebar": probe("--dsw-specific-sidebar-fill"),
			"accent": probe("--dsw-alias-state-business-primary"),
		},
		skinSheets: document.querySelectorAll("style[data-dsh-skin]").length,
	};
})()`;

async function main() {
	const cdp = await connect();
	try {
		await cdp.send("Emulation.setDeviceMetricsOverride", {
			width: WIDTH,
			height: HEIGHT,
			deviceScaleFactor: 1,
			mobile: false,
		});
		await cdp.send("Emulation.setEmulatedMedia", {
			features: [{ name: "prefers-color-scheme", value: SCHEME }],
		});

		if (RELOAD) {
			await cdp.send("Page.enable");
			await cdp.send("Network.enable");
			await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
			await cdp.send("Page.reload", { ignoreCache: true });
			// Wait for the app to paint the skin rather than sleeping blind.
			const deadline = Date.now() + 30000;
			for (;;) {
				try {
					const ok = await evaluate(cdp, `!!document.getElementById("dsh-skin-nier-character") || document.readyState !== "complete"`);
					if (ok && (await evaluate(cdp, `!!document.getElementById("dsh-skin-nier-character")`))) break;
				} catch {}
				if (Date.now() > deadline) break;
				await new Promise((r) => setTimeout(r, 250));
			}
			await new Promise((r) => setTimeout(r, 900)); // let the image decode + fonts settle
		}

		const report = await evaluate(cdp, PROBE);
		console.log(JSON.stringify(report, null, 2));

		if (SHOT) {
			const params = { format: "jpeg", quality: 96 };
			if (CLIP) {
				const [x, y, width, height, scale = 2] = CLIP.split(",").map(Number);
				params.clip = { x, y, width, height, scale };
			}
			const { data } = await cdp.send("Page.captureScreenshot", params);
			writeFileSync(SHOT, Buffer.from(data, "base64"));
			console.log(`  shot -> ${SHOT}`);
		}
	} finally {
		cdp.close();
	}
}

main().catch((err) => {
	console.error("probe failed:", err.message);
	process.exit(1);
});
