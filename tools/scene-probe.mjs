/**
 * Scene probe: reload a live DSH page, dismiss the first-run notice, and report
 * what the skin actually mounted — plus a screenshot for eyeballing the blend.
 *
 * The point of this script is that the scene has no bitmap to inspect: it is a
 * stack of gradients and masks, so "did it render" can only be answered by
 * reading computed style out of a real page and looking at the composite.
 *
 * Usage:
 *   node tools/scene-probe.mjs <cdpPort> <urlFragment> <out.jpg> [w] [h] [scheme]
 *   node tools/scene-probe.mjs 9230 17655 shot.jpg 2560 1500 dark
 */

import { writeFileSync } from "node:fs";

const [PORT, MATCH, OUT, W = "1600", H = "900", SCHEME = "dark"] = process.argv.slice(2).map(String);
if (!PORT || !MATCH || !OUT) {
	console.error("usage: node tools/scene-probe.mjs <cdpPort> <urlFragment> <out.jpg> [w] [h] [scheme]");
	process.exit(2);
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === "page" && t.url.includes(MATCH));
if (!page) throw new Error(`no page target matching "${MATCH}" — is the browser on the app?`);

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.id && pending.has(message.id)) {
		const { res, rej } = pending.get(message.id);
		pending.delete(message.id);
		message.error ? rej(new Error(message.error.message)) : res(message.result);
	}
};
const send = (method, params = {}) =>
	new Promise((res, rej) => {
		const i = ++id;
		pending.set(i, { res, rej });
		ws.send(JSON.stringify({ id: i, method, params }));
		setTimeout(() => {
			if (pending.has(i)) {
				pending.delete(i);
				rej(new Error(method + " timeout"));
			}
		}, 30000);
	});
const evaluate = async (expression) => {
	const { result } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
	if (result.subtype === "error") throw new Error(result.description);
	return result.value;
};

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: SCHEME }] });
await send("Emulation.setDeviceMetricsOverride", {
	width: Number(W),
	height: Number(H),
	deviceScaleFactor: 1,
	mobile: false
});
await send("Page.enable");
await send("Page.reload", { ignoreCache: true });
await new Promise((r) => setTimeout(r, 2600));

/* The beta notice covers the whole viewport on a fresh profile. */
const notice = await evaluate(`(() => {
	const button = [...document.querySelectorAll("button,[role=button]")]
		.find((el) => el.textContent.trim() === "继续" && el.offsetParent);
	if (!button) return null;
	const box = button.getBoundingClientRect();
	return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
})()`);
if (notice) {
	for (const type of ["mousePressed", "mouseReleased"]) {
		await send("Input.dispatchMouseEvent", { type, x: notice.x, y: notice.y, button: "left", clickCount: 1 });
	}
	await new Promise((r) => setTimeout(r, 900));
	console.log("dismissed first-run notice");
}

const report = await evaluate(`(() => {
	const scene = document.getElementById("dsh-skin-nier-scene");
	const figure = document.getElementById("dsh-skin-nier-figure");
	const city = document.querySelector(".nier-city.near > i");
	const out = { scene: !!scene, figure: !!figure };
	if (scene) {
		const box = scene.getBoundingClientRect();
		out.box = { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) };
		out.sceneMask = getComputedStyle(scene).maskImage.slice(0, 64);
		out.planeMask = getComputedStyle(scene.firstElementChild).maskImage.slice(0, 64);
		out.layers = scene.firstElementChild.children.length;
	}
	if (city) {
		out.cityMask = getComputedStyle(city).maskImage.slice(0, 48);
		out.cityFill = getComputedStyle(city).backgroundImage.slice(0, 48);
	}
	out.dark = document.body.hasAttribute("data-ds-dark-theme");
	return out;
})()`);
console.log(JSON.stringify(report, null, 1));

const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 96 });
writeFileSync(OUT, Buffer.from(data, "base64"));
console.log("shot ->", OUT);
ws.close();
