# dsh-skin-nier-automata

给 DeepSeek Harness 网页界面换上 **NieR: Automata** 主题：冷石墨底、冰白文字、一点沙金强调，一层几乎看不见的 CRT 扫描线，一片**夜里废墟城市的场景**——天际线、地平线雾光、飘尘，全部由 CSS 与一个 1 KB 的遮罩构成，并且向界面方向**渐变消失，没有一条边界**。

场景之外还有**两个壁纸位**：一张全幅主背景、一张左下角 2:3 图版。两位**出厂就带默认图**，装完什么都不用挑；也可以换成自己的图，或者一键关掉退回废墟场景。

原生 UI 的布局、间距、字号、圆角一概不动 —— 这是换皮，不是改版。

---

## 安装

```bash
node tools/install.mjs
```

> 以下命令都在**源码仓库根目录**执行。`tools/` 不随 `.tgz` 发布 —— 如果你手上只有
> `dsh-skin-nier-automata-<版本>.tgz`，跳过脚本直接装：
> `dsh plugin --profile desktop add "file:<tgz 的绝对路径>"`。

Windows 上双击 `tools/install.cmd` 也行。脚本会构建 → 过令牌门禁 → 打包 → 装进
`desktop` profile → 校验（依赖、bundles 登记、已装副本与源的 sha256 一致），
任一步失败就停并说明原因。装完**完全退出并重新打开 DeepSeek Harness** ——
`dsh.profile.bundles` 只在启动时读取。

装完（或任何时候想确认状态）跑一次体检，只读、不动文件：

```bash
node tools/status.mjs
```

皮肤对 **light / dark 两套底都成立**：它盖在你当前选的模式之上，不需要你去设置里另挑。

开发时要改完立刻看到效果，用软链模式（改 `src/` 后只需重新构建 + 刷新页面）：

```bash
node tools/install.mjs --link
```

⚠️ 软链模式指向源码目录的绝对路径，**目录一移动，主题就会在下次插件操作时被静默清掉**
（`reconcile` 解析不到依赖 → 连 `dsh.profile.bundles` 里的条目一起删，且不报错）。
默认装法因此改为「打包后拷进 `profile/vendor` 用 `file:` 装」，与源码目录解耦。
完整的机制说明、手动安装步骤与诊断表见 [INSTALL.md](INSTALL.md)。

## 卸载 / 临时关掉

```bash
dsh plugin --profile desktop remove dsh-skin-nier-automata
```

或者只在插件管理里 disable —— disposer 会同时撤掉 token 层、样式表和两个壁纸节点，界面精确回到原样。

---

## 它到底改了什么

| 层 | 内容 |
|---|---|
| token 层 | 覆盖平台声明的**全部 89 个** `--dsw-alias-*` / `--dsw-specific-*` 语义 token，每个都给了 `{light, dark}` 两套值 |
| 场景层 | 夜城：远近两层天际线、地平线雾光、地面暖光、两层飘雾、五粒浮尘；`pointer-events:none` |
| 壁纸层 | 全幅主背景（`z-index:-3`）+ 左下角 2:3 图版（`z-index:1`），出厂带默认图，可换自选图、可单独关掉 |
| 交互层 | 指针视差（场景 16px）、`W` 键壁纸面板与遮罩滑杆、雾漂移空转动效 |
| 装饰层 | 选区高亮、focus 描边色、链接色、CRT 扫描线（`pointer-events:none`）、方形滚动条 |

**不改**：布局、间距、字号、圆角、`--dsw-static-*` 原始色阶、字体栈（CJK 下改字体风险太高）。

配色不是凭印象调的，是从参考图实测提取的主色（`tools/palette.py`）：影棚灰 `#3c3d43`/`#49484f`、工业冷钢 `#151820`/`#5a6072`、雪地冰白 `#e8edf6`、刀刃高光 `#a3aec8`。

## 壁纸：两个位置，图由你提供

早先版本在右侧和左下各放了一个镂空人物。去掉的原因不是审美偏好，是**几何**：设置面板 `x1154 w286 h852`，人物 `x1062 w378 h615`，交集 `286×615` —— 她 76% 的面积压在面板底下，只露出 92px；左下的 A2 更彻底，204px 宽占了 232px 侧栏的 **100%**。摆在那儿却看不见，就不如换成能看见的东西。

现在是两个**壁纸位**，**不带任何出厂图**：

| 位置 | 元素 | 建议尺寸 |
|---|---|---|
| 主背景 | `#dsh-skin-nier-wp`，`position:fixed;inset:0;z-index:-3` | 2560×1440（16:9），`background-size:cover` |
| 左下图版 | `#dsh-skin-nier-plate`，`position:fixed;left:14px;bottom:66px;z-index:1` | 800×1200（2:3），`width:clamp(148px,13vw,204px)` |

**为什么一张都不带**：之前的出厂图是《尼尔：机械纪元》的美术资源，随包分发等于按本项目的 MIT 许可把它们再授权出去——作者没有这个权利。所以主题只带**场景**（纯 CSS 遮罩画的天际线），图由使用者自己放。顺带把包体从 655 KB 压到 **91 KB**。

每个位置是**两态**：

| 状态 | `localStorage` | 面板按钮 | 看到什么 |
|---|---|---|---|
| 空 | 键不存在，或 `"off"` | `关`（禁用态） | 什么都不画，露出废墟场景 |
| 自选 | `data:image/…` | `选择` | 自己上传的图 |

控制坞读数 `W:U`（自选）/ `W:-`（空）。

### 图怎么进去

`选择` → 文件选择器 → `createImageBitmap` → canvas 缩放 → 质量阶梯 `webp .78/.64/.52 → jpeg .74/.60`，直到塞进 base64 上限（主背景 900,000 字符 / 图版 240,000 字符）。超了就明确报错，不静默丢弃。全程没有 `fetch`，图不出这台机器，只存在 `localStorage`。

主背景上限 2560 宽、图版 800 宽——图版显示宽度只有 204 CSS px，800 已经是 4 倍余量。

## 遮罩：为什么必须有，以及 70% 这个数是怎么来的

宿主面板本身只有 62%–95% 不透明。照片直接垫在下面时，正文是**坐在照片上**的，不是坐在面板上。

遮罩层 `#dsh-skin-nier-wpveil` 在 `z-index:-2`——照片之上、所有界面之下，所以它只压暗背景，碰不到文字。深色用 `#0b0e12`、浅色用 `#efece5`（纸色，不是把深色遮罩调亮）。

70% 是拿两张亮度差很大的图各测一遍定下来的（把文字涂透明再截一张，逐像素比两张图，只取笔画内部、排除 1px 分隔线）：暗的那张 p50 11.1:1 / p10 4.4:1，亮的那张 p50 8.8:1 / p10 4.4:1——都压在 AA 线上，所以没有为某一张图单独调遮罩。

你自己放的图如果亮部特别大，把滑杆往右拉一档就够了。

浅色 74% 是更早定的：45% 时正文只有 3.8:1（AA 要 4.5:1），压到 74% 回到 7.7:1。

滑杆**松手才写** `--nier-veil`。没动过就一直走 CSS 里的分模式默认值（`opacity:var(--nier-veil,.70)` / `…,.74)`），所以切深浅色会自动重算，不会停在挂载时算出来的那个数——这是踩过的坑：最初在 JS 里按 `data-ds-dark-theme` 算默认值，预览切主题后它就冻在 55 不动了。

**已知取舍**：两个模式都会把照片压成一层底纹。这是纸主题的硬约束——正文直接坐在背景上，就只能在「图清楚」和「字清楚」之间选。默认值选了字，滑杆往左是留给想看图的人。

### 宿主外壳是一摞不透明的盒子（1.1.0 / 1.1.1 两次才修对）

壁纸在真机里**完全看不见**，而在预览页里一切正常。原因不在皮肤，在宿主：`app.asar` 里的样式表给外壳的**每一层**都写了底色，不是一层——

```css
.frame      {background:var(--dsw-alias-bg-base)}            /* Windows 上不透明 */
[data-platform=darwin] .frame{background:0 0}                /* ← macOS 才透明 */
.centerCol  {background:var(--dsw-alias-bg-base)}            /* 仅 [data-windows-titlebar] */
.bottomRow  {background:var(--dsw-alias-bg-base)}
.sidebarCol {background:var(--dsw-specific-sidebar-fill)}
.rightbarCol{background:var(--dsw-alias-bg-base)}            /* 仅 darwin */
._root / ._page {background:var(--dsw-alias-bg-base)}        /* 会话页 / 插件页根节点 */
```

照片层是 `body` 的子元素、`z-index:-3`，于是它被画在 `#root` 底下，也画在这一摞底色底下——照片挂上了、data URL 也在，但一个像素都透不出来。更糟的是 `body.nier-wp-user` 同时把 `.nier-wallpaper` / `.nier-city` / `--nier-sky` 全关了，两件事叠在一起，背景就剩一块纯色：既没有照片，也没有废墟。

**第一次修错在哪**：只清了四个列，漏了包住它们的 `.frame`；而且读到的 `.frame` 是 `background:0 0` —— 那是 `[data-platform=darwin]` 的规则，Windows 上它是实心的。症状因此**一模一样**，看起来像「修了没用」。

**预览页为什么一直没暴露**：预览里那层深色来自 `#dsh-skin-nier-scene`（`z-index:0`，是 `body` 的**子元素**），照片在它下面但仍在 `body` 底色之上，而且预览页根本没有宿主这些盒子。

修法是照片开着时让整摞底色让位，压暗交给本来就该干这事的遮罩（`z-index:-2`，在照片之上、界面之下）：

```css
body.nier-wp-user [class*='centerCol'],body.nier-wp-user [class*='rightbarCol'],
body.nier-wp-user [class*='bottomRow'],body.nier-wp-user [class*='sidebarCol'],
body.nier-wp-user [class*='_frame'],body.nier-wp-user [class*='_root'],
body.nier-wp-user [class*='_page'],body.nier-wp-user [class*='_screen'],
body.nier-wp-user [class*='_mainPanel']{background-color:transparent}
```

选择器用**子串匹配**而不是全名，因为宿主给类名加了每次构建都可能变的前缀（今天是 `mP3x-q_centerCol`，明天未必），只有 `_name` 尾巴是稳定的。特异性 `(0,2,1)` 已经压过宿主的 `(0,1,0)`，不需要 `!important`。

**再加一道不依赖类名的保险**：宿主升级随时可能多一层，那时上面这张清单就漏了，而且**不会报任何错**。所以照片开着时，`mountWallpaper()` 会沿内容主轴（`#root` → `.frame` → 面积最大的子元素 → …，最多 8 层）把仍然不透明的整屏盒子清成透明；遇到 `position:fixed` 就停（那是对话框，必须保持不透明）。写过的每个元素都记着原值，关掉壁纸时逐一还原。

复现页 `preview/_repro-host.html` 按 `app.asar` 里的原样重建了整摞壳（含哈希前缀、含 `#root`、含会话页根节点），加载真 `lib/client.js` 后把五层的实测底色打成 JSON：

| 跑法 | 结论 |
|---|---|
| 1.1.0 的包 | `"opaque":["frame","page"]` → `BLOCKED by frame,page`（症状与真机一致） |
| 当前包 | `"opaque":[]` → `VISIBLE`，五层全 `rgba(0, 0, 0, 0)` |
| `?inline=1`（给三层写内联底色，CSS 清不掉） | 仍然 `VISIBLE` —— 证明运行时清扫真的在兜底 |
| 打开面板点「关」 | `.frame` 的底色还原成 `rgb(17, 20, 25)`，`nier-wp-user` 移除 |

同一页上重测正文对比度：p50 12.3:1 / p25 8.0:1 / p10 5.5:1（2358 个笔画内部像素），和上面那张表的结论一致。

## 场景怎么做到「不割裂」

场景没有用第二张位图。它整块是**由渐变和一个遮罩画出来的**：天际线是一个 1 KB 的 SVG 路径，只当 `mask-image` 用，颜色由 CSS 给——所以明暗两套底共用一个资源，也不用为浅色再存一张图。

真正解决割裂的是**两条互相垂直的遮罩，套在两层嵌套元素上**：

```css
/* 外层：横向。右边缘实、左边缘归零 */
#dsh-skin-nier-scene { mask-image: linear-gradient(to left, #000 0, #000 34%, rgba(0,0,0,.55) 64%, transparent 100%) }
/* 内层：纵向。底部实、顶部归零 */
.nier-plane          { mask-image: linear-gradient(to top,  #000 0, #000 40%, rgba(0,0,0,.58) 68%, transparent 100%) }
```

嵌套的遮罩是**相乘**的，所以不管窗口多宽多高，画面在左边和上边的 alpha 都精确到 0 —— 元素边界处没有像素可以露出来，也就不可能出现矩形边或直线接缝。这比把两个遮罩写在同一条 `mask-image` 里再靠 `mask-composite` 求交更稳（后者在旧内核上会退化成并集，反而露出一个矩形）。

配色上，雾光取的是 token 调色板里同一个冷钢色系，所以渐变消失的那一头落点就是界面自己的底色，不是另一个色相。

场景本身有四个深度层，按 DOM 顺序叠：

| 顺序 | 元素 | 作用 |
|---|---|---|
| 1 | `.nier-sky` | 地平线雾光（径向渐变）+ 角落压暗 |
| 2 | `.nier-city.far` | 远层天际线，缩到 68%×56%、模糊 1.3px、偏亮 —— 空气透视 |
| 3 | `.nier-fog.haze` | 夹在两层之间的雾，远层才会「远」 |
| 4 | `.nier-city.near` | 近层天际线，压到近黑，是全画面唯一的实心剪影 |

楼上的小灯是 `<i>::after` 里一个 `radial-gradient` 点阵——因为父级已经被楼形遮罩裁过，点阵只能落在楼体内部，不需要手工摆位。

## 剩下的动效

人物去掉之后，动的只有场景本身，幅度都不大：

- **雾漂移**两条反向，74s / 96s——周期互质，168s 内不会重新对齐，所以看不到循环点。单条等距正弦无论多慢都会被眼睛读出「机械」。
- **五粒浮尘**，各自随机相位。
- **指针视差**：场景整层 16px，`.8s` 缓动。
- 场景 `brightness(1.07)`，把冷钢底从「死黑」提到「有雾」。
- 壁纸激活时，城市剪影、地面梯度、天空梯度**全部撤掉**（`.nier-wallpaper{background:none}` / `.nier-city{opacity:0}` / `--nier-sky:none`）——两套背景系统不叠着跑，否则照片底下会透出第二片天际线。

`prefers-reduced-motion: reduce` 下雾漂移、浮尘、视差全部关闭（`mountParallax` 直接返回空 disposer）。

## 合同自检（DSH 插件五条不变量）

| # | 不变量 | 状态 |
|---|---|---|
| 1 | `type:"module"`、`main:"lib/index.js"`、`exports["."]` + `exports["./package.json"]` | ✅ |
| 2 | 组合包需 `dsh.bundle.patch` + `exports["./cordis.patch.yml"]` + `files` | ✅ |
| 3 | UI 需 `dsh.client.platform:"web"` 与 `exports["./client"]` **成对** | ✅ |
| 4 | 名称三处一致（`package.json#name` = patch `id`/`name` = ModuleLoader `id`） | ✅ 均为 `dsh-skin-nier-automata` |
| 5 | 不声明 `@deepseek-ai/*` 依赖；client bundle 里 react 等必须 external | ✅ 本包**零 import**，无 external 可违规 |

## 已验证到什么程度

在真实 DSH 实例上起服务，用无头浏览器 + CDP 读真实页面的计算样式，不是看截图猜：

- 插件进入 `window.__DSH_BOOT__.entries`，`inject` 为 `["theme"]`
- `/plugins/dsh-skin-nier-automata/client.js` 下发字节与 `lib/client.js` 一致
- `style[data-dsh-skin]` 挂载 1 份、`#dsh-skin-nier-scene` / `-wp` / `-wpveil` / `-plate` 各 1 份，卸载后残留 0
- `body` 上 inline `--dsw-*` 89 个，明暗两套取值均符合预期
- 壁纸图版：1440×900 下 187×281 落在 (14,554)；1280×800 下 166×250 落在 (14,484)；≤1180 宽 `display:none`
- 场景几何：2560 下 `left:1160 w:1400`，1600 下 `left:420 w:1180`，1120 下 `display:none`
- 视差实测：指针到右上角 → `--nier-px 0.836`，场景位移 12.3px；到左下角 → 反向同量级
- 三态回归：无键 → `W:寄` + 两张 data URL；`关` → `W:X` + `background:none` + 废墟底纹复现；`默认` → 回到 `W:寄`
- 壁纸位回归：上传后 `W:U` + `background-image` 是 data URL；点「关」→ `W:-` + `background:none` + 场景复现；刷新后状态保持
- 宿主列让位回归：`preview/_repro-host.html` 里 `centerBg` 为 `rgba(0, 0, 0, 0)`（修之前是 `rgb(17, 20, 25)`），照片真实可见
- 场景上边缘（y=300）与左边缘逐像素看过，无横向/纵向亮度台阶
- 浅色底下无灰边、无灰底残留（抠图做了边界去污）

## 稳定性（皮肤坏了也不会拖垮应用）

这套皮肤是**装饰层**，设计前提是「任何一块挂不上，都不能变成宿主的故障」：

- 宿主侧 `apply()` 是空函数，零服务端副作用；全部视觉走 client bundle
- 每个挂载点单独 `try/catch`：抛错只跳过那一块，异常**绝不逃逸**到 Cordis
- 卸载同样容错，一个释放失败不连累其他（否则会留下孤儿遮罩，重载后叠加）
- 开屏动画有 **20 秒看门狗**，保证全屏遮罩一定会被移除（否则看起来就是卡死）
- 零网络请求、零 `window.*` 全局赋值、零 `setInterval`、`innerHTML` 只写硬编码字面量
- 尊重 `prefers-reduced-motion`

回归测试用 `tools/stability-test.html`（无头浏览器，20 条断言，故意让主题服务抛错、
`requestAnimationFrame` 被拒），当前 **20/20 通过**。

## 目录

```
nier-automata-skin/
├── package.json            # 契约：dsh.bundle.patch + dsh.client{inject,platform}
├── cordis.patch.yml        # insert 自己进层栈
├── src/
│   └── client.template.js   # 皮肤源码（TOKENS 表 + 场景/壁纸/视差/装饰 CSS）
├── lib/
│   ├── index.js            # 宿主半侧：空 apply（纯 UI 插件的标准形态）
│   └── client.js           # 全部逻辑：89 个 token 对 + 场景 + 壁纸 + 视差 + 装饰 CSS + apply/disposer
├── docs/plan.md            # 决策留痕（为什么用 overrideTokens 而不是 register）
└── tools/
    ├── palette.py          # 从参考图提取主色
    ├── build-client.py     # 校验无残留占位符 → 产出 lib/client.js → 量包体
    ├── cdp.mjs             # 无头 Chrome 驱动：导航 → 等待 → 求值 → 截图
    ├── verify-tokens.mjs   # 门禁：覆盖度 / 未知名 / 导出形状
    ├── stability-test.html # 20 条断言：主题服务抛错 / rAF 被拒 / 卸载无残留
    ├── status.mjs          # 只读体检：契约、已装副本、bundle 登记
    ├── install.mjs         # 构建 → 门禁 → 打包 → 离线装入 profile → 校验
    └── build-and-check.cmd # 上面几件的批处理串联
```

## 改配色

源码在 `src/client.template.js` 的 `TOKENS` 表（每项 `p(light, dark)`）。**改完必须重新构建再分发**——`lib/client.js` 是 `tools/build-client.py` 的产物，手改它会被下一次构建覆盖丢失。

```bash
# 1. 编辑 src/client.template.js 的 TOKENS（不要直接改 lib/client.js）
# 2. 重新生成 lib/client.js
python tools/build-client.py
#   或：npm run build
# 3. 门禁：必须 89/89、0 unknown、exit 0
node tools/verify-tokens.mjs
#   或：npm run verify
```

`verify-tokens.mjs` 会拿平台 `design-platform.css` 里声明的 token 名做双向 diff —— 写错名字或漏项会直接失败，不会静默失效。

## 许可

代码 MIT，**且包里确实只有代码**。

这个主题不含任何游戏素材：场景是 CSS 渐变加一条 SVG 路径遮罩，HUD 是边框和文字，壁纸由使用者自己上传并只存在本机 `localStorage`。所以「MIT」覆盖的就是全部内容，不存在代码与素材两套授权的问题。

NieR: Automata 及其角色为 © SQUARE ENIX / PlatinumGames 所有。本皮肤是非官方粉丝作品，与 SQUARE ENIX 无任何关联；配色、排版与场景为观感致敬，不含其美术资源、标识或商标。
