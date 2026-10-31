// scripts/probe/probe.js —— 通用回归探针（被 scripts/probe/serve.js 注入 index.html）
// 覆盖：首页看板配置 / 统计下钻 / 流水详情面板 / 项目详情 / 对账详情 / 设置页 / 资金预测 / 周期记账
(function () {
  var out = { steps: [] };
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function send() {
    try {
      var s = b64(JSON.stringify(out));
      try { window.parent.document.body.setAttribute('data-b64', s); } catch (e) {}
      var d = document.getElementById('probeout');
      if (!d) { d = document.createElement('div'); d.id = 'probeout'; d.style.display = 'none'; document.body.appendChild(d); }
      d.setAttribute('data-b64', s);
    } catch (e) { out.fatal = String(e && e.message || e); }
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // 等待 #view 内容稳定（连续两次快照一致即认为渲染完成）——
  // headless 的虚拟时钟会快速推进 setTimeout，但 IndexedDB 是真实 IO，
  // 固定等待会读到上一次的 DOM（假象），必须以「内容稳定」为准。
  function waitStable(timeout, requireContent) {
    var max = timeout || 9000;
    var need = requireContent !== false;
    var start = Date.now();
    var last = null, same = 0;
    return new Promise(function (resolve) {
      (function tick() {
        var v = document.getElementById('view');
        var txt0 = v ? v.textContent.trim() : '';
        var cur = txt0.length + '|' + txt0.slice(0, 40);
        if (need && txt0.length === 0) { last = null; same = 0; }
        else if (cur === last) { same++; } else { same = 0; last = cur; }
        if ((same >= 2 && (!need || txt0.length > 0)) || Date.now() - start > max) { resolve(cur); return; }
        setTimeout(tick, 120);
      })();
    });
  }
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function txt(sel) { var el = q(sel); return el ? el.textContent.trim() : ''; }
  function btnByText(sel, re) {
    var list = qa(sel).filter(function (b) { return re.test(b.textContent || ''); });
    return list[0] || null;
  }
  function overflow() {
    var vw = document.documentElement.clientWidth;
    var bad = [];
    qa('#view *').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!(r.width > 0 && (r.right > vw + 1 || r.left < -1))) return;
      var p = el.parentElement;                       // 横向滚动容器内的元素不算溢出
      while (p && p.id !== 'view') {
        var ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll') return;
        p = p.parentElement;
      }
      // SVG 内部元素超出部分由 SVG 自身裁剪，不算页面溢出
      p = el.parentElement;
      while (p && p.id !== 'view') {
        if (p.tagName && p.tagName.toLowerCase() === 'svg') return;
        p = p.parentElement;
      }
      var cn = (typeof el.className === 'string') ? el.className : (el.getAttribute && el.getAttribute('class')) || '';
      bad.push((cn || el.tagName).slice(0, 26));
    });
    return { vw: vw, badCount: bad.length, bad: bad.slice(0, 5) };
  }
  function snap(tag) {
    out[tag] = {
      overflow: overflow(),
      hash: location.hash,
      viewText: txt('#view').slice(0, 260),
      txCount: qa('#view .tx').length,
      tdpCount: qa('#view .tdp').length
    };
    out.steps.push(tag);
    send();
  }
  async function go(tag, hash, settle) {
    location.hash = hash;
    await wait(250);
    await waitStable(settle || 9000);
    snap(tag);
  }

  async function run() {
    try {
      await wait(250); await waitStable();

      // A. 首页（默认看板）
      await go('A_home', '#/home', 1000);
      out.A_blocks = qa('#view .card, #view .section').map(function (e) { return e.textContent.trim().slice(0, 14); }).slice(0, 10);

      // B. 看板配置模式：显隐 + 排序
      var cfgBtn = btnByText('#view .btn', /看板配置|配置看板/);
      out.B_cfgFound = !!cfgBtn;
      if (cfgBtn) {
        cfgBtn.click(); await wait(250); await waitStable();
        snap('B_home_cfg');
        out.B_cfgRows = qa('#view [data-board-row]').length;
        // 关掉一个卡片
        var hideBtn = btnByText('#view [data-board-row] .btn', /隐藏|不显示/);
        out.B_hideFound = !!hideBtn;
        if (hideBtn) { hideBtn.click(); await wait(250); await waitStable(); }
        snap('B_home_cfg2');
        // 退出配置
        var exitBtn = btnByText('#view .btn', /完成|退出配置/);
        if (exitBtn) { exitBtn.click(); await wait(250); await waitStable(); }
        snap('B_home_after');
        var cfg = await Meta.get('homeBoard', null);
        out.B_config = cfg;
      }

      // C. 统一下钻：统计 / 对账 / 对比 三处下钻到流水页 → 提示条一致
      await go('C_stats', '#/stats', 1200);
      out.C_legend = qa('#view .chart-legend .lg-row').length;
      // 统计下钻（走 drillToLedger 统一通道）
      drillToLedger('统计下钻测试', ['t1', 't2'], 'stats');
      await wait(250); await waitStable();
      snap('C_drill');
      out.C_bannerText = txt('#view .drill-banner');
      out.C_bannerTitle = txt('#view .drill-banner div');
      out.C_bannerHasExit = !!btnByText('#view .drill-banner .btn', /退出/);
      out.C_txInDrill = qa('#view .tx').length;
      // 退出下钻
      var exitBtn = btnByText('#view .drill-banner .btn', /退出/);
      if (exitBtn) { exitBtn.click(); await wait(250); await waitStable(); }
      out.C_afterExit = qa('#view .drill-banner').length;
      // 对账下钻
      await go('C2_recon', '#/recon', 1200);
      var rd = btnByText('#view .btn', /看流水/);
      out.C2_reconDrillBtn = !!rd;
      if (rd) { rd.click(); await wait(250); await waitStable(); }
      snap('C2_reconDrill');
      out.C2_bannerText = txt('#view .drill-banner');
      out.C2_bannerTitle = txt('#view .drill-banner div');

      // D. 流水页详情面板 + 内联快改
      await go('D_ledger', '#/ledger/all', 1100);
      var row0 = q('#view .tx-click');
      out.D_rowFound = !!row0;
      if (row0) {
        row0.click(); await wait(250); await waitStable();
        snap('D_ledger_open');
        var amtIn = q('#view .tdp-edit input[type=number]');
        out.D_amtBefore = amtIn ? amtIn.value : '';
        if (amtIn) amtIn.value = '1234';
        var saveBtn = btnByText('#view .tdp-acts .btn', /保存修改/);
        if (saveBtn) { saveBtn.click(); await wait(250); await waitStable(); }
      }
      snap('D_ledger_saved');

      // E. 项目详情详情面板
      await go('E_project', '#/project/p1', 1200);
      var prow = q('#view .tx-click');
      if (prow) { prow.click(); await wait(250); await waitStable(); }
      snap('E_project_open');

      // F. 对账页 → 对账单详情面板
      await go('F_recon', '#/recon', 1200);
      var st = q('#view .card.party-clickable');
      out.F_stmtBtn = !!st;
      if (st) {
        st.click(); await wait(250); await waitStable();
        snap('F_statement');
        var srow = q('#modal-root .tx-click');
        if (srow) { srow.click(); await wait(250); await waitStable(); }
        snap('F_statement_open');
        out.F_modalTdp = qa('#modal-root .tdp').length;
        var closeBtn = btnByText('#modal-root .modal-actions .btn', /关闭/);
        if (closeBtn) { closeBtn.click(); await wait(250); }
      }

      // G. 设置页（C3 分组）：逐个 Tab 切换，检查内容可达
      await go('G_settings', '#/settings', 1200);
      out.G_tabs = qa('#view .set-tab').map(function (e) { return e.textContent.trim(); });
      out.G_cards = qa('#view .card').length;
      var tabNames = ['提醒与预警', '外观', '记账配置', '项目模板', '数据安全'];
      out.G_tabFlow = [];
      for (var ti = 0; ti < tabNames.length; ti++) {
        var tb = btnByText('#view .set-tab', new RegExp(tabNames[ti]));
        if (!tb) { out.G_tabFlow.push(tabNames[ti] + ':NOTFOUND'); continue; }
        tb.click(); await wait(250); await waitStable();
        out.G_tabFlow.push(tabNames[ti] + ':cards=' + qa('#view .set-group .card').length + ',ovf=' + overflow().badCount);
      }
      snap('G_settings_last');

      // H. 资金预测
      await go('H_forecast', '#/forecast', 1200);

      // I. 多项目对比（C1）
      await go('I_compare', '#/compare', 1300);
      var pc = qa('#view .chip');
      if (pc.length >= 2) { pc[0].click(); await wait(250); await waitStable(); }
      if (pc.length >= 2) { pc = qa('#view .chip'); pc[1].click(); await wait(250); await waitStable(); }
      snap('I_compare2');
      out.I_sumLabel = txt('#view .sum-card .sum-label');
      out.I_sumSub = txt('#view .sum-card .sum-sub');
      out.I_compareText = txt('#view').slice(0, 260);
      out.I_hasExport = !!btnByText('#view .btn', /导出对比表/);

      out.done = true;
    } catch (e) {
      out.error = String(e && e.message || e) + ' @ ' + String(e && e.stack || '').slice(0, 200);
    }
    send();
  }
  run();
})();
