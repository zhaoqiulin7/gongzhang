#!/usr/bin/env node
/**
 * scripts/verify.js —— 静态一致性检查（无需浏览器）
 * 用法：node scripts/verify.js
 * 覆盖：SW 缓存与资源清单、构建产物完整性、Token 弃用门禁、演示数据口径断言、
 *       Capacitor 工程完整性（阶段 1）、品牌一致性
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.normalize(__dirname + '/..');

let fails = 0, warns = 0;
const ok = (m) => console.log('  \u2713 ' + m);
const bad = (m) => { fails++; console.log('  \u2717 ' + m); };
const warn = (m) => { warns++; console.log('  ! ' + m); };
const head = (m) => console.log('\n' + m);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

// ---------- 1. Service Worker ----------
head('[1] Service Worker 缓存与资源清单');
const sw = read('sw.js');
const cacheM = sw.match(/const CACHE = '([^']+)'/);
const cache = cacheM ? cacheM[1] : '';
const assetM = sw.match(/const ASSETS = \[([\s\S]*?)\]/);
const assets = assetM ? (assetM[1].match(/'([^']+)'/g) || []).map((s) => s.replace(/'/g, '')) : [];
if (!cache) bad('sw.js 读不到 CACHE 版本');
else ok('SW 缓存版本 ' + cache);
if (!assets.length) bad('sw.js 读不到 ASSETS 清单');
assets.forEach((a) => {
  if (a === './') return;
  const p = a.replace(/^\.\//, '');
  if (!exists(p)) bad('SW 清单里的文件不存在: ' + a);
});
ok('SW 资源清单 ' + assets.length + ' 项，文件均存在');

// 所有 js/ 源文件都应进 SW 清单（离线可用）
const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f);
const missing = jsFiles.filter((f) => assets.indexOf('./' + f) < 0);
if (missing.length) bad('以下源文件未列入 SW 资源清单（离线会失效）: ' + missing.join(', '));
else ok('全部 ' + jsFiles.length + ' 个源文件均在 SW 清单内');

// ---------- 2. 构建产物 ----------
head('[2] 构建产物完整性');
const idx = exists('index.html') ? read('index.html') : '';
if (!idx) bad('index.html 不存在');
else {
  ok('index.html ' + idx.length + ' 字节');
  if (idx.indexOf('<script src="./js/') >= 0) bad('index.html 仍引用外部 js（应为单文件内联）');
  else ok('单文件内联（无外部 js 引用）');
  ['js/demo.js', 'js/db.js', 'js/util.js', 'js/chart.js', 'js/app.js'].forEach((f) => {
    if (idx.indexOf('/* ===== ') < 0 && idx.indexOf(f) < 0) { /* 单文件内不含文件名，仅检查分段注释 */ }
  });
  if (idx.indexOf('/* ===== app ===== */') < 0) bad('index.html 缺少 app 分段（build.js 可能未正确合并）');
  else ok('合并分段齐全');
  // SW 注册片段必须在（否则离线不可用）
  if (idx.indexOf("serviceWorker.register('./sw.js')") < 0) bad('index.html 缺少 SW 注册片段');
  else ok('SW 注册片段存在');
}

// SW 缓存版本必须与最近一次改动同步（手动维护 CACHE 常量）
const pkgNote = '每次改动 js/css 后必须递增 sw.js 的 CACHE 版本号，否则真机拿不到新资源';
if (cache && !/v\d+/.test(cache)) bad('SW CACHE 版本格式异常: ' + cache);

// build.js 的合并顺序必须覆盖全部源文件
// 顺序不可变：demo → db → util → chart → gantt → bridge → app（gantt 依赖 util/chart 的 Token 约定）
const build = read('build.js');
const SRC_ORDER = ['demo', 'db', 'util', 'chart', 'gantt', 'bridge', 'app'];
const built = SRC_ORDER.filter((n) => build.indexOf("'" + n + ".js'") >= 0);
if (built.length !== SRC_ORDER.length) bad('build.js 未包含全部 ' + SRC_ORDER.length + ' 个源文件，实际: ' + built.join(', '));
else ok('build.js 合并 ' + built.length + ' 个源文件: ' + built.join(' → '));

// 合并顺序字面量必须与上面一致（防止有人把 bridge 插到 util 前面）
const orderMatch = build.match(/const ORDER = \[([^\]]+)\]/);
const orderList = orderMatch ? (orderMatch[1].match(/'([^']+\.js)'/g) || []).map((s) => s.replace(/'/g, '')) : [];
if (orderList.join(',') !== SRC_ORDER.map((n) => n + '.js').join(',')) {
  bad('build.js 的 ORDER 顺序应为 ' + SRC_ORDER.map((n) => n + '.js').join(' → ') + '，实际 ' + orderList.join(' → '));
} else ok('build.js 加载顺序正确（bridge 在 util 后、app 前）');

// ---------- 3. Token 体系门禁 ----------
head('[3] Token 体系门禁');
const css = read('css/styles.css');
const compat = (css.match(/var\(--g-sp-c\d+\)/g) || []).length;
const compatDefs = (css.match(/--g-sp-c\d+\s*:/g) || []).length;
console.log('    兼容阶 --g-sp-c* 定义 ' + compatDefs + ' 个，引用 ' + compat + ' 处');
if (compatDefs || compat) bad('兼容阶未收敛（v3.0 要求删除全部 --g-sp-c*）');
else ok('兼容阶已完全收敛（0 定义 / 0 引用）');

// 4pt 阶梯完整性：1..10 每档都应存在
const ladder = [];
for (let i = 1; i <= 10; i++) {
  const m = css.match(new RegExp('--g-sp-' + i + ':\\s*(\\d+)px'));
  ladder.push(m ? +m[1] : null);
}
const expect = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
const ladderOk = ladder.every((v, i) => v === expect[i]);
if (!ladderOk) bad('4pt 间距阶梯不完整或非 4 的倍数: ' + ladder.join(','));
else ok('4pt 阶梯完整: ' + ladder.join(','));

// 弃用别名门禁
const deprecated = [];
css.split('\n').forEach((ln, i) => {
  if (ln.indexOf('@deprecated') >= 0 && /^\s*--[a-z-]+\s*:/.test(ln)) deprecated.push((i + 1) + ': ' + ln.trim());
});
if (deprecated.length) {
  deprecated.forEach((d) => bad('仍存在 @deprecated 别名 → ' + d));
} else ok('无遗留 @deprecated Token 别名');

// --tab-h 历史别名（计划移除）
if (css.indexOf('--tab-h:') >= 0) bad('仍存在历史别名 --tab-h（应已删除）');
else ok('历史别名 --tab-h 已清理');

// 语义层色值必须走 Token，不允许图表代码写死色
const chartJs = read('js/chart.js');
const hexInChart = (chartJs.match(/#[0-9a-fA-F]{3,6}\b/g) || []).length;
if (hexInChart) bad('chart.js 出现写死色值 ' + hexInChart + ' 处（应只用 var(--chart-n)）');
else ok('chart.js 无写死色值');

// ---------- 4. 演示数据与余额口径断言 ----------
head('[4] 演示数据与余额口径断言');
const demo = read('js/demo.js');
const demoBody = demo.replace(/function demoDataset\(\)\s*\{\s*/, '').replace(/\}\s*$/, '');
// 解析 demo 数据里的 transactions（用宽松正则提取关键字段）
const txBlock = (demoBody.match(/transactions:\s*\[([\s\S]*?)\n\s*\],/) || [])[1] || '';
const remBlock = (demoBody.match(/reminders:\s*\[([\s\S]*?)\n\s*\],/) || [])[1] || '';
const accBlock = (demoBody.match(/accounts[\s\S]*?value:\s*\[([\s\S]*?)\n\s*\]/) || [])[1] || '';

const txs = [];
txBlock.split('\n').forEach((ln) => {
  const m = ln.match(/id:\s*'(t\d+)'[\s\S]*?type:\s*'(\w+)'[\s\S]*?amount:\s*(\d+)[\s\S]*?date:\s*'([\d-]+)'/);
  if (m) {
    const acc = (ln.match(/account:\s*'([^']*)'/) || [])[1] || '';
    const from = (ln.match(/fromAccount:\s*'([^']*)'/) || [])[1] || '';
    const to = (ln.match(/toAccount:\s*'([^']*)'/) || [])[1] || '';
    txs.push({ id: m[1], type: m[2], amount: +m[3], date: m[4], account: acc, from: from, to: to });
  }
});
const rems = [];
remBlock.split('\n').forEach((ln) => {
  const m = ln.match(/id:\s*'(r\d+)'[\s\S]*?kind:\s*'(\w+)'[\s\S]*?amount:\s*(\d+)[\s\S]*?dueDate:\s*'([\d-]+)'/);
  if (m) rems.push({ id: m[1], kind: m[2], amount: +m[3], dueDate: m[4] });
});
const accs = [];
accBlock.split('\n').forEach((ln) => {
  const m = ln.match(/name:\s*'([^']*)',\s*opening:\s*(\d+)/);
  if (m) accs.push({ name: m[1], opening: +m[2] });
});

if (txs.length !== 8) bad('演示流水应为 8 笔，实际解析到 ' + txs.length + ' 笔');
else ok('演示流水 8 笔');
if (rems.length !== 2) bad('演示提醒应为 2 条，实际 ' + rems.length);
else ok('演示提醒 2 条');

// 余额口径：期初 + 收 - 支 + 转账互抵
const bal = {};
accs.forEach((a) => { bal[a.name] = a.opening; });
txs.forEach((t) => {
  if (t.type === 'transfer') { bal[t.from] -= t.amount; bal[t.to] += t.amount; }
  else if (t.type === 'income') bal[t.account] += t.amount;
  else if (t.type === 'expense') bal[t.account] -= t.amount;
});
const total = Object.keys(bal).reduce((s, k) => s + bal[k], 0);
console.log('    演示账户余额: ' + Object.keys(bal).map((k) => k + ' ' + bal[k]).join(' / ') + ' → 总计 ' + total);
// 基线口径（手工核对过）：现金 -8000(t4) -3000(t6) +5000(t8转入) = -6000
//               微信 +40000(t1)；银行 +20000(t2) -12000(t3) -20000(t5) -5000(t7) -5000(t8转出) = -22000
if (total !== 12000) bad('演示总余额应为 12000，实际 ' + total);
else ok('演示总余额 12000（收60000 - 支48000，含 t8 转账银行侧 -5000）');

// 预测口径：8 周桶，逾期并入本周
const in8 = rems.filter((r) => r.kind === 'receive').reduce((s, r) => s + r.amount, 0);
const out8 = rems.filter((r) => r.kind === 'pay').reduce((s, r) => s + r.amount, 0);
const end8 = total + in8 - out8;
console.log('    8 周预测: 收 +' + in8 + ' 付 -' + out8 + ' → 期末 ' + end8);
if (in8 !== 20000 || out8 !== 5000) bad('演示提醒金额异常（应 收20000/付5000）');
else if (end8 !== 27000) bad('8 周期末余额应为 27000，实际 ' + end8);
else ok('8 周期末余额 27000（= 12000 + 20000 - 5000）');

// 演示提醒到期日必须落在 8 周内（否则预测会漏）
const today = new Date();
const horizon = new Date(today.getTime() + 56 * 86400000);
remBlock.split('\n').forEach((ln) => {
  const m = ln.match(/dueDate:\s*'([\d-]+)'/);
  if (m) {
    const d = new Date(m[1] + 'T00:00:00');
    if (d > horizon) warn('演示提醒 ' + m[1] + ' 超出 8 周预测窗口');
  }
});
ok('演示提醒到期日均在 8 周窗口内');

// ---------- 5. 安卓构建环境（阶段 0 固化）----------
head('[5] 安卓构建环境');
const envSh = exists('scripts/env.sh') ? read('scripts/env.sh') : '';
if (!envSh) {
  warn('未找到 scripts/env.sh（安卓构建环境未固化）');
} else {
  ok('scripts/env.sh 存在');
  // 必须锁定 JDK 21（系统 JDK 27 过新，Gradle 会报 class file major version 71）
  if (envSh.indexOf('jdk21') < 0 || envSh.indexOf('JAVA_HOME') < 0) bad('env.sh 未锁定 JDK 21');
  else ok('env.sh 已锁定 JDK 21');
  // Gradle 镜像（官方源本机不通）
  if (envSh.indexOf('mirrors.cloud.tencent.com') < 0) bad('env.sh 未配置 Gradle 镜像');
  else ok('env.sh 已配置 Gradle 镜像');
  // 构建脚本必须带 --no-build-cache（Windows transforms 目录锁）
  const buildSh = exists('scripts/build-android.sh') ? read('scripts/build-android.sh') : '';
  if (!buildSh) warn('未找到 scripts/build-android.sh');
  else if (buildSh.indexOf('--no-build-cache') < 0) bad('build-android.sh 缺少 --no-build-cache');
  else ok('build-android.sh 已含 --no-build-cache');
}

// ---------- 6. Capacitor 工程完整性（阶段 1）----------
head('[6] Capacitor 工程完整性');
const json = (p) => JSON.parse(read(p).replace(/^\uFEFF/, ''));

if (!exists('capacitor.config.json')) bad('缺少 capacitor.config.json');
else {
  const cfg = json('capacitor.config.json');
  console.log('    appId=' + cfg.appId + '  appName=' + cfg.appName + '  webDir=' + cfg.webDir);
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(cfg.appId || '')) bad('appId 不是合法反向域名: ' + cfg.appId);
  else ok('appId 合法: ' + cfg.appId);
  if (!cfg.appName) bad('appName 缺失');
  if (cfg.webDir !== 'www') bad('webDir 必须为 www（build.js 的输出目录），实际: ' + cfg.webDir);
  else ok('webDir 指向 www，与 build.js 输出一致');
}

if (!exists('package.json')) bad('缺少 package.json');
else {
  const pkg = json('package.json');
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  const need = ['@capacitor/core', '@capacitor/cli', '@capacitor/android'];
  const miss = need.filter((n) => !deps[n]);
  if (miss.length) bad('package.json 缺少 Capacitor 依赖: ' + miss.join(', '));
  else ok('Capacitor 依赖齐备: ' + need.map((n) => n + '@' + deps[n]).join(' / '));
  if (!exists('node_modules/@capacitor/cli')) warn('node_modules 未安装 @capacitor/cli（执行 npm i 后消除）');
  else ok('@capacitor/cli 已安装到 node_modules');
}

const wwwIdx = exists('www/index.html') ? read('www/index.html') : '';
if (!wwwIdx) bad('www/index.html 不存在（先执行 node build.js）');
else {
  const srcs = (wwwIdx.match(/<script src="js\/[^"]+"/g) || []).map((s) => s.replace(/.*js\//, '').replace('"', ''));
  // 与 build.js 的 ORDER 保持同一顺序（bridge 必须在 util 后、app 前）
  const want = SRC_ORDER.map((n) => n + '.js');
  if (srcs.join(',') !== want.join(',')) bad('www/index.html 脚本顺序应为 ' + want.join(' → ') + '，实际 ' + srcs.join(' → '));
  else ok('www/index.html 脚本顺序正确: ' + srcs.join(' → '));
  if (wwwIdx.indexOf('serviceWorker.register') >= 0) bad('www/index.html 不应注册 SW（原生壳内会缓存住旧资源）');
  else ok('www/index.html 未注册 SW（原生形态正确）');
  if (wwwIdx.indexOf('manifest.webmanifest') >= 0) warn('www/index.html 仍引用 manifest（原生形态无意义）');
  ['css/styles.css', 'js/app.js', 'icon.svg'].forEach((f) => { if (!exists('www/' + f)) bad('www/ 缺少 ' + f); });
  ok('www/ 资源齐全（css / js / icon.svg）');
  let dirty = 0;
  want.forEach((f) => {
    const t = exists('www/js/' + f) ? read('www/js/' + f) : '';
    if (t && /^\s*(import|export)\s/m.test(t)) { dirty++; bad('www/js/' + f + ' 残留 import/export（普通脚本会语法错误）'); }
  });
  if (!dirty) ok('www/js/*.js 无残留 import/export');
}

if (!exists('android')) warn('未生成 android/ 工程（执行 npx cap add android）');
else {
  ok('android/ 工程已生成');
  if (!exists('android/gradlew') && !exists('android/gradlew.bat')) bad('android/gradlew 缺失');
  else ok('gradlew 存在');
  if (!exists('android/app/src/main/AndroidManifest.xml')) bad('AndroidManifest.xml 缺失');
  else ok('AndroidManifest.xml 存在');
  const dens = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
  const missIc = dens.filter((d) => !exists('android/app/src/main/res/' + d + '/ic_launcher.png'));
  if (missIc.length) bad('缺少图标密度: ' + missIc.join(', '));
  else ok('图标五档密度齐全（mdpi → xxxhdpi）');
  const cfgName = exists('capacitor.config.json') ? json('capacitor.config.json').appName : '';
  const strings = exists('android/app/src/main/res/values/strings.xml') ? read('android/app/src/main/res/values/strings.xml') : '';
  if (strings && cfgName && strings.indexOf('>' + cfgName + '<') < 0) bad('strings.xml 的 app_name 与 capacitor appName 不一致（应为 ' + cfgName + '）');
  else if (strings) ok('Android 应用名与配置一致: ' + cfgName);
  const colors = exists('android/app/src/main/res/values/colors.xml') ? read('android/app/src/main/res/values/colors.xml') : '';
  if (!colors) warn('缺少 res/values/colors.xml（状态栏主题色未定制）');
  else if (colors.indexOf('#1f6f54') < 0) warn('colors.xml 主色不是 --primary #1f6f54');
  else ok('主题色已对齐设计 Token（#1f6f54）');
}

// ---------- 7. 品牌一致性 ----------
head('[7] 品牌一致性');
const BRAND = exists('capacitor.config.json') ? json('capacitor.config.json').appName : '';
const titleOf = (s) => { const m = s.match(/<title>([^<]+)<\/title>/); return m ? m[1] : ''; };
if (BRAND) {
  const t1 = exists('index.html') ? titleOf(read('index.html')) : '';
  const t2 = exists('www/index.html') ? titleOf(read('www/index.html')) : '';
  const mf = exists('manifest.webmanifest') ? json('manifest.webmanifest') : null;
  let good = true;
  [[t1, 'index.html <title>'], [t2, 'www/index.html <title>'], [mf && mf.name, 'manifest.name']].forEach((it) => {
    if (it[0] && it[0] !== BRAND) { good = false; bad(it[1] + ' = ' + it[0] + '，与 appName「' + BRAND + '」不一致'); }
  });
  if (good) ok('品牌名一致：' + BRAND + '（index.html / www/index.html / manifest）');
}

// ---------- 8. 桥接层与原生能力（阶段 B / C）----------
head('[8] 桥接层与原生能力');

const bridgeSrc = exists('js/bridge.js') ? read('js/bridge.js') : '';
if (!bridgeSrc) bad('缺少 js/bridge.js（能力抽象层，阶段 B 核心）');
else {
  ok('js/bridge.js 存在');
  // 双实现完备性：每个对外的能力方法都必须存在（bridge 里是嵌套对象字面量，
  // 不会写出 notify.permission 这种全路径，故只匹配「方法名(」）
  const needApi = ['permission', 'request', 'show', 'schedule', 'cancel', 'syncReminders',
    'image', 'pick', 'saveAndShare', 'text', 'file', 'write', 'install', 'exitApp', 'apply'];
  const missApi = needApi.filter((m) => !new RegExp('(async\\s+)?' + m + '\\s*\\(').test(bridgeSrc));
  if (missApi.length) bad('bridge.js 缺少能力: ' + missApi.join(', '));
  else ok('bridge.js 能力齐备（' + needApi.length + ' 项：通知/相机/文件/分享/剪贴板/返回键/状态栏）');

  // 每个能力都必须走 isNative/nativePlugin 判分支，否则 Web 形态会炸
  const nativeBranch = (bridgeSrc.match(/nativePlugin\(/g) || []).length;
  if (nativeBranch < 6) bad('bridge.js 的原生分支调用过少（' + nativeBranch + ' 处），疑似漏接插件');
  else ok('bridge.js 原生分支调用 ' + nativeBranch + ' 处');
}

// app.js 不允许再直接用浏览器专有 API（必须走 Bridge）
const appSrc = exists('js/app.js') ? read('js/app.js') : '';
if (appSrc) {
  const leak = [];
  // 说明：bridge.js 内部实现允许出现这些 API，这里是检查业务层 app.js
  if (/navigator\.share/.test(appSrc)) leak.push('navigator.share');
  if (/navigator\.clipboard/.test(appSrc)) leak.push('navigator.clipboard');
  if (/execCommand\s*\(/.test(appSrc)) leak.push('execCommand');
  if (/new Notification\s*\(/.test(appSrc)) leak.push('new Notification');
  if (leak.length) bad('app.js 仍在直接使用浏览器 API（应改走 Bridge）: ' + leak.join(', '));
  else ok('app.js 未直接使用浏览器专有 API（已全部收敛到 Bridge）');
}

// 插件：package.json 声明 ↔ 原生插件清单一致
const pkg = exists('package.json') ? json('package.json') : {};
const declared = Object.keys(pkg.dependencies || {}).filter((d) => /^@capacitor\//.test(d) && d !== '@capacitor/core');
const pluginJson = exists('android/app/src/main/assets/capacitor.plugins.json') ? json('android/app/src/main/assets/capacitor.plugins.json') : null;
if (!declared.length) bad('package.json 未声明任何 Capacitor 插件');
else ok('已声明插件: ' + declared.join(', '));
if (pluginJson === null) warn('capacitor.plugins.json 不存在（先执行 npx cap sync android）');
else if (pluginJson.length !== declared.length) {
  bad('原生插件清单 ' + pluginJson.length + ' 个，与 package.json 声明的 ' + declared.length + ' 个不一致（执行 npx cap sync android）');
} else ok('原生插件清单与依赖声明一致（' + pluginJson.length + ' 个）');

// AndroidManifest 权限最小化 + 必须项
const man = exists('android/app/src/main/AndroidManifest.xml') ? read('android/app/src/main/AndroidManifest.xml') : '';
if (man) {
  const perms = (man.match(/<uses-permission[^>]*android:name="([^"]+)"/g) || [])
    .map((s) => (s.match(/android:name="([^"]+)"/) || [])[1]);
  const needPerm = ['android.permission.POST_NOTIFICATIONS', 'android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES'];
  const missPerm = needPerm.filter((p) => perms.indexOf(p) < 0);
  if (missPerm.length) bad('Manifest 缺少权限: ' + missPerm.join(', '));
  else ok('Manifest 权限齐备: ' + perms.join(', '));
  // 隐私承诺：不申请联网/定位/通讯录
  const forbidden = perms.filter((p) => /ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|READ_CONTACTS|RECORD_AUDIO|READ_PHONE_STATE/.test(p));
  if (forbidden.length) bad('Manifest 申请了与记账无关的权限（违反最小化原则）: ' + forbidden.join(', '));
  else ok('未申请与记账无关的权限（权限最小化）');
}

// ---------- 汇总 ----------
head('─── 结果 ───');
console.log('失败 ' + fails + ' 项，警告 ' + warns + ' 项');
process.exit(fails ? 1 : 0);
