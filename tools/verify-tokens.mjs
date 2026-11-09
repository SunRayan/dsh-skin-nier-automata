// Cross-check the skin's override keys against the platform's declared tokens.
import fs from 'node:fs';
import path from 'node:path';

// Locate the platform's design-platform.css. The path differs per install, so
// try an explicit override first, then the documented DSH home (~/.dsh), then
// WorkBuddy's bundled runtime. This keeps the gate working outside this box
// and in CI instead of hard-failing on a single hardcoded path.
const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '';
const CANDIDATES = [
  process.env.DSH_THEME_CSS,
  path.join(HOME, '.dsh/profiles/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css'),
  path.join(HOME, '.workbuddy/binaries/node/workspace/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css'),
].filter(Boolean);

const themeDir = CANDIDATES.find((p) => {
  try { return fs.statSync(p).isFile(); } catch { return false; }
});
if (!themeDir) {
  console.error('找不到平台的 design-platform.css，已尝试：\n' + CANDIDATES.map((p) => '  ' + p).join('\n')
    + '\n可设置环境变量 DSH_THEME_CSS 直接指向该文件。');
  process.exit(2);
}

const css = fs.readFileSync(themeDir, 'utf8').split(/\r?\n/);
// Light alias block = the `body {` block that follows the dark static block (line ~156).
const declared = new Set();
let inAlias = false;
for (const line of css) {
  if (/^body\s*\{/.test(line)) { inAlias = true; continue; }
  if (/^body\[data-ds-dark-theme\]\s*\{/.test(line)) { inAlias = false; continue; }
  if (!inAlias) continue;
  const m = line.match(/^\s*(--dsw-(?:alias|specific)-[a-z0-9-]+):/);
  if (m) declared.add(m[1]);
}

let skin;
globalThis.window = {
  __ModuleLoader__: {
    load({ factory }) {
      skin = factory(() => { throw new Error('skin must not require externals'); });
    },
  },
};
await import('../lib/client.js');

const used = new Set(Object.keys(skin.TOKENS));
const missing = [...declared].filter((n) => !used.has(n));
const extra = [...used].filter((n) => !declared.has(n));

for (const [name, pair] of Object.entries(skin.TOKENS)) {
  if (typeof pair?.light !== 'string' || typeof pair?.dark !== 'string') {
    console.error('BAD PAIR', name, pair);
    process.exitCode = 1;
  }
}

console.log('declared tokens :', declared.size);
console.log('skin overrides  :', used.size);
console.log('uncovered       :', missing.length, missing.slice(0, 10));
console.log('unknown to platform:', extra.length, extra);
console.log('inject          :', JSON.stringify(skin.inject));
console.log('name            :', skin.name);
console.log('apply is fn     :', typeof skin.apply === 'function');
if (missing.length || extra.length) process.exitCode = 1;
