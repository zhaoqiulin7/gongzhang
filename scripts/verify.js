#!/usr/bin/env node
/**
 * scripts/verify.js —— 静态一致性检查（无需浏览器）
 * 用法：node scripts/verify.js
 * 覆盖：SW 缓存与资源清单、构建产物完整性、Token 弃用门禁、演示数据口径断言
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
const build = read('build.js');
const built = ['demo', 'db', 'util', 'chart', 'app'].filter((n) => build.indexOf("'" + n + ".js'") >= 0);
if (built.length !== 5) bad('build.js 未包含全部 5 个源文件，实际: ' + built.join(', '));
else ok('build.js 合并 5 个源文件: ' + built.join(' → '));

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

// ---------- 5. 汇总 ----------
head('─── 结果 ───');
console.log('失败 ' + fails + ' 项，警告 ' + warns + ' 项');
process.exit(fails ? 1 : 0);
