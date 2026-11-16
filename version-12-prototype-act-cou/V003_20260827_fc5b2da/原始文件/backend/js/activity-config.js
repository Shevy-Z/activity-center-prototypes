(function () {
  'use strict';

  var common = window.SACommon;
  var data = window.SAReportData;
  var esc = common.escapeHtml;
  var status = common.status;
  var checkpointOptions = ['进入活动','领券前','抽奖前','触发发券前'];
  var state = {
    mode: 'create',
    step: 1,
    selectedId: 'ACT-SA-20260701',
    placementId: 'SA-PUT-20260702',
    placementMode: 'create',
    placementForm: null,
    placementCandidateId: null,
    placementSelectorTab: 'available',
    selectedComboId: 'COMB-SA-20260701',
    comboMode: 'edit',
    comboForm: null,
    form: null,
    pendingId: null,
    accessDraft: null,
    storeSelectionDraftCount: 0,
    posterForm: null,
    posterUploadUrl: ''
  };

  var pages = {
    'activity-manage': {center:'活动中心', menu:'保客活动创建', title:'保客活动创建', desc:'创建和维护原有保客活动；活动内配置适用门店与允许分享角色。'},
    'activity-create': {center:'活动中心', menu:'保客活动创建', title:'保客活动新增 / 编辑', desc:'沿用原有四步流程，在活动范围内增加允许分享角色。'},
    'activity-detail': {center:'活动中心', menu:'保客活动创建', title:'保客活动详情', desc:'查看活动配置、准入配置、奖品和互斥关系快照。'},
    'combo-manage': {center:'活动中心', menu:'组合活动列表', title:'组合活动列表', desc:'组合活动作为一个大活动配置适用门店和允许分享角色。'},
    'combo-edit': {center:'活动中心', menu:'组合活动列表', title:'组合活动新增 / 编辑', desc:'在组合活动层维护展示名称、门店范围和允许分享角色。'},
    'combo-detail': {center:'活动中心', menu:'组合活动列表', title:'组合活动详情', desc:'查看组合活动及其子活动、门店和角色授权快照。'},
    'activity-mutex': {center:'活动中心', menu:'保客活动互斥关系', title:'保客活动互斥关系', desc:'复用原活动互斥能力，查看参与主体口径及生效状态。'},
    'sa-placement-manage': {center:'活动中心', menu:'活动分享配置', title:'活动分享配置', desc:'独立维护普通活动和组合活动是否进入员工可分享池。'},
    'sa-placement-edit': {center:'活动中心', menu:'活动分享配置', title:'新增 / 编辑活动分享配置', desc:'选择普通活动或组合活动；门店与角色读取投放对象配置。'},
    'sa-placement-detail': {center:'活动中心', menu:'活动分享配置', title:'活动分享配置详情', desc:'查看投放对象、来源配置和活动授权快照。'},
    'sa-qr-settings': {center:'活动中心', menu:'活动分享配置', title:'二维码参数配置', desc:'配置员工生成二维码时可选择的有效时长及默认值。'},
    'sa-poster-settings': {center:'活动中心', menu:'活动分享配置', title:'分享海报规则配置', desc:'维护员工端生成分享海报时读取的默认背景和默认文案。'}
  };

  function findActivity(id) {
    return data.activityConfigs.find(function (item) { return item.id === id; });
  }

  function accessSubject(level) {
    return level === '认证级' ? '认证关系' : level === '绑车级' ? 'VIN' : 'oneID';
  }

  function defaultCheckpoints(activityType) {
    return activityType === '抽奖' ? ['进入活动','抽奖前'] : ['进入活动','领券前'];
  }

  function freshForm() {
    return {
      id: '系统生成', name: '', brand: '东风日产', business: '维保活动', activityType: '领券',
      trigger: 'C端主动领取', claimMode: '一键领取', level: '绑车级', status: '草稿',
      time: '2026-08-01 至 2026-09-30', storeScope: '已选择0家专营店', storeCount: 0,
      couponIds: ['TPL-CP-10021'], coupons: ['基础保养抵扣券'], rights: ['免费车辆检测'],
      shareRoleCodes: [], shareRoleNames: [], mutexIds: [], mutexSubject: 'VIN', accessEnabled: '启用', checkpoints: defaultCheckpoints('领券'), shareTitle: ''
    };
  }

  function copyForm(source, mode) {
    var form = JSON.parse(JSON.stringify(source || freshForm()));
    form.accessEnabled = form.accessEnabled || '启用';
    form.checkpoints = form.checkpoints || defaultCheckpoints(form.activityType);
    form.shareRoleCodes = form.shareRoleCodes || [];
    form.shareRoleNames = form.shareRoleNames || [];
    if (typeof form.storeCount !== 'number') {
      var storeCountMatch = String(form.storeScope || '').match(/(\d+)家/);
      form.storeCount = storeCountMatch ? Number(storeCountMatch[1]) : (form.storeScope && form.storeScope !== '全部门店' ? 1 : 0);
    }
    form.mutexSubject = accessSubject(form.level);
    if (mode === 'copy') {
      form.id = '系统生成';
      form.name = source.name + '-副本';
      form.status = '草稿';
      form.shareRoleCodes = [];
      form.shareRoleNames = [];
    }
    return form;
  }

  function prepare(mode, id) {
    state.mode = mode;
    state.step = 1;
    state.selectedId = id || state.selectedId;
    if (mode === 'create') state.form = freshForm();
    else state.form = copyForm(findActivity(id), mode);
  }

  function options(items, current) {
    return items.map(function (item) {
      return '<option value="' + esc(item) + '"' + (item === current ? ' selected' : '') + '>' + esc(item) + '</option>';
    }).join('');
  }

  function roleNames(row) {
    return (row && row.shareRoleNames && row.shareRoleNames.length) ? row.shareRoleNames : [];
  }

  function roleSummary(row) {
    var names = roleNames(row);
    return names.length ? names.join('、') : '未配置（无人可分享）';
  }

  function roleSelector(form, locked, fieldName) {
    var selected = form.shareRoleCodes || [];
    return '<div class="role-checkbox-grid">' + (data.roleOptions || []).map(function (role) {
      var checked = selected.indexOf(role.code) > -1;
      return '<label class="role-option ' + (checked ? 'checked' : '') + (locked ? ' locked' : '') + '"><input type="checkbox" data-share-role="' + esc(fieldName || 'activity') + '" value="' + esc(role.code) + '"' + (checked ? ' checked' : '') + (locked ? ' disabled' : '') + '><span><strong>' + esc(role.name) + '</strong><small>' + esc(role.code) + '</small></span></label>';
    }).join('') + '</div>';
  }

  function activityFilters() {
    return '<div class="filter-panel"><div class="filter-grid">' +
      '<div class="filter-field"><label>活动ID：</label><input placeholder="请输入活动ID"></div>' +
      '<div class="filter-field"><label>活动名称：</label><input placeholder="请输入活动名称"></div>' +
      '<div class="filter-field"><label>活动状态：</label><select><option>全部</option><option>草稿</option><option>未启用</option><option>已启用</option><option>已关闭</option></select></div>' +
      '<div class="filter-field"><label>触发方式：</label><select><option>全部</option><option>C端主动参与</option><option>C端主动领取</option><option>后台统一推送</option></select></div>' +
      '<div class="filter-field"><label>准入级别：</label><select><option>全部</option><option>号码级</option><option>绑车级</option><option>认证级</option></select></div>' +
      '<div class="filter-field"><label>品牌：</label><select><option>东风日产</option><option>启辰</option></select></div>' +
      '<div class="filter-field"><label>活动时间：</label><input value="2026-07-01 至 2026-09-30"></div>' +
      '</div><div class="filter-actions"><button class="button" data-reset type="button">重置</button><button class="button primary" data-query type="button">查询</button></div></div>';
  }

  function operationLinks(row) {
    var action = row.status === '已启用'
      ? '<a class="link-action danger-link" data-activity-action="close" data-id="' + row.id + '">关闭</a>'
      : (row.status === '已关闭' ? '' : '<a class="link-action" data-activity-action="enable" data-id="' + row.id + '">启用</a>');
    return '<a class="link-action" data-activity-action="view" data-id="' + row.id + '">查看</a>' +
      '<a class="link-action" data-activity-action="edit" data-id="' + row.id + '">编辑</a>' +
      '<a class="link-action" data-activity-action="copy" data-id="' + row.id + '">复制</a>' + action;
  }

  function renderManage() {
    return '<div class="rule-alert neutral"><strong>职责边界：</strong>活动内维护适用门店与允许分享角色；是否进入服务助手可分享池，请前往“活动分享配置”。</div>' + activityFilters() + '<div class="panel"><div class="panel-head"><div class="panel-title">保客活动列表 <span class="panel-subtitle">活动主数据与分享角色同源维护</span></div>' +
      '<div class="toolbar"><button class="button primary" data-activity-new type="button">新增活动</button></div></div>' +
      '<div class="table-shell"><table class="data-table activity-config-table"><thead><tr><th>活动ID / 名称</th><th>业务子版块</th><th>活动类型</th><th>触发方式</th><th>领券方式</th><th>准入等级</th><th>活动时间</th><th>活动状态</th><th>操作</th></tr></thead><tbody>' +
      data.activityConfigs.map(function (row) {
        return '<tr><td class="wrap"><a class="link-action" data-activity-action="view" data-id="' + row.id + '">' + esc(row.id) + '</a><br>' + esc(row.name) + '</td><td>' + esc(row.business) + '</td><td>' + esc(row.activityType) + '</td><td>' + esc(row.trigger) + '</td><td>' + esc(row.claimMode) + '</td><td>' + status(row.level) + '</td><td>' + esc(row.time) + '</td><td>' + status(row.status) + '</td><td class="operation-cell">' + operationLinks(row) + '</td></tr>';
      }).join('') + '</tbody></table></div>' + common.pagination(data.activityConfigs.length) + '</div>';
  }

  function stepper() {
    var steps = [['1','基本信息'],['2','关联卡券'],['3','活动对象'],['4','分享与SEO']];
    return '<div class="activity-stepper">' + steps.map(function (item) {
      var no = Number(item[0]);
      return '<button class="activity-step ' + (state.step === no ? 'active' : '') + ' ' + (state.step > no ? 'done' : '') + '" data-form-step="' + no + '" type="button"><i>' + item[0] + '</i><span>' + item[1] + '</span></button>';
    }).join('') + '</div>';
  }

  function formItem(label, control, full, note) {
    return '<div class="activity-form-item ' + (full ? 'full' : '') + '"><label>' + label + '</label><div class="activity-control">' + control + (note ? '<small>' + note + '</small>' : '') + '</div></div>';
  }

  function storeSelectionLabel(form) {
    return '已选择' + Number(form.storeCount || 0) + '家专营店';
  }

  function storeSelectionControl(form,locked) {
    return '<div class="store-scope-control">' +
      '<input class="store-count-input" value="' + esc(storeSelectionLabel(form)) + '" readonly>' +
      '<button class="button primary" data-open-store-selector type="button"' + (locked ? ' disabled' : '') + '>选择门店</button>' +
      '<button class="button primary" data-store-template-download type="button"' + (locked ? ' disabled' : '') + '><span class="store-action-icon">⇩</span>下载模板</button>' +
      '<label class="button primary store-upload-button' + (locked ? ' disabled' : '') + '"><span class="store-action-icon">↥</span>上传文件<input data-store-file-upload type="file" accept=".xlsx,.xls,.csv"' + (locked ? ' disabled' : '') + '></label>' +
      '</div>';
  }

  function renderStep1(form) {
    var locked = form.status === '已启用';
    return '<section class="activity-form-section"><div class="form-section-head"><div><h2>Step1 基本信息</h2><p>维护活动主数据；投放关系由独立“活动分享配置”承接。</p></div>' + (locked ? '<span class="lock-badge">活动已启用 · 门店与角色已锁定</span>' : '') + '</div>' +
      (state.mode === 'copy' ? '<div class="rule-alert neutral"><strong>复制规则：</strong>允许分享角色已重置为空，且不会复制活动分享配置。</div>' : '') +
      '<div class="activity-form-grid">' +
      formItem('<em>*</em>活动ID','<input value="' + esc(form.id) + '" disabled>') +
      formItem('<em>*</em>活动名称','<input data-activity-field="name" value="' + esc(form.name) + '" placeholder="请输入活动名称">') +
      formItem('<em>*</em>品牌','<select data-activity-field="brand">' + options(['东风日产','启辰'],form.brand) + '</select>') +
      formItem('<em>*</em>业务子版块','<select data-activity-field="business">' + options(['会员权益','维保活动','续保活动','取送车活动'],form.business) + '</select>') +
      formItem('<em>*</em>活动时间','<input data-activity-field="time" value="' + esc(form.time) + '">') +
      formItem('<em>*</em>活动类型','<select data-activity-field="activityType">' + options(['领券','抽奖'],form.activityType) + '</select>') +
      formItem('<em>*</em>触发方式','<select data-activity-field="trigger"' + (locked ? ' disabled' : '') + '>' + options(['C端主动参与','C端主动领取','后台统一推送','用户行为触发'],form.trigger) + '</select>',false,locked ? '活动开启后触发方式不可修改。' : '触发方式决定活动执行链路和后续字段。') +
      formItem('<em>*</em>启用状态','<select><option>' + esc(form.status) + '</option></select>') +
      '</div></section>';
  }

  function renderStep2(form) {
    var locked = form.status === '已启用';
    return '<section class="activity-form-section"><div class="form-section-head"><div><h2>Step2 关联卡券与分享范围</h2><p>领券方式、门店来源和适用门店沿用原页面；允许分享角色在同一活动内配置。</p></div><button class="button" type="button" data-demo-action="add-coupon">选择卡券</button></div>' +
      '<div class="activity-form-grid">' +
      formItem('<em>*</em>领券方式','<select data-activity-field="claimMode">' + options(['一键领取','手动领取','自动抽奖','自动领取'],form.claimMode) + '</select>',false,'动态二维码只承接用户可主动执行的领券或抽奖活动。') +
      formItem('门店来源','<select><option>活动统一配置</option><option>沿用卡券中心</option></select>') +
      formItem('<em>*</em>适用门店',storeSelectionControl(form,locked),true,locked ? '活动生效后不可调整。' : '支持按组织树选择门店，也可下载模板后批量上传。') +
      formItem('<em>*</em>允许分享角色',roleSelector(form,locked,'activity'),true,(locked ? '活动生效后不可调整。' : '候选角色读取服务助手；员工任一有效角色命中即可分享。') + ' 空值表示无人可分享。') +
      '</div><div class="table-shell inline-table"><table class="data-table"><thead><tr><th>卡券模板ID</th><th>卡券名称</th><th>状态</th><th>适用范围</th><th>操作</th></tr></thead><tbody>' +
      form.coupons.map(function (coupon,index) { return '<tr><td>' + esc(form.couponIds[index] || '-') + '</td><td>' + esc(coupon) + '</td><td>' + status('已生效') + '</td><td>' + esc(form.storeScope) + '</td><td><a class="link-action">查看</a></td></tr>'; }).join('') +
      '</tbody></table></div></section>';
  }

  function checkpointTags(form) {
    if (form.accessEnabled !== '启用') return '<span class="empty-inline">未启用准入，不执行节点校验</span>';
    if (!form.checkpoints.length) return '<span class="empty-inline">暂未选择校验节点</span>';
    return form.checkpoints.map(function (item) { return '<span class="access-summary-tag">' + esc(item) + '</span>'; }).join('');
  }

  function selectedMutex(form) {
    if (!form.mutexIds.length) return '<span class="empty-inline">暂未配置互斥活动</span>';
    return form.mutexIds.map(function (id) {
      var item = findActivity(id);
      return '<span class="selected-chip">' + esc(item ? item.name : id) + '<small>' + esc(id) + '</small></span>';
    }).join('');
  }

  function renderStep3(form) {
    var accessLevel = form.accessEnabled === '启用' ? form.level : '-';
    var mutexDisabled = form.accessEnabled !== '启用';
    return '<section class="activity-form-section" data-anno="access-config-source"><div class="form-section-head"><div><h2>Step3 活动对象</h2><p>复用活动原有准入配置；员工选择页和用户聚合页只读取结果，不增加第二套“员工活动级别”。</p></div></div>' +
      '<div class="rule-alert"><strong>改造边界：</strong>准入开关、准入等级和校验节点均沿用活动中心原有能力；员工分享链路只读取该配置。</div>' +
      '<div class="configuration-split"><div class="config-card access-config-card" data-anno="access-config-panel"><div class="config-card-head"><div><h3>准入配置</h3><p>原活动页面已有配置</p></div><button class="button primary" data-configure-access type="button">配置准入</button></div>' +
      '<div class="access-summary-grid"><div><span>是否启用准入</span>' + status(form.accessEnabled === '启用' ? '已启用' : '未启用') + '</div><div><span>准入等级</span><strong>' + esc(accessLevel) + '</strong></div><div class="full"><span>校验节点</span><div class="access-summary-tags">' + checkpointTags(form) + '</div></div></div></div>' +
      '<div class="config-card" data-anno="mutex-reuse"><div class="config-card-head"><div><h3>互斥活动</h3><p>复用原“选择互斥活动”能力</p></div><button class="button" data-select-mutex type="button"' + (mutexDisabled ? ' disabled' : '') + '>选择互斥活动</button></div><div class="selected-chip-list">' + selectedMutex(form) + '</div><div class="subject-summary"><span>互斥主体口径</span><strong>' + (mutexDisabled ? '-' : esc(form.mutexSubject)) + '</strong><small>' + (mutexDisabled ? '请先启用准入并配置等级' : '由准入等级自动确定，不单独配置') + '</small></div></div></div></section>';
  }

  function renderStep4(form) {
    return '<section class="activity-form-section"><div class="form-section-head"><div><h2>Step4 分享与SEO</h2><p>本步骤仍用于C端页面素材，不承担活动投放配置。</p></div></div>' +
      '<div class="rule-alert neutral"><strong>注意：</strong>这里的“分享”仅指活动页面标题、描述和图片素材，与“活动分享配置”无关。</div>' +
      '<div class="activity-form-grid">' +
      formItem('分享标题','<input data-activity-field="shareTitle" value="' + esc(form.shareTitle || form.name) + '" placeholder="请输入分享标题">',true) +
      formItem('分享描述','<textarea rows="3">活动详情及参与说明，以活动规则为准。</textarea>',true) +
      formItem('WAP/APP分享图标','<button class="upload-box" type="button">＋ 上传图片</button>') +
      formItem('小程序分享图标','<button class="upload-box" type="button">＋ 上传图片</button>') +
      formItem('SEO标题','<input value="' + esc(form.name) + '">') +
      formItem('SEO关键词','<input value="保客活动,车主权益">') +
      '</div></section>';
  }

  function formFooter(form) {
    return '<div class="activity-form-footer"><button class="button" data-back-list type="button">返回列表</button><div>' +
      (state.step > 1 ? '<button class="button" data-form-prev type="button">上一步</button>' : '') +
      '<button class="button" data-save-draft type="button">保存草稿</button>' +
      (state.step < 4 ? '<button class="button primary" data-form-next type="button">下一步</button>' : '<button class="button primary" data-submit-activity type="button">' + (form.status === '已启用' ? '保存修改' : '提交并启用') + '</button>') +
      '</div></div>';
  }

  function renderCreate() {
    var form = state.form || freshForm();
    var body = state.step === 1 ? renderStep1(form) : state.step === 2 ? renderStep2(form) : state.step === 3 ? renderStep3(form) : renderStep4(form);
    return '<div class="activity-mode-bar"><span>' + (state.mode === 'create' ? '新增活动' : state.mode === 'copy' ? '复制活动' : '编辑活动') + '</span><strong>' + esc(form.name || '未命名活动') + '</strong><em>' + esc(form.id) + '</em></div>' + stepper() + body + formFooter(form);
  }

  function detailBlock(title, rows) {
    return '<section class="detail-block"><h2>' + esc(title) + '</h2><div class="detail-block-grid">' + rows.map(function (row) {
      return '<div><label>' + esc(row[0]) + '</label><strong>' + (row[2] ? row[1] : esc(row[1])) + '</strong></div>';
    }).join('') + '</div></section>';
  }

  function renderDetail() {
    var row = findActivity(state.selectedId) || data.activityConfigs[0];
    var mutexNames = row.mutexIds.map(function (id) { var item = findActivity(id); return item ? item.name + '（' + id + '）' : id; }).join('、') || '未配置';
    var rowCheckpoints = row.checkpoints || defaultCheckpoints(row.activityType);
    var accessEnabled = row.accessEnabled || '启用';
    return '<div class="rule-alert neutral"><strong>员工分享：</strong>适用门店与允许分享角色在活动内维护；投放关系在“活动分享配置”查询。</div><div class="detail-summary"><div><span>活动状态</span>' + status(row.status) + '</div><div><span>触发方式</span><strong>' + esc(row.trigger) + '</strong></div><div><span>准入等级</span>' + status(accessEnabled === '启用' ? row.level : '未启用') + '</div><div><span>活动类型</span><strong>' + esc(row.activityType) + '</strong></div></div>' +
      detailBlock('基本信息', [['活动ID',row.id],['活动名称',row.name],['品牌',row.brand],['业务子版块',row.business],['活动时间',row.time],['触发方式',row.trigger],['领券方式',row.claimMode]]) +
      detailBlock('准入配置', [['是否启用准入',status(accessEnabled === '启用' ? '已启用' : '未启用'),true],['准入等级',accessEnabled === '启用' ? status(row.level) : '-',true],['校验节点',accessEnabled === '启用' ? rowCheckpoints.join('、') : '-'],['参与主体口径',accessEnabled === '启用' ? row.mutexSubject : '-']]) +
      detailBlock('活动奖品与分享范围', [['关联卡券',row.coupons.join('、')],['关联权益',row.rights.join('、') || '无'],['适用门店',row.storeScope],['允许分享角色',roleSummary(row)],['角色来源','服务助手角色列表（只读候选）']]) +
      detailBlock('活动互斥', [['互斥活动',mutexNames],['互斥主体口径',row.mutexSubject],['配置来源','原活动中心“选择互斥活动”']]) +
      '<div class="detail-page-footer"><button class="button" data-back-list type="button">返回列表</button><button class="button primary" data-detail-edit="' + row.id + '" type="button">编辑活动</button></div>';
  }

  function mutexFilters() {
    return '<div class="filter-panel"><div class="filter-grid compact">' +
      '<div class="filter-field"><label>活动ID：</label><input placeholder="请输入活动ID"></div>' +
      '<div class="filter-field"><label>活动名称：</label><input placeholder="请输入活动名称"></div>' +
      '<div class="filter-field"><label>主体口径：</label><select><option>全部</option><option>oneID</option><option>VIN</option><option>认证关系</option></select></div>' +
      '<div class="filter-field"><label>生效状态：</label><select><option>全部</option><option>已生效</option><option>待生效</option></select></div>' +
      '</div><div class="filter-actions"><button class="button" data-reset type="button">重置</button><button class="button primary" data-query type="button">查询</button></div></div>';
  }

  function renderMutex() {
    return '<div class="rule-alert"><strong>配置入口：</strong>互斥关系仍在活动新增/编辑页通过“选择互斥活动”维护，本页仅用于查询和追溯，不新增员工分享互斥菜单。</div>' + mutexFilters() +
      '<div class="panel" data-anno="mutex-list"><div class="panel-head"><div class="panel-title">活动互斥关系 <span class="panel-subtitle">参与阶段按活动准入等级对应主体校验</span></div></div>' +
      '<div class="table-shell"><table class="data-table"><thead><tr><th>关系ID</th><th>活动A</th><th>准入级别</th><th>活动B</th><th>准入级别</th><th>互斥主体口径</th><th>配置来源</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>' +
      data.mutexRelations.map(function (row) {
        return '<tr><td>' + row.id + '</td><td class="wrap">' + row.activityA + '<br>' + esc(row.nameA) + '</td><td>' + status(row.levelA) + '</td><td class="wrap">' + row.activityB + '<br>' + esc(row.nameB) + '</td><td>' + status(row.levelB) + '</td><td>' + status(row.subject) + '</td><td>' + esc(row.source) + '</td><td>' + status(row.status) + '</td><td>' + row.updated + '</td><td><a class="link-action" data-view-mutex="' + row.id + '">查看关系</a></td></tr>';
      }).join('') + '</tbody></table></div>' + common.pagination(data.mutexRelations.length) + '</div>';
  }

  function findPlacement(id) {
    return data.saPlacements.find(function (item) { return item.id === id; });
  }

  function findCombo(id) {
    return data.comboActivities.find(function (item) { return item.id === id; });
  }

  function freshCombo() {
    return {id:'系统生成',name:'',displayName:'',brand:'东风日产',time:'2026-09-01 至 2026-10-31',level:'绑车级',active:false,shareRoleCodes:[],shareRoleNames:[],storeScope:{mode:'SPECIFIED',storeIds:['S001']},children:[
      {id:'系统生成',segment:'留存人群包',coupon:'待选择卡券',benefit:'待选择权益'}
    ]};
  }

  function prepareCombo(mode,id) {
    state.comboMode = mode;
    state.selectedComboId = id || state.selectedComboId;
    var source = mode === 'create' ? freshCombo() : JSON.parse(JSON.stringify(findCombo(id) || freshCombo()));
    source.shareRoleCodes = source.shareRoleCodes || [];
    source.shareRoleNames = source.shareRoleNames || [];
    if (mode === 'copy') {
      source.id = '系统生成';
      source.name = source.name + '-副本';
      source.displayName = source.displayName ? source.displayName + '-副本' : '';
      source.active = false;
      source.shareRoleCodes = [];
      source.shareRoleNames = [];
    }
    state.comboForm = source;
  }

  function comboStoreSelector(form,locked) {
    var selected = (form.storeScope && form.storeScope.storeIds) || [];
    return '<div class="role-checkbox-grid store-checkbox-grid">' + (data.stores || []).map(function (store) {
      var checked = form.storeScope && form.storeScope.mode === 'ALL' ? true : selected.indexOf(store.id) > -1;
      return '<label class="role-option ' + (checked ? 'checked' : '') + (locked ? ' locked' : '') + '"><input type="checkbox" data-combo-store value="' + esc(store.id) + '"' + (checked ? ' checked' : '') + (locked ? ' disabled' : '') + '><span><strong>' + esc(store.name) + '</strong><small>' + esc(store.code) + '</small></span></label>';
    }).join('') + '</div>';
  }

  function renderComboManage() {
    return '<div class="rule-alert neutral"><strong>组合活动边界：</strong>适用门店与允许分享角色在组合活动父级配置，子活动不重复配置；用户端仍展示一张大活动卡片。</div>' + activityFilters() +
      '<div class="panel"><div class="panel-head"><div class="panel-title">组合活动列表 <span class="panel-subtitle">父活动统一配置，命中子活动独立执行与统计</span></div><div class="toolbar"><button class="button primary" data-combo-new type="button">新增组合活动</button></div></div>' +
      '<div class="table-shell"><table class="data-table"><thead><tr><th>组合活动ID / 名称</th><th>用户端展示名称</th><th>品牌</th><th>子活动数</th><th>适用门店</th><th>允许分享角色</th><th>活动时间</th><th>状态</th><th>操作</th></tr></thead><tbody>' + data.comboActivities.map(function (row) {
        return '<tr><td class="wrap"><a class="link-action" data-combo-action="view" data-id="' + esc(row.id) + '">' + esc(row.id) + '</a><br>' + esc(row.name) + '</td><td>' + esc(comboDisplayName(row)) + '</td><td>' + esc(row.brand) + '</td><td>' + row.children.length + '</td><td class="wrap">' + esc(comboScopeSummary(row)) + '</td><td class="wrap">' + esc(roleSummary(row)) + '</td><td>' + esc(row.time) + '</td><td>' + status(row.active ? '已启用' : '草稿') + '</td><td class="operation-cell"><a class="link-action" data-combo-action="view" data-id="' + esc(row.id) + '">查看</a><a class="link-action" data-combo-action="edit" data-id="' + esc(row.id) + '">编辑</a><a class="link-action" data-combo-action="copy" data-id="' + esc(row.id) + '">复制</a></td></tr>';
      }).join('') + '</tbody></table></div>' + common.pagination(data.comboActivities.length) + '</div>';
  }

  function renderComboEdit() {
    var form = state.comboForm || freshCombo();
    var locked = !!form.active;
    return '<div class="activity-mode-bar"><span>' + (state.comboMode === 'create' ? '新增组合活动' : state.comboMode === 'copy' ? '复制组合活动' : '编辑组合活动') + '</span><strong>' + esc(form.name || '未命名组合活动') + '</strong><em>' + esc(form.id) + '</em></div>' +
      (state.comboMode === 'copy' ? '<div class="rule-alert neutral"><strong>复制规则：</strong>允许分享角色已重置为空，活动分享配置不会复制，复制结果保持草稿。</div>' : '') +
      '<section class="activity-form-section"><div class="form-section-head"><div><h2>组合活动基本信息与分享范围</h2><p>基本信息由父级统一维护；门店和角色不下沉到子活动。</p></div>' + (locked ? '<span class="lock-badge">组合活动已启用 · 门店与角色已锁定</span>' : '') + '</div><div class="activity-form-grid">' +
      formItem('<em>*</em>组合活动ID','<input value="' + esc(form.id) + '" disabled>') +
      formItem('<em>*</em>组合活动名称','<input data-combo-field="name" value="' + esc(form.name) + '">') +
      formItem('用户端展示名称','<input data-combo-field="displayName" value="' + esc(form.displayName || '') + '" placeholder="未配置时回退组合活动名称">') +
      formItem('品牌','<select data-combo-field="brand">' + options(['东风日产','启辰'],form.brand) + '</select>') +
      formItem('活动时间','<input data-combo-field="time" value="' + esc(form.time) + '">') +
      formItem('准入等级','<input value="' + esc(form.level) + '" disabled>',false,'读取组合活动既有准入，不新增员工分享等级。') +
      formItem('<em>*</em>适用门店',comboStoreSelector(form,locked),true,locked ? '组合活动生效后不可调整。' : '一个服务助手账号仅使用其唯一门店校验。') +
      formItem('<em>*</em>允许分享角色',roleSelector(form,locked,'combo'),true,(locked ? '组合活动生效后不可调整。' : '候选角色读取服务助手；任一角色命中即可分享。') + ' 空值表示无人可分享。') +
      '</div></section><section class="activity-form-section"><div class="form-section-head"><div><h2>子活动</h2><p>各子活动可以关联不同卡券和权益；不重复配置门店与分享角色。</p></div><button class="button" data-demo-action="add-child" type="button">新增子活动</button></div><div class="table-shell"><table class="data-table"><thead><tr><th>子活动ID</th><th>人群包</th><th>关联卡券</th><th>关联权益</th></tr></thead><tbody>' + form.children.map(function (child) {
        return '<tr><td>' + esc(child.id) + '</td><td>' + esc(child.segment) + '</td><td>' + esc(child.coupon) + '</td><td>' + esc(child.benefit) + '</td></tr>';
      }).join('') + '</tbody></table></div></section><div class="activity-form-footer"><button class="button" data-combo-back type="button">返回列表</button><div><button class="button" data-combo-save="draft" type="button">保存草稿</button><button class="button primary" data-combo-save="active" type="button">' + (locked ? '保存修改' : '提交并启用') + '</button></div></div>';
  }

  function renderComboDetail() {
    var row = findCombo(state.selectedComboId) || data.comboActivities[0];
    return '<div class="detail-summary"><div><span>组合活动状态</span>' + status(row.active ? '已启用' : '草稿') + '</div><div><span>子活动数</span><strong>' + row.children.length + '</strong></div><div><span>准入等级</span>' + status(row.level) + '</div><div><span>参与唯一键</span><strong>组合活动ID + VIN</strong></div></div>' +
      detailBlock('组合活动信息', [['组合活动ID',row.id],['组合活动名称',row.name],['用户端展示名称',comboDisplayName(row)],['品牌',row.brand],['活动时间',row.time],['适用门店',comboScopeSummary(row)],['允许分享角色',roleSummary(row)],['角色来源','服务助手角色列表']]) +
      '<section class="detail-block"><h2>子活动与奖品</h2><div class="table-shell"><table class="data-table"><thead><tr><th>子活动ID</th><th>人群包</th><th>关联卡券</th><th>关联权益</th></tr></thead><tbody>' + row.children.map(function (child) { return '<tr><td>' + esc(child.id) + '</td><td>' + esc(child.segment) + '</td><td>' + esc(child.coupon) + '</td><td>' + esc(child.benefit) + '</td></tr>'; }).join('') + '</tbody></table></div><div class="rule-alert neutral"><strong>执行规则：</strong>同一VIN命中多个子活动时全部执行、全部发放；用户端一张卡，报表按子活动拆行。</div></section><div class="detail-page-footer"><button class="button" data-combo-back type="button">返回列表</button><button class="button primary" data-combo-action="edit" data-id="' + esc(row.id) + '" type="button">编辑组合活动</button></div>';
  }

  function placementSource(row) {
    return row.objectType === '组合活动' ? findCombo(row.objectId) : findActivity(row.objectId);
  }

  function comboDisplayName(combo) {
    if (!combo) return '-';
    return String(combo.displayName || '').trim() || combo.name;
  }

  function comboScopeStores(combo) {
    if (!combo || !combo.storeScope || combo.storeScope.mode !== 'SPECIFIED') return [];
    return (combo.storeScope.storeIds || []).map(function (id) {
      return (data.stores || []).find(function (store) { return store.id === id && store.available; });
    }).filter(Boolean);
  }

  function comboScopeSummary(combo) {
    var stores = comboScopeStores(combo);
    if (!stores.length) return '全部门店';
    return '指定' + stores.length + '家：' + stores.map(function (store) { return store.name; }).join('、');
  }

  function placementDisplayName(row) {
    var source = placementSource(row);
    return row.objectType === '组合活动' ? comboDisplayName(source) : (source ? source.name : row.objectName);
  }

  function inheritedScope(row) {
    var source = placementSource(row);
    if (!source) return '-';
    return row.objectType === '组合活动' ? comboScopeSummary(source) : (source.storeScope || '-');
  }

  function inheritedRoles(row) {
    return roleSummary(placementSource(row));
  }

  function scopeSourceLabel(row) {
    return row.objectType === '组合活动' ? '组合活动配置' : '活动配置';
  }

  function placementTabs(active) {
    return '<div class="subtabs placement-subtabs"><a class="subtab ' + (active === 'placement' ? 'active' : '') + '" href="#sa-placement-manage">活动分享配置</a><a class="subtab ' + (active === 'qr' ? 'active' : '') + '" href="#sa-qr-settings">二维码参数</a><a class="subtab ' + (active === 'poster' ? 'active' : '') + '" href="#sa-poster-settings">分享海报规则</a></div>';
  }

  function renderPlacementManage() {
    var filters = '<div class="filter-panel"><div class="filter-grid">' +
      '<div class="filter-field"><label>配置ID：</label><input placeholder="请输入配置ID"></div>' +
      '<div class="filter-field"><label>配置名称：</label><input placeholder="请输入配置名称"></div>' +
      '<div class="filter-field"><label>投放对象：</label><select><option>全部</option><option>普通活动</option><option>组合活动</option></select></div>' +
      '<div class="filter-field"><label>状态：</label><select><option>全部</option><option>草稿</option><option>已生效</option><option>已停用</option></select></div>' +
      '<div class="filter-field"><label>品牌：</label><select><option>东风日产</option><option>启辰</option></select></div>' +
      '<div class="filter-field"><label>活动时间：</label><input value="2026-07-01 至 2026-09-30"></div></div>' +
      '<div class="filter-actions"><button class="button" data-reset type="button">重置</button><button class="button primary" data-query type="button">查询</button></div></div>';
    return placementTabs('placement') + '<div class="rule-alert"><strong>独立配置：</strong>本页只维护普通活动和组合活动是否进入员工可分享池；适用门店、允许分享角色、准入、卡券和互斥关系均读取投放对象配置。</div>' + filters +
      '<div class="panel" data-anno="sa-placement-list"><div class="panel-head"><div class="panel-title">活动分享配置列表 <span class="panel-subtitle">一个配置对应一个普通活动或一个组合活动</span></div><div class="toolbar"><button class="button primary" data-placement-new type="button">新增配置</button></div></div>' +
      '<div class="table-shell"><table class="data-table"><thead><tr><th>配置ID / 名称</th><th>投放对象</th><th>对象ID / 名称</th><th>活动数</th><th>准入等级</th><th>适用门店（只读）</th><th>允许分享角色（只读）</th><th>活动时间</th><th>状态</th><th>更新时间 / 操作人</th><th>操作</th></tr></thead><tbody>' + data.saPlacements.map(function (row) {
        var originalName = row.objectType === '组合活动' && placementSource(row) ? '<br><span class="panel-subtitle">原名：' + esc(placementSource(row).name) + '</span>' : '';
        return '<tr><td class="wrap"><a class="link-action" data-placement-view="' + row.id + '">' + esc(row.id) + '</a><br>' + esc(row.name) + '</td><td>' + status(row.objectType) + '</td><td class="wrap">' + esc(row.objectId) + '<br>' + esc(placementDisplayName(row)) + originalName + '</td><td>' + row.activityCount + '</td><td>' + status(row.levelSummary) + '</td><td class="wrap">' + esc(inheritedScope(row)) + '<br><span class="panel-subtitle">来源：' + esc(scopeSourceLabel(row)) + '</span></td><td class="wrap">' + esc(inheritedRoles(row)) + '</td><td>' + esc(row.time) + '</td><td>' + status(row.status) + '</td><td>' + row.updated + '<br><span class="panel-subtitle">' + esc(row.operator) + '</span></td><td class="operation-cell"><a class="link-action" data-placement-view="' + row.id + '">查看</a><a class="link-action" data-placement-edit="' + row.id + '">编辑</a>' + (row.status === '已生效' ? '<a class="link-action danger-link" data-placement-toggle="' + row.id + '">停用</a>' : '<a class="link-action" data-placement-toggle="' + row.id + '">启用</a>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' + common.pagination(data.saPlacements.length) + '</div>';
  }

  function freshPlacement() {
    return {id:'系统生成',name:'',objectType:'普通活动',objectId:'ACT-SA-20260701',objectName:'夏季养护礼遇',brand:'东风日产',activityCount:1,levelSummary:'绑车级',status:'草稿',time:'2026-07-01 至 2026-08-31',updated:'-',operator:'当前用户'};
  }

  function preparePlacement(mode, id) {
    state.placementMode = mode;
    state.placementId = id || state.placementId;
    state.placementForm = mode === 'create' ? freshPlacement() : JSON.parse(JSON.stringify(findPlacement(id) || freshPlacement()));
  }

  function syncPlacementObject(form) {
    if (form.objectType === '组合活动') {
      var combo = findCombo(form.objectId) || data.comboActivities[0];
      form.objectId = combo.id;
      form.objectName = comboDisplayName(combo);
      form.objectOriginalName = combo.name;
      form.activityCount = combo.children.length;
      form.levelSummary = combo.level;
      form.time = combo.time;
      form.brand = combo.brand;
      return;
    }
    var activity = findActivity(form.objectId) || data.activityConfigs.filter(function (item) { return item.status === '已启用' && item.trigger !== '后台统一推送' && item.trigger !== '用户行为触发'; })[0];
    form.objectId = activity.id;
    form.objectName = activity.name;
    form.activityCount = 1;
    form.levelSummary = activity.level;
    form.time = activity.time;
    form.brand = activity.brand;
  }

  function placementObjectOptions(form) {
    var rows = form.objectType === '组合活动' ? data.comboActivities.map(function (item) {
      return {id:item.id,name:comboDisplayName(item)};
    }) : data.activityConfigs.filter(function (item) {
      return item.status === '已启用' && item.trigger !== '后台统一推送' && item.trigger !== '用户行为触发';
    }).map(function (item) { return {id:item.id,name:item.name}; });
    return rows.map(function (item) { return '<option value="' + item.id + '"' + (item.id === form.objectId ? ' selected' : '') + '>' + esc(item.id + ' / ' + item.name) + '</option>'; }).join('');
  }

  function placementCandidates(form) {
    if (form.objectType === '组合活动') return data.comboActivities.map(function (item) {
      return {id:item.id,name:comboDisplayName(item),originalName:item.name,type:'组合活动',status:item.active ? '已发布' : '已停用',level:item.level,time:item.time,scope:comboScopeSummary(item),count:item.children.length};
    });
    return data.activityConfigs.filter(function (item) {
      return item.status === '已启用' && item.trigger !== '后台统一推送' && item.trigger !== '用户行为触发';
    }).map(function (item) {
      return {id:item.id,name:item.name,type:'普通活动',status:item.status,level:item.level,time:item.time,scope:item.storeScope,count:1};
    });
  }

  function renderPlacementSelectorModal() {
    var form = state.placementForm;
    var rows = placementCandidates(form);
    var selected = rows.find(function (item) { return item.id === state.placementCandidateId; });
    var availableTable = '<div class="selector-filter"><div><label>对象类型</label><input value="' + esc(form.objectType) + '" disabled></div><div><label>活动ID</label><input placeholder="请输入活动ID"></div><div><label>活动名称</label><input placeholder="请输入活动名称"></div><button class="button primary" data-query type="button">查询</button></div>' +
      '<div class="selector-table-title"><strong>可选投放对象（' + rows.length + '）</strong><span>单个配置仅可选择1个对象</span></div><div class="table-shell selector-table-shell"><table class="data-table"><thead><tr><th>选择</th><th>对象ID</th><th>对象名称</th><th>类型</th><th>活动状态</th><th>准入等级</th><th>活动数</th><th>适用门店（只读）</th><th>允许分享角色（只读）</th><th>活动时间</th></tr></thead><tbody>' + rows.map(function (item) {
        var source = item.type === '组合活动' ? findCombo(item.id) : findActivity(item.id);
        return '<tr class="' + (item.id === state.placementCandidateId ? 'selected-row' : '') + '"><td><input type="radio" name="placementCandidate" data-placement-candidate value="' + item.id + '"' + (item.id === state.placementCandidateId ? ' checked' : '') + '></td><td>' + esc(item.id) + '</td><td>' + esc(item.name) + (item.originalName && item.originalName !== item.name ? '<br><span class="panel-subtitle">原名：' + esc(item.originalName) + '</span>' : '') + '</td><td>' + status(item.type) + '</td><td>' + status(item.status) + '</td><td>' + status(item.level) + '</td><td>' + item.count + '</td><td class="wrap">' + esc(item.scope) + '</td><td class="wrap">' + esc(roleSummary(source)) + '</td><td>' + esc(item.time) + '</td></tr>';
      }).join('') + '</tbody></table></div>' + common.pagination(rows.length);
    var selectedTable = selected ? '<div class="selector-table-title"><strong>已选投放对象（1）</strong><span>确认后回填配置页</span></div><div class="table-shell"><table class="data-table"><thead><tr><th>对象ID</th><th>对象名称</th><th>类型</th><th>准入等级</th><th>活动数</th><th>操作</th></tr></thead><tbody><tr><td>' + esc(selected.id) + '</td><td>' + esc(selected.name) + (selected.originalName && selected.originalName !== selected.name ? '<br><span class="panel-subtitle">原名：' + esc(selected.originalName) + '</span>' : '') + '</td><td>' + status(selected.type) + '</td><td>' + status(selected.level) + '</td><td>' + selected.count + '</td><td><a class="link-action danger-link" data-remove-placement-candidate>移除</a></td></tr></tbody></table></div>' : '<div class="selector-empty"><strong>暂无已选投放对象</strong><span>请切换到“可选”页签选择一个活动</span></div>';
    var body = '<div class="selector-tabs"><button class="' + (state.placementSelectorTab === 'available' ? 'active' : '') + '" data-placement-selector-tab="available" type="button">可选</button><button class="' + (state.placementSelectorTab === 'selected' ? 'active' : '') + '" data-placement-selector-tab="selected" type="button">已选' + (selected ? '（1）' : '') + '</button></div><div class="selector-tip"><strong>选择说明：</strong>普通活动与组合活动分开选择；适用门店、允许分享角色、卡券、权益、准入和互斥关系均读取投放对象配置。</div>' + (state.placementSelectorTab === 'available' ? availableTable : selectedTable);
    common.openModal('选择分享活动', body, '<button class="button" data-close-modal type="button">取消</button><button class="button primary" data-confirm-placement-object type="button"' + (selected ? '' : ' disabled') + '>确认</button>', 'wide-modal placement-selector-modal');
  }

  function openPlacementSelector() {
    state.placementCandidateId = state.placementForm.objectId;
    state.placementSelectorTab = 'available';
    renderPlacementSelectorModal();
  }

  function placementSnapshot(form) {
    if (form.objectType === '组合活动') {
      var combo = findCombo(form.objectId) || data.comboActivities[0];
      return '<div class="placement-snapshot"><div class="detail-block-grid placement-grid"><div><label>用户端展示名称</label><strong>' + esc(comboDisplayName(combo)) + '</strong><small>' + (String(combo.displayName || '').trim() ? '读取组合活动展示名称' : '未配置展示名称，已回退原组合活动名称') + '</small></div><div><label>原组合活动名称</label><strong>' + esc(combo.name) + '</strong><small>保留后台识别与追溯</small></div><div><label>适用门店</label><strong>' + esc(comboScopeSummary(combo)) + '</strong><small>读取组合活动配置</small></div><div><label>允许分享角色</label><strong>' + esc(roleSummary(combo)) + '</strong><small>读取组合活动配置</small></div><div><label>活动时间</label><strong>' + esc(combo.time) + '</strong></div></div><div class="rule-alert neutral"><strong>员工可见与分享规则：</strong>活动分享配置有效 ∩ 组合活动启用 ∩ 当前账号唯一门店命中适用门店 ∩ 任一有效角色命中允许分享角色。</div><div class="rule-alert neutral"><strong>组合活动展示规则：</strong>用户端只展示一张大活动卡片；绑车并匹配VIN后，在原卡片内汇总展示所有命中子活动的卡券和权益。参与唯一键为“组合活动ID + VIN”。</div><div class="table-shell"><table class="data-table"><thead><tr><th>子活动ID</th><th>人群包</th><th>关联卡券</th><th>关联权益</th></tr></thead><tbody>' + combo.children.map(function (child) {
        return '<tr><td>' + esc(child.id) + '</td><td>' + esc(child.segment) + '</td><td>' + esc(child.coupon) + '</td><td>' + esc(child.benefit) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="placement-match-rule"><strong>多子活动命中规则：</strong>同一VIN满足多个子活动时，命中的卡券与权益全部发放；不阻断、不记为异常，不设优先级和执行顺序。组合活动只生成一条参与主记录，发放明细按命中子活动记录。</p></div>';
    }
    var activity = findActivity(form.objectId) || data.activityConfigs[0];
    return '<div class="placement-snapshot"><div class="detail-block-grid placement-grid"><div><label>活动状态</label><strong>' + status(activity.status) + '</strong></div><div><label>准入配置</label><strong>' + esc(activity.level) + ' · ' + esc(activity.checkpoints.join('、')) + '</strong></div><div><label>适用门店</label><strong>' + esc(activity.storeScope) + '</strong><small>读取活动配置</small></div><div><label>允许分享角色</label><strong>' + esc(roleSummary(activity)) + '</strong><small>读取活动配置</small></div><div><label>领券方式</label><strong>' + esc(activity.claimMode) + '</strong></div><div><label>关联卡券/权益</label><strong>' + esc(activity.coupons.join('、') + (activity.rights.length ? '；' + activity.rights.join('、') : '')) + '</strong></div></div></div>';
  }

  function renderPlacementEdit() {
    var form = state.placementForm || freshPlacement();
    return placementTabs('placement') + '<section class="activity-form-section"><div class="form-section-head"><div><h2>' + (state.placementMode === 'create' ? '新增活动分享配置' : '编辑活动分享配置') + '</h2><p>仅配置投放关系；适用门店与允许分享角色由活动或组合活动维护。</p></div><span class="lock-badge">配置对象发布后不可切换类型</span></div>' +
      '<div class="activity-form-grid">' +
      formItem('<em>*</em>配置ID','<input value="' + esc(form.id) + '" disabled>') +
      formItem('<em>*</em>配置名称','<input data-placement-field="name" value="' + esc(form.name) + '" placeholder="请输入配置名称">') +
      formItem('<em>*</em>投放对象','<div class="radio-card-group placement-type">' + ['普通活动','组合活动'].map(function (item) { return '<label class="radio-card ' + (form.objectType === item ? 'checked' : '') + '"><input type="radio" name="placementType" data-placement-type value="' + item + '"' + (form.objectType === item ? ' checked' : '') + '><strong>' + item + '</strong><span>' + (item === '普通活动' ? '选择单个已启用活动' : '选择一个组合活动作为整体') + '</span></label>'; }).join('') + '</div>',true) +
      formItem('<em>*</em>选择活动','<div class="selected-object-row"><span><strong>' + esc(form.objectName) + '</strong><small>' + esc(form.objectId) + ' · ' + esc(form.objectType) + ' · ' + esc(form.levelSummary) + '</small></span><button class="button primary" data-open-placement-selector type="button">选择投放对象</button></div>',true,'沿用现有“可选/已选 + 查询 + 表格选择”交互；后台统一推券和用户行为触发活动不进入候选池。') +
      formItem('<em>*</em>配置状态','<select data-placement-field="status">' + options(['草稿','已生效','已停用'],form.status) + '</select>') +
      '</div><div class="rule-alert neutral"><strong>授权配置位置：</strong>适用门店与允许分享角色请在所选普通活动或组合活动中维护，本配置不保存副本。</div></section><section class="activity-form-section"><div class="form-section-head"><div><h2>投放对象快照</h2><p>以下信息只读，变化时实时读取活动或组合活动配置。</p></div></div>' + placementSnapshot(form) + '</section>' +
      '<div class="activity-form-footer"><button class="button" data-placement-back type="button">返回列表</button><div><button class="button" data-placement-save="draft" type="button">保存草稿</button><button class="button primary" data-placement-save="active" type="button">保存并生效</button></div></div>';
  }

  function renderPlacementDetail() {
    var row = findPlacement(state.placementId) || data.saPlacements[0];
    return placementTabs('placement') + '<div class="detail-summary"><div><span>配置状态</span>' + status(row.status) + '</div><div><span>投放对象</span>' + status(row.objectType) + '</div><div><span>活动数量</span><strong>' + row.activityCount + '</strong></div><div><span>准入等级</span>' + status(row.levelSummary) + '</div></div>' +
      detailBlock('配置关系', [['配置ID',row.id],['配置名称',row.name],['对象ID',row.objectId],['对象名称',row.objectName],['授权来源',scopeSourceLabel(row)],['当前继承门店',inheritedScope(row)],['当前继承角色',inheritedRoles(row)],['活动时间',row.time],['更新时间',row.updated],['操作人',row.operator]]) +
      '<section class="detail-block"><h2>投放对象快照</h2>' + placementSnapshot(row) + '</section>' +
      '<div class="detail-page-footer"><button class="button" data-placement-back type="button">返回列表</button><button class="button primary" data-placement-edit="' + row.id + '" type="button">编辑配置</button></div>';
  }

  function durationLabel(minutes) {
    if (minutes === -1) return '长期有效';
    if (minutes === 1440) return '1天';
    if (minutes >= 60) return (minutes / 60) + '小时';
    return minutes + '分钟';
  }

  function renderQrSettings() {
    var settings = data.saQrSettings;
    return placementTabs('qr') + '<div class="rule-alert"><strong>生效范围：</strong>配置只影响之后新生成的二维码；既有二维码保留生成时的有效期和配置版本。</div>' +
      '<section class="activity-form-section" data-anno="qr-duration-settings"><div class="form-section-head"><div><h2>二维码有效时长</h2><p>分享员工生成前只能从已启用选项中选择，默认勾选默认值。</p></div><span class="lock-badge">固定5分钟—1天 / 长期有效</span></div>' +
      '<div class="qr-setting-layout"><div class="qr-setting-block"><h3>可选时长</h3><p>固定时长限制为5分钟至1天；长期有效截止到本次二维码冻结活动中最晚结束时间。</p><div class="duration-option-grid">' + settings.durationOptions.map(function (minutes) {
        var note = minutes === -1 ? '至活动有效期' : minutes + '分钟';
        return '<label class="duration-setting-card' + (minutes === -1 ? ' activity-end' : '') + '"><input type="checkbox" data-ttl-option value="' + minutes + '" checked><span><strong>' + durationLabel(minutes) + '</strong><small>' + note + '</small></span></label>';
      }).join('') + '</div></div><div class="qr-setting-block default-setting"><h3>默认值</h3><p>服务助手打开有效期抽屉时默认选中。</p><select data-ttl-default>' + settings.durationOptions.map(function (minutes) { return '<option value="' + minutes + '"' + (minutes === settings.defaultMinutes ? ' selected' : '') + '>' + durationLabel(minutes) + '</option>'; }).join('') + '</select><div class="setting-meta"><span>当前版本</span><strong>' + esc(settings.version) + '</strong><span>最后更新</span><strong>' + settings.updated + ' · ' + esc(settings.operator) + '</strong></div></div></div>' +
      '<div class="activity-form-footer qr-setting-footer"><span>固定时长保存durationMinutes；长期有效保存ACTIVITY_END模式并按活动截止时间计算expiresAt</span><div><button class="button" data-ttl-reset type="button">恢复当前配置</button><button class="button primary" data-ttl-save type="button">保存配置</button></div></div></section>';
  }

  function freshPosterForm() {
    var form = JSON.parse(JSON.stringify(data.saPosterSettings));
    form.previewUrl = '';
    form.uploadName = '';
    return form;
  }

  function ensurePosterForm() {
    if (!state.posterForm) state.posterForm = freshPosterForm();
    return state.posterForm;
  }

  function syncPosterFormFromDom() {
    var form = ensurePosterForm();
    Array.prototype.slice.call(document.querySelectorAll('[data-poster-rule-field]')).forEach(function (node) {
      form[node.getAttribute('data-poster-rule-field')] = node.value;
    });
    return form;
  }

  function posterPreviewMarkup(form) {
    var backgroundStyle = form.previewUrl
      ? "background-image:url('" + esc(form.previewUrl) + "');"
      : 'background-image:linear-gradient(155deg,#0b4578 0%,#2188c7 54%,#78c7e8 100%);';
    return '<div class="poster-rule-preview" style="' + backgroundStyle + '"><div class="poster-rule-brand">东风日产车主礼遇</div><div class="poster-rule-copy"><strong>' + esc(form.defaultTitle || '请输入默认标题') + '</strong><span>' + esc(form.defaultSubtitle || '请输入默认副标题') + '</span></div><div class="poster-rule-qr"><img src="../mobile/assets/images/sa-demo-qr.png" alt="海报二维码示意"><div><strong>' + esc(form.defaultGuide || '请输入二维码引导语') + '</strong><small>' + esc(form.sampleStoreName) + ' · ' + esc(form.sampleEmployeeName) + '</small></div></div></div>';
  }

  function posterRuleField(label, key, value, maxLength) {
    return '<label class="poster-rule-field"><span><strong>' + esc(label) + '</strong><small>最多' + maxLength + '字</small></span><input data-poster-rule-field="' + esc(key) + '" maxlength="' + maxLength + '" value="' + esc(value) + '"></label>';
  }

  function renderPosterSettings() {
    var form = ensurePosterForm();
    var backgroundName = form.uploadName || form.backgroundName;
    return placementTabs('poster') + '<div class="rule-alert"><strong>本期唯一增量：</strong>这里只维护员工端海报的默认规则；员工端沿用既有编辑、预览、微信分享和保存流程，普通/组合活动角色、分享权限和报表角色维度不在本次改造范围。</div>' +
      '<section class="activity-form-section" data-anno="poster-rule-settings"><div class="form-section-head"><div><h2>分享海报规则</h2><p>原型以一套当前已生效配置演示；员工打开海报编辑页时读取以下默认值。</p></div><span class="lock-badge">' + esc(form.configStatus) + ' · ' + esc(form.configId) + '</span></div>' +
      '<div class="poster-rule-layout"><div class="poster-rule-editor"><div class="poster-rule-block"><div class="poster-rule-block-head"><div><h3>默认模板 / 背景图</h3><p>系统提供默认模板，也可上传自定义背景图作为员工端默认底图。</p></div></div><div class="poster-background-current"><span><strong>' + esc(backgroundName) + '</strong><small>建议比例 ' + esc(form.backgroundRatio) + '；正式格式、像素尺寸和文件大小待确认</small></span><em>' + (form.previewUrl ? '自定义背景' : '系统模板') + '</em></div><div class="poster-background-actions"><button class="button" data-poster-background-system type="button">使用系统模板</button><label class="button upload-button">上传背景图<input data-poster-background-upload type="file" accept="image/*"></label></div></div>' +
      '<div class="poster-rule-block"><div class="poster-rule-block-head"><div><h3>默认文案</h3><p>员工端读取后仍可按现有能力编辑，不改变现有生成和分享流程。</p></div></div><div class="poster-rule-fields">' + posterRuleField('默认标题','defaultTitle',form.defaultTitle,20) + posterRuleField('默认副标题','defaultSubtitle',form.defaultSubtitle,36) + posterRuleField('默认二维码引导语','defaultGuide',form.defaultGuide,24) + '</div></div>' +
      '<div class="poster-rule-pending"><strong>待确认</strong><span>最终按全局还是按活动配置、可维护模板数量、保存/发布/生效版本机制，均未在本原型固化。</span></div></div>' +
      '<aside class="poster-rule-preview-panel"><div class="poster-rule-preview-head"><div><h3>海报效果预览</h3><p>示例二维码及员工信息仅用于排版预览</p></div><button class="button" data-poster-preview type="button">刷新预览</button></div>' + posterPreviewMarkup(form) + '<div class="setting-meta"><span>当前配置</span><strong>' + esc(form.configId) + ' · ' + esc(form.configStatus) + '</strong><span>最后更新</span><strong>' + esc(form.updated) + ' · ' + esc(form.operator) + '</strong></div></aside></div>' +
      '<div class="activity-form-footer poster-rule-footer"><span>员工端只读取当前已生效默认值；正式配置同步与发布架构待研发确认。</span><div><button class="button" data-poster-rule-reset type="button">恢复当前配置</button><button class="button primary" data-poster-rule-save type="button">保存配置</button></div></div></section>';
  }

  function render(route) {
    if (route === 'activity-manage') return renderManage();
    if (route === 'activity-create') return renderCreate();
    if (route === 'activity-detail') return renderDetail();
    if (route === 'combo-manage') return renderComboManage();
    if (route === 'combo-edit') return renderComboEdit();
    if (route === 'combo-detail') return renderComboDetail();
    if (route === 'activity-mutex') return renderMutex();
    if (route === 'sa-placement-manage') return renderPlacementManage();
    if (route === 'sa-placement-edit') return renderPlacementEdit();
    if (route === 'sa-placement-detail') return renderPlacementDetail();
    if (route === 'sa-qr-settings') return renderQrSettings();
    if (route === 'sa-poster-settings') return renderPosterSettings();
    return '';
  }

  function pageActions(route) {
    if (route === 'activity-manage') return '<button class="button primary" data-activity-new type="button">新增活动</button>';
    if (route === 'activity-detail' || route === 'activity-create') return '<button class="button" data-back-list type="button">返回列表</button>';
    if (route === 'combo-manage') return '<button class="button primary" data-combo-new type="button">新增组合活动</button>';
    if (route === 'combo-edit' || route === 'combo-detail') return '<button class="button" data-combo-back type="button">返回列表</button>';
    if (route === 'sa-placement-manage') return '<button class="button primary" data-placement-new type="button">新增配置</button>';
    if (route === 'sa-placement-edit' || route === 'sa-placement-detail') return '<button class="button" data-placement-back type="button">返回列表</button>';
    return '';
  }

  function infoStrip() {
    return '活动配置主责：活动中心 <span class="permission-note">员工分享报表仍保持独立菜单</span>';
  }

  function enableBody(row) {
    return '<div class="modal-rule-card"><strong>发布前确认</strong><p>启用后，触发方式、适用门店和允许分享角色将锁定；是否进入员工可分享池由独立配置决定。</p></div>' + common.detailGrid([
      ['活动',row.id + ' / ' + row.name],['触发方式',row.trigger],['领券方式',row.claimMode],['准入等级',row.level],['适用门店',row.storeScope],['允许分享角色',roleSummary(row)],['互斥主体',row.mutexSubject]
    ]) + '<div class="rule-alert neutral"><strong>说明：</strong>启用活动不会自动创建活动分享配置；允许分享角色为空时无人可分享。</div>';
  }

  function openEnable(row) {
    state.pendingId = row.id;
    common.openModal('确认启用活动', enableBody(row), '<button class="button" data-close-modal type="button">取消</button><button class="button primary" data-confirm-enable type="button">确认启用</button>');
  }

  function openClose(row) {
    state.pendingId = row.id;
    common.openModal('确认关闭活动', '<div class="modal-warning-icon">!</div><h3 class="modal-center-title">关闭“' + esc(row.name) + '”吗？</h3><p class="modal-center-copy">关闭后，已生成动态二维码中的该活动将在提交时显示“活动已下线”，不可继续参与；二维码内其他有效活动继续执行。</p>', '<button class="button" data-close-modal type="button">取消</button><button class="button danger-button" data-confirm-close type="button">确认关闭</button>', 'compact-modal');
  }

  function openCopy(row) {
    state.pendingId = row.id;
    common.openModal('复制活动', '<div class="rule-alert warning"><strong>复制规则：</strong>活动基础信息、卡券、准入配置和互斥关系将被复制；允许分享角色清空，活动分享配置不复制。</div>' + common.detailGrid([
      ['原活动',row.id + ' / ' + row.name],['复制后状态','草稿'],['允许分享角色','清空'],['活动分享配置','不创建']
    ]), '<button class="button" data-close-modal type="button">取消</button><button class="button primary" data-confirm-copy type="button">继续复制</button>');
  }

  function accessConfigBody() {
    var draft = state.accessDraft;
    var disabled = draft.enabled !== '启用';
    return '<div class="access-config-intro"><strong>配置活动准入条件</strong><span>员工活动选择页和用户活动聚合页将直接读取这里的配置结果。</span></div><div class="access-config-form">' +
      '<div class="access-config-field"><div class="access-config-label"><label>是否启用准入</label><small>关闭后不执行准入校验</small></div><div class="access-segment-group two">' + ['启用','不启用'].map(function (item) {
        return '<button class="access-segment ' + (draft.enabled === item ? 'active' : '') + '" data-access-enabled="' + item + '" type="button" aria-pressed="' + (draft.enabled === item ? 'true' : 'false') + '">' + item + '</button>';
      }).join('') + '</div></div>' +
      '<div class="access-config-field ' + (disabled ? 'disabled' : '') + '"><div class="access-config-label"><label>准入等级</label><small>按活动参与主体选择</small></div><div class="access-segment-group three">' + ['号码级','绑车级','认证级'].map(function (item) {
        return '<button class="access-segment ' + (draft.level === item ? 'active' : '') + '" data-access-level="' + item + '" type="button" aria-pressed="' + (draft.level === item ? 'true' : 'false') + '"' + (disabled ? ' disabled' : '') + '>' + item + '</button>';
      }).join('') + '</div></div>' +
      '<div class="access-config-field ' + (disabled ? 'disabled' : '') + '"><div class="access-config-label"><label>校验节点</label><small>支持多选</small></div><div class="checkpoint-grid">' + checkpointOptions.map(function (item) {
        var checked = draft.checkpoints.indexOf(item) > -1;
        return '<label class="checkpoint-option ' + (checked ? 'checked' : '') + '"><input type="checkbox" data-access-checkpoint value="' + item + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span>' + item + '</span></label>';
      }).join('') + '</div></div>' +
      '</div>';
  }

  function renderAccessConfigModal() {
    common.openModal('准入配置', accessConfigBody(), '<button class="button" data-close-modal type="button">取消</button><button class="button primary" data-confirm-access type="button">确认</button>', 'access-config-modal');
  }

  function openAccessConfig() {
    state.accessDraft = {
      enabled: state.form.accessEnabled || '启用',
      level: state.form.level || '绑车级',
      checkpoints: (state.form.checkpoints || defaultCheckpoints(state.form.activityType)).slice()
    };
    renderAccessConfigModal();
  }

  function openMutexSelector() {
    var form = state.form;
    var candidates = data.activityConfigs.filter(function (item) { return item.id !== form.id; });
    var body = '<div class="rule-alert neutral"><strong>规则：</strong>复用原“选择互斥活动”能力。准入级别不同的活动不可选择，互斥主体由当前准入等级自动确定。</div><div class="mutex-selector-list">' + candidates.map(function (item) {
      var compatible = item.level === form.level && item.trigger !== '后台统一推送';
      var selected = form.mutexIds.indexOf(item.id) > -1;
      return '<label class="mutex-selector-row ' + (!compatible ? 'disabled' : '') + '"><input type="checkbox" data-mutex-choice value="' + item.id + '" ' + (selected ? 'checked' : '') + (!compatible ? ' disabled' : '') + '><div><strong>' + esc(item.name) + '</strong><span>' + esc(item.id) + ' · ' + esc(item.trigger) + '</span></div>' + status(item.level) + '<em>' + (compatible ? '互斥主体：' + esc(form.mutexSubject) : '准入级别不一致') + '</em></label>';
    }).join('') + '</div>';
    common.openModal('选择互斥活动', body, '<button class="button" data-close-modal type="button">取消</button><button class="button primary" data-confirm-mutex type="button">确认选择</button>', 'wide-modal');
  }

  var beijingStores = [
    ['北京东西石景山','B0161'],['北京鑫达润城怀柔','B0160'],['东风日产北京认证三店','Y9916'],
    ['东风日产北京认证二店','Y9915'],['东风日产北京认证店','Y9904'],['广实北京店','Y9902'],
    ['北京博瑞','B0158'],['北京博瑞（旧）','B0152'],['北京东风南方西三旗','B0157'],
    ['北京君诚驰悦','B0155'],['及新车北京东日零售店','JSS16'],['北京汽车之家朝阳','B0153']
  ];

  function storeTreeCheckbox(label,count,level,extra) {
    var checked = state.storeSelectionDraftCount >= 325;
    return '<label class="store-tree-row level-' + level + '">' +
      (extra && extra.branch ? '<span class="store-tree-arrow">⌄</span>' : '<span class="store-tree-spacer"></span>') +
      '<input type="checkbox" data-store-choice' + (count > 1 ? ' data-store-group-count="' + count + '"' : '') + (checked ? ' checked' : '') + '>' +
      '<span>' + esc(label) + (extra && extra.code ? '，门店编码：' + esc(extra.code) : '') + '</span></label>';
  }

  function storeSelectorBody() {
    return '<div class="store-selector-search"><input data-store-search placeholder="输入关键词搜索"><button type="button" aria-label="搜索">⌕</button></div>' +
      '<div class="store-tree" data-store-tree>' +
      storeTreeCheckbox('东风日产-日产',325,0,{branch:true}) +
      storeTreeCheckbox('全国',325,1,{branch:true}) +
      storeTreeCheckbox('北京',14,2,{branch:true}) +
      storeTreeCheckbox('北京',14,3,{branch:true}) +
      beijingStores.map(function (store) { return storeTreeCheckbox(store[0],1,4,{code:store[1]}); }).join('') +
      '</div>';
  }

  function updateStoreSelectorCount() {
    var countNode = document.querySelector('[data-store-selected-count]');
    if (countNode) countNode.textContent = String(state.storeSelectionDraftCount || 0);
  }

  function openStoreSelector() {
    state.storeSelectionDraftCount = Number((state.form && state.form.storeCount) || 0);
    var foot = '<div class="store-modal-count">已选择 <strong data-store-selected-count>' + state.storeSelectionDraftCount + '</strong> 家门店</div>' +
      '<div class="store-modal-actions"><button class="button primary" data-confirm-store-selector type="button">确认</button><button class="button" data-close-modal type="button">取消</button></div>';
    common.openModal('关联门店',storeSelectorBody(),foot,'store-selector-modal');
  }

  function downloadStoreTemplate() {
    var csv = '\uFEFF门店名称,门店编码\n北京东西石景山,B0161\n北京鑫达润城怀柔,B0160\n';
    var url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    var link = document.createElement('a');
    link.href = url; link.download = '活动适用门店导入模板.csv';
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    common.showToast('门店导入模板已下载');
  }

  function updateField(target) {
    if (!state.form) return;
    var field = target.getAttribute('data-activity-field');
    if (!field) return;
    state.form[field] = target.value;
    if (field === 'activityType') {
      state.form.claimMode = target.value === '抽奖' ? '自动抽奖' : '一键领取';
      state.form.checkpoints = defaultCheckpoints(target.value);
    }
    if (window.SAApp) window.SAApp.render();
  }

  function syncRoleSelection(form,scope) {
    if (!form) return;
    var codes = Array.prototype.slice.call(document.querySelectorAll('[data-share-role="' + scope + '"]:checked')).map(function (node) { return node.value; });
    form.shareRoleCodes = codes;
    form.shareRoleNames = codes.map(function (code) {
      var role = (data.roleOptions || []).find(function (item) { return item.code === code; });
      return role ? role.name : code;
    });
  }

  function persistCombo(targetStatus) {
    var form = state.comboForm || freshCombo();
    var existing = findCombo(form.id);
    if (!existing) {
      form.id = 'COMB-DEMO-' + String(data.comboActivities.length + 1).padStart(3,'0');
      form.children.forEach(function (child,index) { if (child.id === '系统生成') child.id = form.id + '-CH' + (index + 1); });
      data.comboActivities.unshift(JSON.parse(JSON.stringify(form)));
      existing = data.comboActivities[0];
    } else Object.keys(form).forEach(function (key) { existing[key] = JSON.parse(JSON.stringify(form[key])); });
    existing.active = targetStatus === 'active' ? true : !!form.active;
    state.comboForm = JSON.parse(JSON.stringify(existing));
    state.selectedComboId = existing.id;
    return existing;
  }

  function persistForm(targetStatus) {
    var form = state.form;
    var existing = findActivity(form.id);
    if (!existing) {
      form.id = 'ACT-SA-DEMO-' + String(data.activityConfigs.length + 1).padStart(3,'0');
      data.activityConfigs.unshift(copyForm(form,'edit'));
      existing = data.activityConfigs[0];
    }
    Object.keys(form).forEach(function (key) { existing[key] = JSON.parse(JSON.stringify(form[key])); });
    existing.status = targetStatus || form.status;
    state.form.status = existing.status;
    state.selectedId = existing.id;
    return existing;
  }

  function handleClick(event) {
    var target;
    if (event.target.closest('[data-combo-new]')) { prepareCombo('create'); location.hash = 'combo-edit'; return true; }
    if ((target = event.target.closest('[data-combo-action]'))) {
      var comboAction = target.getAttribute('data-combo-action');
      var comboId = target.getAttribute('data-id');
      if (comboAction === 'view') { state.selectedComboId = comboId; location.hash = 'combo-detail'; }
      if (comboAction === 'edit') { prepareCombo('edit',comboId); location.hash = 'combo-edit'; }
      if (comboAction === 'copy') { prepareCombo('copy',comboId); location.hash = 'combo-edit'; }
      return true;
    }
    if (event.target.closest('[data-combo-back]')) { location.hash = 'combo-manage'; return true; }
    if ((target = event.target.closest('[data-combo-save]'))) {
      var comboStatus = target.getAttribute('data-combo-save');
      if (comboStatus === 'active' && !(state.comboForm.shareRoleCodes || []).length) { common.showToast('提交员工分享前，请至少选择一个允许分享角色'); return true; }
      var savedCombo = persistCombo(comboStatus);
      common.showToast(comboStatus === 'active' ? '组合活动已保存并启用，门店与角色已锁定' : '组合活动草稿已保存');
      state.selectedComboId = savedCombo.id; location.hash = 'combo-detail'; return true;
    }
    if (event.target.closest('[data-placement-new]')) {
      preparePlacement('create'); location.hash = 'sa-placement-edit'; return true;
    }
    if (event.target.closest('[data-open-placement-selector]')) { openPlacementSelector(); return true; }
    if ((target = event.target.closest('[data-placement-selector-tab]'))) {
      state.placementSelectorTab = target.getAttribute('data-placement-selector-tab');
      renderPlacementSelectorModal(); return true;
    }
    if (event.target.closest('[data-remove-placement-candidate]')) {
      state.placementCandidateId = null;
      renderPlacementSelectorModal(); return true;
    }
    if (event.target.closest('[data-confirm-placement-object]')) {
      if (!state.placementCandidateId) { common.showToast('请先选择一个投放对象'); return true; }
      state.placementForm.objectId = state.placementCandidateId;
      syncPlacementObject(state.placementForm);
      common.closeModal();
      window.SAApp.render();
      common.showToast('投放对象已回填'); return true;
    }
    if ((target = event.target.closest('[data-placement-view]'))) {
      state.placementId = target.getAttribute('data-placement-view'); location.hash = 'sa-placement-detail'; return true;
    }
    if ((target = event.target.closest('[data-placement-edit]'))) {
      preparePlacement('edit',target.getAttribute('data-placement-edit')); location.hash = 'sa-placement-edit'; return true;
    }
    if (event.target.closest('[data-placement-back]')) { location.hash = 'sa-placement-manage'; return true; }
    if ((target = event.target.closest('[data-placement-toggle]'))) {
      var placement = findPlacement(target.getAttribute('data-placement-toggle'));
      if (placement && placement.status !== '已生效' && !roleNames(placementSource(placement)).length) { common.showToast('投放对象未配置允许分享角色，不能启用'); return true; }
      if (placement) placement.status = placement.status === '已生效' ? '已停用' : '已生效';
      common.showToast(placement && placement.status === '已生效' ? '活动分享配置已生效' : '活动分享配置已停用');
      window.SAApp.render(); return true;
    }
    if ((target = event.target.closest('[data-placement-save]'))) {
      var placementForm = state.placementForm || freshPlacement();
      syncPlacementObject(placementForm);
      placementForm.status = target.getAttribute('data-placement-save') === 'active' ? '已生效' : '草稿';
      if (placementForm.status === '已生效' && !roleNames(placementSource(placementForm)).length) { common.showToast('投放对象未配置允许分享角色，不能保存并生效'); return true; }
      placementForm.updated = '2026-07-17 12:08:36';
      placementForm.operator = '当前用户';
      var currentPlacement = findPlacement(placementForm.id);
      if (!currentPlacement) {
        placementForm.id = 'SA-PUT-DEMO-' + String(data.saPlacements.length + 1).padStart(3,'0');
        data.saPlacements.unshift(JSON.parse(JSON.stringify(placementForm)));
      } else Object.keys(placementForm).forEach(function (key) { currentPlacement[key] = JSON.parse(JSON.stringify(placementForm[key])); });
      state.placementId = placementForm.id;
      common.showToast(placementForm.status === '已生效' ? '活动分享配置已保存并生效' : '活动分享配置草稿已保存');
      location.hash = 'sa-placement-detail'; return true;
    }
    if (event.target.closest('[data-ttl-reset]')) { window.SAApp.render(); common.showToast('已恢复当前已保存配置'); return true; }
    if (event.target.closest('[data-ttl-save]')) {
      var enabledDurations = Array.prototype.slice.call(document.querySelectorAll('[data-ttl-option]:checked')).map(function (node) { return Number(node.value); });
      var defaultDuration = Number(document.querySelector('[data-ttl-default]').value);
      if (!enabledDurations.length) { common.showToast('请至少保留一个可选时长'); return true; }
      if (enabledDurations.indexOf(defaultDuration) === -1) { common.showToast('默认值必须属于已启用时长'); return true; }
      if (enabledDurations.some(function (minutes) { return minutes !== -1 && (minutes < 5 || minutes > 1440); })) { common.showToast('固定有效时长必须在5分钟至1天之间'); return true; }
      data.saQrSettings.durationOptions = enabledDurations;
      data.saQrSettings.defaultMinutes = defaultDuration;
      data.saQrSettings.allowActivityEnd = enabledDurations.indexOf(-1) >= 0;
      data.saQrSettings.version = 'QR-TTL-V6';
      data.saQrSettings.updated = '2026-07-17 12:08:36';
      data.saQrSettings.operator = '当前用户';
      window.SAApp.render(); common.showToast('二维码参数已保存，仅影响新生成二维码'); return true;
    }
    if (event.target.closest('[data-poster-preview]')) {
      syncPosterFormFromDom();
      window.SAApp.render();
      common.showToast('海报预览已按当前默认规则刷新'); return true;
    }
    if (event.target.closest('[data-poster-background-system]')) {
      var systemPoster = ensurePosterForm();
      if (state.posterUploadUrl) URL.revokeObjectURL(state.posterUploadUrl);
      state.posterUploadUrl = '';
      systemPoster.previewUrl = '';
      systemPoster.uploadName = '';
      systemPoster.backgroundMode = 'SYSTEM';
      systemPoster.backgroundName = '东风日产车主礼遇蓝色模板';
      window.SAApp.render();
      common.showToast('已切换为系统默认模板'); return true;
    }
    if (event.target.closest('[data-poster-rule-reset]')) {
      if (state.posterUploadUrl) URL.revokeObjectURL(state.posterUploadUrl);
      state.posterUploadUrl = '';
      state.posterForm = freshPosterForm();
      window.SAApp.render();
      common.showToast('已恢复当前已生效海报规则'); return true;
    }
    if (event.target.closest('[data-poster-rule-save]')) {
      var posterForm = syncPosterFormFromDom();
      if (!posterForm.defaultTitle.trim() || !posterForm.defaultSubtitle.trim() || !posterForm.defaultGuide.trim()) {
        common.showToast('默认标题、副标题和二维码引导语均不能为空'); return true;
      }
      ['backgroundMode','backgroundName','backgroundRatio','defaultTitle','defaultSubtitle','defaultGuide'].forEach(function (key) {
        data.saPosterSettings[key] = posterForm[key];
      });
      data.saPosterSettings.updated = '2026-08-27 11:08:00';
      data.saPosterSettings.operator = '当前用户';
      posterForm.updated = data.saPosterSettings.updated;
      posterForm.operator = data.saPosterSettings.operator;
      window.SAApp.render();
      common.showToast('海报规则已保存（原型演示），正式发布与生效机制待确认'); return true;
    }
    if ((target = event.target.closest('[data-activity-new]'))) {
      prepare('create'); location.hash = 'activity-create'; return true;
    }
    if ((target = event.target.closest('[data-activity-action]'))) {
      var action = target.getAttribute('data-activity-action');
      var id = target.getAttribute('data-id');
      var row = findActivity(id);
      if (action === 'view') { state.selectedId = id; location.hash = 'activity-detail'; }
      if (action === 'edit') { prepare('edit',id); location.hash = 'activity-create'; }
      if (action === 'copy') openCopy(row);
      if (action === 'enable') openEnable(row);
      if (action === 'close') openClose(row);
      return true;
    }
    if ((target = event.target.closest('[data-detail-edit]'))) {
      prepare('edit',target.getAttribute('data-detail-edit')); location.hash = 'activity-create'; return true;
    }
    if (event.target.closest('[data-back-list]')) { location.hash = 'activity-manage'; return true; }
    if (event.target.closest('[data-open-store-selector]')) { openStoreSelector(); return true; }
    if (event.target.closest('[data-store-template-download]')) { downloadStoreTemplate(); return true; }
    if (event.target.closest('[data-confirm-store-selector]')) {
      state.form.storeCount = Number(state.storeSelectionDraftCount || 0);
      state.form.storeScope = storeSelectionLabel(state.form);
      common.closeModal(); window.SAApp.render();
      common.showToast('已关联' + state.form.storeCount + '家专营店'); return true;
    }
    if ((target = event.target.closest('[data-form-step]'))) { state.step = Number(target.getAttribute('data-form-step')); window.SAApp.render(); return true; }
    if (event.target.closest('[data-form-next]')) { state.step = Math.min(4,state.step + 1); window.SAApp.render(); return true; }
    if (event.target.closest('[data-form-prev]')) { state.step = Math.max(1,state.step - 1); window.SAApp.render(); return true; }
    if (event.target.closest('[data-save-draft]')) { persistForm('草稿'); common.showToast('原型演示：草稿已保存'); return true; }
    if (event.target.closest('[data-submit-activity]')) {
      if (state.form.status === '已启用') { persistForm('已启用'); common.showToast('原型演示：可编辑配置已保存，锁定字段未变更'); }
      else openEnable(state.form);
      return true;
    }
    if (event.target.closest('[data-configure-access]')) { openAccessConfig(); return true; }
    if ((target = event.target.closest('[data-access-enabled]'))) {
      state.accessDraft.enabled = target.getAttribute('data-access-enabled');
      renderAccessConfigModal();
      return true;
    }
    if ((target = event.target.closest('[data-access-level]'))) {
      state.accessDraft.level = target.getAttribute('data-access-level');
      renderAccessConfigModal();
      return true;
    }
    if (event.target.closest('[data-confirm-access]')) {
      var previousLevel = state.form.level;
      state.accessDraft.checkpoints = Array.prototype.slice.call(document.querySelectorAll('[data-access-checkpoint]:checked')).map(function (node) { return node.value; });
      state.form.accessEnabled = state.accessDraft.enabled;
      state.form.level = state.accessDraft.level;
      state.form.checkpoints = state.accessDraft.checkpoints.slice();
      state.form.mutexSubject = accessSubject(state.form.level);
      if (previousLevel !== state.form.level || state.form.accessEnabled !== '启用') state.form.mutexIds = [];
      common.closeModal();
      common.showToast('准入配置已更新，员工分享链路将直接读取该结果');
      window.SAApp.render();
      return true;
    }
    if (event.target.closest('[data-select-mutex]')) { openMutexSelector(); return true; }
    if (event.target.closest('[data-confirm-copy]')) {
      var copySource = findActivity(state.pendingId); common.closeModal(); prepare('copy',copySource.id); location.hash = 'activity-create'; return true;
    }
    if (event.target.closest('[data-confirm-enable]')) {
      var enableRow = findActivity(state.pendingId);
      if (enableRow) enableRow.status = '已启用';
      else enableRow = persistForm('已启用');
      if (state.form && state.form.id === enableRow.id) state.form.status = '已启用';
      common.closeModal(); common.showToast('活动已启用，关键字段已锁定');
      if (location.hash === '#activity-create') { state.selectedId = enableRow.id; location.hash = 'activity-detail'; } else window.SAApp.render();
      return true;
    }
    if (event.target.closest('[data-confirm-close]')) {
      var closeRow = findActivity(state.pendingId); if (closeRow) closeRow.status = '已关闭';
      common.closeModal(); common.showToast('活动已关闭；二维码内其他有效活动不受影响'); window.SAApp.render(); return true;
    }
    if (event.target.closest('[data-confirm-mutex]')) {
      state.form.mutexIds = Array.prototype.slice.call(document.querySelectorAll('[data-mutex-choice]:checked')).map(function (node) { return node.value; });
      common.closeModal(); common.showToast('已更新互斥活动，互斥主体口径保持为' + state.form.mutexSubject); window.SAApp.render(); return true;
    }
    if ((target = event.target.closest('[data-view-mutex]'))) {
      var relation = data.mutexRelations.find(function (item) { return item.id === target.getAttribute('data-view-mutex'); });
      if (relation) common.openDrawer('活动互斥关系详情', common.detailSection('关系信息',common.detailGrid([
        ['关系ID',relation.id],['生效状态',status(relation.status),true],['活动A',relation.activityA + ' / ' + relation.nameA],['活动A准入',relation.levelA],['活动B',relation.activityB + ' / ' + relation.nameB],['活动B准入',relation.levelB],['互斥主体口径',relation.subject],['配置来源',relation.source],['更新时间',relation.updated]
      ])) + common.detailSection('执行说明','<div class="rule-alert neutral">聚合页加载、用户切换选择及一键参与提交前均按该主体口径校验；命中已参与关系时，另一活动置灰。</div>'));
      return true;
    }
    if (event.target.closest('[data-demo-action]')) { common.showToast('原型演示：已打开原有选择卡券能力'); return true; }
    return false;
  }

  function handleChange(event) {
    if (event.target.matches('[data-store-choice]')) {
      var groupCount = Number(event.target.getAttribute('data-store-group-count') || 0);
      if (groupCount > 1) {
        state.storeSelectionDraftCount = event.target.checked ? groupCount : 0;
        Array.prototype.forEach.call(document.querySelectorAll('[data-store-choice]'),function (node) { node.checked = event.target.checked; });
      } else {
        var checkedLeaves = document.querySelectorAll('[data-store-choice]:checked:not([data-store-group-count])').length;
        state.storeSelectionDraftCount = checkedLeaves;
        Array.prototype.forEach.call(document.querySelectorAll('[data-store-choice][data-store-group-count]'),function (node) { node.checked = false; });
      }
      updateStoreSelectorCount(); return;
    }
    if (event.target.matches('[data-store-file-upload]')) {
      var storeFile = event.target.files && event.target.files[0];
      if (!storeFile) return;
      state.form.storeCount = 325;
      state.form.storeScope = storeSelectionLabel(state.form);
      window.SAApp.render();
      common.showToast('已解析“' + storeFile.name + '”，成功关联325家专营店'); return;
    }
    if (event.target.matches('[data-share-role="activity"]')) {
      syncRoleSelection(state.form,'activity');
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-share-role="combo"]')) {
      syncRoleSelection(state.comboForm,'combo');
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-combo-store]') && state.comboForm) {
      state.comboForm.storeScope = {mode:'SPECIFIED',storeIds:Array.prototype.slice.call(document.querySelectorAll('[data-combo-store]:checked')).map(function (node) { return node.value; })};
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-combo-field]') && state.comboForm) {
      state.comboForm[event.target.getAttribute('data-combo-field')] = event.target.value;
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-placement-candidate]')) {
      state.placementCandidateId = event.target.value;
      renderPlacementSelectorModal(); return;
    }
    if (event.target.matches('[data-placement-type]') && state.placementForm) {
      state.placementForm.objectType = event.target.value;
      state.placementForm.objectId = event.target.value === '组合活动' ? data.comboActivities[0].id : data.activityConfigs.filter(function (item) { return item.status === '已启用' && item.trigger !== '后台统一推送' && item.trigger !== '用户行为触发'; })[0].id;
      syncPlacementObject(state.placementForm);
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-placement-object]') && state.placementForm) {
      state.placementForm.objectId = event.target.value;
      syncPlacementObject(state.placementForm);
      window.SAApp.render(); return;
    }
    if (event.target.matches('[data-placement-field]') && state.placementForm) {
      state.placementForm[event.target.getAttribute('data-placement-field')] = event.target.value;
      return;
    }
    if (event.target.matches('[data-poster-rule-field]')) {
      ensurePosterForm()[event.target.getAttribute('data-poster-rule-field')] = event.target.value;
      return;
    }
    if (event.target.matches('[data-poster-background-upload]')) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      if (state.posterUploadUrl) URL.revokeObjectURL(state.posterUploadUrl);
      state.posterUploadUrl = URL.createObjectURL(file);
      var poster = ensurePosterForm();
      poster.previewUrl = state.posterUploadUrl;
      poster.uploadName = file.name;
      poster.backgroundMode = 'CUSTOM';
      poster.backgroundName = file.name;
      window.SAApp.render();
      common.showToast('背景图已载入预览；正式格式、尺寸和大小限制待确认'); return;
    }
    if (event.target.matches('[data-access-checkpoint]') && state.accessDraft) {
      state.accessDraft.checkpoints = Array.prototype.slice.call(document.querySelectorAll('[data-access-checkpoint]:checked')).map(function (node) { return node.value; });
      event.target.closest('.checkpoint-option').classList.toggle('checked',event.target.checked);
      return;
    }
    if (event.target.matches('[data-activity-field]')) updateField(event.target);
  }

  function onNavigate(route) {
    if (route === 'activity-create' && !state.form) prepare('create');
    if (route === 'combo-edit' && !state.comboForm) prepareCombo('create');
    if (route === 'sa-placement-edit' && !state.placementForm) preparePlacement('create');
    if (route === 'sa-poster-settings' && !state.posterForm) state.posterForm = freshPosterForm();
  }

  window.ActivityConfigPages = {
    pages: pages,
    isPage: function (route) { return !!pages[route]; },
    render: render,
    pageActions: pageActions,
    infoStrip: infoStrip,
    handleClick: handleClick,
    handleChange: handleChange,
    onNavigate: onNavigate
  };
})();
