window.AnnotationData = {
  'sa-select': [{
    id: 1,
    target: '.sa-rule-note',
    title: '员工活动池权限过滤',
    position: {placement:'bottom-right',offsetX:-8,offsetY:8},
    sections: {
      functionName: '可分享活动过滤',
      functionDesc: '按活动投放、账号状态、唯一门店与员工任一命中角色过滤活动。',
      permissionScope: '当前服务助手登录员工。',
      dataSource: '活动分享配置、活动适用门店、允许分享角色与服务助手员工快照。',
      valueLogic: '活动有效、投放有效、账号有效、门店命中且至少一个角色命中时展示。',
      fieldDesc: 'employeeId、accountId、storeId、roleCodes、shareRoleCodes。',
      interactionDesc: '被过滤对象不展示，不进入全选和二维码冻结范围。',
      judgeRule: '允许分享角色为空表示无人可分享。',
      exceptionRule: '无任何命中活动时展示空业务态；无权限时入口不展示。',
      otherDesc: '活动选择数量不设业务上限。'
    }
  }, {
    id: 2,
    target: '[data-generate-qr]',
    title: '生成前选择有效期',
    position: {placement:'top-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '二维码有效期抽屉',
      functionDesc: '生成前从后台候选项选择固定时长或长期有效，默认值预选。',
      permissionScope: '当前有分享权限的员工。',
      dataSource: '后台二维码参数配置。',
      valueLogic: '固定时长5分钟至1天；长期有效截止到冻结活动中最晚结束时间。',
      fieldDesc: '有效期模式、时长、预计失效时间。',
      interactionDesc: '确认后生成；取消不生成。',
      judgeRule: '不可自由输入。',
      exceptionRule: '重新生成时再次选择。',
      otherDesc: '生成时冻结员工、账号、全部角色、主角色、命中角色、门店与活动集合。'
    }
  }, {
    id: 3,
    target: '.employee-quick-entry',
    title: '本人业务快捷入口',
    position: {placement:'bottom-right',offsetX:-8,offsetY:8},
    sections: {
      functionName: '二维码与数据双入口',
      functionDesc: '将两个并列业务入口从标题栏下沉到员工身份卡下方，避免右上角拥挤。',
      permissionScope: '当前服务助手登录员工。',
      dataSource: '当前账号二维码记录与本人分享报表。',
      valueLogic: '我的二维码展示当前账号记录；我的分享数据仅统计当前账号。',
      fieldDesc: '有效二维码数、扫码、参与、领券与核销。',
      interactionDesc: '点击卡片进入对应原有页面，不占用底部生成二维码主动作。',
      judgeRule: '两个入口同级，不使用更多菜单二次收纳。',
      exceptionRule: '有权限但无可分享活动时仍可查看历史二维码和本人数据。',
      otherDesc: '无分享权限状态不展示本业务入口。'
    }
  }],
  'sa-qr-list': [{
    id: 1,
    target: '.qr-history-list',
    title: '我的二维码',
    position: {placement:'top-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '本人二维码记录',
      functionDesc: '仅展示当前员工账号生成的二维码及有效状态。',
      permissionScope: '当前员工账号。',
      dataSource: '二维码生成记录与冻结快照。',
      valueLogic: '员工主数据变化不回写历史记录。',
      fieldDesc: 'sceneId、生成时间、时长、失效时间、活动数。',
      interactionDesc: '进入详情后可再次保存原二维码或海报。',
      judgeRule: '再次保存保持原sceneId。',
      exceptionRule: '本期不支持手动作废。',
      otherDesc: '移动端无导出。'
    }
  }],
  'sa-qr-detail': [{
    id: 1,
    target: '.qr-share-effect-card',
    title: '二维码客户分享效果',
    position: {placement:'top-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '历史二维码海报预览',
      functionDesc: '二维码详情默认展示客户收到的完整海报，并可切换查看纯二维码。',
      permissionScope: '当前二维码所属员工账号。',
      dataSource: '二维码生成记录、海报文案与来源员工/门店冻结快照。',
      valueLogic: '海报与二维码保持同一sceneId、活动数和来源快照；有效期仅在内部信息区查看。',
      fieldDesc: '标题、副标题、引导语、二维码、活动数、员工姓名、门店。',
      interactionDesc: '默认海报效果；点击二维码后在原区域切换，不跳转新页。',
      judgeRule: '客户海报不展示员工角色、二维码有效期、员工ID、账号ID或sceneId。',
      exceptionRule: '过期记录仍可查看原海报，但海报明确显示已过期。',
      otherDesc: '内部冻结信息在海报下方单独展示。'
    }
  }],
  'sa-poster-editor': [{
    id: 1,
    target: '.poster-source-card',
    title: '员工分享海报',
    position: {placement:'bottom-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '海报编辑与上传',
      functionDesc: '员工可使用系统模板或上传自定义底图，并编辑三段营销文案。',
      permissionScope: '当前员工账号。',
      dataSource: '当前sceneId、员工/门店快照、系统模板或本地图片。',
      valueLogic: '始终叠加二维码、门店与员工姓名；头像可隐藏。海报不展示员工角色或二维码有效期。',
      fieldDesc: 'posterMode、title、subtitle、guide、posterShowAvatar。',
      interactionDesc: '上传或输入后即时预览。',
      judgeRule: '仅支持JPG/PNG，单张不超过10MB。',
      exceptionRule: '格式或大小不合法时保留当前海报。',
      otherDesc: '对客户不展示员工角色、二维码有效期、工号、手机号或账号ID。'
    }
  }],
  'activity-aggregation-unbound': [{
    id: 1,
    target: '.combo-activity-card',
    title: '组合活动绑车前状态',
    position: {placement:'top-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '组合活动单卡片',
      functionDesc: '绑车前展示大活动基本信息，卡券区域整体不渲染。',
      permissionScope: '扫码用户。',
      dataSource: '二维码冻结活动与组合活动基本信息。',
      valueLogic: '没有VIN时不判断人群包。',
      fieldDesc: '活动名、期限和去绑车入口；无卡券占位区。',
      interactionDesc: '不可勾选，可去绑车。',
      judgeRule: '不展示人群包、具体券或待解锁占位。',
      exceptionRule: '绑车完成后不回跳，需重新扫码。',
      otherDesc: '用户侧不展示活动等级分区。'
    }
  }],
  'activity-aggregation': [{
    id: 1,
    target: '.source-card',
    title: '分享员工公开信息',
    position: {placement:'bottom-left',offsetX:8,offsetY:8},
    sections: {
      functionName: '扫码来源展示',
      functionDesc: '仅展示“由{门店}·{员工姓名}分享”和活动数量。',
      permissionScope: '扫码用户。',
      dataSource: 'sceneId内冻结的来源快照。',
      valueLogic: '最终归属在活动成功执行时按最后触点确认。',
      fieldDesc: '门店、员工姓名、活动数量。',
      interactionDesc: '只读展示。',
      judgeRule: '不展示员工角色、二维码有效期、工号、手机号或账号ID。',
      exceptionRule: '历史SA数据仅在后台报表标记。',
      otherDesc: '渠道枚举仍为SA动态二维码。'
    }
  }, {
    id: 2,
    target: '.combo-activity-card',
    title: '组合活动VIN匹配结果',
    position: {placement:'top-right',offsetX:-10,offsetY:8},
    sections: {
      functionName: '组合活动动态卡券',
      functionDesc: '绑车后在原卡片内汇总当前VIN命中的全部卡券。',
      permissionScope: '扫码用户。',
      dataSource: '组合活动、当前VIN和各子活动人群包匹配结果。',
      valueLogic: '组合活动唯一键为组合活动ID + VIN。',
      fieldDesc: '命中子活动数、全部专属卡券和权益。',
      interactionDesc: '切换VIN后刷新原卡片。',
      judgeRule: '同一VIN满足多个子活动时全部执行，无优先级和顺序。',
      exceptionRule: '多重命中不阻断且不记异常。',
      otherDesc: '用户看一张大卡片，报表按子活动拆开。'
    }
  }],
  'sa-customer-list': [{
    id: 1,
    target: '.customer-scope-note',
    title: '本人客户卡券',
    position: {placement:'bottom-right',offsetX:-8,offsetY:8},
    sections: {
      functionName: '客户卡券列表',
      functionDesc: '按客户汇总最终来源员工账号为本人的上线后券实例。',
      permissionScope: '当前服务助手登录员工本人。',
      dataSource: '上线后参与记录、券实例与核销状态。',
      valueLogic: '客户按当前账号 + oneID聚合，页面不展示oneID。',
      fieldDesc: '脱敏手机号、脱敏VIN、券实例数、待核销/已核销/已过期数。',
      interactionDesc: '可按脱敏手机号、后四位或VIN后四位查询并进入客户详情。',
      judgeRule: '仅展示功能上线后产生的券实例，不回补历史。',
      exceptionRule: '已过期券仍可查看；真正已失效的券实例不进入客户列表或详情。无结果时可清除查询条件。',
      otherDesc: '移动端不提供导出。'
    }
  }],
  'sa-customer-detail': [{
    id: 1,
    target: '.customer-share-rule',
    title: '从客户详情再次分享',
    position: {placement:'bottom-right',offsetX:-8,offsetY:8},
    sections: {
      functionName: '发起活动分享',
      functionDesc: '员工自行判断是否再次促销，并从客户详情进入原普通活动分享流程。',
      permissionScope: '所有当前仍有活动分享权限的员工角色。',
      dataSource: '当前员工账号可分享活动池。',
      valueLogic: '新二维码不绑定当前客户，可被转发，不建立原券到新券的特殊链路。',
      fieldDesc: '券实例、来源普通/组合活动、子活动、VIN、参与记录、核销状态。',
      interactionDesc: '点击底部按钮回到活动选择页，再走时长、二维码、海报和微信分享流程。',
      judgeRule: '生成时按普通分享规则校验；实际参与前再次校验准入、互斥和参与唯一性。',
      exceptionRule: '新码仅进入我的二维码；实际领券记录归属于真实扫码参与客户。',
      otherDesc: '系统不定义长期未核销阈值、频控或待跟进任务。'
    }
  }]
};
