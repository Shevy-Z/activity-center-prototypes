(function () {
  'use strict';

  var data = window.SAFrontData;
  var common = window.SAFrontCommon;
  var esc = common.escapeHtml;
  var validRoutes = [
    'sa-select', 'sa-select-activity-detail', 'sa-empty', 'sa-no-permission', 'sa-qr', 'sa-qr-list', 'sa-qr-detail', 'sa-poster-editor', 'sa-poster-preview', 'qr-invalid',
    'sa-data-overview', 'sa-activity-list', 'sa-activity-detail', 'sa-participation-detail',
    'sa-coupon-list', 'sa-coupon-detail', 'sa-customer-list', 'sa-customer-detail',
    'activity-aggregation', 'activity-aggregation-unbound', 'activity-aggregation-offline'
  ];

  function naturalDaySerial(value) {
    var parts = String(value || '').slice(0,10).split('-').map(Number);
    if (parts.length !== 3 || parts.some(function (part) { return !Number.isFinite(part); })) return NaN;
    return Date.UTC(parts[0],parts[1] - 1,parts[2]);
  }

  function daysUntilExpiry(item) {
    var expiry = naturalDaySerial(item && item.expiresAt);
    var reference = naturalDaySerial(data.expiryTagReferenceDate);
    return Number.isFinite(expiry) && Number.isFinite(reference) ? Math.round((expiry - reference) / 86400000) : NaN;
  }

  function isExpiringSoonCoupon(item) {
    var blockedStatuses = ['已过期','已失效','已作废'];
    var days = daysUntilExpiry(item);
    return !!item && item.redemptionStatus !== '已核销' && blockedStatuses.indexOf(item.couponStatus) === -1 && Number.isFinite(days) && days >= 0 && days <= 7;
  }

  function expiringSoonCountForTemplate(templateId) {
    return data.customerCoupons.reduce(function (count,customer) {
      return count + (customer.couponInstances || []).filter(function (coupon) {
        return coupon.templateId === templateId && isExpiringSoonCoupon(coupon);
      }).length;
    },0);
  }

  window.SAExpiryTagRule = {
    daysUntilExpiry: daysUntilExpiry,
    isExpiringSoonCoupon: isExpiringSoonCoupon
  };

  function activityDisplayName(activity) {
    if (!activity) return '';
    if (!activity.isCombo) return activity.name;
    return String(activity.displayName || '').trim() || activity.name;
  }

  function activityScopeText(activity) {
    if (!activity || !activity.storeScope || activity.storeScope.mode !== 'SPECIFIED') return activity.shareNote || '全部门店';
    return '指定' + (activity.storeScope.storeIds || []).length + '家门店';
  }

  function isActivityVisibleToSource(activity) {
    if (activity.saPlacementEnabled === false || activity.activityState === 'INACTIVE') return false;
    var allowedRoles = activity.shareRoleCodes || [];
    var employeeRoles = data.source.roleCodes || [];
    var roleMatched = allowedRoles.some(function (roleCode) { return employeeRoles.indexOf(roleCode) >= 0; });
    if (!roleMatched) return false;
    if (!activity.storeScope || activity.storeScope.mode !== 'SPECIFIED') return true;
    return (activity.storeScope.storeIds || []).indexOf(data.source.storeId) >= 0;
  }

  function saAvailableActivities() {
    return data.activities.filter(isActivityVisibleToSource);
  }

  var state = {
    vehicleId: data.user.defaultVehicleId,
    saSelected: {},
    generatedActivityIds: saAvailableActivities().map(function (activity) { return activity.id; }),
    selected: {},
    completed: {},
    reportRange: '30d',
    reportActivityId: data.saReport.activities[0].id,
    reportParticipationId: data.saReport.activities[0].records[0].id,
    reportCouponId: data.saReport.coupons[0].id,
    reportCustomerId: data.customerCoupons[0].id,
    customerQuery: '',
    saDetailActivityId: data.activities[0].id,
    currentSceneId: data.qr.nextSceneId,
    previousSceneId: data.source.sceneId,
    qrVersion: Number(String(data.qr.snapshotVersion).replace(/\D/g, '')) || 3,
    qrGeneration: 0,
    invalidReason: 'replaced',
    selectedDurationMinutes: data.qr.defaultMinutes,
    pendingDurationMinutes: data.qr.defaultMinutes,
    durationAction: 'generate',
    posterTitle: data.poster.defaultTitle,
    posterSubtitle: data.poster.defaultSubtitle,
    posterGuide: data.poster.defaultGuide,
    posterMode: 'template',
    posterShowAvatar: true,
    posterUploadName: '',
    posterUploadUrl: '',
    qrDetailSceneId: data.myQrs[0].sceneId,
    qrDetailView: 'poster'
  };

  data.activities.forEach(function (activity) { state.saSelected[activity.id] = isActivityVisibleToSource(activity); });

  function route() {
    var value = window.location.hash.replace(/^#/, '').split('?')[0];
    return validRoutes.indexOf(value) >= 0 ? value : 'sa-select';
  }

  function hashParam(name) {
    var query = window.location.hash.split('?')[1] || '';
    var params = new URLSearchParams(query);
    return params.get(name);
  }

  function go(page) {
    common.closeSheet();
    if (route() === page) render();
    else window.location.hash = page;
  }

  function currentVehicle() {
    return data.vehicles.find(function (vehicle) { return vehicle.id === state.vehicleId; }) || data.vehicles[0];
  }

  function hasVehicleContext() {
    return route() !== 'activity-aggregation-unbound';
  }

  function sharedActivities() {
    return data.activities.filter(function (activity) {
      return state.generatedActivityIds.indexOf(activity.id) >= 0 && isActivityVisibleToSource(activity);
    });
  }

  function saSelectedActivities() {
    return saAvailableActivities().filter(function (activity) { return !!state.saSelected[activity.id]; });
  }

  function completionKey(activity) {
    if (activity.level === 'number') return 'number:' + activity.id;
    if (activity.isCombo) return 'combo:' + activity.id + ':' + (hasVehicleContext() ? state.vehicleId : 'unbound');
    return state.vehicleId + ':' + activity.id;
  }

  function activityById(id) {
    return data.activities.find(function (activity) { return activity.id === id; }) || data.activities[0];
  }

  function baseActivityStatus(activity) {
    if (state.completed[completionKey(activity)]) return 'participated';
    if (!hasVehicleContext() && activity.level !== 'number') return 'need-bind';
    if (activity.level === 'certified' && !currentVehicle().certified) return 'need-certified';
    return activity.status.all || activity.status[state.vehicleId] || 'ineligible';
  }

  function matchedComboRewards(activity) {
    if (!activity.isCombo || !hasVehicleContext()) return [];
    var rewards = activity.matchedRewards[state.vehicleId] || [];
    return Array.isArray(rewards) ? rewards : [rewards];
  }

  function comboCoupons(activity) {
    return matchedComboRewards(activity).reduce(function (items, reward) {
      return items.concat(reward.coupons || []);
    }, []);
  }

  function comboBenefits(activity) {
    return matchedComboRewards(activity).reduce(function (items, reward) {
      return items.concat(reward.benefits || []);
    }, []);
  }

  function activityReward(activity) {
    var matched = matchedComboRewards(activity);
    return matched.length ? matched.map(function (item) { return item.reward; }).join(' + ') : activity.reward;
  }

  function mutexPeers(activity) {
    if (!activity.mutex) return [];
    return sharedActivities().filter(function (candidate) {
      return candidate.id !== activity.id && candidate.mutex && candidate.mutex.group === activity.mutex.group;
    });
  }

  function activityStatus(activity) {
    var ownStatus = baseActivityStatus(activity);
    if (ownStatus === 'participated') return ownStatus;
    if (activity.mutex && mutexPeers(activity).some(function (peer) { return baseActivityStatus(peer) === 'participated'; })) return 'mutex-participated';
    return ownStatus;
  }

  function resetDefaultSelection() {
    state.selected = {};
    var selectedMutexGroups = {};
    sharedActivities().forEach(function (activity) {
      if (activityStatus(activity) !== 'eligible') return;
      if (activity.mutex && selectedMutexGroups[activity.mutex.group]) return;
      state.selected[activity.id] = true;
      if (activity.mutex) selectedMutexGroups[activity.mutex.group] = activity.id;
    });
  }

  function selectedActivities() {
    return sharedActivities().filter(function (activity) {
      return state.selected[activity.id] && activityStatus(activity) === 'eligible';
    });
  }

  function typeLabel(type) {
    return type === 'lottery' ? '抽奖' : '领券';
  }

  function levelLabel(level) {
    var item = data.levels.find(function (candidate) { return candidate.key === level; });
    return item ? item.title.replace('活动', '') : '';
  }

  function statusMarkup(status) {
    if (status === 'participated') return '<span class="activity-state done">已参与</span>';
    if (status === 'mutex-participated') return '<span class="activity-state locked">互斥已参与</span>';
    if (status === 'need-certified') return '<span class="activity-state locked">需认证</span>';
    if (status === 'need-bind') return '<span class="activity-state locked">需绑车</span>';
    return '<span class="activity-state available">可参与</span>';
  }

  function usesSaBlueTheme() {
    var current = route();
    return current.indexOf('sa-') === 0 || current === 'qr-invalid';
  }

  function mobileShell(title, body, footer, headerAction) {
    var withAction = headerAction ? ' with-action' : '';
    var blueTheme = usesSaBlueTheme();
    document.body.classList.toggle('sa-blue-context', blueTheme);
    return '<div class="mobile-page' + (blueTheme ? ' sa-blue-theme' : '') + '">' +
      '<div class="mobile-status"><img src="assets/images/mobile-statusbar.png" alt="手机状态栏"></div>' +
      '<header class="mobile-header' + withAction + '"><button class="header-icon" data-back type="button" aria-label="返回"><img src="assets/images/back.png" alt=""></button><h1>' + esc(title) + '</h1>' + (headerAction || '<span class="header-placeholder"></span>') + '</header>' +
      body + (footer || '') + '</div>';
  }

  function employeeIdentityCard() {
    return '<section class="sa-identity-card"><div class="sa-avatar">员</div><div><small>当前分享员工</small><strong>' + esc(data.source.employeeName) + ' · ' + esc(data.source.primaryRole) + '</strong><span>' + esc(data.source.store) + ' · 角色：' + esc(data.source.roleNames.join('、')) + '</span></div><em>账号有效</em></section>';
  }

  function employeeQuickEntries() {
    var validCount = data.myQrs.filter(function (item) { return item.status === '有效'; }).length;
    return '<section class="employee-quick-entry" aria-label="员工分享快捷入口">' +
      '<button data-open-my-qrs type="button"><span class="employee-quick-icon">码</span><span class="employee-quick-copy"><strong>我的二维码</strong><small>' + validCount + '个有效 · 查看与保存</small></span></button>' +
      '<button data-open-sa-data type="button"><span class="employee-quick-icon">数</span><span class="employee-quick-copy"><strong>我的分享数据</strong><small>扫码、参与、领券与核销</small></span></button></section>';
  }

  function saActivityCard(activity) {
    var checked = !!state.saSelected[activity.id];
    return '<article class="sa-activity-card ' + (checked ? 'selected' : '') + '">' +
      '<label class="sa-card-check"><input type="checkbox" data-sa-check="' + activity.id + '" ' + (checked ? 'checked' : '') + '><span></span></label>' +
      '<button class="sa-card-main sa-card-detail" data-open-sa-activity="' + activity.id + '" type="button"><div class="sa-card-title"><h3>' + esc(activityDisplayName(activity)) + '</h3><span class="level-tag">' + esc(levelLabel(activity.level)) + '</span>' + (activity.isCombo ? '<span class="combo-tag">组合活动</span>' : '') + (activity.mutex ? '<span class="mutex-tag">互斥</span>' : '') + '</div>' +
      '<p>' + esc(activity.description) + '</p><div class="sa-card-reward"><span class="type-tag ' + (activity.type === 'lottery' ? 'lottery' : '') + '">' + typeLabel(activity.type) + '</span><strong>' + esc(activity.reward) + '</strong></div>' +
      '<div class="sa-card-meta"><span>' + esc(activity.expiry) + '</span><span>' + esc(activityScopeText(activity)) + '</span></div><div class="sa-card-detail-link">查看活动详情 <span>›</span></div></button></article>';
  }

  function saActivitySection(level) {
    var activities = saAvailableActivities().filter(function (activity) { return activity.level === level.key; });
    return '<section class="activity-section sa-section"><div class="section-head"><div><h2>' + esc(level.title) + '</h2><p>' + esc(level.note) + '</p></div><span>' + activities.length + '项</span></div><div class="activity-list">' + activities.map(saActivityCard).join('') + '</div></section>';
  }

  function renderSaSelect() {
    var selectedCount = saSelectedActivities().length;
    var allSelected = selectedCount === saAvailableActivities().length;
    document.title = '选择活动';
    return mobileShell('选择活动', '<div class="page-scroll sa-select-scroll">' + employeeIdentityCard() + employeeQuickEntries() +
      '<section class="sa-rule-note"><strong>可分享活动</strong><span>已校验活动分享配置、当前账号唯一门店与任一命中角色</span></section>' +
      '<label class="select-all-row"><span><strong>全部可投活动</strong><small>可选择全部或指定活动生成二维码</small></span><span class="select-count">已选' + selectedCount + '项</span><input type="checkbox" data-sa-select-all ' + (allSelected ? 'checked' : '') + '></label>' +
      data.levels.map(saActivitySection).join('') + '<div class="end-note">活动范围将在二维码生成时冻结</div></div>',
      '<footer class="bottom-action sa-generate-action"><p>来源员工、角色与门店将在生成时冻结</p><button class="primary-action" data-generate-qr type="button" ' + (selectedCount ? '' : 'disabled') + '>生成动态二维码' + (selectedCount ? '（' + selectedCount + '项）' : '') + '</button></footer>');
  }

  function renderSaSelectActivityDetail() {
    var activity = activityById(state.saDetailActivityId);
    var rules = activity.rules.map(function (rule) { return '<li>' + esc(rule) + '</li>'; }).join('');
    var coupons = activity.isCombo ? '<div class="relation-card combo-relation"><span><strong>按用户当前VIN动态匹配</strong><small>用户可同时命中多个子活动，在同一张卡片内汇总展示全部卡券</small></span><em>' + activity.childCount + '套</em></div>' : activity.coupons.length ? activity.coupons.map(function (coupon) {
      return '<div class="relation-card"><span><strong>' + esc(coupon.name) + '</strong><small>有效期：' + esc(coupon.valid) + '</small></span><em>' + esc(coupon.quantity) + '</em></div>';
    }).join('') : '<div class="relation-empty">未关联卡券</div>';
    var benefits = activity.isCombo ? '<div class="relation-card combo-relation"><span><strong>权益随VIN全量匹配结果展示</strong><small>命中多个子活动时全部执行，不设优先级和顺序</small></span><em>动态</em></div>' : activity.benefits.length ? activity.benefits.map(function (benefit) {
      return '<div class="relation-card"><span><strong>' + esc(benefit.name) + '</strong><small>' + esc(benefit.note) + '</small></span><em>权益</em></div>';
    }).join('') : '<div class="relation-empty">未关联权益</div>';
    var mutex = activity.mutex ? '<section class="mobile-detail-section"><h2>互斥关系</h2><div class="mutex-detail-card"><span>' + esc(activity.mutex.scopeLabel) + '</span><strong>' + esc(activity.mutex.description) + '</strong><small>用户端同组仅可勾选1项，提交时再次校验。</small></div></section>' : '<section class="mobile-detail-section"><h2>互斥关系</h2><div class="relation-empty">无互斥活动</div></section>';
    document.title = '活动详情';
    return mobileShell('活动详情', '<div class="page-scroll detail-page-scroll select-activity-detail-scroll"><section class="detail-hero"><span>' + esc(levelLabel(activity.level)) + ' · ' + typeLabel(activity.type) + (activity.isCombo ? ' · 组合活动' : '') + (activity.mutex ? ' · 互斥活动' : '') + '</span><h2>' + esc(activityDisplayName(activity)) + '</h2><p>' + esc(activity.id) + ' · ' + esc(activity.expiry) + '</p></section><section class="mobile-detail-section"><h2>基本信息</h2>' + detailRow('活动时间', activity.period) + detailRow('适用品牌', activity.brand) + detailRow('适用范围', activityScopeText(activity)) + detailRow('领券方式', typeLabel(activity.type)) + '</section><section class="mobile-detail-section"><h2>活动规则</h2><ol class="activity-rule-list">' + rules + '</ol></section><section class="mobile-detail-section"><h2>关联卡券</h2><div class="relation-list">' + coupons + '</div></section><section class="mobile-detail-section"><h2>关联权益</h2><div class="relation-list">' + benefits + '</div></section>' + mutex + '<div class="privacy-note">查看详情不会改变当前活动勾选状态</div></div>');
  }

  function renderSaEmpty() {
    document.title = '选择活动';
    return mobileShell('选择活动', '<div class="page-scroll empty-page-scroll">' + employeeIdentityCard() + employeeQuickEntries() + '<section class="empty-business-card"><strong>当前暂无可分享活动</strong><p>暂未找到同时满足活动有效、投放有效、当前门店和当前角色范围的活动。</p><span>后台统一推券活动不会出现在这里</span><button data-empty-refresh type="button">重新加载</button></section></div>');
  }

  function renderNoPermission() {
    document.title = '活动分享';
    return mobileShell('活动分享', '<div class="page-scroll empty-page-scroll">' + employeeIdentityCard() + '<section class="empty-business-card permission-empty"><strong>当前账号暂无活动分享权限</strong><p>当前角色未命中任何活动的“允许分享角色”，服务助手首页不展示活动分享入口。</p><span>角色或活动配置调整后，重新进入服务助手即可生效</span></section><div class="permission-check-list"><div><span>当前门店</span><strong>' + esc(data.source.store) + '</strong></div><div><span>当前角色</span><strong>' + esc(data.source.roleNames.join('、')) + '</strong></div><div><span>账号状态</span><strong>' + esc(data.source.accountStatus) + '</strong></div></div></div>');
  }

  function snapshotRows() {
    return sharedActivities().map(function (activity) {
      return '<div class="snapshot-row"><span><strong>' + esc(activityDisplayName(activity)) + '</strong><small>' + esc(levelLabel(activity.level)) + ' · ' + (activity.isCombo ? '组合活动 · ' : '') + typeLabel(activity.type) + '</small></span><em>' + esc(activity.id) + '</em></div>';
    }).join('');
  }

  function myQrBySceneId(sceneId) {
    return data.myQrs.find(function (item) { return item.sceneId === sceneId; }) || data.myQrs[0];
  }

  function qrActivityRows(qr) {
    return (qr.activities || []).map(function (activityName, index) {
      return '<div class="snapshot-row"><span><strong>' + esc(activityName) + '</strong><small>生成时冻结的活动对象</small></span><em>' + String(index + 1).padStart(2,'0') + '</em></div>';
    }).join('');
  }

  function durationLabel(minutes) {
    if (minutes === -1) return '长期有效';
    if (minutes === 1440) return '1天';
    if (minutes >= 60) return (minutes / 60) + '小时';
    return minutes + '分钟';
  }

  function durationScopeActivities() {
    var activities = route() === 'sa-select' ? saSelectedActivities() : sharedActivities();
    return activities.length ? activities : saAvailableActivities();
  }

  function latestActivityEndText() {
    var latest = durationScopeActivities().reduce(function (current, activity) {
      var endText = String(activity.period || '').split('至').pop().trim();
      var parts = endText.split('-').map(Number);
      if (parts.length !== 3 || parts.some(function (part) { return !part; })) return current;
      var end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
      return !current || end > current ? end : current;
    }, null);
    if (!latest) return '活动结束时';
    var pad = function (value) { return String(value).padStart(2,'0'); };
    return pad(latest.getMonth() + 1) + '-' + pad(latest.getDate()) + ' ' + pad(latest.getHours()) + ':' + pad(latest.getMinutes()) + ':' + pad(latest.getSeconds());
  }

  function qrExpiryText(minutes) {
    if (minutes === -1) return latestActivityEndText();
    var parts = data.qr.generatedAt.split(/[- :]/).map(Number);
    var date = new Date(parts[0],parts[1] - 1,parts[2],parts[3],parts[4],parts[5]);
    date.setMinutes(date.getMinutes() + minutes);
    var pad = function (value) { return String(value).padStart(2,'0'); };
    return pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function durationDescription(minutes) {
    return minutes === -1 ? '长期有效 · 至所选活动最晚结束时间' : '有效时长 ' + durationLabel(minutes) + ' · 失效后请重新生成';
  }

  function posterMarkup() {
    var count = state.generatedActivityIds.length;
    var uploaded = state.posterMode === 'upload' && state.posterUploadUrl;
    var uploadBackground = uploaded ? '<img class="poster-upload-bg" src="' + esc(state.posterUploadUrl) + '" alt="员工上传的自定义海报底图">' : '';
    var employeeRow = state.posterShowAvatar ? '<div class="poster-sa-row"><span class="poster-sa-avatar">员</span><span><strong>由' + esc(data.source.store) + ' · ' + esc(data.source.employeeName) + '分享</strong></span></div>' : '<div class="poster-employee-copy"><strong>由' + esc(data.source.store) + ' · ' + esc(data.source.employeeName) + '分享</strong></div>';
    return '<section class="share-poster-card' + (uploaded ? ' uploaded' : '') + '" data-poster-card>' + uploadBackground + '<div class="poster-glow glow-one"></div><div class="poster-glow glow-two"></div><div class="poster-content"><div class="poster-brand-row"><span>东风日产 · 专属礼遇</span><em>员工推荐</em></div><h2 data-poster-preview-title>' + esc(state.posterTitle) + '</h2><p data-poster-preview-subtitle>' + esc(state.posterSubtitle) + '</p><div class="poster-activity-count"><strong>' + count + '项</strong><span>活动已为您精选</span></div><div class="poster-qr-panel"><img src="assets/images/sa-demo-qr.png" alt="活动分享二维码"><div><strong data-poster-preview-guide>' + esc(state.posterGuide) + '</strong></div></div>' + employeeRow + '</div></section>';
  }

  function qrRecordPosterMarkup(item) {
    var poster = item.poster || {};
    var title = poster.title || data.poster.defaultTitle;
    var subtitle = poster.subtitle || data.poster.defaultSubtitle;
    var guide = poster.guide || data.poster.defaultGuide;
    var statusLabel = item.status === '有效' ? '员工推荐' : item.status;
    return '<section class="share-poster-card qr-detail-poster" data-qr-record-poster><div class="poster-glow glow-one"></div><div class="poster-glow glow-two"></div><div class="poster-content"><div class="poster-brand-row"><span>东风日产 · 专属礼遇</span><em>' + esc(statusLabel) + '</em></div><h2>' + esc(title) + '</h2><p>' + esc(subtitle) + '</p><div class="poster-activity-count"><strong>' + item.activityCount + '项</strong><span>活动已为您精选</span></div><div class="poster-qr-panel"><img src="assets/images/sa-demo-qr.png" alt="活动分享二维码"><div><strong>' + esc(guide) + '</strong><small>参与资格以扫码进入页面后的实时校验为准</small></div></div><div class="poster-sa-row"><span class="poster-sa-avatar">员</span><span><strong>由' + esc(data.source.store) + ' · ' + esc(data.source.employeeName) + '分享</strong></span></div></div></section>';
  }

  function renderQr() {
    var count = state.generatedActivityIds.length;
    document.title = '动态二维码';
    return mobileShell('动态二维码', '<div class="page-scroll qr-page-scroll"><section class="qr-result-card"><span class="qr-success">二维码已生成</span><h2>请用户使用微信扫码参与</h2><div class="qr-image-wrap"><img src="assets/images/sa-demo-qr.png" alt="员工活动分享二维码"></div><div class="qr-expiry"><strong>有效期至 ' + qrExpiryText(state.selectedDurationMinutes) + '</strong><span>' + durationDescription(state.selectedDurationMinutes) + '</span></div><button class="poster-entry" data-create-poster type="button"><span><strong>制作活动分享海报</strong><small>嵌入二维码与分享员工信息，可编辑分享文案</small></span><em>›</em></button></section>' +
      '<section class="qr-info-card"><div class="qr-info-head"><strong>活动冻结快照</strong><span>' + count + '项 · V' + state.qrVersion + '</span></div><div class="qr-data-grid"><div><small>场景ID</small><strong>' + esc(state.currentSceneId) + '</strong></div><div><small>生成时间</small><strong>08-20 16:10</strong></div><div><small>有效时长 / 版本</small><strong>' + durationLabel(state.selectedDurationMinutes) + ' · ' + esc(data.qr.configVersion) + '</strong></div><div><small>来源员工</small><strong>' + esc(data.source.employeeName) + '</strong></div><div><small>主角色 / 命中角色</small><strong>' + esc(data.source.primaryRole) + ' / ' + esc(data.source.matchedRoleNames.join('、')) + '</strong></div><div><small>来源门店</small><strong>' + esc(data.source.store) + '</strong></div></div><div class="snapshot-list">' + snapshotRows() + '</div><button class="text-row-action" data-edit-selection type="button">修改活动范围</button></section><div class="end-note">新活动和后台后续参数变更不会影响本二维码</div></div>',
      '<footer class="qr-bottom-action"><button class="secondary-action" data-regenerate type="button">重新生成</button><button class="primary-action" data-simulate-scan type="button">模拟用户扫码</button></footer>', '<button class="header-text-action" data-open-my-qrs type="button">我的二维码</button>');
  }

  function renderQrList() {
    var cards = data.myQrs.map(function (item) {
      var statusClass = item.status === '有效' ? 'active' : 'expired';
      return '<button class="qr-history-card" data-open-qr-detail="' + esc(item.sceneId) + '" type="button"><div><span class="qr-history-status ' + statusClass + '">' + esc(item.status) + '</span><strong>' + esc(item.sceneId) + '</strong><small>' + esc(item.generatedAt) + '生成 · ' + esc(item.duration) + '</small></div><div class="qr-history-meta"><span>' + item.activityCount + '项活动</span><em>查看 ›</em></div></button>';
    }).join('');
    document.title = '我的二维码';
    return mobileShell('我的二维码', '<div class="page-scroll qr-history-scroll">' + employeeIdentityCard() + '<div class="report-list-summary"><span>仅展示当前账号</span><strong>' + data.myQrs.length + '个二维码</strong></div><div class="qr-history-list">' + cards + '</div><div class="privacy-note">二维码仅可再次查看、保存和生成海报，本期不支持手动作废</div></div>', '', '<button class="header-text-action" data-back-to-generate type="button">生成码</button>');
  }

  function renderQrDetail() {
    var item = myQrBySceneId(state.qrDetailSceneId);
    var poster = item.poster || {};
    var posterTitle = poster.title || data.poster.defaultTitle;
    var posterSubtitle = poster.subtitle || data.poster.defaultSubtitle;
    var posterGuide = poster.guide || data.poster.defaultGuide;
    var isPosterView = state.qrDetailView !== 'qr';
    var statusClass = item.status === '有效' ? 'active' : 'expired';
    var effectMarkup = isPosterView ? '<div class="poster-preview-stage qr-record-poster-stage">' + qrRecordPosterMarkup(item) + '</div><section class="poster-copy-card"><div class="poster-copy-head"><strong>海报内容</strong><span>生成时保存</span></div><div class="poster-copy-row"><small>标题</small><strong>' + esc(posterTitle) + '</strong></div><div class="poster-copy-row"><small>副标题</small><strong>' + esc(posterSubtitle) + '</strong></div><div class="poster-copy-row"><small>扫码引导语</small><strong>' + esc(posterGuide) + '</strong></div></section>' : '<div class="qr-detail-code-pane"><section class="qr-result-card compact"><span class="qr-success">' + esc(item.status) + '</span><h2>' + esc(item.sceneId) + '</h2><div class="qr-image-wrap small"><img src="assets/images/sa-demo-qr.png" alt="活动分享二维码"></div></section><p>纯二维码适合当面出示；对外转发建议保存上方海报效果。</p></div>';
    document.title = '二维码详情';
    return mobileShell('二维码详情', '<div class="page-scroll qr-page-scroll"><section class="qr-detail-summary"><span class="qr-history-status ' + statusClass + '">' + esc(item.status) + '</span><div><strong>' + esc(item.generatedAt) + ' 生成</strong><small>' + item.activityCount + '项活动 · ' + esc(item.duration) + '</small></div></section><section class="qr-share-effect-card"><div class="qr-effect-head"><span><strong>客户分享效果</strong><small>查看客户收到的完整内容</small></span><div class="qr-view-switch" role="group" aria-label="分享效果类型"><button class="' + (isPosterView ? 'active' : '') + '" data-qr-detail-view="poster" aria-pressed="' + isPosterView + '" type="button">海报效果</button><button class="' + (!isPosterView ? 'active' : '') + '" data-qr-detail-view="qr" aria-pressed="' + (!isPosterView) + '" type="button">二维码</button></div></div>' + effectMarkup + '</section><section class="qr-info-card"><div class="qr-info-head"><strong>冻结信息</strong><span>' + item.activityCount + '项</span></div><div class="qr-data-grid"><div><small>场景ID</small><strong>' + esc(item.sceneId) + '</strong></div><div><small>来源员工</small><strong>' + esc(data.source.employeeName) + '</strong></div><div><small>员工账号</small><strong>' + esc(data.source.accountId) + '</strong></div><div><small>主角色</small><strong>' + esc(data.source.primaryRole) + '</strong></div><div><small>命中角色</small><strong>' + esc(data.source.matchedRoleNames.join('、')) + '</strong></div><div><small>来源门店</small><strong>' + esc(data.source.store) + '</strong></div></div><div class="snapshot-list">' + qrActivityRows(item) + '</div></section></div>', '<footer class="qr-bottom-action"><button class="secondary-action" data-save-existing-qr type="button">保存二维码</button><button class="primary-action" data-save-existing-poster type="button">保存海报</button></footer>');
  }

  function posterField(label, key, value, maxLength, placeholder) {
    return '<label class="poster-edit-field"><span><strong>' + esc(label) + '</strong><small data-poster-count="' + key + '">' + String(value).length + '/' + maxLength + '</small></span><input data-poster-input="' + key + '" maxlength="' + maxLength + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '"></label>';
  }

  function renderPosterEditor() {
    document.title = '编辑分享海报';
    var uploadNote = state.posterUploadName ? '已上传：' + state.posterUploadName : 'JPG/PNG，10MB以内，建议3:4';
    return mobileShell('编辑分享海报', '<div class="page-scroll poster-editor-scroll"><section class="poster-editor-note"><span><strong>编辑海报文案</strong><small>二维码、分享员工和门店信息不可修改</small></span><button data-reset-poster type="button">恢复默认</button></section><section class="poster-rule-source-note" data-poster-rule-source><strong>默认内容已由后台海报规则下发</strong><span>' + esc(data.poster.configId) + ' · ' + esc(data.poster.configStatus) + ' · ' + esc(data.poster.defaultBackgroundName) + '</span><small>读取后仍可按现有流程编辑、预览、分享微信或保存本地</small></section><section class="poster-source-card"><div><strong>海报来源</strong><small>上传自定义底图后，系统仍统一叠加二维码与分享员工信息</small></div><div class="poster-source-options"><button class="' + (state.posterMode === 'template' ? 'active' : '') + '" data-poster-mode="template" type="button"><strong>系统模板</strong><small>使用品牌蓝色模板</small></button><label class="' + (state.posterMode === 'upload' ? 'active' : '') + '"><input data-poster-upload type="file" accept="image/jpeg,image/png"><strong>上传自定义海报</strong><small>' + esc(uploadNote) + '</small></label></div><label class="poster-avatar-toggle"><span><strong>展示员工头像</strong><small>关闭后仍保留门店与员工姓名</small></span><input data-poster-avatar type="checkbox" ' + (state.posterShowAvatar ? 'checked' : '') + '></label></section><div class="poster-preview-stage">' + posterMarkup() + '</div><section class="poster-form-card">' + posterField('海报标题','title',state.posterTitle,data.poster.titleMaxLength,'请输入海报标题') + posterField('副标题','subtitle',state.posterSubtitle,data.poster.subtitleMaxLength,'请输入活动说明') + posterField('扫码引导语','guide',state.posterGuide,data.poster.guideMaxLength,'请输入扫码引导语') + '</section><div class="end-note">生成后仍可返回继续编辑；重新生成二维码后旧海报内二维码同步失效</div></div>', '<footer class="poster-bottom-action"><button class="primary-action" data-generate-poster type="button">生成分享海报</button></footer>');
  }

  function renderPosterPreview() {
    document.title = '分享海报';
    return mobileShell('分享海报', '<div class="page-scroll poster-result-scroll"><section class="poster-result-head"><span>海报已生成</span><strong>可保存或直接分享给客户</strong><small>海报已嵌入当前二维码及分享员工信息</small></section><div class="poster-preview-stage final">' + posterMarkup() + '</div><button class="text-row-action poster-edit-again" data-edit-poster type="button">继续编辑文案</button><div class="end-note">二维码来源仍以用户最终成功执行触点为准</div></div>', '<footer class="qr-bottom-action poster-share-actions"><button class="secondary-action" data-save-poster type="button">保存到相册</button><button class="primary-action" data-share-poster type="button">分享给客户</button></footer>');
  }

  function renderQrInvalid() {
    var reason = hashParam('reason') || state.invalidReason;
    var expired = reason === 'expired';
    var title = expired ? '二维码已过期' : '二维码已失效';
    var copy = expired ? '该二维码已超过有效期，请联系分享人重新获取。' : '分享人已重新生成二维码，当前旧码不再接受新的扫码。';
    document.title = title;
    return mobileShell('二维码状态', '<div class="page-scroll invalid-page-scroll"><section class="invalid-card"><img src="assets/images/close.png" alt=""><h2>' + title + '</h2><p>' + copy + '</p><div><span>场景ID</span><strong>' + esc(state.previousSceneId) + '</strong></div><button data-invalid-done type="button">我知道了</button></section><p class="invalid-note">已建立的历史扫码会话将在提交时重新校验活动状态</p></div>');
  }

  function reportTabs(active) {
    var tabs = [
      {key:'overview', route:'sa-data-overview', label:'概览'},
      {key:'activity', route:'sa-activity-list', label:'活动'},
      {key:'coupon', route:'sa-coupon-list', label:'卡券'},
      {key:'customer', route:'sa-customer-list', label:'客户'}
    ];
    return '<nav class="report-tabs">' + tabs.map(function (tab) {
      return '<button class="' + (active === tab.key ? 'active' : '') + '" data-report-route="' + tab.route + '" type="button">' + tab.label + '</button>';
    }).join('') + '</nav>';
  }

  function reportOwner() {
    return '<section class="report-owner"><span>仅统计当前员工账号</span><strong>' + esc(data.source.employeeName) + ' · ' + esc(data.source.primaryRole) + '</strong><small>' + esc(data.source.store) + '<br>角色：' + esc(data.source.roleNames.join('、')) + '</small></section>';
  }

  function reportShell(active, content) {
    return mobileShell('我的分享数据', reportTabs(active) + '<div class="page-scroll report-page-scroll"><div class="sa-watermark">' + esc(data.source.employeeName) + ' ' + esc(data.source.primaryRole) + '</div>' + content + '</div>', '', '<button class="header-text-action" data-back-to-generate type="button">生成码</button>');
  }

  function renderReportOverview() {
    var summarySource = state.reportRange === '7d' ? data.saReport.summary7d : data.saReport.summary;
    var ratioSource = state.reportRange === '7d' ? data.saReport.ratios7d : data.saReport.ratios;
    var summary = summarySource.map(function (item) {
      return '<div class="report-kpi"><span>' + esc(item.label) + '</span><strong>' + esc(item.value) + '</strong><small>' + esc(item.note) + '</small></div>';
    }).join('');
    var ratios = ratioSource.map(function (item) {
      return '<div class="ratio-row"><span><strong>' + esc(item.label) + '</strong><small>' + esc(item.note) + '</small></span><em>' + esc(item.value) + '</em></div>';
    }).join('');
    var maxScan = Math.max.apply(null, data.saReport.trend.map(function (item) { return item.scan; }));
    var trend = data.saReport.trend.map(function (item) {
      var scanHeight = Math.round(item.scan / maxScan * 72);
      var partHeight = Math.round(item.participation / maxScan * 72);
      return '<div class="mobile-trend-col"><div class="mobile-trend-bars"><i style="height:' + scanHeight + 'px"></i><i class="primary" style="height:' + partHeight + 'px"></i></div><span>' + esc(item.day.slice(3)) + '</span></div>';
    }).join('');
    document.title = '我的分享数据';
    return reportShell('overview', reportOwner() + '<div class="report-toolbar"><div><strong>数据概览</strong><span>统计口径与后台员工分享报表一致</span></div><div class="range-switch"><button data-report-range="7d" class="' + (state.reportRange === '7d' ? 'active' : '') + '" type="button">近7日</button><button data-report-range="30d" class="' + (state.reportRange === '30d' ? 'active' : '') + '" type="button">近30日</button></div></div><section class="report-kpi-grid">' + summary + '</section><section class="report-panel"><div class="report-panel-head"><strong>转化与核销</strong><span>' + (state.reportRange === '7d' ? '近7日' : '近30日') + '</span></div>' + ratios + '</section><section class="report-panel"><div class="report-panel-head"><strong>近7日趋势</strong><span><i></i>扫码 <i class="primary"></i>参与</span></div><div class="mobile-trend">' + trend + '</div></section><section class="report-shortcuts customer-enabled"><button data-report-route="sa-activity-list" type="button"><strong>查看活动数据</strong><span>' + data.saReport.activities.length + '个统计对象及参与记录</span></button><button data-report-route="sa-coupon-list" type="button"><strong>查看卡券数据</strong><span>' + data.saReport.coupons.length + '个券模板生命周期</span></button><button data-report-route="sa-customer-list" type="button"><strong>查看客户卡券</strong><span>' + visibleCustomers().length + '位客户 · 上线后券实例明细</span></button></section><div class="privacy-note">手机号和VIN已脱敏，用户统一标识不展示</div>');
  }

  function reportActivityById(id) {
    return data.saReport.activities.find(function (item) { return item.id === id; }) || data.saReport.activities[0];
  }

  function reportCouponById(id) {
    return data.saReport.coupons.find(function (item) { return item.id === id; }) || data.saReport.coupons[0];
  }

  function renderReportActivityList() {
    var cards = data.saReport.activities.map(function (item) {
      var comboInfo = item.parentName ? '<p class="combo-parent-line">组合活动：' + esc(item.parentName) + ' · ' + esc(item.segment || '子活动') + '</p>' : '';
      return '<button class="report-list-card" data-open-report-activity="' + item.id + '" type="button"><div class="report-list-title"><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.id) + '</small></span><em>' + esc(item.status) + '</em></div>' + comboInfo + '<div class="report-list-tags"><span>' + esc(levelLabel(item.level)) + '</span><span>' + typeLabel(item.type) + '</span>' + (item.parentName ? '<span>组合子活动</span>' : '') + '</div><div class="report-list-metrics"><span><small>成功参与</small><strong>' + item.participation + '</strong></span><span><small>领券数</small><strong>' + item.coupons + '</strong></span><span><small>转化率</small><strong>' + esc(item.conversion) + '</strong></span></div><p>最近参与 ' + esc(item.last) + '</p></button>';
    }).join('');
    document.title = '我的分享数据-活动';
    return reportShell('activity', reportOwner() + '<div class="report-list-summary"><span>活动数据</span><strong>' + data.saReport.activities.length + '个统计对象</strong></div><div class="report-list">' + cards + '</div><div class="privacy-note">仅展示最终来源员工账号为本人的参与数据；组合活动按子活动拆开</div>');
  }

  function renderReportActivityDetail() {
    var item = reportActivityById(state.reportActivityId);
    var records = item.records.map(function (record) {
      return '<button class="record-row" data-open-participation="' + record.id + '" type="button"><span><strong>' + esc(record.mobile) + '</strong><small>' + esc(record.time) + ' · ' + esc(record.level) + '</small></span><span><em>' + esc(record.result) + '</em><small>' + record.couponCount + '张券</small></span></button>';
    }).join('');
    document.title = '活动详情';
    return mobileShell('活动详情', '<div class="page-scroll detail-page-scroll"><section class="detail-hero"><span>' + esc(levelLabel(item.level)) + ' · ' + typeLabel(item.type) + (item.parentName ? ' · 组合子活动' : '') + '</span><h2>' + esc(item.name) + '</h2><p>' + esc(item.id) + ' · ' + esc(item.status) + '</p></section>' + (item.parentName ? '<section class="mobile-detail-section"><h2>组合活动归属</h2>' + detailRow('组合活动',item.parentName) + detailRow('人群包',item.segment) + '</section>' : '') + '<section class="detail-metric-grid"><div><small>成功参与</small><strong>' + item.participation + '</strong></div><div><small>领券数</small><strong>' + item.coupons + '</strong></div><div><small>转化率</small><strong>' + esc(item.conversion) + '</strong></div><div><small>最近参与</small><strong>' + esc(item.last.slice(6)) + '</strong></div></section><section class="report-panel"><div class="report-panel-head"><strong>参与记录</strong><span>共' + item.participation + '条</span></div><div class="record-list">' + records + '</div><button class="text-row-action" data-all-records type="button">查看全部记录</button></section><div class="privacy-note">手机号和VIN已脱敏，用户统一标识不展示</div></div>');
  }

  function currentParticipation() {
    var activity = reportActivityById(state.reportActivityId);
    var record = activity.records.find(function (item) { return item.id === state.reportParticipationId; });
    if (record) return {activity:activity, record:record};
    for (var i = 0; i < data.saReport.activities.length; i += 1) {
      record = data.saReport.activities[i].records.find(function (item) { return item.id === state.reportParticipationId; });
      if (record) return {activity:data.saReport.activities[i], record:record};
    }
    return {activity:activity, record:activity.records[0]};
  }

  function detailRow(label, value) {
    return '<div class="mobile-detail-row"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function renderParticipationDetail() {
    var current = currentParticipation();
    var record = current.record;
    document.title = '参与记录详情';
    return mobileShell('参与记录详情', '<div class="page-scroll detail-page-scroll"><section class="detail-status-card"><span>执行结果</span><strong>' + esc(record.result) + '</strong><small>' + esc(record.id) + '</small></section><section class="mobile-detail-section"><h2>活动信息</h2>' + detailRow('活动名称', current.activity.name) + (current.activity.parentName ? detailRow('组合活动',current.activity.parentName) + detailRow('人群包',current.activity.segment) : '') + detailRow('参与级别', record.level) + detailRow('执行方式', record.type) + detailRow('参与时间', record.time) + '</section><section class="mobile-detail-section"><h2>用户与车辆（已脱敏）</h2>' + detailRow('手机号码', record.mobile) + detailRow('执行VIN', record.vin) + '</section><section class="mobile-detail-section"><h2>执行与来源</h2>' + detailRow('来源员工', data.source.employeeName) + detailRow('主角色',data.source.primaryRole) + detailRow('来源门店', record.store) + detailRow('准入校验', record.validation) + detailRow('关联卡券', record.coupons) + '</section><div class="privacy-note">不展示用户统一标识，仅限本人查看</div></div>');
  }

  function renderReportCouponList() {
    var cards = data.saReport.coupons.map(function (item) {
      var expiringSoonCount = expiringSoonCountForTemplate(item.id);
      return '<button class="report-list-card coupon-report-card" data-open-report-coupon="' + item.id + '" type="button"><div class="report-list-title"><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.id) + '</small></span><div class="report-list-badges">' + (expiringSoonCount ? '<b class="expiry-soon-tag" data-expiry-template="' + esc(item.id) + '">即将到期 ' + expiringSoonCount + '张</b>' : '') + '<em>' + esc(item.status) + '</em></div></div><p>来源活动：' + esc(item.activity) + '</p><div class="report-list-metrics"><span><small>领券数</small><strong>' + item.issued + '</strong></span><span><small>已核销</small><strong>' + item.redeemed + '</strong></span><span><small>核销率</small><strong>' + esc(item.redemptionRate) + '</strong></span></div><p>最近领券 ' + esc(item.last) + ' · 跨店核销' + item.cross + '张</p></button>';
    }).join('');
    document.title = '我的分享数据-卡券';
    return reportShell('coupon', reportOwner() + '<div class="report-list-summary"><span>卡券数据</span><strong>' + data.saReport.coupons.length + '个券模板</strong></div><div class="report-list">' + cards + '</div><div class="privacy-note">仅统计本人活动产生的卡券实例</div>');
  }

  function renderReportCouponDetail() {
    var item = reportCouponById(state.reportCouponId);
    var timeline = item.timeline.map(function (row) { return '<li><span></span><strong>' + esc(row) + '</strong></li>'; }).join('');
    document.title = '卡券详情';
    return mobileShell('卡券详情', '<div class="page-scroll detail-page-scroll"><section class="detail-hero coupon-detail-hero"><span>' + esc(item.owner) + ' · ' + esc(item.status) + '</span><h2>' + esc(item.name) + '</h2><p>' + esc(item.id) + '</p></section><section class="detail-metric-grid"><div><small>领券数</small><strong>' + item.issued + '</strong></div><div><small>已核销</small><strong>' + item.redeemed + '</strong></div><div><small>已过期</small><strong>' + item.expired + '</strong></div><div><small>核销率</small><strong>' + esc(item.redemptionRate) + '</strong></div></section><section class="mobile-detail-section"><h2>卡券信息</h2>' + detailRow('来源活动', item.activity) + detailRow('有效期', item.valid) + detailRow('跨店核销', item.cross + '张') + detailRow('最近领券', item.last) + '</section><section class="mobile-detail-section"><h2>最近生命周期</h2><ol class="coupon-timeline">' + timeline + '</ol></section><div class="privacy-note">仅展示当前员工账号权限范围内的汇总数据</div></div>');
  }

  function trackableCouponInstances(item) {
    return (item.couponInstances || []).filter(function (coupon) { return coupon.couponStatus !== '已失效'; });
  }

  function trackableCustomer(item) {
    var instances = trackableCouponInstances(item);
    if (!instances.length) return null;
    return Object.assign({},item,{
      couponInstances:instances,
      couponCount:instances.length,
      pendingCount:instances.filter(function (coupon) { return coupon.redemptionStatus === '未核销' && coupon.couponStatus !== '已过期'; }).length,
      redeemedCount:instances.filter(function (coupon) { return coupon.redemptionStatus === '已核销'; }).length,
      expiredCount:instances.filter(function (coupon) { return coupon.couponStatus === '已过期'; }).length,
      expiringSoonCount:instances.filter(isExpiringSoonCoupon).length
    });
  }

  function visibleCustomers() {
    return data.customerCoupons.map(trackableCustomer).filter(Boolean);
  }

  function customerById(id) {
    var customers = visibleCustomers();
    return customers.find(function (item) { return item.id === id; }) || customers[0];
  }

  function filteredCustomers() {
    var keyword = state.customerQuery.trim().toLowerCase();
    var customers = visibleCustomers();
    if (!keyword) return customers;
    return customers.filter(function (item) {
      return [item.mobile,item.id].concat(item.vins || []).some(function (value) {
        return String(value).toLowerCase().indexOf(keyword) > -1;
      });
    });
  }

  function customerCouponStatus(item) {
    if (item.couponStatus === '已过期') return {label:'已过期',className:'expired'};
    if (item.redemptionStatus === '已核销') return {label:'已核销',className:'redeemed'};
    return {label:'待核销',className:'pending'};
  }

  function renderCustomerList() {
    var customers = filteredCustomers();
    var cards = customers.map(function (item) {
      return '<button class="customer-list-card" data-open-customer="' + esc(item.id) + '" type="button"><div class="customer-list-head"><span><strong>' + esc(item.mobile) + '</strong><small>最近领券 ' + esc(item.lastClaimed) + '</small></span><div class="customer-list-badges">' + (item.expiringSoonCount ? '<b class="expiry-soon-tag" data-expiry-customer="' + esc(item.id) + '">即将到期 ' + item.expiringSoonCount + '张</b>' : '') + '<em>' + item.couponCount + '张券</em></div></div><p>' + esc(item.vins.join('、')) + '</p><div class="customer-count-grid"><span><small>待核销</small><strong>' + item.pendingCount + '</strong></span><span><small>已核销</small><strong>' + item.redeemedCount + '</strong></span><span><small>已过期</small><strong>' + item.expiredCount + '</strong></span></div><div class="customer-list-link">查看客户券实例 <span>›</span></div></button>';
    }).join('');
    var empty = '<section class="customer-empty"><strong>未找到客户</strong><span>请使用脱敏手机号、手机号后四位或VIN后四位重新查询</span><button data-clear-customer-query type="button">清除条件</button></section>';
    document.title = '我的分享数据-客户卡券';
    return reportShell('customer', reportOwner() + '<section class="customer-scope-note"><strong>客户卡券</strong><span>仅展示最终来源员工账号为本人、且在 ' + esc(data.featureLaunchDate.slice(0,10)) + ' 功能上线后产生的券实例</span></section><section class="customer-search"><label for="customerSearch">查询客户</label><div><input id="customerSearch" data-customer-search value="' + esc(state.customerQuery) + '" placeholder="脱敏手机号 / 后四位 / VIN后四位"><button data-customer-query type="button">查询</button></div></section><div class="report-list-summary"><span>客户列表</span><strong>' + customers.length + '位客户</strong></div><div class="customer-list">' + (cards || empty) + '</div><div class="privacy-note">客户按当前员工账号 + oneID聚合；不展示oneID，不提供移动端导出</div>');
  }

  function renderCustomerDetail() {
    var customer = customerById(state.reportCustomerId);
    var couponCards = customer.couponInstances.map(function (item) {
      var lifecycle = customerCouponStatus(item);
      var source = item.comboId ? '<strong>' + esc(item.comboName) + '</strong><small>组合活动 · ' + esc(item.comboId) + '</small><small>子活动：' + esc(item.segment) + ' · ' + esc(item.activityName) + '</small>' : '<strong>' + esc(item.activityName) + '</strong><small>普通活动 · ' + esc(item.activityId) + '</small>';
      var relation = item.childExecutionId && item.childExecutionId !== '-' ? item.participationId + ' / ' + item.childExecutionId : item.participationId;
      var expiryTag = isExpiringSoonCoupon(item) ? '<b class="expiry-soon-tag" data-expiry-coupon="' + esc(item.id) + '">即将到期</b>' : '';
      return '<article class="customer-coupon-instance"><div class="customer-coupon-head"><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.id) + '</small></span><div class="customer-coupon-statuses">' + expiryTag + '<em class="' + lifecycle.className + '">' + lifecycle.label + '</em></div></div><div class="customer-coupon-source"><span>来源活动</span><div>' + source + '</div></div><div class="customer-coupon-meta"><span><small>归属VIN</small><strong>' + esc(item.vin) + '</strong></span><span><small>到期日</small><strong>' + esc(item.expiresAt || '-') + '</strong></span><span><small>领取时间</small><strong>' + esc(item.claimedAt) + '</strong></span></div><div class="customer-coupon-relation"><span>参与 / 子执行</span><strong>' + esc(relation) + '</strong></div>' + (item.redemptionStatus === '已核销' ? '<div class="customer-redeem-time">核销时间：' + esc(item.redeemedAt) + '</div>' : '') + '</article>';
    }).join('');
    document.title = '客户卡券详情';
    return mobileShell('客户卡券详情', '<div class="page-scroll customer-detail-scroll"><section class="customer-detail-hero"><span>当前员工来源客户</span><h2>' + esc(customer.mobile) + '</h2><p>' + esc(customer.vins.join('、')) + '</p></section><section class="customer-detail-counts"><div><small>券实例</small><strong>' + customer.couponCount + '</strong></div><div><small>待核销</small><strong>' + customer.pendingCount + '</strong></div><div><small>已核销</small><strong>' + customer.redeemedCount + '</strong></div><div><small>已过期</small><strong>' + customer.expiredCount + '</strong></div></section><section class="customer-share-rule"><strong>再次分享说明</strong><span>是否需要再次促销由你自行判断；下方按钮只进入普通活动分享流程，不绑定本客户，也不建立原券到新券的特殊链路。</span></section><div class="customer-instance-title"><strong>券实例明细</strong><span>功能上线后 · ' + customer.couponCount + '张</span></div><div class="customer-coupon-list">' + couponCards + '</div><div class="privacy-note">已过期券仍保留追踪；真正已失效的券实例不进入客户列表或详情。新二维码可被转发，后续领券归属于实际扫码并成功参与的客户。</div></div>', '<footer class="bottom-action customer-follow-action"><p>从当前账号可分享活动池重新选择活动</p><button class="primary-action" data-customer-share type="button">发起活动分享</button></footer>');
  }

  function mutexNotice(activity, status, checked) {
    if (!activity.mutex) return '';
    var peers = mutexPeers(activity);
    var peerNames = peers.map(function (peer) { return '“' + peer.name + '”'; }).join('、');
    if (status === 'mutex-participated') {
      var participatedPeer = peers.find(function (peer) { return baseActivityStatus(peer) === 'participated'; });
      return '<div class="mutex-notice locked">已参加“' + esc(participatedPeer ? participatedPeer.name : '同组活动') + '”，当前活动不可再参与</div>';
    }
    if (status !== 'eligible') return '';
    if (checked) return '<div class="mutex-notice selected">已选中；选择另一项互斥活动时将自动切换</div>';
    return '<div class="mutex-notice">与' + esc(peerNames) + '互斥，同组仅可选择1项</div>';
  }

  function activityCard(activity) {
    var status = activityStatus(activity);
    var selectable = status === 'eligible';
    var checked = selectable && !!state.selected[activity.id];
    var action = '';
    if (status === 'need-certified') action = '<button class="upgrade-link" data-upgrade="certified" type="button">去认证</button>';
    if (status === 'need-bind') action = '<button class="upgrade-link" data-upgrade="bind" type="button">去绑车</button>';
    var rewardContent = '<div class="reward-row"><span class="type-tag ' + (activity.type === 'lottery' ? 'lottery' : '') + '">' + typeLabel(activity.type) + '</span><strong>' + esc(activityReward(activity)) + '</strong></div>';
    if (activity.isCombo && !hasVehicleContext()) rewardContent = '';
    if (activity.isCombo && hasVehicleContext()) {
      var comboRewards = matchedComboRewards(activity);
      var matchedCoupons = comboCoupons(activity);
      var matchedBenefits = comboBenefits(activity);
      var couponRows = matchedCoupons.map(function (coupon) {
        return '<div class="combo-reward-item"><strong>' + esc(coupon.name) + '</strong><small>' + esc(coupon.quantity + ' · ' + coupon.valid) + '</small></div>';
      }).join('');
      rewardContent = comboRewards.length
        ? '<div class="combo-reward-visible"><span>当前VIN可领取 · 命中' + comboRewards.length + '个子活动</span><div class="combo-reward-list">' + couponRows + '</div><small>关联权益：' + esc(matchedBenefits.map(function (benefit) { return benefit.name; }).join('、') || '无') + '</small><em>已汇总全部匹配结果，一键参与时同时发放</em></div>'
        : '<div class="combo-reward-visible empty"><span>当前VIN匹配结果</span><strong>暂未匹配到专属权益</strong><small>系统按当前VIN实时匹配</small></div>';
    }
    return '<article class="activity-card ' + (selectable ? '' : 'disabled') + ' ' + (activity.isCombo ? 'combo-activity-card' : '') + '" data-activity-id="' + activity.id + '">' +
      '<label class="activity-select"><input type="checkbox" data-activity-check="' + activity.id + '" ' + (checked ? 'checked' : '') + ' ' + (selectable ? '' : 'disabled') + '><span class="check-copy"></span></label>' +
      '<div class="activity-content"><div class="activity-top"><div><h3>' + esc(activityDisplayName(activity)) + (activity.isCombo ? '<span class="combo-tag">组合活动</span>' : '') + (activity.mutex ? '<span class="mutex-tag">互斥</span>' : '') + '</h3><p>' + esc(activity.description) + '</p></div>' + statusMarkup(status) + '</div>' +
      rewardContent + mutexNotice(activity, status, checked) +
      '<div class="activity-meta"><span>' + esc(activity.expiry) + '</span><span>' + esc(activity.id) + '</span>' + action + '</div></div></article>';
  }

  function customerActivityList() {
    var activities = sharedActivities();
    if (!activities.length) return '';
    return '<section class="activity-section customer-activity-section"><div class="activity-list customer-activity-list">' + activities.map(activityCard).join('') + '</div></section>';
  }

  function renderAggregation() {
    var vehicle = currentVehicle();
    var bound = hasVehicleContext();
    var count = selectedActivities().length;
    var activityCount = sharedActivities().length;
    document.title = '专属活动';
    return mobileShell('专属活动', '<div class="page-scroll"><section class="source-card"><div><span>活动分享</span><strong>由' + esc(data.source.store) + ' · ' + esc(data.source.employeeName) + '分享</strong><small>已为你精选' + activityCount + '项活动</small></div><span class="source-mark">荐</span></section>' +
      '<div class="prototype-scenario-switch"><span>组合活动演示</span><button class="' + (bound ? 'active' : '') + '" data-demo-bound type="button">已绑车</button><button class="' + (!bound ? 'active' : '') + '" data-demo-unbound type="button">未绑车</button></div>' +
      (bound ? '<button class="vehicle-switch" data-open-vehicle type="button"><span><small>当前执行车辆</small><strong>' + esc(vehicle.model) + ' · ' + esc(vehicle.plate) + '</strong><em>' + esc(vehicle.vin) + (vehicle.certified ? ' · 已认证' : ' · 未认证') + '</em></span><span class="switch-copy">切换</span></button>' : '<section class="vehicle-unbound-card"><span><small>当前车辆状态</small><strong>尚未绑定车辆</strong><em>绑车后才可按VIN匹配组合活动卡券</em></span><button data-upgrade="bind" type="button">去绑车</button></section>') +
      '<div class="list-summary"><span>以下为本次二维码包含的全部活动</span><strong>已选' + count + '项</strong></div>' +
      customerActivityList() + '<div class="end-note">活动资格与互斥关系以当前账号、所选车辆及提交时校验结果为准</div></div>',
      '<footer class="bottom-action"><p>将同时领券并完成所选抽奖活动</p><button class="primary-action" data-participate type="button" ' + (count ? '' : 'disabled') + '>一键参与' + (count ? '（' + count + '项）' : '') + '</button></footer>');
  }

  function render() {
    var app = document.getElementById('app');
    var current = route();
    if (!app) return;
    if (current === 'sa-qr') app.innerHTML = renderQr();
    else if (current === 'sa-qr-list') app.innerHTML = renderQrList();
    else if (current === 'sa-qr-detail') app.innerHTML = renderQrDetail();
    else if (current === 'sa-poster-editor') app.innerHTML = renderPosterEditor();
    else if (current === 'sa-poster-preview') app.innerHTML = renderPosterPreview();
    else if (current === 'sa-select-activity-detail') app.innerHTML = renderSaSelectActivityDetail();
    else if (current === 'qr-invalid') app.innerHTML = renderQrInvalid();
    else if (current === 'sa-empty') app.innerHTML = renderSaEmpty();
    else if (current === 'sa-no-permission') app.innerHTML = renderNoPermission();
    else if (current === 'sa-data-overview') app.innerHTML = renderReportOverview();
    else if (current === 'sa-activity-list') app.innerHTML = renderReportActivityList();
    else if (current === 'sa-activity-detail') app.innerHTML = renderReportActivityDetail();
    else if (current === 'sa-participation-detail') app.innerHTML = renderParticipationDetail();
    else if (current === 'sa-coupon-list') app.innerHTML = renderReportCouponList();
    else if (current === 'sa-coupon-detail') app.innerHTML = renderReportCouponDetail();
    else if (current === 'sa-customer-list') app.innerHTML = renderCustomerList();
    else if (current === 'sa-customer-detail') app.innerHTML = renderCustomerDetail();
    else if (current === 'activity-aggregation' || current === 'activity-aggregation-unbound' || current === 'activity-aggregation-offline') app.innerHTML = renderAggregation();
    else app.innerHTML = renderSaSelect();
  }

  function renderPreservingScroll() {
    var scrollNode = document.querySelector('.page-scroll');
    var scrollTop = scrollNode ? scrollNode.scrollTop : 0;
    render();
    requestAnimationFrame(function () {
      var nextScroll = document.querySelector('.page-scroll');
      if (nextScroll) nextScroll.scrollTop = scrollTop;
    });
  }

  function openVehicleSheet() {
    var vehicle = currentVehicle();
    var rows = data.vehicles.map(function (item) {
      return '<button class="vehicle-option ' + (item.id === vehicle.id ? 'active' : '') + '" data-select-vehicle="' + item.id + '" type="button"><span><strong>' + esc(item.model) + ' · ' + esc(item.plate) + '</strong><small>' + esc(item.vin) + (item.isDefault ? ' · 默认车辆' : '') + '</small></span><input type="radio" ' + (item.id === vehicle.id ? 'checked' : '') + ' tabindex="-1"></button>';
    }).join('');
    common.openSheet('<div class="sheet-head"><h2>选择本次执行车辆</h2><button data-close-sheet type="button">关闭</button></div><div class="sheet-note">每次仅针对一辆VIN计算和执行活动</div><div class="vehicle-options">' + rows + '</div><button class="bind-other" data-upgrade="bind" type="button">绑定其他车辆</button>');
  }

  function selectedMutexConflict(activities) {
    var groups = {};
    for (var i = 0; i < activities.length; i += 1) {
      var activity = activities[i];
      if (!activity.mutex) continue;
      if (groups[activity.mutex.group]) return {first:groups[activity.mutex.group], second:activity};
      groups[activity.mutex.group] = activity;
    }
    return null;
  }

  function participate() {
    var activities = selectedActivities();
    var mutexConflict = selectedMutexConflict(activities);
    var offlineScenario = route() === 'activity-aggregation-offline';
    var offlineId = 'ACT-SA-20260701';
    var successCount = 0;
    var invalidCount = 0;
    if (!activities.length) {
      common.showToast('请先选择可参与活动');
      return;
    }
    if (mutexConflict) {
      common.showToast('“' + mutexConflict.first.name + '”与“' + mutexConflict.second.name + '”不可同时参与');
      resetDefaultSelection();
      renderPreservingScroll();
      return;
    }
    var resultRows = activities.map(function (activity) {
      if (offlineScenario && activity.id === offlineId) {
        invalidCount += 1;
        return '<div class="result-row invalid"><span class="result-dot invalid"></span><div><strong>' + esc(activityDisplayName(activity)) + '</strong><small>活动已下线，本次未执行</small></div><em>未处理</em></div>';
      }
      state.completed[completionKey(activity)] = true;
      successCount += 1;
      var result = activity.type === 'lottery' ? '抽奖成功' : '领取成功';
      var detail = activity.type === 'lottery' ? '恭喜中奖：200元保养券' : activityReward(activity) + '已发至卡包';
      if (activity.isCombo) {
        var comboMatches = matchedComboRewards(activity);
        var issuedCoupons = comboCoupons(activity);
        detail = '命中' + comboMatches.length + '个子活动，已全部发放：' + issuedCoupons.map(function (coupon) { return coupon.name; }).join('、');
      }
      return '<div class="result-row"><span class="result-dot"></span><div><strong>' + esc(activityDisplayName(activity)) + '</strong><small>' + esc(detail) + '</small></div><em>' + result + '</em></div>';
    }).join('');
    state.selected = {};
    render();
    var title = invalidCount ? successCount + '项成功，' + invalidCount + '项未处理' : activities.length + '项活动已处理';
    var desc = invalidCount ? '下线活动已拦截，其他有效活动继续执行' : '卡券已发放，抽奖活动已自动完成';
    common.openSheet('<div class="result-hero"><span>参与完成</span><h2>' + title + '</h2><p>' + desc + '</p></div><div class="result-list">' + resultRows + '</div><button class="sheet-primary" data-view-wallet type="button">查看我的卡券</button><button class="sheet-secondary" data-close-sheet type="button">完成</button>', {className:'result-sheet'});
  }

  function openUpgradeSheet(type) {
    var isBind = type === 'bind';
    var title = isBind ? '将前往绑定车辆' : '将前往车主认证';
    var description = isBind ? '绑定新车辆后，系统将重新判断可参与活动。' : '完成当前账号与车辆认证后，系统将重新判断可参与活动。';
    var action = isBind ? '继续去绑车' : '继续去认证';
    common.openSheet('<div class="upgrade-sheet"><span class="upgrade-label">参与资格提升</span><h2>' + title + '</h2><p>' + description + '</p><div class="leave-note"><strong>请注意</strong><span>完成后不会自动返回本活动页，请重新扫描活动二维码进入。</span></div><button class="sheet-primary" data-confirm-upgrade="' + type + '" type="button">' + action + '</button><button class="sheet-secondary" data-close-sheet type="button">暂不处理</button></div>');
  }

  function openDurationSheet(action) {
    state.durationAction = action || 'generate';
    state.pendingDurationMinutes = data.qr.defaultMinutes;
    var options = data.qr.durationOptions.map(function (item) {
      var checked = item.minutes === state.pendingDurationMinutes;
      var note = item.minutes === -1 ? item.note : item.minutes + '分钟';
      return '<label class="duration-choice ' + (checked ? 'active' : '') + '"><input type="radio" name="qrDuration" data-duration-choice value="' + item.minutes + '"' + (checked ? ' checked' : '') + '><span><strong>' + esc(item.label) + '</strong><small>' + esc(note) + '</small></span><i></i></label>';
    }).join('');
    var warning = state.durationAction === 'regenerate' ? '<div class="leave-note compact"><strong>重新生成规则</strong><span>新码生效后旧码不再接受新扫码；已建立会话提交时仍会重新校验。</span></div>' : '';
    common.openSheet('<div class="duration-drawer"><div class="sheet-head"><h2>选择二维码有效期</h2><button data-close-sheet type="button">关闭</button></div><p>可选5分钟至1天，或长期有效至所选活动结束</p><div class="duration-choice-grid">' + options + '</div><div class="duration-preview"><span>默认已选</span><strong data-duration-preview>' + durationLabel(state.pendingDurationMinutes) + '</strong><small data-duration-expiry>预计失效：' + qrExpiryText(state.pendingDurationMinutes) + '</small></div>' + warning + '<button class="sheet-primary" data-confirm-duration="' + state.durationAction + '" type="button">' + (state.durationAction === 'regenerate' ? '按此有效期重新生成' : '确认并生成二维码') + '</button><button class="sheet-secondary" data-close-sheet type="button">取消</button></div>', {className:'duration-sheet'});
  }

  function regenerateQr() {
    state.previousSceneId = state.currentSceneId;
    state.qrGeneration += 1;
    state.qrVersion += 1;
    var nextNumber = 89 + state.qrGeneration;
    state.currentSceneId = 'SCN-20260820-10045-' + String(nextNumber).padStart(4, '0');
    state.invalidReason = 'replaced';
    common.closeSheet();
    render();
    setTimeout(function () {
      common.openSheet('<div class="result-hero"><span>新二维码已生效</span><h2>原二维码已失效</h2><p>新sceneId：' + esc(state.currentSceneId) + '</p></div><div class="regenerate-summary"><span>旧sceneId</span><strong>' + esc(state.previousSceneId) + '</strong><small>不再接受新的扫码</small></div><button class="sheet-primary" data-close-sheet type="button">查看新二维码</button><button class="sheet-secondary" data-old-code type="button">模拟扫描旧码</button>');
    }, 220);
  }

  function handleBack() {
    var current = route();
    if (current === 'sa-qr' || current === 'sa-empty' || current === 'sa-no-permission' || current === 'sa-data-overview' || current === 'sa-activity-list' || current === 'sa-coupon-list' || current === 'sa-customer-list' || current === 'sa-qr-list') go('sa-select');
    else if (current === 'sa-qr-detail') go('sa-qr-list');
    else if (current === 'sa-poster-editor') go('sa-qr');
    else if (current === 'sa-poster-preview') go('sa-poster-editor');
    else if (current === 'sa-select-activity-detail') go('sa-select');
    else if (current === 'sa-activity-detail') go('sa-activity-list');
    else if (current === 'sa-participation-detail') go('sa-activity-detail');
    else if (current === 'sa-coupon-detail') go('sa-coupon-list');
    else if (current === 'sa-customer-detail') go('sa-customer-list');
    else if (current === 'qr-invalid') go('sa-qr');
    else if (current === 'activity-aggregation' || current === 'activity-aggregation-unbound' || current === 'activity-aggregation-offline') common.showToast('原型演示：返回扫码前页面');
    else common.showToast('原型演示：返回服务助手首页');
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-back]')) handleBack();
    if (event.target.closest('[data-open-sa-data]')) go('sa-data-overview');
    if (event.target.closest('[data-open-my-qrs]')) go('sa-qr-list');
    var qrDetailLink = event.target.closest('[data-open-qr-detail]');
    if (qrDetailLink) {
      state.qrDetailSceneId = qrDetailLink.getAttribute('data-open-qr-detail');
      state.qrDetailView = 'poster';
      go('sa-qr-detail');
    }
    var qrDetailView = event.target.closest('[data-qr-detail-view]');
    if (qrDetailView) {
      state.qrDetailView = qrDetailView.getAttribute('data-qr-detail-view');
      renderPreservingScroll();
    }
    var saActivityDetail = event.target.closest('[data-open-sa-activity]');
    if (saActivityDetail) {
      state.saDetailActivityId = saActivityDetail.getAttribute('data-open-sa-activity');
      go('sa-select-activity-detail');
    }
    if (event.target.closest('[data-back-to-generate]')) go('sa-select');
    var reportRoute = event.target.closest('[data-report-route]');
    if (reportRoute) go(reportRoute.getAttribute('data-report-route'));
    var range = event.target.closest('[data-report-range]');
    if (range) {
      state.reportRange = range.getAttribute('data-report-range');
      renderPreservingScroll();
      common.showToast(state.reportRange === '7d' ? '已切换为近7日' : '已切换为近30日');
    }
    var activityLink = event.target.closest('[data-open-report-activity]');
    if (activityLink) {
      state.reportActivityId = activityLink.getAttribute('data-open-report-activity');
      go('sa-activity-detail');
    }
    var participationLink = event.target.closest('[data-open-participation]');
    if (participationLink) {
      state.reportParticipationId = participationLink.getAttribute('data-open-participation');
      go('sa-participation-detail');
    }
    var couponLink = event.target.closest('[data-open-report-coupon]');
    if (couponLink) {
      state.reportCouponId = couponLink.getAttribute('data-open-report-coupon');
      go('sa-coupon-detail');
    }
    var customerLink = event.target.closest('[data-open-customer]');
    if (customerLink) {
      state.reportCustomerId = customerLink.getAttribute('data-open-customer');
      go('sa-customer-detail');
    }
    if (event.target.closest('[data-customer-query]')) {
      var customerSearch = document.querySelector('[data-customer-search]');
      state.customerQuery = customerSearch ? customerSearch.value : state.customerQuery;
      renderPreservingScroll();
      common.showToast('客户查询完成');
    }
    if (event.target.closest('[data-clear-customer-query]')) {
      state.customerQuery = '';
      renderPreservingScroll();
    }
    if (event.target.closest('[data-customer-share]')) {
      go('sa-select');
      setTimeout(function () { common.showToast('已进入普通活动分享流程，本次分享不绑定客户'); },0);
    }
    if (event.target.closest('[data-all-records]')) common.showToast('已展示当前原型全部脱敏记录');
    if (event.target.closest('[data-generate-qr]')) {
      openDurationSheet('generate');
    }
    if (event.target.closest('[data-edit-selection]')) go('sa-select');
    if (event.target.closest('[data-create-poster]')) go('sa-poster-editor');
    if (event.target.closest('[data-generate-poster]')) {
      var currentQrRecord = data.myQrs.find(function (item) { return item.sceneId === state.currentSceneId; }) || data.myQrs[0];
      currentQrRecord.poster = {title:state.posterTitle,subtitle:state.posterSubtitle,guide:state.posterGuide};
      go('sa-poster-preview');
    }
    if (event.target.closest('[data-edit-poster]')) go('sa-poster-editor');
    if (event.target.closest('[data-reset-poster]')) {
      state.posterTitle = data.poster.defaultTitle;
      state.posterSubtitle = data.poster.defaultSubtitle;
      state.posterGuide = data.poster.defaultGuide;
      renderPreservingScroll();
      common.showToast('已恢复默认文案');
    }
    var posterMode = event.target.closest('[data-poster-mode]');
    if (posterMode) {
      state.posterMode = posterMode.getAttribute('data-poster-mode');
      renderPreservingScroll();
      common.showToast('已切换为系统模板');
    }
    if (event.target.closest('[data-save-poster]')) common.showToast('海报已保存到相册（原型演示）');
    if (event.target.closest('[data-share-poster]')) common.showToast('已调起系统分享面板（原型演示）');
    if (event.target.closest('[data-save-existing-qr]')) common.showToast('已再次保存原二维码，sceneId保持不变');
    if (event.target.closest('[data-save-existing-poster]')) common.showToast('已保存当前海报，sceneId保持不变');
    if (event.target.closest('[data-regenerate]')) openDurationSheet('regenerate');
    var durationConfirm = event.target.closest('[data-confirm-duration]');
    if (durationConfirm) {
      state.selectedDurationMinutes = state.pendingDurationMinutes;
      if (durationConfirm.getAttribute('data-confirm-duration') === 'regenerate') regenerateQr();
      else {
        state.generatedActivityIds = saSelectedActivities().map(function (activity) { return activity.id; });
        state.currentSceneId = data.qr.nextSceneId;
        state.qrVersion = Number(String(data.qr.snapshotVersion).replace(/\D/g, '')) || 3;
        data.myQrs[0].duration = durationLabel(state.selectedDurationMinutes);
        data.myQrs[0].expiresAt = '2026-' + qrExpiryText(state.selectedDurationMinutes);
        data.myQrs[0].activityCount = state.generatedActivityIds.length;
        data.myQrs[0].activities = saSelectedActivities().map(activityDisplayName);
        go('sa-qr');
      }
    }
    if (event.target.closest('[data-old-code]')) go('qr-invalid');
    if (event.target.closest('[data-invalid-done]')) common.showToast('请联系分享人获取最新二维码');
    if (event.target.closest('[data-empty-refresh]')) {
      common.showToast('已重新加载可投活动');
      go('sa-select');
    }
    if (event.target.closest('[data-simulate-scan]')) {
      state.vehicleId = data.user.defaultVehicleId;
      resetDefaultSelection();
      go('activity-aggregation');
    }
    if (event.target.closest('[data-demo-unbound]')) {
      go('activity-aggregation-unbound');
      setTimeout(function () { resetDefaultSelection(); render(); },0);
    }
    if (event.target.closest('[data-demo-bound]')) {
      state.vehicleId = data.user.defaultVehicleId;
      go('activity-aggregation');
      setTimeout(function () { resetDefaultSelection(); render(); },0);
    }
    if (event.target.closest('[data-open-vehicle]')) openVehicleSheet();
    var vehicleButton = event.target.closest('[data-select-vehicle]');
    if (vehicleButton) {
      state.vehicleId = vehicleButton.getAttribute('data-select-vehicle');
      resetDefaultSelection();
      common.closeSheet();
      render();
      common.showToast('已切换车辆，活动资格已重新计算');
    }
    if (event.target.closest('[data-participate]')) participate();
    if (event.target.closest('[data-view-wallet]')) {
      common.closeSheet();
      common.showToast('原型演示：进入“我的卡券”');
    }
    var upgrade = event.target.closest('[data-upgrade]');
    if (upgrade) openUpgradeSheet(upgrade.getAttribute('data-upgrade'));
    var confirmUpgrade = event.target.closest('[data-confirm-upgrade]');
    if (confirmUpgrade) {
      var upgradeType = confirmUpgrade.getAttribute('data-confirm-upgrade');
      common.closeSheet();
      common.showToast(upgradeType === 'bind' ? '原型演示：已离开活动页，进入绑车流程' : '原型演示：已离开活动页，进入认证流程');
    }
  });

  document.addEventListener('input', function (event) {
    var customerSearch = event.target.closest('[data-customer-search]');
    if (customerSearch) {
      state.customerQuery = customerSearch.value;
      return;
    }
    var input = event.target.closest('[data-poster-input]');
    if (!input) return;
    var key = input.getAttribute('data-poster-input');
    if (key === 'title') state.posterTitle = input.value;
    if (key === 'subtitle') state.posterSubtitle = input.value;
    if (key === 'guide') state.posterGuide = input.value;
    var preview = document.querySelector('[data-poster-preview-' + key + ']');
    var count = document.querySelector('[data-poster-count="' + key + '"]');
    if (preview) preview.textContent = input.value || (key === 'title' ? '请输入海报标题' : key === 'subtitle' ? '请输入活动说明' : '请输入扫码引导语');
    if (count) count.textContent = input.value.length + '/' + input.maxLength;
  });

  document.addEventListener('change', function (event) {
    var posterAvatar = event.target.closest('[data-poster-avatar]');
    if (posterAvatar) {
      state.posterShowAvatar = posterAvatar.checked;
      renderPreservingScroll();
      common.showToast(state.posterShowAvatar ? '海报将展示员工头像' : '已隐藏员工头像');
      return;
    }
    var posterUpload = event.target.closest('[data-poster-upload]');
    if (posterUpload) {
      var file = posterUpload.files && posterUpload.files[0];
      if (!file) return;
      if (['image/jpeg','image/png'].indexOf(file.type) === -1) {
        common.showToast('仅支持JPG或PNG图片');
        posterUpload.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        common.showToast('图片大小不能超过10MB');
        posterUpload.value = '';
        return;
      }
      if (state.posterUploadUrl) URL.revokeObjectURL(state.posterUploadUrl);
      state.posterUploadUrl = URL.createObjectURL(file);
      state.posterUploadName = file.name;
      state.posterMode = 'upload';
      renderPreservingScroll();
      common.showToast('自定义海报已上传，并叠加二维码与分享员工信息');
      return;
    }
    var durationChoice = event.target.closest('[data-duration-choice]');
    if (durationChoice) {
      state.pendingDurationMinutes = Number(durationChoice.value);
      document.querySelectorAll('.duration-choice').forEach(function (node) { node.classList.toggle('active',node.contains(durationChoice)); });
      var preview = document.querySelector('[data-duration-preview]');
      var expiry = document.querySelector('[data-duration-expiry]');
      if (preview) preview.textContent = durationLabel(state.pendingDurationMinutes);
      if (expiry) expiry.textContent = '预计失效：' + qrExpiryText(state.pendingDurationMinutes);
      return;
    }
    var saCheck = event.target.closest('[data-sa-check]');
    if (saCheck) {
      state.saSelected[saCheck.getAttribute('data-sa-check')] = saCheck.checked;
      renderPreservingScroll();
      return;
    }
    var selectAll = event.target.closest('[data-sa-select-all]');
    if (selectAll) {
      data.activities.forEach(function (activity) { state.saSelected[activity.id] = isActivityVisibleToSource(activity) ? selectAll.checked : false; });
      renderPreservingScroll();
      return;
    }
    var check = event.target.closest('[data-activity-check]');
    if (check && !check.disabled) {
      var checkedActivity = activityById(check.getAttribute('data-activity-check'));
      var cancelledPeers = [];
      if (check.checked && checkedActivity.mutex) {
        mutexPeers(checkedActivity).forEach(function (peer) {
          if (state.selected[peer.id]) cancelledPeers.push(peer.name);
          state.selected[peer.id] = false;
        });
      }
      state.selected[checkedActivity.id] = check.checked;
      renderPreservingScroll();
      if (cancelledPeers.length) common.showToast('已取消“' + cancelledPeers.join('、') + '”，互斥活动不可同时参与');
    }
  });

  window.addEventListener('hashchange', render);
  resetDefaultSelection();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  window.getCurrentPage = route;
  window.SAFrontApp = {
    render:render,
    state:state,
    activityStatus:activityStatus,
    selectedActivities:selectedActivities,
    sharedActivities:sharedActivities,
    saAvailableActivities:saAvailableActivities,
    activityDisplayName:activityDisplayName,
    isActivityVisibleToSource:isActivityVisibleToSource,
    route:route
  };
})();
