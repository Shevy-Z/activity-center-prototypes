(function () {
  'use strict';
  var data = window.StateBoardData;
  var resultSection = data.sections.find(function (s) { return s.id === 'results'; });
  resultSection.height = 3820;
  resultSection.subtitle = '原有五种结果状态，以及同一 VIN 不同手机号的两种限领场景';
  data.version = '20261126-vin-claim-limits';
  [
    {id:'vin-limit-two',limit:2,x:1930,title:'绑车级 · VIN限领2张',description:'A已领1张，B快捷绑车同一VIN后，仍可再领1张。'},
    {id:'vin-limit-one',limit:1,x:3050,title:'绑车级 · VIN限领1张',description:'A已领1张，B绑定同一VIN后可发起领取，但提交时超限失败。'}
  ].forEach(function (c) {
    data.nodes.push({id:c.id,type:'vin-claim',title:c.title,description:c.description,x:c.x,y:4380,width:340,height:1000,sectionId:'results',vinLimit:c.limit});
    data.annotations.push({
      id:c.limit===2?'R18':'R19',nodeId:c.id,x:c.x+370,y:4380,width:310,
      title:c.limit===2?'VIN限领2张 · B可领取':'VIN限领1张 · B提交超限',
      text:c.limit===2
        ? 'A与B绑定同一VIN。A已领1张，B本人未领，因此B入口显示“立即领取”。点击时校验VIN累计1/2，发放1张成功，累计变为2/2。只有B成功领券后才显示“查看卡券”。'
        : 'A与B绑定同一VIN。A已领1张，B本人未领，因此B入口仍显示“立即领取”。点击时校验VIN累计1/1，领取失败，不发券、不增加次数，toast：“该VIN已在其他手机号领取卡券，超过限领次数”。',
      functions:'本次新增 · 同VIN跨手机号领取',status:'2026-11-26 用户确认',pending:''
    });
  });
  data.edges.push(
    {id:'E14',from:'bound-folded',to:'vin-limit-two',fromSide:'bottom',toSide:'top',fromRatio:.5,points:[{x:2100,y:4260}],label:'B快捷绑车同一VIN\nVIN限领2张',labelX:2100,labelY:4190},
    {id:'E15',from:'bound-folded',to:'vin-limit-one',fromSide:'bottom',toSide:'top',fromRatio:.75,points:[{x:2185,y:4310},{x:3220,y:4310}],label:'B绑定同一VIN\nVIN限领1张',labelX:2780,labelY:4310}
  );
  function mount(card,node) {
    var vin='LGB******1234',currentUser='B';
    var records=[{user:'A',vin:vin,count:1}];
    var timer;
    var surface=document.createElement('div');
    surface.className='vin-case-surface';
    surface.innerHTML='<section class="vin-phone" aria-label="'+node.title+'交互演示">'+
      '<header class="vin-phone-header"><span aria-hidden="true">‹</span><strong>领取结果</strong><span aria-hidden="true">•••</span></header>'+
      '<div class="vin-result-summary"><span class="vin-result-symbol" aria-hidden="true">券</span><div><h4 data-vin-heading>专属优惠待领取</h4><p data-vin-summary>完成快捷绑车，领取后可在卡包查看</p></div></div>'+
      '<div class="vin-vehicle"><span>当前用户：B用户 · 139****0002</span><strong>已绑定车辆 · '+vin+'</strong><small>通过快捷绑车进入 · 绑车级</small></div>'+
      '<section class="vin-coupon-section"><h4>车主专享养护礼</h4><div class="vin-coupon"><div><strong>50<small>元</small></strong><b>车辆养护优惠券</b><span>满300元可用</span></div><button data-vin-claim type="button">立即领取</button></div></section>'+
      '<div class="vin-bag" data-vin-bag hidden><strong>B用户的卡包</strong><p>车辆养护优惠券 · 50元</p><span>本次领取1张，归属B用户</span></div>'+
      '<p class="vin-customer-hint">优惠券仅示意，请以卡包实际到账为准</p>'+
      '<div class="vin-case-toast" role="status" aria-live="polite" hidden></div></section>'+
      '<section class="vin-review"><h4>场景核对</h4><p>A用户已绑车并领取1张；B用户绑定同一VIN，本人尚未领取。</p>'+
      '<dl><div><dt>VIN限领</dt><dd>'+node.vinLimit+'张</dd></div><div><dt>A用户已领</dt><dd>1张</dd></div><div><dt>B用户已领</dt><dd data-vin-user-count>0张</dd></div><div><dt>VIN累计</dt><dd data-vin-total>1/'+node.vinLimit+'张</dd></div></dl>'+
      '<p class="vin-review-rule">按钮按B本人领取记录展示，点击时才校验VIN总限额。</p>'+
      '<div class="vin-review-actions"><button data-vin-reset type="button">重置本场景</button><button data-vin-other type="button">查看'+(node.vinLimit===2?'场景二':'场景一')+'</button></div></section>';
    card.append(surface);
    var button=surface.querySelector('[data-vin-claim]'),toast=surface.querySelector('.vin-case-toast');
    function userCount(){return records.filter(function(r){return r.user===currentUser&&r.vin===vin;}).reduce(function(n,r){return n+r.count;},0);}
    function vinCount(){return records.filter(function(r){return r.vin===vin;}).reduce(function(n,r){return n+r.count;},0);}
    function feedback(message,failed){
      clearTimeout(timer);toast.textContent=message;toast.classList.toggle('is-error',!!failed);toast.setAttribute('aria-live',failed?'assertive':'polite');toast.hidden=false;
      timer=setTimeout(function(){toast.hidden=true;},4500);
    }
    function render(){
      var count=userCount();
      button.textContent=count?'查看卡券':'立即领取';
      surface.querySelector('[data-vin-heading]').textContent=count?'领取成功':'专属优惠待领取';
      surface.querySelector('[data-vin-summary]').textContent=count?'好礼已放入您的卡包，本次到账1张卡券':'完成快捷绑车，领取后可在卡包查看';
      surface.querySelector('[data-vin-user-count]').textContent=count+'张';
      surface.querySelector('[data-vin-total]').textContent=vinCount()+'/'+node.vinLimit+'张';
      card.dataset.vinCount=String(vinCount());card.dataset.currentUserCount=String(count);
    }
    button.addEventListener('click',function(){
      if(userCount()){surface.querySelector('[data-vin-bag]').hidden=false;feedback('已打开B用户的卡包');return;}
      if(vinCount()+1>node.vinLimit){feedback('该VIN已在其他手机号领取卡券，超过限领次数',true);return;}
      records.push({user:currentUser,vin:vin,count:1});render();feedback('领取成功，1张卡券已放入您的卡包');
    });
    surface.querySelector('[data-vin-reset]').addEventListener('click',function(){
      records=[{user:'A',vin:vin,count:1}];clearTimeout(timer);toast.hidden=true;surface.querySelector('[data-vin-bag]').hidden=true;render();
    });
    surface.querySelector('[data-vin-other]').addEventListener('click',function(){window.StateBoard.focusNode(node.vinLimit===2?'vin-limit-one':'vin-limit-two');});
    render();
  }
  window.VinClaimScenarios={mount:mount};
  var entry=document.getElementById('vin-cases-toggle');
  if(entry)entry.addEventListener('click',function(){window.StateBoard.focusNode('vin-limit-two');});
})();
