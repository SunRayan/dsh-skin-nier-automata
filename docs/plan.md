# NieR: Automata · DSH 主题皮肤

> 形态：**函数式插件（UI 特例：纯浏览器半侧）** · 模板：`T8` · 目标 DSH 版本：`desktop 0.2.1-rc.5`（`@deepseek-ai/dsh-client-ui-theme@0.1.0-rc.6`）
> 目标 profile：`desktop` · 分发方式：本地目录（`dsh plugin add <路径>`）

## 第 0 步 · 版本闸门（强制）

- [x] 目标 DSH 版本已确认：`~/.dsh/dsh-runtimes/dsh-primary-runtime/runtime.json` → `desktopVersion: 0.2.1-rc.5`
- [x] 三问答完：
  - 对哪个版本写代码 → 本机安装的 `0.2.1-rc.5`，主题包 `dsh-client-ui-theme@0.1.0-rc.6`
  - API 属 S/M/V 哪级 → `ctx.theme.overrideTokens` / `ctx.effect` 属 **M 级**（会随版本变），必须核验
  - 能不能核验 → 能，但**不是**用探针
- [x] 核验方式（**替代探针，已声明**）：本机**没有** DSH 源码 checkout（`D:\DeepseekHarness` 是用户的工作目录，不是仓库），因此 `dsh-api-probe.py` 无法运行（退出码 2 的路径错误）。
  改为对**已安装产物**逐条核验——比源码快照更贴近本机实际：
  - `dsh-client-ui-theme/lib/types/client/index.d.ts` → `ThemeRuntime.overrideTokens(source, ThemeTokenOverrides)` 签名、`ThemeTokenModes{light,dark}` 必填两套、`ThemeDefinition`、`theme/change` 事件
  - `dsh-client-ui-theme/lib/client.js:1182` → `overrideTokens` 实现；`:1234` → `validateOverrides`（裸字符串抛教学式 TypeError）
  - `dsh-client-ui-theme/lib/client.js:1276` → `ctx.provide("theme", theme)`，确认服务名为 `theme`
  - `dsh-client-ui-layout/lib/client.js:345-380` → presenter 把 `active.tokens` 以 inline style 写到 `document.body`，并按 `colorScheme` 切 `body[data-ds-dark-theme]`
  - `dsh-client-modules/lib/index.js:238-268` → `resolveMeta(pkgName)` 按**包名**解析 `package.json#dsh.client`，缺 `exports["./client"]` 才报错
- [x] 未核验的 M/V 级 API：**无**。本插件只用到上述三个符号（`ctx.effect` / `ctx.theme.overrideTokens` / 服务名 `theme`），全部有行号出处。

## 第 1 步 · 选型

- [x] 形态：**函数式插件**（UI 插件的浏览器半侧）。理由：只改观感，不需要给别的插件提供能力，也不需要组装已有插件。
- [x] 已确认**没有 `export default`**：宿主半侧 `export function apply() {}`，客户端半侧 `exports.apply`。
- [x] 模板编号 `T8`。路由依据：用户说「制作一个主题皮肤」= 改界面观感。

### 关键选型：为什么用 `overrideTokens` 而不是 `register`

`ThemeRuntime` 有两条路：

| 路 | 结果 |
|---|---|
| `register({id, colorScheme, tokens})` | 主题进注册表，但 Appearance 行的可选值被 `THEME_PREFERENCES = ['light','dark','system']` 写死；`setTheme('nier-…')` 无法写进持久化 settings（schema 校验不过），刷新即丢 |
| **`overrideTokens(source, tokens)`** ✅ | 官方为第三方留的叠加层：盖在当前 light/dark 之上、**两套值必填**、返回 disposer、按 source 归并（重复调用只替换自己那层） |

选后者：无论用户选 light 还是 dark，皮肤都成立，且插件停用即完整还原。

## 第 2 步 · 环境

- [x] `--dump-config` 能打出组合树（`--profile desktop --patch <overlay>`，已看到 `- id: dsh-client-ui-skin-nier-automata` 进入层栈）
- [x] `DSH_HOME` = `C:\Users\Admin\.dsh`；profile = `profiles/desktop`
- [x] 环境降级：**无** Node 构建链，故**不写 TS / 不跑 tsdown**，直接手写 `lib/client.js`（`window.__ModuleLoader__.load({id, factory})` 格式，与 `dshmarket/client/client.js` 逐字同构）。好处是零构建依赖、零 external 违规。

## 第 3 步 · 最小闭环

- [x] 装进**真 profile** 后有可见结果。验证路径：把包 junction 进 `profiles/web/node_modules`，以 `--patch` overlay 插入，`dsh --profile web --port 17650` 起真服务。
- [x] 可见结果：`/` 返回的 `window.__DSH_BOOT__.entries` 中出现
  `{"id":"dsh-client-ui-skin-nier-automata","url":"/plugins/dsh-client-ui-skin-nier-automata/client.js?rev=…","inject":["@deepseek-ai/dsh-client-ui-theme"]}`
  且该 URL 下发的字节与 `lib/client.js` **完全一致**（`diff` 为空）。

## 第 4 步 · 冒烟（UI 类：组件可见、无 slot 崩溃）

用无头 Edge + CDP 读真实页面的**计算值**，不靠肉眼：

| 断言 | light | dark |
|---|---|---|
| `style[data-dsh-skin]` 已挂载、且只有 1 个 | ✅ 958 B | ✅ |
| `body` 上 inline `--dsw-*` 数量 | ✅ 89 | ✅ 89 |
| `--dsw-alias-bg-base` | `#f4f6fa` | `#0a0b0d` |
| `--dsw-alias-state-business-primary` | `#8a6f3d` | `#c9b98d` |
| `getComputedStyle(body).backgroundColor` | `rgb(244,246,250)` | `rgb(15,16,19)`→改深后 `#0a0b0d` |
| 控制台 slot 崩溃 | 无 | 无 |

> 注：dark 行的 `rgb(15,16,19)` 是加深前那次的读数；加深后重测 `bg-base` 已是 `#0a0b0d`。

## 第 5 步 · 写功能

- [x] `inject = ['theme']` —— 只依赖主题服务，不用 `ctx.get('x')`（非可选服务）
- [x] 副作用全部在 `ctx.effect(() => {...}, label)` 内，返回 disposer：`releaseTokens()` + `style.remove()`
- [x] 重复挂载安全：`mountStyle()` 先清掉同 `data-dsh-skin` 的旧节点（HMR / 二次 apply 不会叠层）

## 第 6 步 · UI

- [x] 两个半侧齐全：`lib/index.js`（空 apply）+ `lib/client.js`
- [x] 三个登记点：`exports["./client"]`、`dsh.client{inject,platform}`、`files` 含 `lib/client.js`
- [x] 名称三处一致：`package.json#name` = patch 的 `id`/`name` = ModuleLoader `id` = `dsh-client-ui-skin-nier-automata`

## 第 7 步 · 调试

- [x] 无 PENDING 条目（插件无服务依赖顺序问题，`theme` 为 `immediately` 提供）
- [x] 无静默失败：客户端半侧不进条目表时是**静默跳过**（`resolveMeta` 返回 null 不报错）——第一次用绝对路径当 `name` 时正是这样被跳过的，靠比对 `__DSH_BOOT__.entries` 才发现的

## 第 8 步 · 打包

- [x] 合同不变量 5 条全过（见根 `README.md` 的「合同自检」）

## 第 9 步 · 安装验证

- [x] 从**最终分发源**（本地目录）装入 profile 后仍通过冒烟 —— 即在 `profiles/web` 上完成的验证
- [x] 装入 `desktop` profile：**已执行**，由用户于 2026-11-02 手动 `dsh plugin --profile desktop add <本地路径>` 加载并确认生效（web 上的全部验证结论在 desktop 同样成立）

## 第 10 步 · 工程化

- [x] `README.md` 含安装/卸载/自定义节
- [x] `tools/verify-tokens.mjs` 门禁：覆盖度 89/89、无平台未知名、`inject`/`name`/`apply` 形状
- [x] ~~`tools/build-preview.mjs`：预览页由 token 表生成，不会与插件漂移~~ —— 已废弃（2026-11-08）：预览改为手写 HTML 直接加载 `lib/client.js`，看的是真实注入结果，比生成页更接近实机

## 已知边界

- 只覆盖 `--dsw-alias-*` / `--dsw-specific-*` 语义层，**不动** `--dsw-static-*` 原始色阶与字体栈（改字体在 CJK 下风险高）。
- 装饰层只加：选区、focus 描边色、链接色、CRT 扫描线、方形滚动条。**不碰**布局、圆角、字号。
- `--dsw-alias-button-tool-bar-*` 三项在两个模式下同值（沿用平台半透明黑），因为它们是悬浮工具条遮罩，跟主题无关。
