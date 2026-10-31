#!/usr/bin/env node
/**
 * scripts/probe/parse.js —— 解析 headless dump 出的 data-b64
 * 用法：node scripts/probe/parse.js <dump.html> [-v]
 */
const fs = require('fs');
const file = process.argv[2];
const verbose = process.argv.includes('-v');
if (!file) { console.log('用法: node scripts/probe/parse.js <dump.html> [-v]'); process.exit(1); }
const s = fs.readFileSync(file, 'utf8');
const m = s.match(/data-b64="([^"]+)"/);
if (!m) { console.log('NO DATA（探针未回写结果）'); process.exit(1); }
const j = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let o;
try { o = JSON.parse(Buffer.from(j, 'base64').toString('utf8')); }
catch (e) { console.log('PARSE FAIL', e.message); process.exit(1); }
if (o.error) console.log('!! PROBE ERROR:', o.error);
let bad = 0;
for (const k of Object.keys(o)) {
  if (k === 'steps' || k === 'done' || k === 'error') continue;
  const v = o[k];
  if (typeof v !== 'object' || v === null) { console.log(k, '=', v); continue; }
  const of = v.overflow;
  if (of === undefined) { console.log(k, '=', JSON.stringify(v).slice(0, 400)); continue; }
  if (of.badCount) bad++;
  console.log([k.padEnd(20), 'vw' + of.vw, 'ovf' + of.badCount, 'tx' + v.txCount, 'tdp' + v.tdpCount,
    (of.badCount ? ' BAD:' + of.bad.join(',') : ''), JSON.stringify(v.viewText).slice(0, 80)].join(' '));
  if (of.badCount && verbose) console.log('   bad:', of.bad.join(' | '));
  if (v.calc) console.log('   calc:', JSON.stringify(v.calc));
  if (v.sumSub) console.log('   sumSub:', v.sumSub);
}
console.log('done =', o.done, o.error ? ('ERROR=' + o.error) : '', bad ? ('\n溢出状态数: ' + bad) : '');
process.exit(o.error || bad ? 1 : 0);
