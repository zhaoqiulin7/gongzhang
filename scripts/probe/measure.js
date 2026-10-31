// scripts/probe/measure.js —— 关键元素几何测量（D1 Token 收敛前后比对用）
// 用法：node scripts/probe/measure.js <dump.html>
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.log('用法: node scripts/probe/measure.js <dump.html>'); process.exit(1); }
const s = fs.readFileSync(file, 'utf8');
const m = s.match(/data-geo="([^"]+)"/);
if (!m) { console.log('NO GEO DATA'); process.exit(1); }
const j = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const o = JSON.parse(Buffer.from(j, 'base64').toString('utf8'));
// 输出 key=value 行，便于 diff
Object.keys(o).sort().forEach((k) => console.log(k + ' = ' + o[k]));
