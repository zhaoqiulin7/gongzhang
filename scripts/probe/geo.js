// scripts/probe/geo.js —— 测量关键元素几何（D1 视觉回归基线）
// 被 serve.js 以 /_probe/geo.html 注入；输出 data-geo（base64 JSON）到父页
(function () {
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function send(o) {
    var s = b64(JSON.stringify(o));
    try { window.parent.document.body.setAttribute('data-geo', s); } catch (e) {}
    var d = document.getElementById('geoout');
    if (!d) { d = document.createElement('div'); d.id = 'geoout'; d.style.display = 'none'; document.body.appendChild(d); }
    d.setAttribute('data-geo', s);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function box(sel, n) {
    var els = document.querySelectorAll(sel);
    if (!els.length) return null;
    var e = els[n || 0];
    var r = e.getBoundingClientRect();
    var cs = getComputedStyle(e);
    return {
      w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100,
      pt: cs.paddingTop, pb: cs.paddingBottom, pl: cs.paddingLeft, pr: cs.paddingRight,
      mt: cs.marginTop, mb: cs.marginBottom, gap: cs.gap
    };
  }
  function pick(o, keys) {
    var out = {};
    keys.forEach(function (k) {
      var parts = k.split('|');
      var b = box(parts[0], parts[1] ? +parts[1] : 0);
      if (!b) { out[k] = 'NA'; return; }
      out[k] = 'w' + b.w + ' h' + b.h + ' p' + b.pt + '/' + b.pb + '/' + b.pl + '/' + b.pr + ' m' + b.mt + '/' + b.mb + ' g' + b.gap;
    });
    return out;
  }
  async function run() {
    var out = {};
    try {
      await wait(1800);
      // 首页
      location.hash = '#/home'; await wait(1200);
      out = Object.assign(out, pick(out, [
        '#view .card', '#view .stat-grid', '#view .stat', '#view .tr-row', '#view .chips', '#view .chip',
        '#view .section', '#view .project-card', '#view .tag', '#view .muted'
      ]));
      // 流水页
      location.hash = '#/ledger/month'; await wait(1200);
      out = Object.assign(out, pick(out, [
        '#view .sum-card', '#view .tx', '#view .tx .meta', '#view .tx-date', '#view .pill-tabs', '#view .pill',
        '#view .dim-row', '#view .ctl', '#view .btn', '#view .seg', '#view .seg button', '#view .month-head'
      ]));
      // 弹窗
      var fab = document.querySelector('#fab');
      if (fab) { fab.click(); await wait(1000); }
      out = Object.assign(out, pick(out, [
        '#modal-root .modal', '#modal-root .modal-actions', '#modal-root .btn', '#modal-root .ctl',
        '#modal-root .field', '#modal-root .field label', '#modal-root .rows', '#modal-root .frow'
      ]));
      try { closeModal(); } catch (e) {}
      await wait(400);
      // 统计页
      location.hash = '#/stats'; await wait(1400);
      out = Object.assign(out, pick(out, [
        '#view .sum-card', '#view .tr-row', '#view .card', '#view .pill', '#view .chart-legend'
      ]));
      // 设置页
      location.hash = '#/settings'; await wait(1400);
      out = Object.assign(out, pick(out, [
        '#view .card', '#view .set-tab', '#view .seg button', '#view .ctl'
      ]));
    } catch (e) {
      out.__error = String(e && e.message || e);
    }
    send(out);
  }
  run();
})();
