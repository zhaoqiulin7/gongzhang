#!/usr/bin/env node
/**
 * scripts/probe/serve.js —— 探针静态服务器
 * 用法：node scripts/probe/serve.js 8760
 * 提供 /_probe/app.html（index.html + 注入 probe.js）与全部静态资源。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.normalize(__dirname + '/../..');

function build() {
  let h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (h.indexOf('_probe/probe.js') < 0) {
    h = h.replace('</body>', '<script src="/_probe/probe.js"></script>\n</body>');
  }
  return h;
}
function buildGeo() {
  let h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (h.indexOf('_probe/geo.js') < 0) {
    h = h.replace('</body>', '<script src="/_probe/geo.js"></script>\n</body>');
  }
  return h;
}
let appHtml = build();
let geoHtml = buildGeo();
let last = fs.statSync(path.join(ROOT, 'index.html')).mtimeMs;

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/_probe/app.html') {
    const m = fs.statSync(path.join(ROOT, 'index.html')).mtimeMs;
    if (m !== last) { last = m; appHtml = build(); geoHtml = buildGeo(); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(appHtml);
  }
  if (p === '/_probe/geo.html') {
    const m = fs.statSync(path.join(ROOT, 'index.html')).mtimeMs;
    if (m !== last) { last = m; appHtml = build(); geoHtml = buildGeo(); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(geoHtml);
  }
  if (p === '/_probe/geo-wrap.html' || p === '/_probe/wrap.html') {
    const src = path.join(__dirname, p === '/_probe/geo-wrap.html' ? 'geo-wrap.html' : 'wrap.html');
    const html = fs.readFileSync(src, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(html);
  }
  // 探针脚本放在 scripts/probe/ 下，此处做路径映射
  if (p.indexOf('/_probe/') === 0 && /\.js$/.test(p)) {
    const src = path.join(__dirname, p.replace('/_probe/', ''));
    if (fs.existsSync(src)) {
      const js = fs.readFileSync(src, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(js);
    }
  }
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end('no'); }
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404); return res.end('x'); }
    const ct = p.endsWith('.js') ? 'text/javascript' : p.endsWith('.css') ? 'text/css'
      : p.endsWith('.webmanifest') ? 'application/manifest+json' : p.endsWith('.svg') ? 'image/svg+xml' : 'text/html';
    res.writeHead(200, { 'Content-Type': ct + '; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(b);
  });
}).listen(Number(process.argv[2] || 8760), '127.0.0.1', () => console.log('probe serve up on ' + process.argv[2]));
