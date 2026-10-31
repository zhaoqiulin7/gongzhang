// 演示数据（v2.6.0 从 db.js 抽离）
// 首次启动播种一份演示账本（2 项目 + 5 往来 + 8 流水 + 2 提醒 + 基础配置），
// 用户可随时「还原演示」或「清空为空白账本」（设置 → 数据安全 → 演示数据）。
// 这里只定义纯数据；写入逻辑在 db.js（内存模式 memPut 直写 / 统一 put 走 ensureFirstRun）。

function demoDataset() {
  return {
    projects: [
      { id: 'p1', name: '保利香槟 3-1201 王先生', clientName: '王先生', phone: '138****0011', address: '保利香槟 3栋1201', houseType: '三室两厅', buildArea: 89, constructArea: 89, manager: '老陈', designer: '设计部·林', contractAmount: 80000, costBudget: 60000, startDate: '2026-09-01', endDate: '2026-11-30', status: 'ongoing',
        stages: [ { id: 'p1s1', name: '开工', done: true, date: '2026-09-01', planStart: '2026-09-01', planEnd: '2026-09-02' }, { id: 'p1s2', name: '水电施工', done: true, date: '2026-09-10', planStart: '2026-09-03', planEnd: '2026-09-10' }, { id: 'p1s3', name: '水电验收', done: true, date: '2026-09-18', planStart: '2026-09-11', planEnd: '2026-09-18' }, { id: 'p1s4', name: '泥工进场', done: false, date: '', planStart: '2026-09-19', planEnd: '2026-10-25' }, { id: 'p1s5', name: '木工交底', done: false, date: '', planStart: '2026-10-26', planEnd: '2026-11-15' }, { id: 'p1s6', name: '竣工', done: false, date: '', planStart: '2026-11-16', planEnd: '2026-11-30' } ], planItems: [ { id: 'p1pi1', cat: '泥瓦人工', amount: 30000 }, { id: 'p1pi2', cat: '瓷砖主材', amount: 20000 }, { id: 'p1pi3', cat: '木工人工', amount: 15000 } ] },
      { id: 'p2', name: '绿地城 5-802 李女士', clientName: '李女士', phone: '139****0022', address: '绿地城 5栋802', houseType: '四室两厅', buildArea: 120, constructArea: 120, manager: '老陈', designer: '设计部·林', contractAmount: 120000, costBudget: 95000, startDate: '2026-10-10', endDate: '2026-12-20', status: 'ongoing',
        stages: [ { id: 'p2s1', name: '开工', done: false, date: '', planStart: '2026-10-10', planEnd: '2026-10-12' }, { id: 'p2s2', name: '水电施工', done: false, date: '', planStart: '2026-10-13', planEnd: '2026-11-03' }, { id: 'p2s3', name: '水电验收', done: false, date: '', planStart: '2026-11-04', planEnd: '2026-11-10' }, { id: 'p2s4', name: '泥工进场', done: false, date: '', planStart: '2026-11-11', planEnd: '2026-12-05' }, { id: 'p2s5', name: '木工交底', done: false, date: '', planStart: '2026-12-06', planEnd: '2026-12-15' }, { id: 'p2s6', name: '竣工', done: false, date: '', planStart: '2026-12-16', planEnd: '2026-12-20' } ], planItems: [ { id: 'p2pi1', cat: '水电材料', amount: 25000 }, { id: 'p2pi2', cat: '泥瓦人工', amount: 40000 } ] }
    ],

    parties: [
      { id: 'pa1', name: '佛山瓷砖批发·陈老板', type: 'supplier', phone: '', note: '主材供应商', payStatus: 'unpaid' },
      { id: 'pa2', name: '木工·老张', type: 'worker', phone: '', note: '木工班组', payStatus: 'paid' },
      { id: 'pa3', name: '王先生', type: 'client', phone: '138****0011', note: '保利香槟业主' },
      { id: 'pa4', name: '施工经理·老陈', type: 'manager', phone: '', note: '现场施工管理', payStatus: 'unpaid' },
      { id: 'pa5', name: '设计师·林工', type: 'designer', phone: '', note: '设计部', payStatus: 'reconciled' }
    ],

    transactions: [
      { id: 't1', projectId: 'p1', type: 'income', subType: '首付款', amount: 40000, date: '2026-09-05', time: '10:20', method: '微信', account: '微信', partyId: 'pa3', partyName: '王先生', note: '开工首付', invoiceStatus: '已开', invoiceType: '普票', taxAmount: 0 },
      { id: 't2', projectId: 'p1', type: 'income', subType: '进度款', amount: 20000, date: '2026-10-08', time: '15:40', method: '银行转账', account: '银行转账', partyId: 'pa3', partyName: '王先生', note: '水电完工进度款', invoiceStatus: '未开', invoiceType: '普票', taxAmount: 0 },
      { id: 't3', projectId: 'p1', type: 'expense', category: '材料费', subCat: '主材', amount: 12000, date: '2026-09-20', time: '09:30', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '厨卫', trade: '泥瓦', material: '瓷砖', note: '卫生间+厨房瓷砖' },
      { id: 't4', projectId: 'p1', type: 'expense', category: '人工费', subCat: '木工', amount: 8000, date: '2026-10-12', time: '17:05', method: '现金', account: '现金', partyId: 'pa2', partyName: '木工·老张', region: '全屋', trade: '木工', material: '', note: '全屋吊顶木工' },
      { id: 't5', projectId: 'p2', type: 'expense', category: '材料费', subCat: '主材', amount: 20000, date: '2026-10-15', time: '11:12', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '客厅', trade: '泥瓦', material: '地砖', note: '客厅地砖' },
      { id: 't6', projectId: 'p1', type: 'expense', category: '管理费', subCat: '管理人员', amount: 3000, date: '2026-10-20', time: '09:00', method: '现金', account: '现金', partyId: 'pa4', partyName: '施工经理·老陈', region: '全屋', trade: '其他', material: '', note: '施工管理费' },
      { id: 't7', projectId: 'p1', type: 'expense', category: '管理费', subCat: '设计费', amount: 5000, date: '2026-10-22', time: '14:30', method: '银行转账', account: '银行转账', partyId: 'pa5', partyName: '设计师·林工', region: '全屋', trade: '其他', material: '', note: '设计费' },
      { id: 't8', projectId: 'p1', type: 'transfer', amount: 5000, date: '2026-10-23', time: '10:10', method: '银行转账', account: '银行转账', fromAccount: '银行转账', toAccount: '现金', note: '从银行转现金备用金' }
    ],

    reminders: [
      { id: 'r1', projectId: 'p1', kind: 'receive', title: '尾款催收', amount: 20000, dueDate: '2026-11-25', note: '竣工验收后收尾款' },
      { id: 'r2', projectId: 'p1', kind: 'pay', title: '瓷砖尾款', amount: 5000, dueDate: '2026-11-02', note: '付陈老板瓷砖尾款' }
    ],

    metaEntries: [
      { key: 'remindDays', value: 3 },
      { key: 'stageTemplate', value: [ { id: 's1', name: '开工' }, { id: 's2', name: '水电施工' }, { id: 's3', name: '水电验收' }, { id: 's4', name: '泥工进场' }, { id: 's5', name: '木工交底' }, { id: 's6', name: '竣工' } ] },
      { key: 'accounts', value: [
        { id: 'acc-1', name: '现金', opening: 0, note: '' },
        { id: 'acc-2', name: '微信', opening: 0, note: '' },
        { id: 'acc-3', name: '支付宝', opening: 0, note: '' },
        { id: 'acc-4', name: '银行转账', opening: 0, note: '公司对公账户' }
      ] },
      { key: 'catTree', value: [
        { id: 'c1', name: '材料费', subs: [ { id: 'c1-1', name: '辅材' }, { id: 'c1-2', name: '主材' }, { id: 'c1-3', name: '五金' }, { id: 'c1-4', name: '水电材料' }, { id: 'c1-5', name: '瓷砖主材' } ] },
        { id: 'c2', name: '人工费', subs: [ { id: 'c2-1', name: '水电工' }, { id: 'c2-2', name: '泥工' }, { id: 'c2-3', name: '木工' }, { id: 'c2-4', name: '油漆工' }, { id: 'c2-5', name: '安装工' }, { id: 'c2-6', name: '水电人工' }, { id: 'c2-7', name: '泥瓦人工' }, { id: 'c2-8', name: '木工人工' }, { id: 'c2-9', name: '油漆人工' } ] },
        { id: 'c3', name: '分包费', subs: [ { id: 'c3-1', name: '整包' }, { id: 'c3-2', name: '零包' } ] },
        { id: 'c4', name: '管理费', subs: [ { id: 'c4-1', name: '设计费' }, { id: 'c4-2', name: '管理人员' }, { id: 'c4-3', name: '其他' } ] },
        { id: 'c5', name: '其他', subs: [ { id: 'c5-1', name: '其他' }, { id: 'c5-2', name: '垃圾清运' } ] }
      ] },
      { key: 'txTemplates', value: [
        { id: 'tp1', name: '瓷砖主材', type: 'expense', amount: 0, category: '材料费', note: '' },
        { id: 'tp2', name: '泥工人工', type: 'expense', amount: 0, category: '人工费', note: '' },
        { id: 'tp3', name: '进度款收款', type: 'income', amount: 0, category: '', note: '' }
      ] }
    ]
  };
}
