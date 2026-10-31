# 安卓 APP 开发计划（v2.7.0 → APK）

> 配套文档：[资料汇总.md](./资料汇总.md)
> 目标：把当前的纯前端 PWA「装修记账」变成可安装、可上架的安卓 APP，
> **功能 1:1 不减**（含对参考图的全部需求 + 本项目 10 项增强），工程可长期维护。
>
> 技术路线：**Capacitor 壳打包**（本机已实证跑通至 APK 产出，不存在未知阻塞）。

---

## 0. 路线与已验证的环境事实

### 0.1 为什么是 Capacitor 而不是原生重写

装修记账是**表单驱动、数据量小（单机几千条）、无重型动画**的应用。WebView 的渲染性能绰绰有余，
真正需要原生的只有「通知」和「相机」，而这两个恰好是 Capacitor 生态最成熟的插件。

| | 路线 A：Capacitor 壳 | 路线 B：Kotlin 重写 |
|---|---|---|
| 代码复用 | **~90%** | ~10% |
| 工作量 | **2.5~4 周** | 12~20 周 |
| 视觉一致性 | 完美（同一份 CSS） | 全部重做 |
| 风险 | 低 | 高（6094 行已验证功能极易漏） |

### 0.2 本机已验证的事实（2026-10-31 实测，不是推测）

| 项 | 状态 | 说明 |
|---|---|---|
| Node v22.22.2 / npm 10.9.7 | ✅ | Capacitor 工具链要求 |
| **JDK 21.0.2** | ✅ 已装于 `C:\jdk21\jdk-21.0.2` | ⚠️ **系统自带的是 JDK 27，太新**（Gradle 报 `Unsupported class file major version 71`）。**所有 gradle 命令必须显式指定 JAVA_HOME** |
| Android SDK | ✅ | platform-37.0 / build-tools 36.0.0 / platform-tools / emulator 齐备；缺 cmdline-tools（不影响构建） |
| `@capacitor/core,cli,android` 8.6.0 | ✅ npm 安装成功 | |
| `npx cap add android` | ✅ 生成完整 Android 工程 | 自带 Gradle wrapper 8.14.3 |
| `gradlew assembleDebug` | ✅ **BUILD SUCCESSFUL → 4.0MB app-debug.apk** | |
| Gradle 发行包 | ⚠️ 必须走镜像 | `services.gradle.org` 不通 → 用 `mirrors.cloud.tencent.com/gradle/` |
| JDK 下载源 | ⚠️ 必须走镜像 | `api.adoptium.net` 不通 → 用 `mirrors.huaweicloud.com/openjdk/` |
| Windows 缓存 | ⚠️ 必须加 `--no-build-cache` | 否则 `~/.gradle/caches/8.14.3/transforms` 移动失败 |

> **这三条 ⚠️ 是本项目最容易被卡住的地方**，已固化到 `scripts/verify.js` 与构建脚本里。

---

## 1. 阶段总览

```
阶段 0  环境固化          阶段 1  工程骨架        阶段 2  原生能力接入
（1 天）    ────────▶      （2~3 天）  ────────▶   （5~7 天）
 工具链锁定                Capacitor 工程           通知/相机/分享/剪贴板
 脚本化                    构建管线打通             API 抽象层 + 插件
                                                       │
                                                       ▼
阶段 5  发布准备     阶段 4  真机打磨      阶段 3  数据层与离线
（3~4 天）  ◀────  （5~7 天）  ◀────     （3~4 天）
 版本号/签名                性能与体验               存储策略
 应用商店材料               回归全量跑               备份迁移
 上架与灰度                 缺陷清零
```

**总工期 2.5~4 周**（单人全职）。若兼职投入，按 50% 计约 5~8 周。

### 依赖关系

```
阶段 0 ──▶ 阶段 1 ──▶ 阶段 2 ──▶ 阶段 3 ──▶ 阶段 4 ──▶ 阶段 5
  │         │         │         │         │         │
  └─────────┴─────────┴─────────┴─────────┴─────────┘
              每阶段都必须通过「回归门禁」才允许进入下一阶段
```

---

## 2. 阶段 0：环境固化与工程基座（1 天）

**目标**：把上一阶段验证出的环境坑，全部固化成脚本，让后续任何一次构建都不需要人肉记忆。

### 任务清单

| # | 任务 | 交付物 | 验收 |
|---|---|---|---|
| 0.1 | 写 `scripts/env.sh`（或 `.cmd`）：统一设置 `JAVA_HOME=C:/jdk21/jdk-21.0.2`、`ANDROID_HOME`、`ANDROID_SDK_ROOT`，并把 Gradle 镜像写进 `gradle-wrapper.properties` | `scripts/env.sh` | 新终端执行后 `gradlew -v` 显示 Java 21 |
| 0.2 | 写 `scripts/build-android.sh`：`build.js` → `npx cap sync` → `gradlew assembleDebug --no-build-cache`，一键出 APK | 一条命令出 APK | 从干净 clone 执行成功 |
| 0.3 | 写 `scripts/build-android-release.sh`：签名配置读取环境变量（`ZX_KEYSTORE`/`ZX_KEY_ALIAS`/`ZX_KEY_PASSWORD`），不落盘明文 | release 构建脚本 | 产出已签名 APK |
| 0.4 | 把 JDK 21 下载脚本化（华为云镜像）并写进 `docs/环境准备.md` | 环境文档 | 新机器按文档能复现 |
| 0.5 | 扩展 `scripts/verify.js`：增加「Capacitor 工程完整性」检查段（`android/` 存在、gradlew 可执行、local.properties 已生成、插件清单非空时逐项核对） | verify.js 增强 | `node scripts/verify.js` 仍 0 失败 |

### CodeBuddy 使用方式

- 让 CodeBuddy 读 `scripts/verify.js` 与 `scripts/probe/serve.js` 熟悉现有脚本风格，再照着写 `env.sh` / `build-android.sh`（保持同一套「零配置、显式失败」风格）。
- **不要**让 CodeBuddy 一次性生成整个构建脚本——先要它写 `env.sh`，验证通过后再写 `build-android.sh`。

---

## 3. 阶段 1：Capacitor 工程骨架与构建管线（2~3 天）

**目标**：让现有 6094 行代码在 APK 里跑起来（先不管原生增强）。

### 任务清单

| # | 任务 | 细节 | 验收 |
|---|---|---|---|
| 1.1 | 引入 Capacitor 依赖 | `npm i @capacitor/core @capacitor/cli @capacitor/android`；新建 `package.json`（`webDir: "www"`） | `npm ls @capacitor/*` 无错 |
| 1.2 | **改造 build.js** | 当前输出单文件 `index.html`；改为输出 `www/` 目录结构（`www/index.html` + `www/js/*.js` + `www/css/*.css`），去掉内联合并 | `www/` 结构正确，页面在浏览器可跑 |
| 1.3 | `capacitor.config.json` | `appId: com.zhuangxiu.jizhang`、`appName: 装修记账`、`webDir: www`、`android.allowMixedContent: false`、`server.androidScheme: https` | `npx cap sync` 成功 |
| 1.4 | 生成 Android 工程 | `npx cap add android` | `android/` 目录生成，gradlew 可执行 |
| 1.5 | **图标资产** | `icon.svg` → PNG 各密度 mipmap；用 `@capacitor/assets` 或手工导出（48/72/96/144/192/512）；另做自适应图标前景/背景（Android 8+ 圆形裁切） | 桌面图标不糊、无白边 |
| 1.6 | 主题与状态栏 | 原生 `statusBar` 颜色取 `--primary`；`background_color` 改暖纸色 `#f6f1e6`；处理刘海屏 `env(safe-area-inset)`（WebView 已支持，需验证） | 冷启动无白闪 |
| 1.7 | **打包验证脚本** | `scripts/build-android.sh` 串起 build→sync→gradle | 产出 APK 并可安装 |
| 1.8 | 首次真机安装 | 用 `adb install` 或直接传 APK 到手机 | App 能启动、首页正常、数据可读写 |

### 关键风险与对策

| 风险 | 对策 |
|---|---|
| `build.js` 改多文件后 SW 与相对路径失效 | 阶段 1 先关掉 SW（`sw.js` 不进 `www/`），原生 App 不需要 |
| WebView 里 IndexedDB 行为与浏览器不同 | 阶段 1 就要验证「新建项目→记账→杀进程重开→数据还在」 |
| 单文件 vs 多文件的模块作用域差异 | 保持 5 个源文件顺序合并（`demo→db→util→chart→app`），`app.js` 依赖前者的全局函数 |

### CodeBuddy 使用方式

- 1.2（build.js 改造）是**最高风险任务**，务必拆小：先让它只做「输出到 www/ 而不内联」，跑通后再处理其余。
- 每完成一个子任务就跑 `node scripts/verify.js`，让它把 verify.js 当验收命令。

---

## 4. 阶段 2：原生能力接入（5~7 天）—— **本项目核心阶段**

**目标**：把 8 类浏览器 API 换成原生能力，且**业务层代码几乎不改**。

### 4.1 架构关键决策：先建抽象层，再接插件

不要在 `app.js` 里到处直接调 `navigator.share`。做法：

```
js/bridge.js（新文件）
  ├─ 能力探测：isNative() 判断是否在 Capacitor 环境
  ├─ 统一出口：Bridge.notify() / Bridge.camera() / Bridge.share()
  │             / Bridge.clipboard() / Bridge.filesystem()
  └─ 双实现：Web 实现（现有浏览器 API） + Native 实现（Capacitor 插件）
```

`app.js` 里所有调用点统一改成 `Bridge.xxx()`，Web 与 Native 两套都能跑。
**收益**：PWA 版不被抛弃（用户可能仍想用网页版），且未来换框架不用再改业务层。

### 4.2 任务清单（按优先级）

| # | 任务 | 插件 | 改造点 | 优先级 | 验收 |
|---|---|---|---|---|---|
| 2.1 | 搭 `js/bridge.js` 抽象层 | — | 新文件 + `build.js` 合并顺序（放在 util 后） | **P0** | Web 与 Native 双环境冒烟通过 |
| 2.2 | **本地通知** | `@capacitor/local-notifications` | `app.js` 的 `showNotif()`（13 处调用点）改为 `Bridge.notify()`；收付款节点到期提醒改为**本地预排程通知**（当前是打开 App 时轮询触发，原生可做到到点即弹） | **P0** | 设一个 2 分钟后的提醒，到点手机弹通知 |
| 2.3 | **相机/相册** | `@capacitor/camera` | `app.js` 的 `<input type="file" capture>`（3 处）改为 `Bridge.camera()`；权限申请走原生 | **P0** | 拍照 → 缩略图 → 保存 → 重开仍在 |
| 2.4 | 系统分享 | `@capacitor/share` | `app.js` 的 `navigator.share`（4 处：长图分享、对账单分享） | P1 | 长图能发到微信 |
| 2.5 | 剪贴板 | `@capacitor/clipboard` | `app.js` 的 `navigator.clipboard` / `execCommand`（4 处） | P1 | 复制对账单 → 微信粘贴正常 |
| 2.6 | 文件系统（可选） | `@capacitor/filesystem` | 凭证图片从 IndexedDB Blob 迁到原生文件目录 | P2 | 大量凭证（>100 张）不卡顿 |
| 2.7 | 语音识别（可选） | `@capacitor-community/speech-recognition` | `app.js` 的 `SpeechRecognition`（1 处备注语音） | P3 | 语音转文字正常 |
| 2.8 | 返回键处理 | `@capacitor/app` | Android 物理返回键：弹窗打开时先关弹窗，详情页返回上一级而不是退出 App | **P0**（体验硬伤） | 各级页面返回行为正确 |
| 2.9 | 权限声明 | `AndroidManifest.xml` | 相机、通知（Android 13+ 需 `POST_NOTIFICATIONS`）、存储 | **P0** | 首次启动的权限弹窗符合预期 |
| 2.10 | 应用信息 | `capacitor.config.json` + `package.json` | `versionCode`/`versionName` 与 App 版本号同步（发版必需） | P1 | 版本号一处改两处同步 |

### 4.3 关于「数据不丢」的关键决策

当前数据在 IndexedDB。原生 App 里 WebView 的 IndexedDB **随 App 数据目录持久化**，
不像浏览器会被"清理缓存"误删——这其实是**升级为 APP 的最大收益**之一。

**但仍要做两件事**：
1. 阶段 3 验证「卸载重装是否保留」（Android 默认保留，除非用户主动清数据）。
2. 保留现有的「导出 JSON 备份 / 恢复」入口（已有），在「我的」页给出显眼的入口。

### CodeBuddy 使用方式

- 2.1（bridge.js）**必须先设计接口再写实现**。让 CodeBuddy 先只输出接口定义与 Web 实现，
  验证 PWA 版不回归后，再让它逐个补 Native 实现。
- 每个插件单独一个任务、单独一次提交，便于回滚。
- 让它参照 `js/util.js` 的 `h()` / `openModal()` 风格写 bridge，保持代码风格一致。

---

## 5. 阶段 3：数据层与离线能力加固（3~4 天）

**目标**：让原生 App 的数据安全达到「可上商店」的标准。

| # | 任务 | 细节 | 验收 |
|---|---|---|---|
| 3.1 | 存储策略定稿 | 决策：短期留 IndexedDB（改造成本 0），同时接入 `@capacitor-community/sqlite` 作为可选迁移路径 | 写 ADR 记录决策与理由 |
| 3.2 | 自动快照改为原生定时 | 当前 `dbMaintain()` 在 App 启动时跑；原生可用 `setInterval`/前台事件做周期快照 | 连续运行 3 天，快照按期生成 |
| 3.3 | 数据迁移机制 | 现有 PWA 用户的数据如何进 APP？方案：PWA 导出 JSON → APP 导入（**已有功能，零开发**） | 实际走一遍导出导入 |
| 3.4 | 大数据量压测 | 造 5000 笔流水 + 200 张凭证，测首屏、滚动、统计页、导出耗时 | 各页面 < 1.5s |
| 3.5 | 崩溃与 ANR 排查 | 用 `adb logcat` 抓 WebView console 报错 | 压测期间零报错 |
| 3.6 | 低内存/后台恢复 | `onPause`/`onResume` 行为，进程被系统杀死后重启的状态恢复 | 杀进程重开状态正确 |

### CodeBuddy 使用方式

- 压测脚本用 Node 生成 JSON 备份文件，再通过 APP 导入——让 CodeBuddy 写生成脚本，别手搓数据。
- 3.5 的日志分析可以让 CodeBuddy 写过滤脚本（`adb logcat | grep chromium`）。

---

## 6. 阶段 4：真机打磨与全量回归（5~7 天）

**目标**：在真实手机上把"能用"打磨成"好用"，并跑完既有的整套回归。

| # | 任务 | 细节 | 验收 |
|---|---|---|---|
| 4.1 | **跑 `docs/真机回归清单.md`** | 7 组 40+ 项逐条勾选；本阶段是它的**主场**（PWA 阶段跑不了的原生项这次全要过） | 清单全绿或已知项挂起 |
| 4.2 | 全量窄屏回归 | `scripts/probe/` 探针接 WebView 远程调试（`chrome://inspect`）跑 9 状态 | 溢出 0、数值勾稽全过 |
| 4.3 | 多机型适配 | 小屏（≤360dp）、大屏、平板、折叠屏；刘海/挖孔/手势导航 | 各机型无裁切无错位 |
| 4.4 | 系统大字体 | 字体调到最大，检查 40+ 关键元素不溢出（Token 体系已有 `text-size-adjust:100%` 基础） | 无横向滚动 |
| 4.5 | 深色模式 | 系统深色 + 应用内主题的组合行为 | 跟随策略正确 |
| 4.6 | 启动性能 | 冷启动到可交互耗时（目标 < 1.5s）；白屏/闪屏 | 实测达标 |
| 4.7 | 打包体积优化 | 当前 4.0MB debug；release 约 1.5~2MB。若要更小可考虑拆分图表模块 | 体积可接受 |
| 4.8 | 缺陷清零 | 4.1~4.7 出的问题全部修完并回归 | 零 P0/P1 缺陷 |

### CodeBuddy 使用方式

- 4.1 的清单执行可以让 CodeBuddy 协助：把清单表格读进来，逐项给操作步骤与失败排查建议。
- 4.2 若 WebView 远程调试接不通，退而求其次：把 `scripts/probe/probe.js` 注入 APK 调试包，
  在 App 内跑探针并把结果写到 `localStorage`，再用 `adb pull` 取回。

---

## 7. 阶段 5：发布准备（3~4 天）

| # | 任务 | 细节 | 验收 |
|---|---|---|---|
| 5.1 | 版本号与签名 | `versionCode` 递增规则；生成 keystore 并**妥善备份**（丢了就无法升级覆盖） | release 包签名正确 |
| 5.2 | 构建产物配置 | 混淆、压缩、资源优化；`minSdkVersion`（建议 23+/24+） | release APK 可安装 |
| 5.3 | 应用商店材料 | 应用名、图标、截图（至少 5 张，真机截）、简介、隐私政策 | 材料齐备 |
| 5.4 | **隐私合规** | 声明：数据仅存本机、不上传服务器、无网络权限（或仅有通知所需）；Android 13+ 需隐私声明 | 法务过审 |
| 5.5 | 权限最小化 | 核对 `AndroidManifest.xml`：不必要的权限一律不申请 | 权限清单最小 |
| 5.6 | 内测分发 | 先发 5~10 台真机（`adb install` 或测试版 APK），收集 1 周反馈 | 无崩溃报告 |
| 5.7 | 正式上架 | 应用商店（华为/小米/应用宝等）提交；PWA 版保留为「网页版」入口 | 上架通过 |
| 5.8 | 灰度与回滚 | 首版小范围推；同时保留 PWA 版作为回退方案 | 回滚预案可执行 |

### CodeBuddy 使用方式

- 商店文案可让 CodeBuddy 基于功能清单起草，但**必须人工核对**（尤其隐私与功能描述是否与实现一致）。
- 5.6 的反馈整理：让 CodeBuddy 把反馈文本归类成「崩溃/功能/体验/文案」四类并统计。

---

## 8. 功能模块拆分与 Android 化改造量

| 模块 | 代码位置 | Android 化改造 | 工作量 | 风险 |
|---|---|---|---|---|
| **数据层** | `js/db.js` 479 行 | 保留；可选迁 SQLite | P2 | 中（迁移需数据校验） |
| **工具层** | `js/util.js` 172 行 | **零改动** | — | 无 |
| **图表库** | `js/chart.js` 323 行 | **零改动**（纯 SVG） | — | 无 |
| **演示数据** | `js/demo.js` 62 行 | **零改动** | — | 无 |
| **应用层** | `js/app.js` 4546 行 | 改 8 类 API 调用点 + 加 bridge.js | P0 | 中（面广但浅） |
| **样式** | `css/styles.css` 512 行 | **零改动** | — | 无 |
| **构建** | `build.js` | 改输出为 `www/` 目录 | P0 | 中（曾是最易错点） |
| **PWA 外壳** | `sw.js` `manifest` | 废弃，功能转原生 | P0 | 低 |
| **壳工程** | `android/`（新） | Capacitor 生成 + 定制 | P0 | 低 |
| **抽象层** | `js/bridge.js`（新） | 新增 | P0 | 中（设计不当会返工） |

**总改造面**：4 个文件需改 + 2 个新文件 + 1 个新目录，其余**原封不动**。

---

## 9. 跨阶段的 CodeBuddy 工作方法

### 9.1 上下文准备（每次开工前）

让 CodeBuddy 快速上手的标准输入（按此顺序）：

1. `docs/资料汇总.md` —— 全局地图与约束
2. `docs/安卓APP开发计划.md` —— 当前阶段的任务边界
3. `.workbuddy/memory/*.md` —— 历史决策与踩坑（**尤其别让它重蹈探针口径、Token 收敛的覆辙**）
4. 本次要动的源文件

### 9.2 任务切片原则

- **一次一个任务**，任务粒度 = 一个可独立验收的改动（≈0.5~1 人日上限）。
- 每个任务配三样东西：① 明确的验收命令 ② 明确的回滚点（单独 commit）③ 明确的验证输出。
- 涉及 `app.js`（4546 行）时，**先用 grep 定位所有改动点**再动手，不要整段重写。

### 9.3 验收闭环（每个任务固定四步）

```
改代码 → node scripts/verify.js（静态门禁）
       → scripts/probe 探针（窄屏回归 + 数值勾稽）
       → 真机手测（本阶段涉及的能力）
       → git commit（信息写清「改了什么/为什么/怎么验的」）
```

沿用现有的提交规范：**每个 commit 自带验证结论**，这是本项目 35 次提交积累下来的最有价值资产。

### 9.4 需要人工把关的环节（CodeBuddy 不可全权）

| 环节 | 原因 |
|---|---|
| 商店文案与隐私政策 | 法律责任，不能由 AI 定稿 |
| keystore 管理 | 泄露即失去升级能力 |
| 真实相机/通知/分享体验 | 必须真机真手验证 |
| UI 视觉微调 | 像素级判断需人眼 |
| 新功能的产品决策 | 需求是用户的，不是模型的 |

---

## 10. 风险登记册

| # | 风险 | 概率 | 影响 | 对策 | 触发信号 |
|---|---|---|---|---|---|
| R1 | **JDK 27 覆盖了 JDK 21** | 高 | 阻断构建 | 所有 gradle 命令显式带 `JAVA_HOME`；写进 `env.sh` | `Unsupported class file major version 71` |
| R2 | Gradle/Maven 官方源不通 | 高 | 阻断首次构建 | 用腾讯云/华为云镜像（已实测可用） | 下载超时或 SSL 错误 |
| R3 | Windows 缓存目录锁 | 中 | 构建间歇失败 | 一律加 `--no-build-cache` | `Could not move temporary workspace` |
| R4 | `build.js` 改造引入路径/作用域错误 | 中 | 白屏 | 保留 5 文件合并顺序；阶段 1 末尾加「Web 与 APK 双端冒烟」 | 页面白屏 |
| R5 | 通知在国产 ROM 上被拦截 | 中 | 核心功能失效 | 加「应用内提醒」兜底；引导用户加白名单 | 通知不弹 |
| R6 | PWA 用户数据进不了 APP | 高 | 体验断裂 | 用现有的导出/导入 JSON（零开发），并在两个版本首页互相提示 | 用户反馈数据丢了 |
| R7 | WebView 内 IndexedDB 被清 | 低 | 数据丢失 | 原生 App 目录持久化；保留快照与回收站 | 杀进程后数据没了 |
| R8 | 功能遗漏（重写时） | 中 | 需求缺失 | **不重写**；用 `verify.js` + 探针守住 9 状态回归 | 对照资料汇总 §3 逐项核 |
| R9 | 应用商店审核驳回 | 低 | 延期 | 提前准备隐私说明与权限最小化 | 审核意见 |
| R10 | 长期维护双形态成本 | 中 | 技术债 | bridge 抽象层隔离；优先保证 Native 分支 | 修复要改两处 |

---

## 11. 里程碑与验收清单

| 里程碑 | 判定标准 | 对应阶段 |
|---|---|---|
| **M1 能装能跑** | APK 装到真机，首页显示真实数据，记账→杀进程→重开数据还在 | 阶段 1 末 |
| **M2 原生能力通** | 相机拍照凭证、2 分钟后到点弹通知、长图能分享到微信、复制对账单能粘贴 | 阶段 2 末 |
| **M3 数据可靠** | 5000 笔流水压测各页 < 1.5s；连续运行 3 天快照正常；无崩溃 | 阶段 3 末 |
| **M4 体验达标** | 真机清单全绿；9 状态回归溢出 0；多机型与大字体无错位；冷启动 < 1.5s | 阶段 4 末 |
| **M5 可上架** | release 包已签名；商店材料与隐私声明就绪；内测 1 周无崩溃 | 阶段 5 末 |

---

## 12. 立刻可做的第一件事

**阶段 0 的 0.1 + 0.2**（半天）：
1. 写 `scripts/env.sh` 固化 `JAVA_HOME` / `ANDROID_HOME` / Gradle 镜像；
2. 写 `scripts/build-android.sh` 串起 build → sync → gradle；
3. 在真实项目上跑通一次，产出第一个「装修记账」APK（不是 hello world）。

有了这个 APK，阶段 1 之后的所有工作都有了可见的验证物——这是整个计划的风险对冲点。

---

*相关文档：[资料汇总.md](./资料汇总.md)　|　[真机回归清单.md](./真机回归清单.md)　|　[../DESIGN_TOKENS.md](../DESIGN_TOKENS.md)*
