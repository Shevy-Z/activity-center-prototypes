(function () {
  'use strict';

  window.SAFrontData = {
    featureLaunchDate: '2026-08-21 00:00:00',
    expiryTagReferenceDate: '2026-08-27',
    source: {
      employeeName: '周凯',
      employeeNo: 'SC10045',
      employeeId: 'EMP10045',
      accountId: 'ACC10045',
      primaryRole: '销售顾问',
      roleCodes: ['ROLE_SALES','ROLE_CS'],
      roleNames: ['销售顾问','客服专员'],
      matchedRoleNames: ['销售顾问'],
      employmentStatus: '在职',
      accountStatus: '有效',
      saName: '周凯',
      saId: 'SC10045',
      storeId: 'S001',
      store: '广州花都专营店',
      sceneId: 'SCN-20260820-10045-0031',
      activityCount: 6
    },
    stores: [
      {id:'S001',code:'GZ-HD-001',name:'广州花都专营店',available:true},
      {id:'S002',code:'FS-NH-002',name:'佛山南海专营店',available:true},
      {id:'S003',code:'DG-LB-003',name:'东莞寮步专营店',available:true},
      {id:'S004',code:'SZ-LG-004',name:'深圳龙岗专营店',available:true}
    ],
    qr: {
      nextSceneId: 'SCN-20260820-10045-0032',
      snapshotVersion: 'V3',
      generatedAt: '2026-08-20 16:10:00',
      expiresAt: '2026-08-20 16:40:00',
      configVersion: 'QR-TTL-V6',
      durationOptions: [
        {minutes:5,label:'5分钟'},
        {minutes:30,label:'30分钟'},
        {minutes:60,label:'1小时'},
        {minutes:360,label:'6小时'},
        {minutes:720,label:'12小时'},
        {minutes:1440,label:'1天'},
        {minutes:-1,label:'长期有效',note:'至活动有效期'}
      ],
      defaultMinutes: 30,
      minMinutes: 5,
      maxMinutes: 1440,
      allowActivityEnd: true
    },
    myQrs: [
      {sceneId:'SCN-20260820-10045-0032',generatedAt:'2026-08-20 16:10',duration:'30分钟',expiresAt:'2026-08-20 16:40',status:'有效',activityCount:6,poster:{title:'您的专属车主福利已送达',subtitle:'多项养护礼遇，扫码查看当前可参与活动',guide:'微信扫一扫，立即查看专属活动'},activities:['夏日车主礼','到店保养抽奖季','夏季养护礼遇','老友焕新券包','夏季专属成长礼','认证车主专享礼']},
      {sceneId:'SCN-20260820-10045-0031',generatedAt:'2026-08-20 14:26',duration:'长期有效',expiresAt:'2026-09-15 23:59',status:'有效',activityCount:3,poster:{title:'夏季养护福利专属推荐',subtitle:'为您精选长期有效的养护活动与车主权益',guide:'扫码查看您的车辆专属礼遇'},activities:['夏季养护礼遇','夏季专属成长礼','认证车主专享礼']},
      {sceneId:'SCN-20260819-10045-0028',generatedAt:'2026-08-19 17:42',duration:'1小时',expiresAt:'2026-08-19 18:42',status:'已过期',activityCount:2,poster:{title:'夏日到店好礼限时开启',subtitle:'领券与抽奖活动一次查看，扫码即可参与',guide:'微信扫一扫，查看活动详情'},activities:['夏日车主礼','到店保养抽奖季']}
    ],
    poster: {
      configId: 'POSTER-RULE-V1',
      configStatus: '已生效',
      configSource: '活动中心后台分享海报规则配置',
      defaultBackgroundName: '东风日产车主礼遇蓝色模板',
      defaultBackgroundRatio: '3:4',
      defaultTitle: '您的专属车主福利已送达',
      defaultSubtitle: '多项养护礼遇，扫码查看当前可参与活动',
      defaultGuide: '微信扫一扫，立即查看专属活动',
      titleMaxLength: 20,
      subtitleMaxLength: 36,
      guideMaxLength: 24
    },
    user: {
      oneId: 'OID****8862',
      mobile: '138****5678',
      defaultVehicleId: 'vehicle-1'
    },
    vehicles: [
      {id:'vehicle-1', model:'轩逸', plate:'粤A·8D23', vin:'LVH******1234', certified:false, isDefault:true},
      {id:'vehicle-2', model:'天籁', plate:'粤B·3K58', vin:'LGB******9066', certified:true, isDefault:false}
    ],
    levels: [
      {key:'number', title:'号码级活动', note:'按当前账号判断参与资格'},
      {key:'vehicle', title:'绑车级活动', note:'按当前所选VIN判断参与资格'},
      {key:'certified', title:'认证级活动', note:'按当前账号与VIN认证关系判断'}
    ],
    activities: [
      {
        id:'ACT-SA-20260705', level:'number', name:'夏日车主礼', description:'领取夏季出行卡券包', type:'coupon', reward:'30元保养抵扣券 + 到店检测券', status:{all:'eligible'}, expiry:'活动至 07月31日', shareNote:'本店适用', shareRoleCodes:['ROLE_SA','ROLE_SALES'],
        period:'2026-07-01 至 2026-07-31', brand:'东风日产、启辰', organizer:'东风日产售后运营',
        rules:['同一账号活动期内限参与1次','符合活动准入条件后即时发券','卡券到账后可在“我的卡券”查看'],
        coupons:[{name:'30元保养抵扣券',quantity:'1张',valid:'领取后30天'},{name:'到店检测券',quantity:'1张',valid:'领取后30天'}],
        benefits:[{name:'车辆健康检测',note:'到店可享1次'}],
        mutex:{group:'MX-SA-NUMBER-001',scope:'number',scopeLabel:'号码级（同一账号）',description:'与“到店保养抽奖季”互斥，同一账号只能参加其中一个活动。'}
      },
      {
        id:'ACT-SA-20260703', level:'number', name:'到店保养抽奖季', description:'抽奖自动执行，无需再次操作', type:'lottery', reward:'最高200元保养券', status:{all:'eligible'}, expiry:'活动至 07月25日', shareNote:'本店适用', shareRoleCodes:['ROLE_SALES','ROLE_CS'],
        period:'2026-07-05 至 2026-07-25', brand:'东风日产、启辰', organizer:'东风日产售后运营',
        rules:['同一账号活动期内限参与1次','点击一键参与后系统自动完成抽奖','中奖卡券即时发放，未中奖也视为活动已参与'],
        coupons:[{name:'200元保养券',quantity:'中奖后1张',valid:'领取后15天'}],
        benefits:[],
        mutex:{group:'MX-SA-NUMBER-001',scope:'number',scopeLabel:'号码级（同一账号）',description:'与“夏日车主礼”互斥，同一账号只能参加其中一个活动。'}
      },
      {
        id:'ACT-SA-20260701', level:'vehicle', name:'夏季养护礼遇', description:'当前车辆可领取2张养护券', type:'coupon', reward:'基础保养抵扣券 + 精品券', status:{'vehicle-1':'eligible','vehicle-2':'participated'}, expiry:'活动至 08月15日', shareNote:'华南区域适用', shareRoleCodes:['ROLE_SERVICE','ROLE_SALES'],
        period:'2026-07-01 至 2026-08-15', brand:'东风日产', organizer:'华南区域售后运营',
        rules:['同一VIN活动期内限参与1次','需当前账号已绑定执行VIN','切换车辆后按新VIN重新校验资格'],
        coupons:[{name:'基础保养抵扣券',quantity:'1张',valid:'领取后45天'},{name:'精品券',quantity:'1张',valid:'领取后45天'}],
        benefits:[{name:'空调系统检测',note:'到店可享1次'}]
      },
      {
        id:'ACT-SA-20260704', level:'vehicle', name:'老友焕新券包', description:'每辆绑定车辆限参与一次', type:'coupon', reward:'保养工时折扣券包', status:{'vehicle-1':'participated','vehicle-2':'eligible'}, expiry:'活动至 08月31日', shareNote:'本店适用', shareRoleCodes:['ROLE_CS'],
        period:'2026-07-10 至 2026-08-31', brand:'东风日产、启辰', organizer:'广州花都专营店',
        rules:['同一VIN活动期内限参与1次','仅限当前门店关联客户参与','券包领取成功后不可重复参加'],
        coupons:[{name:'保养工时折扣券',quantity:'2张',valid:'领取后30天'}],
        benefits:[{name:'续保咨询服务',note:'专属顾问1次'}]
      },
      {
        id:'COMB-SA-20260701', level:'vehicle', name:'2026夏季车主组合活动', displayName:'夏季专属成长礼', description:'一个大活动，绑定车辆后汇总当前VIN命中的全部权益', type:'coupon', isCombo:true, childCount:3, reward:'绑车后查看当前车辆专属卡券', status:{'vehicle-1':'eligible','vehicle-2':'eligible'}, expiry:'活动至 09月15日', shareNote:'指定2家门店', saPlacementEnabled:true, activityState:'ACTIVE', shareRoleCodes:['ROLE_SA','ROLE_SERVICE','ROLE_SALES'], storeScope:{mode:'SPECIFIED',storeIds:['S001','S002']},
        period:'2026-07-05 至 2026-09-15', brand:'东风日产',
        rules:['员工分享链路优先展示组合活动展示名称，未配置时回退原组合活动名称','组合活动以一张活动卡片展示','需绑定车辆并选择当前执行VIN后匹配专属活动','同一VIN可同时命中多个子活动，对应卡券与权益全部发放','组合活动按VIN仅可参与1次，不设子活动优先级和顺序'],
        coupons:[],
        benefits:[],
        matchedRewards:{
          'vehicle-1':[
            {childId:'ACT-COMB-RET-001',reward:'专属保养抵扣券 100元',coupons:[{name:'专属保养抵扣券 100元',quantity:'1张',valid:'领取后30天'}],benefits:[{name:'免费车辆检测',note:'到店可享1次'}]},
            {childId:'ACT-COMB-LOSS-002',reward:'专属回店抵扣券 150元',coupons:[{name:'专属回店抵扣券 150元',quantity:'1张',valid:'领取后30天'}],benefits:[{name:'空调系统检测',note:'到店可享1次'}]}
          ],
          'vehicle-2':[
            {childId:'ACT-COMB-REP-003',reward:'专属精品代金券 80元',coupons:[{name:'专属精品代金券 80元',quantity:'1张',valid:'领取后45天'}],benefits:[{name:'保养工时权益',note:'当前车辆可享1次'}]}
          ]
        }
      },
      {
        id:'COMB-SA-20260702', level:'vehicle', name:'启辰秋季车主组合活动', displayName:'', description:'用于验证展示名称回退、门店与角色过滤，不向当前员工展示', type:'coupon', isCombo:true, childCount:1, reward:'秋季车辆检测券', status:{'vehicle-1':'eligible','vehicle-2':'eligible'}, expiry:'活动至 10月31日', shareNote:'指定1家门店', saPlacementEnabled:true, activityState:'ACTIVE', shareRoleCodes:['ROLE_MANAGER'], storeScope:{mode:'SPECIFIED',storeIds:['S003']},
        period:'2026-09-01 至 2026-10-31', brand:'启辰',
        rules:['未配置展示名称，员工分享链路回退原组合活动名称','当前账号门店或角色未命中时，不进入可查看、可分享列表'],
        coupons:[], benefits:[], matchedRewards:{'vehicle-1':[],'vehicle-2':[]}
      },
      {
        id:'ACT-SA-20260702', level:'certified', name:'认证车主专享礼', description:'完成车主认证后可领取', type:'coupon', reward:'认证车主精品代金券', status:{'vehicle-1':'need-certified','vehicle-2':'eligible'}, expiry:'活动至 09月15日', shareNote:'全国适用', shareRoleCodes:['ROLE_SALES','ROLE_SERVICE'],
        period:'2026-07-01 至 2026-09-15', brand:'东风日产、启辰', organizer:'东风日产售后运营',
        rules:['当前账号与执行VIN需完成1:1车主认证','同一认证关系活动期内限参与1次','完成认证后需重新扫码进入活动页'],
        coupons:[{name:'认证车主精品代金券',quantity:'1张',valid:'领取后60天'}],
        benefits:[{name:'认证车主专属服务标识',note:'认证关系有效期内'}]
      }
    ],
    customerCoupons: [
      {
        id:'CUS-20260821-006638',oneId:'OID****6638',mobile:'135****6638',vins:['LVH******9216'],lastClaimed:'2026-08-21 10:46',couponCount:4,pendingCount:2,redeemedCount:2,expiredCount:0,
        couponInstances:[
          {id:'CPN-68210001',templateId:'TPL-SA-3001',name:'30元保养抵扣券',activityObjectType:'普通活动',activityId:'ACT-SA-20260705',activityName:'夏日车主礼',participationId:'PAR-20260821-001028',childExecutionId:'-',vin:'-',claimedAt:'2026-08-21 10:46',expiresAt:'2026-09-02',couponStatus:'已激活',redemptionStatus:'未核销',redeemedAt:'-'},
          {id:'CPN-68210002',templateId:'TPL-SA-3002',name:'到店检测券',activityObjectType:'普通活动',activityId:'ACT-SA-20260705',activityName:'夏日车主礼',participationId:'PAR-20260821-001028',childExecutionId:'-',vin:'-',claimedAt:'2026-08-21 10:46',expiresAt:'2026-08-30',couponStatus:'已核销',redemptionStatus:'已核销',redeemedAt:'2026-08-21 12:08'},
          {id:'CPN-68210003',templateId:'TPL-COMB-5201',name:'留存车主保养券',activityObjectType:'组合子活动',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'留存人群包',activityId:'ACT-COMB-RET-001',activityName:'留存车主专属礼',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-01',vin:'LVH******9216',claimedAt:'2026-08-21 10:14',expiresAt:'2026-08-31',couponStatus:'已激活',redemptionStatus:'未核销',redeemedAt:'-'},
          {id:'CPN-68210004',templateId:'TPL-COMB-5202',name:'流失车主唤回券',activityObjectType:'组合子活动',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'流失人群包',activityId:'ACT-COMB-LOSS-002',activityName:'流失车主唤回礼',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-02',vin:'LVH******9216',claimedAt:'2026-08-21 10:14',expiresAt:'2026-08-29',couponStatus:'已核销',redemptionStatus:'已核销',redeemedAt:'2026-08-21 13:22'}
        ]
      },
      {
        id:'CUS-20260821-002371',oneId:'OID****2371',mobile:'188****2371',vins:['LGB******1058'],lastClaimed:'2026-08-21 09:18',couponCount:2,pendingCount:1,redeemedCount:0,expiredCount:1,
        couponInstances:[
          {id:'CPN-68210005',templateId:'TPL-SA-4108',name:'基础保养抵扣券',activityObjectType:'普通活动',activityId:'ACT-SA-20260701',activityName:'夏季养护礼遇',participationId:'PAR-20260821-001019',childExecutionId:'-',vin:'LGB******1058',claimedAt:'2026-08-21 09:18',expiresAt:'2026-09-03',couponStatus:'已激活',redemptionStatus:'未核销',redeemedAt:'-'},
          {id:'CPN-68210006',templateId:'TPL-COMB-5203',name:'复购车主精品券',activityObjectType:'组合子活动',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'复购人群包',activityId:'ACT-COMB-REP-003',activityName:'复购车主进阶礼',participationId:'PAR-COMB-20260821-0008',childExecutionId:'CEX-20260821-0008-01',vin:'LGB******1058',claimedAt:'2026-08-21 09:06',expiresAt:'2026-08-24',couponStatus:'已过期',redemptionStatus:'未核销',redeemedAt:'-'}
        ]
      }
    ],
    saReport: {
      range: '近30日',
      summary: [
        {key:'scan', label:'扫码人数', value:'328', note:'本人二维码扫码UV'},
        {key:'participation', label:'成功参与记录', value:'214', note:'组合活动按子活动拆开'},
        {key:'coupon', label:'领券数', value:'269', note:'本人活动产生券实例'},
        {key:'redeem', label:'已核销数', value:'96', note:'成功核销券实例'}
      ],
      summary7d: [
        {key:'scan', label:'扫码人数', value:'96', note:'本人二维码扫码UV'},
        {key:'participation', label:'成功参与记录', value:'67', note:'组合活动按子活动拆开'},
        {key:'coupon', label:'领券数', value:'84', note:'本人活动产生券实例'},
        {key:'redeem', label:'已核销数', value:'21', note:'成功核销券实例'}
      ],
      ratios: [
        {label:'活动参与转化率', value:'56.7%', note:'参与主体 ÷ 识别用户'},
        {label:'卡券核销率', value:'39.8%', note:'已核销 ÷ 已发放'},
        {label:'抽奖 / 中奖', value:'62 / 21', note:'中奖率33.9%'},
        {label:'跨店核销', value:'7', note:'来源门店与核销门店不同'}
      ],
      ratios7d: [
        {label:'活动参与转化率', value:'60.4%', note:'参与主体 ÷ 识别用户'},
        {label:'卡券核销率', value:'28.0%', note:'已核销 ÷ 已发放'},
        {label:'抽奖 / 中奖', value:'18 / 6', note:'中奖率33.3%'},
        {label:'跨店核销', value:'2', note:'来源门店与核销门店不同'}
      ],
      trend: [
        {day:'07/11', scan:9, participation:5},
        {day:'07/12', scan:11, participation:6},
        {day:'07/13', scan:12, participation:7},
        {day:'07/14', scan:14, participation:8},
        {day:'07/15', scan:15, participation:9},
        {day:'07/16', scan:16, participation:10},
        {day:'07/17', scan:19, participation:13}
      ],
      activities: [
        {
          id:'ACT-SA-20260705', name:'夏日车主礼', level:'number', type:'coupon', status:'进行中',
          participation:86, coupons:142, draws:'—', wins:'—', last:'07-17 14:26', conversion:'61.9%',
          records:[
            {id:'PAR-SA-0717-0086', time:'2026-07-17 14:26:18', mobile:'138****5678', vin:'—', level:'号码级', type:'领券', result:'领取成功', couponCount:2, store:'广州花都专营店', validation:'手机号识别 → 活动准入 → 互斥组校验 → 未参与校验', coupons:'30元保养抵扣券、到店检测券'},
            {id:'PAR-SA-0717-0081', time:'2026-07-17 13:48:05', mobile:'186****2309', vin:'—', level:'号码级', type:'领券', result:'领取成功', couponCount:2, store:'广州花都专营店', validation:'手机号识别 → 活动准入 → 互斥组校验 → 未参与校验', coupons:'30元保养抵扣券、到店检测券'}
          ]
        },
        {
          id:'ACT-SA-20260703', name:'到店保养抽奖季', level:'number', type:'lottery', status:'进行中',
          participation:62, coupons:21, draws:62, wins:21, last:'07-17 14:18', conversion:'49.6%',
          records:[
            {id:'PAR-SA-0717-0079', time:'2026-07-17 14:18:33', mobile:'139****1186', vin:'—', level:'号码级', type:'抽奖', result:'中奖', couponCount:1, store:'广州花都专营店', validation:'手机号识别 → 互斥组校验 → 抽奖次数 → 未参与校验', coupons:'200元保养券'},
            {id:'PAR-SA-0717-0067', time:'2026-07-17 11:32:09', mobile:'137****8092', vin:'—', level:'号码级', type:'抽奖', result:'未中奖', couponCount:0, store:'广州花都专营店', validation:'手机号识别 → 互斥组校验 → 抽奖次数 → 未参与校验', coupons:'—'}
          ]
        },
        {
          id:'ACT-SA-20260701', name:'夏季养护礼遇', level:'vehicle', type:'coupon', status:'进行中',
          participation:38, coupons:78, draws:'—', wins:'—', last:'07-17 13:57', conversion:'52.1%',
          records:[
            {id:'PAR-SA-0717-0072', time:'2026-07-17 13:57:42', mobile:'136****7721', vin:'LVH******4528', level:'绑车级', type:'领券', result:'领取成功', couponCount:2, store:'广州花都专营店', validation:'默认VIN → 绑定关系 → VIN未参与校验', coupons:'基础保养抵扣券、精品券'}
          ]
        },
        {
          id:'ACT-COMB-RET-001', parentId:'COMB-SA-20260701', parentName:'夏季专属成长礼', segment:'留存人群包', name:'留存车主专属礼', level:'vehicle', type:'coupon', status:'进行中',
          participation:17, coupons:17, draws:'—', wins:'—', last:'07-17 13:42', conversion:'23.3%',
          records:[
            {id:'PAR-COMB-0717-0048', time:'2026-07-17 13:42:16', mobile:'135****6638', vin:'LVH******9216', level:'绑车级', type:'领券', result:'领取成功', couponCount:1, store:'广州花都专营店', validation:'默认VIN → 组合活动准入 → 留存人群包命中 → 组合活动未参与校验', coupons:'留存车主保养券'}
          ]
        },
        {
          id:'ACT-COMB-LOSS-002', parentId:'COMB-SA-20260701', parentName:'夏季专属成长礼', segment:'流失人群包', name:'流失车主唤回礼', level:'vehicle', type:'coupon', status:'进行中',
          participation:11, coupons:11, draws:'—', wins:'—', last:'07-17 12:19', conversion:'15.1%',
          records:[
            {id:'PAR-COMB-0717-0036', time:'2026-07-17 12:19:08', mobile:'188****2371', vin:'LGB******1058', level:'绑车级', type:'领券', result:'领取成功', couponCount:1, store:'广州花都专营店', validation:'默认VIN → 组合活动准入 → 流失人群包命中 → 组合活动未参与校验', coupons:'流失车主唤回券'}
          ]
        }
      ],
      coupons: [
        {id:'TPL-SA-3001', name:'30元保养抵扣券', activity:'夏日车主礼', issued:96, redeemed:42, expired:6, redemptionRate:'43.8%', cross:3, status:'已生效', owner:'号码级', valid:'领取后30天', last:'07-17 14:26', timeline:['07-17 14:26 最近发放','07-17 13:12 本店核销','07-16 18:42 跨店核销']},
        {id:'TPL-SA-2009', name:'200元保养券', activity:'到店保养抽奖季', issued:21, redeemed:8, expired:1, redemptionRate:'38.1%', cross:1, status:'已生效', owner:'号码级', valid:'领取后15天', last:'07-17 14:18', timeline:['07-17 14:18 抽奖发放','07-17 10:36 本店核销','07-15 16:08 到期失效']},
        {id:'TPL-SA-4108', name:'基础保养抵扣券', activity:'夏季养护礼遇', issued:78, redeemed:31, expired:4, redemptionRate:'39.7%', cross:3, status:'已生效', owner:'绑车级', valid:'领取后45天', last:'07-17 13:57', timeline:['07-17 13:57 最近发放','07-17 09:44 本店核销','07-16 15:20 跨店核销']},
        {id:'TPL-COMB-5201', name:'留存车主保养券', activity:'夏季专属成长礼 / 留存车主专属礼', issued:17, redeemed:6, expired:0, redemptionRate:'35.3%', cross:1, status:'已生效', owner:'组合子活动', valid:'领取后30天', last:'07-17 13:42', timeline:['07-17 13:42 最近领券','07-17 12:06 本店核销','07-16 17:20 跨店核销']},
        {id:'TPL-COMB-5202', name:'流失车主唤回券', activity:'夏季专属成长礼 / 流失车主唤回礼', issued:11, redeemed:3, expired:0, redemptionRate:'27.3%', cross:0, status:'已生效', owner:'组合子活动', valid:'领取后30天', last:'07-17 12:19', timeline:['07-17 12:19 最近领券','07-16 16:33 本店核销']}
      ]
    }
  };
})();
