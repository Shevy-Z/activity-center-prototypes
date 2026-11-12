(function () {
  'use strict';

  window.SAReportData = {
    featureLaunchDate: '2026-08-21 00:00:00',
    meta: {
      brands: ['东风日产', '启辰'],
      regions: ['华南一区', '华南二区', '华东一区'],
      stores: ['广州花都专营店', '佛山南海专营店', '东莞寮步专营店', '深圳龙岗专营店'],
      employees: ['陈晓明 / ACC10086', '李佳 / ACC10023', '周凯 / ACC10045', '王敏 / ACC10061', '赵晨 / 历史SA数据'],
      roles: ['SA', '服务顾问', '销售顾问', '客服专员', '门店经理'],
      activities: ['夏季养护礼遇', '认证车主焕新礼', '到店保养抽奖季', '老友焕新券包'],
      coupons: ['基础保养抵扣券', '到店检测券', '精品代金券', '保养工时折扣券']
    },
    stores: [
      {id:'S001',code:'GZ-HD-001',name:'广州花都专营店',available:true},
      {id:'S002',code:'FS-NH-002',name:'佛山南海专营店',available:true},
      {id:'S003',code:'DG-LB-003',name:'东莞寮步专营店',available:true},
      {id:'S004',code:'SZ-LG-004',name:'深圳龙岗专营店',available:true}
    ],
    employees: [
      {accountId:'ACC10086',employeeId:'EMP10086',employeeNo:'SA10086',name:'陈晓明',storeCode:'GZ-HD-001',store:'广州花都专营店',roles:['SA','服务顾问'],primaryRole:'SA',status:'在职',accountStatus:'有效'},
      {accountId:'ACC10023',employeeId:'EMP10023',employeeNo:'SV10023',name:'李佳',storeCode:'FS-NH-002',store:'佛山南海专营店',roles:['服务顾问'],primaryRole:'服务顾问',status:'在职',accountStatus:'有效'},
      {accountId:'ACC10045',employeeId:'EMP10045',employeeNo:'SC10045',name:'周凯',storeCode:'DG-LB-003',store:'东莞寮步专营店',roles:['销售顾问','客服专员'],primaryRole:'销售顾问',status:'在职',accountStatus:'有效'},
      {accountId:'ACC10061',employeeId:'EMP10061',employeeNo:'CS10061',name:'王敏',storeCode:'SZ-LG-004',store:'深圳龙岗专营店',roles:['客服专员'],primaryRole:'客服专员',status:'在职',accountStatus:'有效'}
    ],
    roleOptions: [
      {code:'ROLE_SA',name:'SA',enabled:true},{code:'ROLE_SERVICE',name:'服务顾问',enabled:true},{code:'ROLE_SALES',name:'销售顾问',enabled:true},{code:'ROLE_CS',name:'客服专员',enabled:true},{code:'ROLE_MANAGER',name:'门店经理',enabled:true}
    ],
    activityConfigs: [
      {id:'ACT-SA-20260701',name:'夏季养护礼遇',brand:'东风日产',business:'维保活动',activityType:'领券',trigger:'C端主动领取',claimMode:'一键领取',level:'绑车级',accessEnabled:'启用',checkpoints:['进入活动','领券前'],status:'已启用',time:'2026-07-01 至 2026-08-31',storeScope:'华南一区授权专营店',shareRoleCodes:['ROLE_SA','ROLE_SERVICE'],shareRoleNames:['SA','服务顾问'],couponIds:['TPL-CP-10021','TPL-CP-10025'],coupons:['基础保养抵扣券','到店检测券'],rights:['免费车辆检测'],mutexIds:['ACT-SA-20260704'],mutexSubject:'VIN'},
      {id:'ACT-SA-20260702',name:'认证车主焕新礼',brand:'东风日产',business:'会员权益',activityType:'领券',trigger:'C端主动参与',claimMode:'一键领取',level:'认证级',accessEnabled:'启用',checkpoints:['进入活动','领券前'],status:'已启用',time:'2026-07-05 至 2026-08-20',storeScope:'华南一区授权专营店',shareRoleCodes:['ROLE_SERVICE','ROLE_MANAGER'],shareRoleNames:['服务顾问','门店经理'],couponIds:['TPL-CP-10018'],coupons:['精品代金券'],rights:['认证车主专属工时权益'],mutexIds:[],mutexSubject:'认证关系'},
      {id:'ACT-SA-20260703',name:'到店保养抽奖季',brand:'东风日产',business:'维保活动',activityType:'抽奖',trigger:'C端主动参与',claimMode:'自动抽奖',level:'号码级',accessEnabled:'启用',checkpoints:['进入活动','抽奖前'],status:'已启用',time:'2026-07-10 至 2026-07-31',storeScope:'华南全区授权专营店',shareRoleCodes:['ROLE_SA','ROLE_SALES','ROLE_CS'],shareRoleNames:['SA','销售顾问','客服专员'],couponIds:['TPL-CP-10025'],coupons:['到店检测券'],rights:['抽奖资格'],mutexIds:['ACT-SA-20260706'],mutexSubject:'oneID'},
      {id:'ACT-SA-20260704',name:'老友焕新券包',brand:'东风日产',business:'维保活动',activityType:'领券',trigger:'C端主动领取',claimMode:'一键领取',level:'绑车级',accessEnabled:'启用',checkpoints:['进入活动','领券前'],status:'草稿',time:'2026-08-01 至 2026-09-30',storeScope:'华南一区授权专营店',shareRoleCodes:['ROLE_SERVICE'],shareRoleNames:['服务顾问'],couponIds:['TPL-CP-10029'],coupons:['保养工时折扣券'],rights:['免费车辆检测'],mutexIds:['ACT-SA-20260701'],mutexSubject:'VIN'},
      {id:'ACT-OPS-20260705',name:'夏季关怀统一发券',brand:'东风日产',business:'维保活动',activityType:'领券',trigger:'后台统一推送',claimMode:'自动领取',level:'号码级',accessEnabled:'启用',checkpoints:['触发发券前'],status:'已启用',time:'2026-07-01 至 2026-07-31',storeScope:'全国授权专营店',shareRoleCodes:[],shareRoleNames:[],couponIds:['TPL-CP-10021'],coupons:['基础保养抵扣券'],rights:[],mutexIds:[],mutexSubject:'oneID'},
      {id:'ACT-SA-20260706',name:'夏日会员抽奖礼',brand:'东风日产',business:'会员权益',activityType:'抽奖',trigger:'C端主动参与',claimMode:'自动抽奖',level:'号码级',accessEnabled:'启用',checkpoints:['进入活动','抽奖前'],status:'未启用',time:'2026-08-01 至 2026-08-31',storeScope:'华南全区授权专营店',shareRoleCodes:['ROLE_SA'],shareRoleNames:['SA'],couponIds:['TPL-CP-10018'],coupons:['精品代金券'],rights:['抽奖资格'],mutexIds:['ACT-SA-20260703'],mutexSubject:'oneID'}
    ],
    saPlacements: [
      {id:'SA-PUT-20260701',name:'夏季车主关怀投放',objectType:'普通活动',objectId:'ACT-SA-20260701',objectName:'夏季养护礼遇',brand:'东风日产',activityCount:1,levelSummary:'绑车级',status:'已生效',time:'2026-07-01 至 2026-08-31',updated:'2026-07-17 11:26:08',operator:'王运营'},
      {id:'SA-PUT-20260702',name:'夏季专属成长礼投放',objectType:'组合活动',objectId:'COMB-SA-20260701',objectName:'夏季专属成长礼',objectOriginalName:'2026夏季车主组合活动',brand:'东风日产',activityCount:3,levelSummary:'绑车级',status:'已生效',time:'2026-07-05 至 2026-09-15',updated:'2026-08-10 15:20:00',operator:'李运营'},
      {id:'SA-PUT-20260703',name:'到店保养抽奖投放',objectType:'普通活动',objectId:'ACT-SA-20260703',objectName:'到店保养抽奖季',brand:'东风日产',activityCount:1,levelSummary:'号码级',status:'已生效',time:'2026-07-10 至 2026-07-31',updated:'2026-07-17 10:31:17',operator:'周运营'},
      {id:'SA-PUT-20260704',name:'认证焕新礼投放',objectType:'普通活动',objectId:'ACT-SA-20260702',objectName:'认证车主焕新礼',brand:'东风日产',activityCount:1,levelSummary:'认证级',status:'草稿',time:'2026-07-05 至 2026-08-20',updated:'2026-07-17 09:44:02',operator:'王运营'}
    ],
    comboActivities: [
      {id:'COMB-SA-20260701',name:'2026夏季车主组合活动',displayName:'夏季专属成长礼',brand:'东风日产',time:'2026-07-05 至 2026-09-15',level:'绑车级',active:true,shareRoleCodes:['ROLE_SA','ROLE_SERVICE','ROLE_SALES'],shareRoleNames:['SA','服务顾问','销售顾问'],storeScope:{mode:'SPECIFIED',storeIds:['S001','S002']},children:[
        {id:'ACT-COMB-RET-001',segment:'留存人群包',coupon:'专属保养抵扣券 100元',benefit:'免费车辆检测'},
        {id:'ACT-COMB-LOSS-002',segment:'流失人群包',coupon:'专属回店抵扣券 150元',benefit:'空调系统检测'},
        {id:'ACT-COMB-REP-003',segment:'复购人群包',coupon:'精品代金券 80元',benefit:'保养工时权益'}
      ]},
      {id:'COMB-SA-20260702',name:'启辰秋季车主组合活动',displayName:'',brand:'启辰',time:'2026-09-01 至 2026-10-31',level:'号码级',active:true,shareRoleCodes:['ROLE_MANAGER'],shareRoleNames:['门店经理'],storeScope:{mode:'ALL',storeIds:[]},children:[
        {id:'ACT-COMB-VEN-001',segment:'启辰活跃车主人群包',coupon:'启辰秋季检测券',benefit:'秋季车辆检测'}
      ]}
    ],
    saQrSettings: {
      minMinutes: 5,
      maxMinutes: 1440,
      durationOptions: [5,30,60,360,720,1440,-1],
      defaultMinutes: 30,
      allowActivityEnd: true,
      version: 'QR-TTL-V6',
      updated: '2026-08-14 10:20:00',
      operator: '王运营'
    },
    mutexRelations: [
      {id:'MUTEX-ACT-001',activityA:'ACT-SA-20260701',nameA:'夏季养护礼遇',levelA:'绑车级',activityB:'ACT-SA-20260704',nameB:'老友焕新券包',levelB:'绑车级',subject:'VIN',source:'活动编辑-选择互斥活动',status:'已生效',updated:'2026-07-17 10:12:36'},
      {id:'MUTEX-ACT-002',activityA:'ACT-SA-20260703',nameA:'到店保养抽奖季',levelA:'号码级',activityB:'ACT-SA-20260706',nameB:'夏日会员抽奖礼',levelB:'号码级',subject:'oneID',source:'活动编辑-选择互斥活动',status:'待生效',updated:'2026-07-17 10:28:09'}
    ],
    activityOverview: {
      kpis: [
        {key:'qr', label:'生成二维码数', value:'128', note:'较上期 +12.3%', target:'activity-qr'},
        {key:'scan', label:'扫码UV', value:'3,240', note:'识别成功 3,118', target:'activity-qr'},
        {key:'participation', label:'成功参与记录', value:'1,126', note:'组合活动按子活动拆分', target:'activity-participation'},
        {key:'coupon', label:'领券数', value:'1,986', note:'含VIN共享券 316', target:'coupon-claim'},
        {key:'rate', label:'员工分享转化率', value:'34.8%', note:'成功参与记录 / 扫码UV', target:'activity-participation'}
      ],
      trend: [
        {day:'07-11', scan:310, participation:102}, {day:'07-12', scan:365, participation:126},
        {day:'07-13', scan:402, participation:138}, {day:'07-14', scan:438, participation:155},
        {day:'07-15', scan:501, participation:176}, {day:'07-16', scan:552, participation:205},
        {day:'07-17', scan:672, participation:224}
      ],
      ranks: [
        {name:'陈晓明 · SA', value:286}, {name:'李佳 · 服务顾问', value:241}, {name:'周凯 · 销售顾问', value:198}, {name:'王敏 · 客服专员', value:176}, {name:'赵晨 · 历史SA', value:142}
      ],
      rows: [
        {saId:'SA10086',saName:'陈晓明',sourceAccountId:'ACC10086',sourceEmployeeId:'EMP10086',employeeName:'陈晓明',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',store:'广州花都专营店',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',level:'绑车级',type:'领券',scanUv:748,eligible:426,participation:286,coupons:532,rate:'38.2%',last:'2026-07-17 09:42:18'},
        {saId:'SV10023',saName:'李佳',sourceAccountId:'ACC10023',sourceEmployeeId:'EMP10023',employeeName:'李佳',primaryRole:'服务顾问',matchedRoles:['服务顾问'],sourceType:'当前员工',store:'佛山南海专营店',activityId:'ACT-SA-20260702',activity:'认证车主焕新礼',level:'认证级',type:'领券',scanUv:621,eligible:355,participation:241,coupons:418,rate:'38.8%',last:'2026-07-17 09:31:04'},
        {saId:'SC10045',saName:'周凯',sourceAccountId:'ACC10045',sourceEmployeeId:'EMP10045',employeeName:'周凯',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'东莞寮步专营店',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'留存人群包',activityId:'ACT-COMB-RET-001',activity:'留存车主专属礼',level:'绑车级',type:'领券',scanUv:566,eligible:498,participation:198,coupons:236,rate:'35.0%',last:'2026-07-17 09:08:27'},
        {saId:'CS10061',saName:'王敏',sourceAccountId:'ACC10061',sourceEmployeeId:'EMP10061',employeeName:'王敏',primaryRole:'客服专员',matchedRoles:['客服专员'],sourceType:'当前员工',store:'深圳龙岗专营店',activityId:'ACT-SA-20260703',activity:'到店保养抽奖季',level:'号码级',type:'抽奖',scanUv:493,eligible:301,participation:176,coupons:152,rate:'35.7%',last:'2026-07-17 08:51:32'},
        {saId:'SA10072',saName:'赵晨',sourceAccountId:'--',sourceEmployeeId:'--',employeeName:'赵晨',primaryRole:'SA',matchedRoles:['SA'],sourceType:'历史SA数据',store:'广州番禺专营店',activityId:'ACT-SA-20260703',activity:'到店保养抽奖季',level:'号码级',type:'抽奖',scanUv:416,eligible:362,participation:142,coupons:98,rate:'34.1%',last:'2026-07-17 08:36:10'}
      ]
    },
    qrRows: [
      {sceneId:'SCN-20260717-10086-0088',saId:'SA10086',saName:'陈晓明',sourceAccountId:'ACC10086',employeeName:'陈晓明',primaryRole:'SA',allRoles:['SA','服务顾问'],matchedRoles:['SA','服务顾问'],sourceType:'当前员工',store:'广州花都专营店',scope:'部分活动',count:4,version:'V3',generated:'2026-07-17 09:20:00',expires:'2026-07-17 09:50:00',status:'有效',scanPv:86,scanUv:72,identified:69,participation:31,coupons:58,previous:'SCN-20260717-10086-0087',next:'-'},
      {sceneId:'SCN-20260717-10023-0061',saId:'SV10023',saName:'李佳',sourceAccountId:'ACC10023',employeeName:'李佳',primaryRole:'服务顾问',allRoles:['服务顾问'],matchedRoles:['服务顾问'],sourceType:'当前员工',store:'佛山南海专营店',scope:'全部活动',count:7,version:'V5',generated:'2026-07-17 08:40:00',expires:'2026-07-17 09:10:00',status:'已过期',scanPv:114,scanUv:98,identified:95,participation:43,coupons:72,previous:'-',next:'-'},
      {sceneId:'SCN-20260717-10045-0042',saId:'SC10045',saName:'周凯',sourceAccountId:'ACC10045',employeeName:'周凯',primaryRole:'销售顾问',allRoles:['销售顾问','客服专员'],matchedRoles:['销售顾问'],sourceType:'当前员工',store:'东莞寮步专营店',scope:'部分活动',count:3,version:'V2',generated:'2026-07-17 08:20:00',expires:'2026-07-17 08:50:00',status:'重新生成失效',scanPv:47,scanUv:39,identified:38,participation:16,coupons:11,previous:'-',next:'SCN-20260717-10045-0043'},
      {sceneId:'SCN-20260717-10061-0037',saId:'CS10061',saName:'王敏',sourceAccountId:'ACC10061',employeeName:'王敏',primaryRole:'客服专员',allRoles:['客服专员'],matchedRoles:['客服专员'],sourceType:'当前员工',store:'深圳龙岗专营店',scope:'部分活动',count:5,version:'V4',generated:'2026-07-17 07:55:00',expires:'2026-07-17 08:25:00',status:'已过期',scanPv:92,scanUv:81,identified:77,participation:29,coupons:56,previous:'-',next:'-'},
      {sceneId:'SCN-20260716-10086-0087',saId:'SA10086',saName:'陈晓明',store:'广州花都专营店',scope:'部分活动',count:4,version:'V3',generated:'2026-07-16 16:20:00',expires:'2026-07-16 16:50:00',status:'重新生成失效',scanPv:133,scanUv:109,identified:105,participation:48,coupons:86,previous:'-',next:'SCN-20260717-10086-0088'},
      {sceneId:'SCN-20260716-10072-0026',saId:'SA10072',saName:'赵晨',sourceAccountId:'--',employeeName:'赵晨',primaryRole:'SA',allRoles:['SA'],matchedRoles:['SA'],sourceType:'历史SA数据',store:'广州番禺专营店',scope:'全部活动',count:6,version:'V3',generated:'2026-07-16 15:45:00',expires:'2026-07-16 16:15:00',status:'已过期',scanPv:76,scanUv:65,identified:62,participation:24,coupons:19,previous:'-',next:'-'}
    ],
    customerRows: [
      {customerKey:'ACC10045|OID****6638',customerId:'CUS-20260821-006638',oneId:'OID****6638',mobile:'135****6638',vins:['LVH******9216'],employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',couponCount:4,pendingCount:2,redeemedCount:2,expiredCount:0,ordinaryActivityCount:1,comboActivityCount:1,lastClaimed:'2026-08-21 10:46:18'},
      {customerKey:'ACC10045|OID****2371',customerId:'CUS-20260821-002371',oneId:'OID****2371',mobile:'188****2371',vins:['LGB******1058'],employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问','客服专员'],sourceType:'当前员工',store:'广州花都专营店',couponCount:2,pendingCount:1,redeemedCount:0,expiredCount:1,ordinaryActivityCount:1,comboActivityCount:1,lastClaimed:'2026-08-21 09:18:06'},
      {customerKey:'ACC10086|OID****8862',customerId:'CUS-20260821-008862',oneId:'OID****8862',mobile:'138****5678',vins:['LVH******1234'],employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',store:'广州花都专营店',couponCount:2,pendingCount:1,redeemedCount:1,expiredCount:0,ordinaryActivityCount:1,comboActivityCount:0,lastClaimed:'2026-08-21 08:42:18'}
    ],
    participationRows: [
      {id:'PAR-20260821-001028',participationId:'PAR-20260821-001028',customerKey:'ACC10045|OID****6638',activityId:'ACT-SA-20260705',activity:'夏日车主礼',level:'号码级',type:'领券',oneId:'OID****6638',mobile:'135****6638',vin:'-',subject:'oneID尾号6638',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781028',participated:'2026-08-21 10:46:18',confirmed:'2026-08-21 10:46:18',result:'领取成功',couponCount:2,coupons:['CPN-68210001','CPN-68210002'],validation:['oneID识别：通过','号码级参与唯一性：通过','活动准入与互斥校验：通过'],dataScope:'功能上线后'},
      {id:'CEX-20260821-0009-01',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-01',customerKey:'ACC10045|OID****6638',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'留存人群包',activityId:'ACT-COMB-RET-001',activity:'留存车主专属礼',level:'绑车级',type:'领券',oneId:'OID****6638',mobile:'135****6638',vin:'LVH******9216',subject:'VIN尾号9216',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781014',participated:'2026-08-21 10:14:32',confirmed:'2026-08-21 10:14:32',result:'领取成功',couponCount:1,coupons:['CPN-68210003'],validation:['oneID识别：通过','当前VIN绑定关系：通过','组合活动ID+VIN唯一性：通过','留存人群包：命中'],dataScope:'功能上线后'},
      {id:'CEX-20260821-0009-02',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-02',customerKey:'ACC10045|OID****6638',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'流失人群包',activityId:'ACT-COMB-LOSS-002',activity:'流失车主唤回礼',level:'绑车级',type:'领券',oneId:'OID****6638',mobile:'135****6638',vin:'LVH******9216',subject:'VIN尾号9216',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781014',participated:'2026-08-21 10:14:32',confirmed:'2026-08-21 10:14:32',result:'领取成功',couponCount:1,coupons:['CPN-68210004'],validation:['oneID识别：通过','当前VIN绑定关系：通过','组合活动ID+VIN唯一性：通过','流失人群包：命中'],dataScope:'功能上线后'},
      {id:'PAR-20260821-001019',participationId:'PAR-20260821-001019',customerKey:'ACC10045|OID****2371',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',level:'绑车级',type:'领券',oneId:'OID****2371',mobile:'188****2371',vin:'LGB******1058',subject:'VIN尾号1058',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0047',scanId:'SCAN-260821-781019',participated:'2026-08-21 09:18:06',confirmed:'2026-08-21 09:18:06',result:'领取成功',couponCount:1,coupons:['CPN-68210005'],validation:['oneID识别：通过','当前VIN绑定关系：通过','绑车级参与唯一性：通过'],dataScope:'功能上线后'},
      {id:'CEX-20260821-0008-01',participationId:'PAR-COMB-20260821-0008',childExecutionId:'CEX-20260821-0008-01',customerKey:'ACC10045|OID****2371',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'复购人群包',activityId:'ACT-COMB-REP-003',activity:'复购车主进阶礼',level:'绑车级',type:'领券',oneId:'OID****2371',mobile:'188****2371',vin:'LGB******1058',subject:'VIN尾号1058',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0047',scanId:'SCAN-260821-781006',participated:'2026-08-21 09:06:11',confirmed:'2026-08-21 09:06:11',result:'领取成功',couponCount:1,coupons:['CPN-68210006'],validation:['oneID识别：通过','当前VIN绑定关系：通过','组合活动ID+VIN唯一性：通过','复购人群包：命中'],dataScope:'功能上线后'},
      {id:'PAR-20260821-001012',participationId:'PAR-20260821-001012',customerKey:'ACC10086|OID****8862',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',level:'绑车级',type:'领券',oneId:'OID****8862',mobile:'138****5678',vin:'LVH******1234',subject:'VIN尾号1234',sa:'陈晓明 SA10086',employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260821-10086-0092',scanId:'SCAN-260821-781012',participated:'2026-08-21 08:42:18',confirmed:'2026-08-21 08:42:18',result:'领取成功',couponCount:2,coupons:['CPN-68210007','CPN-68210008'],validation:['oneID识别：通过','当前VIN绑定关系：通过','绑车级参与唯一性：通过'],dataScope:'功能上线后'},
      {id:'PAR-20260717-009812',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',level:'绑车级',type:'领券',oneId:'OID****8862',mobile:'138****5678',vin:'LVH******1234',subject:'VIN尾号1234',sa:'陈晓明 SA10086',employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',store:'广州花都专营店',sceneId:'SCN-20260717-10086-0088',scanId:'SCAN-240717-658812',participated:'2026-07-17 09:42:18',confirmed:'2026-07-17 09:42:18',result:'领取成功',couponCount:2,coupons:['CPN-66002818','CPN-66002819'],validation:['oneID识别：通过','当前VIN绑定关系：通过','绑车级参与唯一性：通过']},
      {id:'PAR-20260717-009811',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'留存人群包',activityId:'ACT-COMB-RET-001',activity:'留存车主专属礼',level:'绑车级',type:'领券',oneId:'OID****1087',mobile:'186****2190',vin:'LGB******8092',subject:'VIN尾号8092',sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',store:'东莞寮步专营店',sceneId:'SCN-20260717-10045-0043',scanId:'SCAN-240717-658807',participated:'2026-07-17 09:39:06',confirmed:'2026-07-17 09:39:06',result:'领取成功',couponCount:1,coupons:['CPN-66002802'],validation:['oneID识别：通过','当前VIN绑定关系：通过','组合活动ID+VIN唯一性：通过','留存人群包：命中']},
      {id:'PAR-20260717-009808',activityId:'ACT-SA-20260702',activity:'认证车主焕新礼',level:'认证级',type:'领券',oneId:'OID****3521',mobile:'139****6308',vin:'LGB******7789',subject:'认证人车尾号3521/7789',sa:'李佳 SV10023',employee:'李佳',sourceAccountId:'ACC10023',primaryRole:'服务顾问',matchedRoles:['服务顾问'],sourceType:'当前员工',store:'佛山南海专营店',sceneId:'SCN-20260717-10023-0061',scanId:'SCAN-240717-658796',participated:'2026-07-17 09:31:04',confirmed:'2026-07-17 09:31:04',result:'领取成功',couponCount:1,coupons:['CPN-66002794'],validation:['oneID识别：通过','认证关系1:1：通过','认证级参与唯一性：通过']},
      {id:'PAR-20260717-009802',activityId:'ACT-SA-20260703',activity:'到店保养抽奖季',level:'号码级',type:'抽奖',oneId:'OID****7750',mobile:'135****0241',vin:'-',subject:'oneID尾号7750',sa:'王敏 CS10061',employee:'王敏',sourceAccountId:'ACC10061',primaryRole:'客服专员',matchedRoles:['客服专员'],sourceType:'当前员工',store:'深圳龙岗专营店',sceneId:'SCN-20260717-10061-0037',scanId:'SCAN-240717-658752',participated:'2026-07-17 09:16:43',confirmed:'2026-07-17 09:16:43',result:'中奖',couponCount:1,coupons:['CPN-66002768'],validation:['oneID识别：通过','号码级参与唯一性：通过','抽奖资格：通过']},
      {id:'PAR-20260717-009795',activityId:'ACT-SA-20260704',activity:'老友焕新券包',level:'绑车级',type:'领券',oneId:'OID****4276',mobile:'188****4472',vin:'LGB******9066',subject:'VIN尾号9066',sa:'王敏 CS10061',employee:'王敏',sourceAccountId:'ACC10061',primaryRole:'客服专员',matchedRoles:['客服专员'],sourceType:'当前员工',store:'深圳龙岗专营店',sceneId:'SCN-20260717-10061-0037',scanId:'SCAN-240717-658716',participated:'2026-07-17 09:02:12',confirmed:'2026-07-17 09:02:12',result:'领取成功',couponCount:2,coupons:['CPN-66002721','CPN-66002722'],validation:['oneID识别：通过','当前VIN绑定关系：通过','绑车级参与唯一性：通过']},
      {id:'PAR-20260717-009786',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',level:'绑车级',type:'直接领券',oneId:'OID****5098',mobile:'137****8106',vin:'LVH******6620',subject:'VIN尾号6620',sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260717-10086-0088',scanId:'SCAN-240717-658674',participated:'2026-07-17 08:48:55',confirmed:'2026-07-17 08:48:55',result:'领取成功',couponCount:2,coupons:['CPN-66002686','CPN-66002687'],validation:['oneID识别：通过','当前VIN绑定关系：通过','绑车级参与唯一性：通过']}
    ],
    couponOverview: {
      kpis: [
        {key:'issued',label:'领券数',value:'1,986',note:'VIN共享券 316',target:'coupon-claim'},
        {key:'active',label:'已激活数',value:'1,430',note:'激活率 72.0%',target:'coupon-claim'},
        {key:'redeemed',label:'已核销数',value:'682',note:'较上期 +9.2%',target:'coupon-redeem'},
        {key:'redemptionRate',label:'卡券核销率',value:'34.3%',note:'核销数 / 发放数',target:'coupon-redeem'},
        {key:'cross',label:'跨店核销数',value:'96',note:'占核销数 14.1%',target:'coupon-redeem'}
      ],
      funnel:[{label:'发放',value:1986},{label:'激活',value:1430},{label:'核销',value:682}],
      ranks:[{name:'陈晓明 · SA',value:188},{name:'李佳 · 服务顾问',value:152},{name:'周凯 · 销售顾问',value:126},{name:'王敏 · 客服专员',value:109},{name:'赵晨 · 历史SA',value:88}],
      rows:[
        {sa:'陈晓明 SA10086',employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',sourceType:'当前员工',store:'广州花都专营店',couponId:'TPL-CP-10021',coupon:'基础保养抵扣券',activity:'夏季养护礼遇',mode:'领券',issued:532,active:421,redeemed:188,expired:21,redemptionRate:'35.3%',cross:26,last:'2026-07-17 09:41:06'},
        {sa:'李佳 SV10023',employee:'李佳',sourceAccountId:'ACC10023',primaryRole:'服务顾问',sourceType:'当前员工',store:'佛山南海专营店',couponId:'TPL-CP-10018',coupon:'精品代金券',activity:'认证车主焕新礼',mode:'领券',issued:418,active:326,redeemed:152,expired:18,redemptionRate:'36.4%',cross:19,last:'2026-07-17 09:28:42'},
        {sa:'周凯 SC10045',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',sourceType:'当前员工',store:'东莞寮步专营店',couponId:'TPL-CP-20001',coupon:'专属保养抵扣券',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',activity:'留存车主专属礼',segment:'留存人群包',mode:'领券',issued:136,active:131,redeemed:126,expired:3,redemptionRate:'92.6%',cross:22,last:'2026-07-17 09:15:37'},
        {sa:'王敏 CS10061',employee:'王敏',sourceAccountId:'ACC10061',primaryRole:'客服专员',sourceType:'当前员工',store:'深圳龙岗专营店',couponId:'TPL-CP-10029',coupon:'保养工时折扣券',activity:'老友焕新券包',mode:'领券',issued:352,active:281,redeemed:109,expired:14,redemptionRate:'31.0%',cross:17,last:'2026-07-17 08:58:26'},
        {sa:'赵晨 SA10072',employee:'赵晨',sourceAccountId:'--',primaryRole:'SA',sourceType:'历史SA数据',store:'广州番禺专营店',couponId:'TPL-CP-10025',coupon:'到店检测券',activity:'到店保养抽奖季',mode:'抽奖',issued:98,active:93,redeemed:88,expired:2,redemptionRate:'89.8%',cross:12,last:'2026-07-17 08:34:11'}
      ]
    },
    claimRows: [
      {id:'CPN-68210001',templateId:'TPL-SA-3001',coupon:'30元保养抵扣券',activityId:'ACT-SA-20260705',activity:'夏日车主礼',activityObjectType:'普通活动',mode:'领券',oneId:'OID****6638',mobile:'135****6638',owner:'oneID',vin:'-',boundCount:0,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781028',claimed:'2026-08-21 10:46:18',confirmed:'2026-08-21 10:46:18',status:'已激活',redemptionStatus:'未核销',redeemedAt:'-',participationId:'PAR-20260821-001028',childExecutionId:'-',customerKey:'ACC10045|OID****6638',dataScope:'功能上线后'},
      {id:'CPN-68210002',templateId:'TPL-SA-3002',coupon:'到店检测券',activityId:'ACT-SA-20260705',activity:'夏日车主礼',activityObjectType:'普通活动',mode:'领券',oneId:'OID****6638',mobile:'135****6638',owner:'oneID',vin:'-',boundCount:0,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781028',claimed:'2026-08-21 10:46:18',confirmed:'2026-08-21 10:46:18',status:'已核销',redemptionStatus:'已核销',redeemedAt:'2026-08-21 12:08:33',participationId:'PAR-20260821-001028',childExecutionId:'-',customerKey:'ACC10045|OID****6638',dataScope:'功能上线后'},
      {id:'CPN-68210003',templateId:'TPL-COMB-5201',coupon:'留存车主保养券',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'留存人群包',activityId:'ACT-COMB-RET-001',activity:'留存车主专属礼',activityObjectType:'组合子活动',mode:'领券',oneId:'OID****6638',mobile:'135****6638',owner:'VIN',vin:'LVH******9216',boundCount:2,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781014',claimed:'2026-08-21 10:14:32',confirmed:'2026-08-21 10:14:32',status:'已激活',redemptionStatus:'未核销',redeemedAt:'-',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-01',customerKey:'ACC10045|OID****6638',dataScope:'功能上线后'},
      {id:'CPN-68210004',templateId:'TPL-COMB-5202',coupon:'流失车主唤回券',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'流失人群包',activityId:'ACT-COMB-LOSS-002',activity:'流失车主唤回礼',activityObjectType:'组合子活动',mode:'领券',oneId:'OID****6638',mobile:'135****6638',owner:'VIN',vin:'LVH******9216',boundCount:2,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0048',scanId:'SCAN-260821-781014',claimed:'2026-08-21 10:14:32',confirmed:'2026-08-21 10:14:32',status:'已核销',redemptionStatus:'已核销',redeemedAt:'2026-08-21 13:22:09',participationId:'PAR-COMB-20260821-0009',childExecutionId:'CEX-20260821-0009-02',customerKey:'ACC10045|OID****6638',dataScope:'功能上线后'},
      {id:'CPN-68210005',templateId:'TPL-SA-4108',coupon:'基础保养抵扣券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',activityObjectType:'普通活动',mode:'领券',oneId:'OID****2371',mobile:'188****2371',owner:'VIN',vin:'LGB******1058',boundCount:1,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0047',scanId:'SCAN-260821-781019',claimed:'2026-08-21 09:18:06',confirmed:'2026-08-21 09:18:06',status:'已激活',redemptionStatus:'未核销',redeemedAt:'-',participationId:'PAR-20260821-001019',childExecutionId:'-',customerKey:'ACC10045|OID****2371',dataScope:'功能上线后'},
      {id:'CPN-68210006',templateId:'TPL-COMB-5203',coupon:'复购车主精品券',comboId:'COMB-SA-20260701',comboName:'夏季专属成长礼',segment:'复购人群包',activityId:'ACT-COMB-REP-003',activity:'复购车主进阶礼',activityObjectType:'组合子活动',mode:'领券',oneId:'OID****2371',mobile:'188****2371',owner:'VIN',vin:'LGB******1058',boundCount:1,employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',store:'广州花都专营店',sceneId:'SCN-20260821-10045-0047',scanId:'SCAN-260821-781006',claimed:'2026-08-21 09:06:11',confirmed:'2026-08-21 09:06:11',status:'已过期',redemptionStatus:'未核销',redeemedAt:'-',participationId:'PAR-COMB-20260821-0008',childExecutionId:'CEX-20260821-0008-01',customerKey:'ACC10045|OID****2371',dataScope:'功能上线后'},
      {id:'CPN-68210007',templateId:'TPL-CP-10021',coupon:'基础保养抵扣券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',activityObjectType:'普通活动',mode:'领券',oneId:'OID****8862',mobile:'138****5678',owner:'VIN',vin:'LVH******1234',boundCount:2,employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260821-10086-0092',scanId:'SCAN-260821-781012',claimed:'2026-08-21 08:42:18',confirmed:'2026-08-21 08:42:18',status:'已激活',redemptionStatus:'未核销',redeemedAt:'-',participationId:'PAR-20260821-001012',childExecutionId:'-',customerKey:'ACC10086|OID****8862',dataScope:'功能上线后'},
      {id:'CPN-68210008',templateId:'TPL-CP-10025',coupon:'到店检测券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',activityObjectType:'普通活动',mode:'领券',oneId:'OID****8862',mobile:'138****5678',owner:'VIN',vin:'LVH******1234',boundCount:2,employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260821-10086-0092',scanId:'SCAN-260821-781012',claimed:'2026-08-21 08:42:18',confirmed:'2026-08-21 08:42:18',status:'已核销',redemptionStatus:'已核销',redeemedAt:'2026-08-21 11:16:40',participationId:'PAR-20260821-001012',childExecutionId:'-',customerKey:'ACC10086|OID****8862',dataScope:'功能上线后'},
      {id:'CPN-66002818',templateId:'TPL-CP-10021',coupon:'基础保养抵扣券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',mode:'直接领券',oneId:'OID****8862',mobile:'138****5678',owner:'VIN',vin:'LVH******1234',boundCount:2,sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260717-10086-0088',scanId:'SCAN-240717-658812',claimed:'2026-07-17 09:42:18',confirmed:'2026-07-17 09:42:18',status:'未激活',participationId:'PAR-20260717-009812'},
      {id:'CPN-66002819',templateId:'TPL-CP-10025',coupon:'到店检测券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',mode:'直接领券',oneId:'OID****8862',mobile:'138****5678',owner:'VIN',vin:'LVH******1234',boundCount:2,sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260717-10086-0088',scanId:'SCAN-240717-658812',claimed:'2026-07-17 09:42:18',confirmed:'2026-07-17 09:42:18',status:'已激活',participationId:'PAR-20260717-009812'},
      {id:'CPN-66002794',templateId:'TPL-CP-10018',coupon:'精品代金券',activityId:'ACT-SA-20260702',activity:'认证车主焕新礼',mode:'直接领券',oneId:'OID****3521',mobile:'139****6308',owner:'认证关系',vin:'LGB******7789',boundCount:1,sa:'李佳 SA10023',store:'佛山南海专营店',sceneId:'SCN-20260717-10023-0061',scanId:'SCAN-240717-658796',claimed:'2026-07-17 09:31:04',confirmed:'2026-07-17 09:31:04',status:'未激活',participationId:'PAR-20260717-009808'},
      {id:'CPN-66002768',templateId:'TPL-CP-10025',coupon:'到店检测券',activityId:'ACT-SA-20260703',activity:'到店保养抽奖季',mode:'抽奖中奖',oneId:'OID****7750',mobile:'135****0241',owner:'oneID',vin:'-',boundCount:0,sa:'王敏 SA10061',store:'深圳龙岗专营店',sceneId:'SCN-20260717-10061-0037',scanId:'SCAN-240717-658752',claimed:'2026-07-17 09:16:43',confirmed:'2026-07-17 09:16:43',status:'已核销',participationId:'PAR-20260717-009802'},
      {id:'CPN-66002721',templateId:'TPL-CP-10029',coupon:'保养工时折扣券',activityId:'ACT-SA-20260704',activity:'老友焕新券包',mode:'直接领券',oneId:'OID****4276',mobile:'188****4472',owner:'VIN',vin:'LGB******9066',boundCount:3,sa:'王敏 SA10061',store:'深圳龙岗专营店',sceneId:'SCN-20260717-10061-0037',scanId:'SCAN-240717-658716',claimed:'2026-07-17 09:02:12',confirmed:'2026-07-17 09:02:12',status:'已激活',participationId:'PAR-20260717-009795'},
      {id:'CPN-66002686',templateId:'TPL-CP-10021',coupon:'基础保养抵扣券',activityId:'ACT-SA-20260701',activity:'夏季养护礼遇',mode:'直接领券',oneId:'OID****5098',mobile:'137****8106',owner:'VIN',vin:'LVH******6620',boundCount:2,sa:'陈晓明 SA10086',store:'广州花都专营店',sceneId:'SCN-20260717-10086-0088',scanId:'SCAN-240717-658674',claimed:'2026-07-17 08:48:55',confirmed:'2026-07-17 08:48:55',status:'已核销',participationId:'PAR-20260717-009786'}
    ],
    redemptionRows: [
      {id:'RED-20260821-002104',couponId:'CPN-68210004',coupon:'流失车主唤回券',activity:'夏季专属成长礼 / 流失车主唤回礼',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',sourceStore:'广州花都专营店',owner:'VIN尾号9216',actualUser:'135****6638',redeemStore:'广州花都专营店',cross:'否',order:'SO-20260821-991204',redeemed:'2026-08-21 13:22:09',amount:'¥460.00',subsidy:'¥150.00',status:'核销成功'},
      {id:'RED-20260821-002103',couponId:'CPN-68210002',coupon:'到店检测券',activity:'夏日车主礼',employee:'周凯',sourceAccountId:'ACC10045',primaryRole:'销售顾问',matchedRoles:['销售顾问'],sourceType:'当前员工',sa:'周凯 SC10045',sourceStore:'广州花都专营店',owner:'oneID尾号6638',actualUser:'135****6638',redeemStore:'广州花都专营店',cross:'否',order:'SO-20260821-991198',redeemed:'2026-08-21 12:08:33',amount:'¥260.00',subsidy:'¥80.00',status:'核销成功'},
      {id:'RED-20260821-002098',couponId:'CPN-68210008',coupon:'到店检测券',activity:'夏季养护礼遇',employee:'陈晓明',sourceAccountId:'ACC10086',primaryRole:'SA',matchedRoles:['SA','服务顾问'],sourceType:'当前员工',sa:'陈晓明 SA10086',sourceStore:'广州花都专营店',owner:'VIN尾号1234',actualUser:'138****5678',redeemStore:'佛山南海专营店',cross:'是',order:'SO-20260821-991152',redeemed:'2026-08-21 11:16:40',amount:'¥520.00',subsidy:'¥150.00',status:'核销成功'},
      {id:'RED-20260717-001986',couponId:'CPN-66002768',coupon:'到店检测券',activity:'到店保养抽奖季',sa:'王敏 SA10061',sourceStore:'深圳龙岗专营店',owner:'oneID尾号7750',actualUser:'135****0241',redeemStore:'深圳龙岗专营店',cross:'否',order:'SO-20260717-883621',redeemed:'2026-07-17 09:24:10',amount:'¥200.00',subsidy:'¥80.00',status:'核销成功'},
      {id:'RED-20260717-001978',couponId:'CPN-66002686',coupon:'基础保养抵扣券',activity:'夏季养护礼遇',sa:'陈晓明 SA10086',sourceStore:'广州花都专营店',owner:'VIN尾号6620',actualUser:'137****8106',redeemStore:'佛山南海专营店',cross:'是',order:'SO-20260717-883540',redeemed:'2026-07-17 09:06:31',amount:'¥500.00',subsidy:'¥150.00',status:'核销成功'},
      {id:'RED-20260717-001965',couponId:'CPN-66002652',coupon:'精品代金券',activity:'认证车主焕新礼',sa:'李佳 SA10023',sourceStore:'佛山南海专营店',owner:'认证VIN尾号7789',actualUser:'139****6308',redeemStore:'佛山南海专营店',cross:'否',order:'SO-20260717-883426',redeemed:'2026-07-17 08:45:18',amount:'¥800.00',subsidy:'¥200.00',status:'核销成功'},
      {id:'RED-20260717-001952',couponId:'CPN-66002611',coupon:'保养工时折扣券',activity:'老友焕新券包',sa:'王敏 SA10061',sourceStore:'深圳龙岗专营店',owner:'VIN尾号9066',actualUser:'188****4472',redeemStore:'东莞寮步专营店',cross:'是',order:'SO-20260717-883305',redeemed:'2026-07-17 08:28:09',amount:'¥360.00',subsidy:'¥90.00',status:'核销成功'},
      {id:'RED-20260716-001911',couponId:'CPN-66002498',coupon:'到店检测券',activity:'到店保养抽奖季',sa:'周凯 SA10045',sourceStore:'东莞寮步专营店',owner:'oneID尾号1087',actualUser:'186****2190',redeemStore:'东莞寮步专营店',cross:'否',order:'SO-20260716-881928',redeemed:'2026-07-16 17:32:44',amount:'¥180.00',subsidy:'¥60.00',status:'已撤销'},
      {id:'RED-20260716-001884',couponId:'CPN-66002447',coupon:'基础保养抵扣券',activity:'夏季养护礼遇',sa:'陈晓明 SA10086',sourceStore:'广州花都专营店',owner:'VIN尾号1234',actualUser:'138****5678',redeemStore:'广州花都专营店',cross:'否',order:'SO-20260716-881604',redeemed:'2026-07-16 16:58:20',amount:'¥520.00',subsidy:'¥150.00',status:'核销成功'}
    ]
  };

  function buildReportActivityCatalog() {
    var reportData = window.SAReportData;
    var rows = reportData.activityConfigs.map(function (item) {
      return {id:item.id,name:item.name,type:'普通活动',status:item.status,level:item.level,time:item.time};
    }).concat(reportData.comboActivities.map(function (item) {
      return {id:item.id,name:String(item.displayName || '').trim() || item.name,type:'组合活动',status:item.active ? '已启用' : '已停用',level:item.level,time:item.time};
    })).concat(reportData.comboActivities.reduce(function (result, item) {
      return result.concat(item.children.map(function (child) {
        return {id:child.id,name:child.segment.replace('人群包','') + '子活动',type:'组合子活动',parentId:item.id,parentName:String(item.displayName || '').trim() || item.name,status:item.active ? '已启用' : '已停用',level:item.level,time:item.time};
      }));
    },[]));
    var themes = ['春季焕新','夏季养护','秋季检测','冬季关怀','会员回馈','到店保养','车主生日','复购促进'];
    var audiences = ['活跃车主','留存车主','流失召回','认证车主','新购车主','高价值车主'];
    var levels = ['号码级','绑车级','认证级'];
    var statuses = ['已启用','已启用','已启用','草稿','已结束'];
    var index;
    for (index = 1; index <= 36; index += 1) {
      var combo = index % 7 === 0;
      rows.push({
        id:(combo ? 'DEMO-COMB-' : 'DEMO-ACT-') + '2026' + String(index).padStart(3,'0'),
        name:themes[(index - 1) % themes.length] + '·' + audiences[(index - 1) % audiences.length] + (combo ? '组合活动' : '活动'),
        type:combo ? '组合活动' : '普通活动',
        status:statuses[(index - 1) % statuses.length],
        level:levels[(index - 1) % levels.length],
        time:'2026-' + String((index % 6) + 5).padStart(2,'0') + '-01 至 2026-' + String((index % 6) + 6).padStart(2,'0') + '-28'
      });
    }
    return rows;
  }

  window.SAReportData.reportActivityCatalog = buildReportActivityCatalog();
})();
