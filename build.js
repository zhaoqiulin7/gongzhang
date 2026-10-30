const fs = require('fs');
const path = require('path');
const dir = __dirname;

let db = fs.readFileSync(path.join(dir, 'js', 'db.js'), 'utf8')
  .replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '');
let util = fs.readFileSync(path.join(dir, 'js', 'util.js'), 'utf8')
  .replace(/export\s+/g, '');
let app = fs.readFileSync(path.join(dir, 'js', 'app.js'), 'utf8')
  .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;/g, '');

const css = fs.readFileSync(path.join(dir, 'css', 'styles.css'), 'utf8');
const js = db + '\n/* ===== util ===== */\n' + util + '\n/* ===== app ===== */\n' + app;

const err = "window.addEventListener('error',function(e){var v=document.getElementById('view');if(v)v.innerHTML='<div class=\"empty\"><div class=\"big\">⚠️</div><div>出错了：'+((e&&e.message)||e)+'</div></div>';});window.addEventListener('unhandledrejection',function(e){var v=document.getElementById('view');if(v)v.innerHTML='<div class=\"empty\"><div class=\"big\">⚠️</div><div>出错了：'+((e&&e.reason&&e.reason.message)||(e&&e.reason)||e)+'</div></div>';});";

const html =
'<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'<meta charset="UTF-8" />\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />\n' +
'<meta name="theme-color" content="#1f6f54" />\n' +
'<meta name="apple-mobile-web-app-capable" content="yes" />\n' +
'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n' +
'<link rel="manifest" href="manifest.webmanifest" />\n' +
'<link rel="icon" type="image/svg+xml" href="icon.svg" />\n' +
'<link rel="apple-touch-icon" href="icon.svg" />\n' +
'<style>\n' + css + '\n</style>\n' +
'<title>装修记账</title>\n' +
'</head>\n' +
'<body>\n' +
'<div id="app">\n' +
'  <header id="topbar"><div class="topbar-inner"><span id="page-title">装修记账</span></div></header>\n' +
'  <main id="view"></main>\n' +
'  <nav id="tabbar">\n' +
'    <button class="tab" data-route="home">首页</button>\n' +
'    <button class="tab" data-route="ledger">流水</button>\n' +
'    <button class="tab" data-route="projects">项目</button>\n' +
'    <button class="tab" data-route="parties">往来</button>\n' +
'    <button class="tab" data-route="settings">设置</button>\n' +
'  </nav>\n' +
'</div>\n' +
'<div id="toast" class="toast"></div>\n' +
'<div id="modal-root"></div>\n' +
'<script>\n' + err + '\n' + js + '\n</script>\n' +
'</body>\n' +
'</html>\n';

fs.writeFileSync(path.join(dir, 'index.html'), html);
fs.writeFileSync(path.join(dir, '_combined.js'), js);
console.log('built index.html, bytes =', html.length);
