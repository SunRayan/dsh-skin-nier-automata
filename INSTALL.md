# 尼尔：机械纪元 DSH 皮肤 — 安装 / 卸载 / 诊断

纯客户端注入式主题：无服务端、无文件系统写入（偏好存于浏览器 `localStorage`）。
所有视觉与音效均为代码生成 / Web Audio 合成，`lib/client.js` 自带角色图 data URL，
**不依赖任何外部素材文件** —— 所以装进 profile 的是单个自包含包。

---

## 1. 一键安装（推荐）

```bash
node tools/install.mjs
```

Windows 也可以直接双击 `tools/install.cmd`。

> 这两条都在**源码仓库根目录**执行。`tools/` 不在 `package.json#files` 里，不随 `.tgz` 发布 ——
> 只拿到 `.tgz` 的话直接 `dsh plugin --profile desktop add "file:<tgz 绝对路径>"`，见 §3。

装完想确认状态，跑体检（只读、不动文件）：

```bash
node tools/status.mjs            # 或 node tools/status.mjs --profile web
```

它把「源码产物 / 构建门禁 / profile 清单 / 已装副本 / vendor」五处状态收成一张表，
末尾给结论和该跑的命令；有异常时退出码为 1。

脚本做六件事，任一步失败就停并报出原因：

| # | 步骤 | 失败意味着 |
|---|---|---|
| 1 | 定位 `dsh` CLI（环境变量 → PATH → 桌面版安装目录） | 没装桌面版，或路径特殊 → 用 `--dsh <路径>` 指定 |
| 2 | 定位带 Pillow 的 python（**DSH 运行时自带的优先**） | 用 `DSH_PYTHON` 指定，或加 `--no-build` 跳过构建 |
| 3 | 构建 `lib/client.js` + 令牌门禁 + 语法校验 | 门禁要求 89/89、0 未知；改坏了会在这里拦住 |
| 4 | `npm pack` 出 `.tgz` | 包体超预算 / 文件缺失 |
| 5 | 装进 profile（默认 `desktop`） | profile 被运行中的应用占用 → 先完全退出 DSH |
| 6 | 校验依赖、bundles 登记、已装副本与源的一致性 | 见下方「诊断」 |

### 常用参数

| 参数 | 作用 |
|---|---|
| `--link` | 开发模式：软链到源码目录。改完 `src/` 只需重新构建 + 刷新页面，**不用重装** |
| `--no-build` | 跳过构建与打包，直接用现有的 `.tgz`（适合只想重装一次） |
| `--profile <名>` | 装进别的 profile（默认 `desktop`） |
| `--pnpm` | 强制走官方 `dsh plugin add`（默认走「离线安装」，见下） |
| `--force` | 额外跑一次 `dsh plugin install --force`，强制重装 profile 的全部依赖（慢，且需要网络） |
| `--dry-run` | 只打印计划，不动磁盘 |
| `--dsh <路径>` | 手动指定 `dsh.cmd` |

装完**完全退出并重新打开 DeepSeek Harness** —— `dsh.profile.bundles` 在启动时读取。

### 「离线安装」：为什么重装只要三秒，而且不怕断网

任何一次 `dsh plugin add/remove` 都会让 pnpm 重解析**整个** profile 的依赖图。这个 profile 里
`dsh-purge-community` 依赖 GitHub Releases 的 `latest` URL，上游一发新版，lockfile 钉的
integrity 就过期 → pnpm 以 `ERR_PNPM_TARBALL_INTEGRITY` / `fetch failed` 反复重试
（实测卡 4 分钟仍失败）。于是「只想更新一个皮肤」变成整个 profile 都装不动。

更糟的是**失败的时机**：`dsh plugin add` 会先把旧依赖摘掉再装新的，一旦新包没装上，
profile 就停在「依赖已删、文件已删」的状态 —— 皮肤直接消失，而且没有任何报错。

所以默认路径干脆不碰 pnpm。这个包是纯客户端插件、**零依赖**，profile 又是
`nodeLinker: hoisted`（`node_modules` 是平铺的真目录，不是软链），因此「装上 / 刷新」
本来就只是四件纯本地的事：

1. 把 `.tgz` 放进 `profile/vendor/`
2. 解包到 `node_modules/<包名>`（**先解到暂存目录**，逐文件复核通过后才整体换上）
3. 写 `profile/package.json` 的 `dependencies` + `dsh.profile.bundles`
4. 补 `pnpm-lock.yaml` 里本包的三条记录（importer / packages / snapshots）

全程不联网、不碰依赖图，所以既快（约 3 秒）又不受别的插件影响。
`pnpm-lock.yaml` 那三条是照 profile 里现成的 `dsh-our-free-model` 逐字符对齐写的
（`file:` 依赖的形状是固定的），写完会重新解析 YAML 校验；结构不认识就跳过不写。

**只有在**离线路径用不了时（`--link` 软链状态、profile 尚未初始化、lockfile 结构异常）
才回退官方 `dsh plugin add`。回退前会先把 `package.json`、`pnpm-lock.yaml`、
`node_modules/<包名>` 三样拍快照，**失败就原样回滚**，不会再把好用的皮肤带走。

首次安装也走离线路径 —— 它自己会补齐依赖登记与 lockfile 记录。

---

## 2. ⚠️ 为什么不要用 `link:` 装到一个会移动的目录

这是这套皮肤唯一真正会「装好了又消失」的坑，值得单独说清楚。

`dsh plugin add` 在 pnpm 跑完之后会调用一次 `reconcile()`（`@deepseek-ai/dsh-plugin-manager/lib/index.js`，
`0.2.1-rc.5` 中位于 `:323` 定义、`:762` 调用）。它按这个规则重写 `dsh.profile.bundles`：

> 保留「依赖仍然存在**且** `package.json#dsh.bundle` 仍能解析到」的条目；
> 新装的依赖若声明了 `dsh.bundle`，自动加进 bundles；否则只打一条 `declares no dsh.bundle` 警告。

`link:` 装法把依赖指向源码目录的绝对路径。**源码目录一旦被移动或改名**，下一次任何
pnpm 操作都会解析不到它 → 依赖被清掉 → `reconcile` 顺手把 bundles 里的条目一起删掉。
整个过程**没有一条报错**，表现就是主题凭空消失。

所以默认装法改为：`npm pack` 出 `.tgz` → 拷贝到 `~/.dsh/profiles/<profile>/vendor/`
→ 用 `file:` 装。安装路径落在 profile 内部，与源码目录彻底解耦（同 profile 里
`dsh-our-free-model` 用的就是这个模式）。

`--link` 仍然保留，但它现在是**明确的开发期选择**，不是默认。

---

## 3. 手动安装（不用脚本）

```bash
# 1. 构建 + 门禁 + 打包
python tools/build-client.py
node tools/verify-tokens.mjs
node --check lib/client.js
npm pack

# 2. 拷贝到 profile 的 vendor 目录（路径随 DSH_HOME 变）
#    C:\Users\<你>\.dsh\profiles\desktop\vendor\

# 3. 安装
dsh plugin --profile desktop add "file:<vendor目录>/dsh-skin-nier-automata-1.1.0.tgz"
```

`dsh` 在桌面版里没有进 PATH，完整路径通常是：

```
%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd
```

注意 `dsh plugin` 会用 **DSH 运行时自带的 pnpm**（本机 `11.28.5`），不是 PATH 上的那个 ——
混用不同大版本的 pnpm 会改写 `pnpm-lock.yaml`，可能连带影响 profile 里的其他插件。

### 改完内容但版本号没变时

pnpm 判定「要不要重装」看的是 **spec + 版本号**：版本号没变，它会直接
`Already up to date` 跳过，`--force` 也只重装、不重解析，已装副本就停在旧内容上。
可靠做法是先摘再装：

```bash
dsh plugin --profile desktop remove dsh-skin-nier-automata
dsh plugin --profile desktop add "file:<vendor目录>/dsh-skin-nier-automata-1.1.0.tgz"
```

`tools/install.mjs` 每次都会逐文件比对已装副本与源，发现差异就自动走这条路径，
所以正常情况你只需要重跑脚本。

---

## 4. 校验装没装对

脚本第 6 步已经做了这四项；手工核对时看这些：

| 检查 | 期望 |
|---|---|
| `~/.dsh/profiles/desktop/package.json` → `dependencies` | 有 `"dsh-skin-nier-automata"` |
| 同上 → `dsh.profile.bundles` | 数组里包含 `"dsh-skin-nier-automata"` |
| `node_modules/dsh-skin-nier-automata/` | 是**真目录**（不是软链），含 `lib/client.js` + `cordis.patch.yml` |
| 已装 `lib/client.js` 与源文件 | sha256 一致（脚本会比对） |

运行期还可以看启动下发：页面 HTML 里 `window.__DSH_BOOT__.entries` 应有一条

```json
{"id":"dsh-skin-nier-automata","url":"plugins/??dsh-skin-nier-automata/client.js&rev=…",
 "inject":["@deepseek-ai/dsh-client-ui-theme"]}
```

`entries` 里有它、并且该 URL 返回 200，就说明客户端半侧真的挂上了。
（`desktop` profile 只能由 Electron 应用启动，命令行 `--dump-config` 会拒绝；
需要独立复现时新建一个 profile 装上，再手动补 `@deepseek-ai/dsh-web-app` 到 bundles。）

---

## 5. 卸载 / 临时关掉

```bash
dsh plugin --profile desktop remove dsh-skin-nier-automata
```

`reconcile` 会同步把它从 `dsh.profile.bundles` 里摘掉。
或者只在插件管理里 disable —— disposer 会同时撤掉 token 层、样式表与人像节点，界面精确回到原样。

浏览器里的本地偏好（`localStorage` 的 `nier-*` 键）卸载后仍保留，重装会沿用；想彻底清空：

```js
['nier-wp-main','nier-wp-plate','nier-wp-veil','nier-audio','nier-dock-pos'].forEach(k => localStorage.removeItem(k))
```

---

## 6. 诊断

| 现象 | 原因 / 处理 |
|---|---|
| **装过，主题突然没了** | 八成是 `link:` 的源目录被移动过，`reconcile` 清了条目。跑 `node tools/install.mjs` 修好 |
| 插件列表里有，界面没变 | 没重启。`bundles` 只在启动时读取 |
| `dsh plugin add` 报 profile 被占用 | 完全退出 DeepSeek Harness 再装（托盘也要退） |
| `pnpm ... fetch failed` | 这个 profile 里 `dsh-purge-community` 依赖 GitHub Releases 的 `latest`，任何一次真正重装都要联网。网络抖动时重试即可，已缓存的包不会重下 |
| 装完 `node_modules/<包名>` 还是软链 | pnpm 沿用了上一次 `--link` 的解析（lockfile 里 `specifier: file:` 但 `version: link:`）。脚本会自动 remove + add 修正；手工修就是这两条命令 |
| 构建报缺 Pillow | 用 DSH 运行时的 python：`~/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/python.exe` |
| 令牌门禁 < 89 | 不应发生；说明引入了新的 `--dsw-*` key，需回退改动 |
| 已装版本对，但界面还是旧的 | 已装副本没刷新 → 重跑 `node tools/install.mjs`（它会先 remove 再 add） |
| 壁纸看不见（1.0 / 1.1.0 的真机 bug） | 外壳是**一摞**不透明盒子（`.frame` → 四个列 → 会话页根节点），照片是 `body` 子元素、`z-index:-3`，被整摞盖死。已用 `body.nier-wp-user [class*='_frame']…{background-color:transparent}` 逐层让位，另有 `sweepShell()` 运行时兜底。**预览页复现不出来**；回归只看 `preview/_repro-host.html` 的 `verdict` 是否为 `VISIBLE`（加 `?inline=1` 仍须 `VISIBLE`） |
| 左下角图版挡字 | 图版是独立的一位（`z-index:1`）；面板里「左下图版 → 关」就撤掉它，不影响主背景 |
| 开屏不出现 | 只在冷启动播放；输入 `POD` / `YORHA` / `2B` 可手动重播 |

`tools/build-and-check.cmd` 只做「构建 + 门禁 + 打包」，不碰 profile —— 改样式时用它最快。

---

## 7. 功能与本地配置

右下角 **YoRHa 控制条**（可拖动，位置记忆）露出三个开关：

- **A** 系统音效：Web Audio 合成的启动音 / 打字「咔哒」，默认关，首次交互后解锁
- **W** 壁纸面板：两个位置（全幅主背景 + 左下 2:3 图版）+ 一个遮罩滑杆。
  **不带出厂图**，每个位置两态：空（露出废墟场景）/ 自选上传。图只存在本机 `localStorage`
- **R** 重播开屏

`localStorage` 键：`nier-wp-main`、`nier-wp-plate`、`nier-wp-veil`、
`nier-audio`、`nier-dock-pos`。

---

## 8. 性能与约束

- 令牌门禁锁定 **89/89**：只能覆盖既有 `--dsw-*` 令牌，新增 UI 全部走自注入样式，不引入新令牌。
- 包体预算 200 KB，当前 `lib/client.js` **91 KB**，`.tgz` 约 **50 KB**。
  **不含任何图片**：场景是 CSS 渐变 + 一条 SVG 路径遮罩，壁纸由使用者上传并只存在 `localStorage`。
  这既是包体优化，也是授权前提——第三方美术不能随 MIT 包再分发。
- 全量性能护栏：DPR 封顶 1.5、标签页隐藏即暂停、`prefers-reduced-motion` 完全静止、窄屏 / 滚出视口停绘。
- 严格尼尔配色（黑 / 白 / 红 `#a3262e` / 枪灰），不含青 / 蓝 / 橙 / 暖金。
