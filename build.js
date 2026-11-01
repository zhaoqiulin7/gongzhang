#!/usr/bin/env node
/**
 * build.js —— 双形态构建（阶段 1 改造）
 *
 *   node build.js            # 默认：同时产出 www/（安卓壳）与 index.html（网页版单文件）
 *   node build.js --www      # 只产出 www/ 目录（供 Capacitor 打包）
 *   node build.js --single   # 只产出根 index.html（单文件 PWA / 预览用）
 *
 * 关键约定（改动前请先读 docs/安卓APP开发计划.md 阶段 1）：
 *   1. 加载顺序 demo → db → util → chart → app 不可变：后者的全局函数依赖前者，
 *      单文件是拼接成同一个 <script>，多文件是按同一顺序的多个 <script>，
 *      两种形态共享「顶层 const/let 在同一全局词法作用域」这一前提。
 *   2. 源文件是 ES module 语法（有 import/export），浏览器里按普通脚本加载会报错，
 *      因此两种形态都要先剥离 import/export（strip 表，与旧版单文件逻辑一致）。
 *   3. www/ 里不放 sw.js、不注册 Service Worker：原生 App 内由 Capacitor 提供离线资源，
 *      SW 属于 PWA 形态专属（计划阶段 1「先关掉 SW」）。
 */

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const WWW = path.join(dir, 'www');

const arg = process.argv[2] || 'all';
const wantWww = arg === 'all' || arg === '--www';
const wantSingle = arg === 'all' || arg === '--single';

// ---------- 源文件：去 ES module 语法 ----------
const strip = {
  'demo.js': (s) => s.replace(/export\s+/g, ''),
  'db.js': (s) => s
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, '')
    .replace(/export\s*\{[^}]*\}\s*;?\s*$/m, ''),
  'util.js': (s) => s.replace(/export\s+/g, ''),
  'chart.js': (s) => s
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, '')
    .replace(/export\s+/g, ''),
  // gantt.js（v2.9.0 新增）：甘特图 / 横道图 / xlsx 导出，依赖 util（today/truncStr），无 import/export
  'gantt.js': (s) => s
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, '')
    .replace(/export\s+/g, ''),
  'app.js': (s) => s
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, ''),
  // bridge.js（阶段 B 新增）：同样没有 import/export，纯全局定义
  'bridge.js': (s) => s
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, '')
    .replace(/export\s+/g, '')
};

// 加载顺序不可变（见文件头约定 1）
// gantt.js 在 util.js/chart.js 之后（用 today/truncStr 与 Token），bridge.js 之前；
// bridge.js 必须在 util.js 之后、app.js 之前：它用到 util 的 h()/openModal()/toast()，
// 且 app.js 顶层就要读取 Bridge。
const ORDER = ['demo.js', 'db.js', 'util.js', 'chart.js', 'gantt.js', 'bridge.js', 'app.js'];

const css = fs.readFileSync(path.join(dir, 'css', 'styles.css'), 'utf8');
const parts = ORDER.map((n) => ({
  n,
  code: strip[n](fs.readFileSync(path.join(dir, 'js', n), 'utf8'))
}));
// 分段注释沿用旧格式（/* ===== app ===== */），scripts/verify.js 依赖它做合并完整性校验
const js = parts.map((p) => '/* ===== ' + p.n.replace(/\.js$/, '') + ' ===== */\n' + p.code).join('\n');

// 全局错误兜底：出错显示红字而不是白屏（预览沙箱/受限环境的救命设计，勿删）
const ERR = "window.addEventListener('error',function(e){var v=document.getElementById('view');if(v)v.innerHTML='<div class=\"empty\"><div class=\"big\">⚠️</div><div>出错了：'+((e&&e.message)||e)+'</div></div>';});window.addEventListener('unhandledrejection',function(e){var v=document.getElementById('view');if(v)v.innerHTML='<div class=\"empty\"><div class=\"big\">⚠️</div><div>出错了：'+((e&&e.reason&&e.reason.message)||(e&&e.reason)||e)+'</div></div>';});";

// PWA 形态专属：注册 Service Worker（通知能力的基础；file/受限环境静默失败）
const SW_REG = "if('serviceWorker' in navigator){window.addEventListener('load',function(){try{navigator.serviceWorker.register('./sw.js').catch(function(){});}catch(e){}});}";

function head(cssPart) {
  return '<!DOCTYPE html>\n' +
    '<html lang="zh-CN">\n' +
    '<head>\n' +
    '<meta charset="UTF-8" />\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />\n' +
    '<meta name="theme-color" content="#1f6f54" />\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes" />\n' +
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n' +
    cssPart +
    '<title>工账</title>\n' +
    '</head>\n';
}

function body(scriptPart, swTag) {
  return '<body>\n' +
    '<div id="app">\n' +
    '  <header id="topbar"><div class="topbar-inner"><span id="page-title">工账</span></div></header>\n' +
    '  <main id="view"></main>\n' +
    '  <nav id="tabbar">\n' +
    '    <button class="tab" data-route="home">首页</button>\n' +
    '    <button class="tab" data-route="ledger">流水</button>\n' +
    '    <button class="tab" data-route="projects">项目</button>\n' +
    '    <button class="tab" data-route="recon">对账</button>\n' +
    '    <button class="tab" data-route="mine">我的</button>\n' +
    '  </nav>\n' +
    '</div>\n' +
    '<div id="toast" class="toast"></div>\n' +
    '<div id="modal-root"></div>\n' +
    scriptPart + '\n' +
    swTag +
    '</body>\n' +
    '</html>\n';
}

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }

// ---------- 形态 A：www/（多文件，Capacitor webDir） ----------
function buildWww() {
  rmrf(WWW);
  mkdirp(path.join(WWW, 'css'));
  mkdirp(path.join(WWW, 'js'));

  const cssPart = '<link rel="stylesheet" href="css/styles.css" />\n' +
    '<link rel="icon" type="image/svg+xml" href="icon.svg" />\n';

  // 注意：不加 manifest / 不注册 SW（原生壳内无意义，且 SW 会缓存住旧资源）
  const tags = parts
    .map((p) => '<script src="js/' + p.n + '"></script>')
    .join('\n');
  const scriptPart = '<script>' + ERR + '</script>\n' + tags;

  fs.writeFileSync(path.join(WWW, 'index.html'), head(cssPart) + body(scriptPart, ''));
  fs.writeFileSync(path.join(WWW, 'css', 'styles.css'), css);
  parts.forEach((p) => fs.writeFileSync(path.join(WWW, 'js', p.n), p.code));
  fs.copyFileSync(path.join(dir, 'icon.svg'), path.join(WWW, 'icon.svg'));

  console.log('www/  ok  index.html + css/styles.css + js/[' + ORDER.join(', ') + '] + icon.svg');
}

// ---------- 形态 B：根 index.html（单文件，PWA / 预览 / 直接双击打开） ----------
function buildSingle() {
  const cssPart = '<link rel="manifest" href="manifest.webmanifest" />\n' +
    '<link rel="icon" type="image/svg+xml" href="icon.svg" />\n' +
    '<link rel="apple-touch-icon" href="icon.svg" />\n' +
    '<style>\n' + css + '\n</style>\n';
  const scriptPart = '<script>\n' + ERR + '\n' + js + '\n</script>';
  const swTag = '<script>' + SW_REG + '</script>\n';

  const html = head(cssPart) + body(scriptPart, swTag);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  fs.writeFileSync(path.join(dir, '_combined.js'), js);
  console.log('index.html ok, bytes =', html.length);
}

if (wantWww) buildWww();
if (wantSingle) buildSingle();
