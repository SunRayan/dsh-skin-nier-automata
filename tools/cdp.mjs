#!/usr/bin/env node
/**
 * Minimal CDP driver for the preview pages: launches its own headless Chrome,
 * navigates to a file:// URL, optionally runs an expression after a settle
 * delay, and writes a screenshot.
 *
 * A plain `chrome --screenshot` races the async image decode and produces blank
 * frames, so every shot here goes through Page.navigate -> wait -> capture.
 *
 *   node tools/cdp.mjs <page.html> [--shot out.png] [--w 1440] [--h 900]
 *                      [--wait 4000] [--eval "js"] [--dark|--light]
 *                      [--clear] [--seed "js"] [--click "selector"]
 */

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const page = argv[0];
if (!page) throw new Error("usage: node tools/cdp.mjs <page.html> [--shot out.png]");
const flag = (name, def) => {
	const i = argv.indexOf(name);
	return i === -1 ? def : argv[i + 1];
};
const has = (name) => argv.includes(name);

const SHOT = flag("--shot", null);
const W = Number(flag("--w", 1440));
const H = Number(flag("--h", 900));
const WAIT = Number(flag("--wait", 4000));
const EVAL = flag("--eval", null);
const CLICK = flag("--click", null);
const THEME = has("--dark") ? "dark" : has("--light") ? "light" : null;
const CLEAR = has("--clear");
// --seed 在第一次导航后、第二次导航前执行，用来把 localStorage 摆成想要的状态
// （切套图、把某个位置置 "off"）。直接 --eval 写 localStorage 不会重绘。
const SEED = flag("--seed", null);
const PORT = 9333 + Math.floor(Math.random() * 400);
const PROFILE = mkdtempSync(join(tmpdir(), "nier-cdp-"));

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const child = spawn(CHROME, [
	"--headless=new",
	`--remote-debugging-port=${PORT}`,
	`--user-data-dir=${PROFILE}`,
	"--no-first-run",
	"--no-default-browser-check",
	"--hide-scrollbars",
	"--allow-file-access-from-files",
	"--force-device-scale-factor=1",
	`--window-size=${W},${H}`,
	"about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
	for (let i = 0; i < 100; i++) {
		try {
			const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
			const t = list.find((x) => x.type === "page");
			if (t && t.webSocketDebuggerUrl) return t.webSocketDebuggerUrl;
		} catch {}
		await sleep(100);
	}
	throw new Error("chrome did not expose a page target");
}

const url = await endpoint();
const ws = new WebSocket(url);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
	const m = JSON.parse(e.data);
	if (m.id && pending.has(m.id)) {
		const { res, rej } = pending.get(m.id);
		pending.delete(m.id);
		m.error ? rej(new Error(m.error.message)) : res(m.result);
	}
};
const send = (method, params = {}) =>
	new Promise((res, rej) => {
		const i = ++id;
		pending.set(i, { res, rej });
		ws.send(JSON.stringify({ id: i, method, params }));
		setTimeout(() => {
			if (pending.has(i)) { pending.delete(i); rej(new Error(`${method} timeout`)); }
		}, 60000);
	});
const ev = async (expression) => {
	const r = await send("Runtime.evaluate", {
		expression, awaitPromise: true, returnByValue: true, userGesture: true,
	});
	if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " :: " + (r.exceptionDetails.exception?.description || ""));
	return r.result.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
	width: W, height: H, deviceScaleFactor: 1, mobile: false,
});

// Seed localStorage before the first paint so "clear" and "theme" both hold.
// 允许带查询串（`page.html?rename=1`）：resolve() 会把 `?…` 当成文件名的一部分。
const q = page.indexOf("?");
const fileUrl = pathToFileURL(resolve(q === -1 ? page : page.slice(0, q))).href + (q === -1 ? "" : page.slice(q));
if (CLEAR || THEME || SEED) {
	await send("Page.navigate", { url: fileUrl });
	await sleep(400);
	if (CLEAR) await ev(`try{localStorage.clear()}catch(e){}`);
	if (SEED) await ev(SEED);
	if (THEME) await ev(`(()=>{const b=document.body;if(${THEME === "dark"}&&!b.hasAttribute("data-ds-dark-theme"))b.setAttribute("data-ds-dark-theme","");if(${THEME === "light"})b.removeAttribute("data-ds-dark-theme");})()`);
}

await send("Page.navigate", { url: fileUrl });
await sleep(WAIT);
if (THEME) {
	await ev(`(()=>{const b=document.body;if(${THEME === "dark"}&&!b.hasAttribute("data-ds-dark-theme"))b.setAttribute("data-ds-dark-theme","");if(${THEME === "light"})b.removeAttribute("data-ds-dark-theme");})()`);
	await sleep(600);
}
if (CLICK) { await ev(`document.querySelector(${JSON.stringify(CLICK)}).click()`); await sleep(600); }
if (EVAL) {
	const out = await ev(EVAL);
	console.log(typeof out === "string" ? out : JSON.stringify(out, null, 2));
}
if (SHOT) {
	const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
	writeFileSync(SHOT, Buffer.from(data, "base64"));
	console.log(`shot -> ${SHOT}`);
}

ws.close();
child.kill();
await sleep(200);
try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
process.exit(0);
