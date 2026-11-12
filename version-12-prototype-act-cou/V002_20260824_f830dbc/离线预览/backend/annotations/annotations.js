window.AnnotationData = {
  'activity-create': [{
    id: 1,
    target: '.role-checkbox-grid',
    title: '普通活动允许分享角色',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '分享角色配置',
      functionDesc: '在普通活动适用门店附近维护允许分享该活动的员工角色。',
      permissionScope: '活动中心运营。',
      dataSource: '服务助手角色列表，只作为候选值。',
      valueLogic: '员工任一有效角色命中即可分享；空值表示无人可分享。',
      fieldDesc: 'shareRoleCodes、storeScope。',
      interactionDesc: '创建/草稿期可选择，生效后锁定。',
      judgeRule: '角色不替代活动准入表达。',
      exceptionRule: '复制活动时重置为空。',
      otherDesc: '活动分享配置页只读继承。'
    }
  }],
  'combo-edit': [{
    id: 1,
    target: '.role-checkbox-grid',
    title: '组合活动分享范围',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '组合层门店与角色配置',
      functionDesc: '适用门店和允许分享角色统一配置在组合活动层。',
      permissionScope: '组合活动运营。',
      dataSource: '组合活动主数据与服务助手角色候选。',
      valueLogic: '子活动不重复配置；组合活动生效后锁定。',
      fieldDesc: 'storeScope、shareRoleCodes。',
      interactionDesc: '草稿期选择门店和角色。',
      judgeRule: '员工需同时命中门店和至少一个角色。',
      exceptionRule: '复制组合活动时角色清空。',
      otherDesc: '用户看一张大卡片，报表按子活动拆开。'
    }
  }],
  'sa-placement-manage': [{
    id: 1,
    target: '[data-anno="sa-placement-list"]',
    title: '活动分享配置',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '活动投放配置',
      functionDesc: '配置普通活动或组合活动是否进入员工可分享池。',
      permissionScope: '活动分享运营管理员。',
      dataSource: '活动中心与组合活动中心。',
      valueLogic: '门店与角色只读继承活动对象；没有允许分享角色时不可生效。',
      fieldDesc: '对象类型、对象ID、展示名称、投放状态、只读范围。',
      interactionDesc: '支持新增、编辑、查看、生效和停用。',
      judgeRule: '后台统一推券和非主动触发活动不进入候选池。',
      exceptionRule: '复制活动不复制投放配置。',
      otherDesc: '本页不二次配置适用门店或角色。'
    }
  }],
  'sa-qr-settings': [{
    id: 1,
    target: '[data-anno="qr-duration-settings"]',
    title: '二维码有效时长',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '二维码时长参数',
      functionDesc: '配置员工生成前可选择的固定时长、长期有效选项和默认值。',
      permissionScope: '活动分享运营管理员。',
      dataSource: '二维码参数配置。',
      valueLogic: '固定时长5—1440分钟；长期有效截止到冻结活动最晚结束时间。',
      fieldDesc: '固定候选时长、长期有效、默认值、配置版本。',
      interactionDesc: '保存后只影响新生成二维码。',
      judgeRule: '默认值必须属于候选集合。',
      exceptionRule: '既有码不回写新参数。',
      otherDesc: 'sceneId生成时冻结员工、账号、角色、门店和活动集合。'
    }
  }],
  'activity-overview': [{
    id: 1,
    target: '.activity-multi-trigger',
    title: '员工分享活动报表多活动查询',
    position: {placement:'bottom-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '多活动选择器',
      functionDesc: '通过可搜索弹窗选择普通活动、组合活动或组合子活动。',
      permissionScope: '按总部、区域、门店数据权限。',
      dataSource: '活动主数据与员工分享参与记录。',
      valueLogic: '一次最多选择20个查询对象；组合活动参与结果按子活动拆开。',
      fieldDesc: 'activityIds、activityTypes。',
      interactionDesc: '可选/已选页签跨页维护选择。',
      judgeRule: '活动条件内部为或，与其他条件为且。',
      exceptionRule: '不选活动表示全部授权活动。',
      otherDesc: '员工输入框为模糊匹配，无结果数上限。'
    }
  }],
  'coupon-overview': [{
    id: 1,
    target: '.table-shell',
    title: '员工分享卡券报表',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '卡券来源与核销统计',
      functionDesc: '展示来源员工、主角色、门店、普通/组合子活动和卡券生命周期。',
      permissionScope: '按总部、区域、门店数据权限。',
      dataSource: '卡券实例、核销流水与员工分享来源快照。',
      valueLogic: '仅使用已核销/核销率，不使用已使用/使用率。',
      fieldDesc: 'employeeId、accountId、primaryRole、activityId、couponInstanceId。',
      interactionDesc: '支持查询、导出和详情下钻。',
      judgeRule: '历史SA数据并入并标记；无账号ID显示--。',
      exceptionRule: '导出继承当前权限和脱敏。',
      otherDesc: '渠道枚举继续使用SA动态二维码。'
    }
  }],
  'coupon-customer': [{
    id: 1,
    target: '.feature-scope-note',
    title: '客户维度上线后数据口径',
    position: {placement:'bottom-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '客户卡券聚合查询',
      functionDesc: '按来源员工账号 + oneID聚合该员工带来的客户与券实例。',
      permissionScope: '总部、区域、门店按既有组织权限只读查询和导出。',
      dataSource: '功能上线后的活动参与记录、子活动执行明细、券实例与核销流水。',
      valueLogic: '客户数按oneID去重，券数按券实例计数；同一客户在不同来源员工下分开统计。',
      fieldDesc: 'sourceAccountId、oneID、participationRecordId、childExecutionId、couponInstanceId。',
      interactionDesc: '支持客户查询、多活动查询、查看客户详情和逐券导出。',
      judgeRule: '仅纳入功能上线后产生的客户和券实例，不回补历史。',
      exceptionRule: '已过期未核销券仍可查看；真正已失效的券实例不纳入客户列表、详情或统计。',
      otherDesc: '是否再次促销由员工自行判断。'
    }
  }],
  'coupon-customer-detail': [{
    id: 1,
    target: '.customer-detail-banner',
    title: '客户券实例追踪',
    position: {placement:'bottom-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '客户卡券详情',
      functionDesc: '展示单个客户由指定来源员工带来的全部上线后券实例。',
      permissionScope: '继承员工分享卡券报表权限。',
      dataSource: '活动参与记录、组合父参与记录、子活动执行明细、券实例与核销流水。',
      valueLogic: '普通活动1条参与记录可关联N张券；组合活动每张券同时关联父参与记录和命中子活动执行明细。',
      fieldDesc: '券实例、活动/组合活动、子活动、VIN、领取时间、券状态、核销状态。',
      interactionDesc: '可查看券实例、反查参与记录、返回客户列表和按券实例导出。',
      judgeRule: '组合活动在客户列表按父活动计1个来源对象，详情按子活动和券实例逐条展示。',
      exceptionRule: '历史券不进入本页。',
      otherDesc: '页面数据为目标能力Mock，不证明正式跨中心接口已实现。'
    }
  }],
  'coupon-claim': [{
    id: 1,
    target: '.data-table',
    title: '参与记录与券实例稳定关联',
    position: {placement:'top-right',offsetX:-12,offsetY:8},
    sections: {
      functionName: '券实例来源反查',
      functionDesc: '每张券实例保存来源参与记录ID；组合活动同时保存子活动执行明细ID。',
      permissionScope: '员工分享卡券报表查询权限。',
      dataSource: '活动中心成功参与记录与卡券中心发券结果。',
      valueLogic: '普通活动为1参与记录对N券实例；组合活动为1父参与记录对N子执行、每个子执行再关联对应券实例。',
      fieldDesc: 'participationRecordId、childExecutionId、couponInstanceId。',
      interactionDesc: '券实例可反查活动参与详情与客户详情。',
      judgeRule: '仅对功能上线后的新数据建立稳定关联。',
      exceptionRule: '历史记录继续展示原有字段，但不伪造关联。',
      otherDesc: '需要研发补齐跨中心字段、回写和查询链路。'
    }
  }]
};
