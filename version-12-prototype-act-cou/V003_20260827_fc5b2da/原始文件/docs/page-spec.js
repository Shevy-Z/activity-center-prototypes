(function () {
  'use strict';
  var dataset=window.EmployeePageSpecs;
  var params=new URLSearchParams(location.search);
  var id=params.get('page');
  var spec=dataset && dataset.specs[id];
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var root=document.getElementById('spec');
  function sourceURL(file) {
    if(file.indexOf('external/')===0){
      var base=document.body.getAttribute('data-external-root');
      var rest=file.slice(9);
      if(rest==='sa-pool.js')rest='js/pages/sa-pool.js';
      else if(rest==='requirements.md')rest='docs/requirements.md';
      return new URL(base+rest,location.href).href;
    }
    return new URL('../'+file,location.href).href;
  }
  function sourceLink(file,label){return '<a href="'+esc(sourceURL(file))+'" target="_blank" rel="noopener">'+esc(label||file)+'</a>';}
  function back(){
    if(window.parent!==window){window.parent.postMessage({type:'employee-page-spec-close'},'*');return;}
    var candidate=params.get('back');
    if(candidate){try{var url=new URL(candidate);if(url.origin===location.origin && /^(https?:|file:)$/.test(url.protocol)){location.href=url.href;return;}}catch(ignore){}}
    location.href='../index.html';
  }
  document.getElementById('back').addEventListener('click',back);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')back();});
  if(!spec){document.title='功能说明未找到';root.innerHTML='<h1>未找到当前页面说明</h1><p>请关闭此页后，从对应原型页面的“功能说明”入口重新打开。</p>';return;}
  document.title=spec.title+' · 功能说明';
  document.getElementById('page-title').textContent=spec.title+' · 功能说明';
  var context=params.get('context');
  var html='<section class="intro"><p class="project">'+esc(dataset.project)+' · 更新于 '+esc(dataset.updated)+'</p><h1>'+esc(spec.title)+'</h1>'+
    (context?'<p class="context">打开时上下文：'+esc(context)+'</p>':'')+
    '<p>'+esc(dataset.modelNote)+'</p><p>只读字段的“必填”记为不适用；输入字段区分界面标识、实际校验和条件必填。当前只显示本页内容。</p></section>';
  if(spec.rules.length)html+='<section class="card"><h2>页面逻辑与边界</h2><ol>'+spec.rules.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol></section>';
  html+='<section class="card"><div class="field-toolbar"><h2>字段说明 <small id="field-count">'+spec.fields.length+'项</small></h2><label>筛选本页字段 <input id="search" type="search" placeholder="字段、模块或逻辑关键词"></label></div><div class="table-wrap"><table><colgroup><col style="width:13%"><col style="width:13%"><col style="width:12%"><col style="width:14%"><col style="width:13%"><col style="width:35%"></colgroup><thead><tr><th scope="col">字段所属模块</th><th scope="col">字段</th><th scope="col">是否必填</th><th scope="col">是否允许编辑修改</th><th scope="col">数据类型</th><th scope="col">字段描述（出处与逻辑说明）</th></tr></thead><tbody>'+
    spec.fields.map(function(f){
      var sources=sourceLink(f.source,'页面实现：'+f.source);
      if(f.data && f.data!==f.source)sources+=' · '+sourceLink(f.data,'取值样例');
      return '<tr><td>'+esc(f.module)+'</td><th scope="row">'+esc(f.name)+'</th><td>'+esc(f.required)+'</td><td>'+esc(f.editable)+'</td><td><code>'+esc(f.type)+'</code></td><td><p>'+esc(f.description)+'</p><p class="origin">业务出处：'+esc(f.origin)+'<br>取值/模型：<code>'+esc(f.key)+'</code><br>'+sources+'</p></td></tr>';
    }).join('')+'</tbody></table></div><p id="no-results" hidden>本页没有匹配字段。</p></section>';
  if(spec.pending.length)html+='<section class="card pending"><h2>尚待确认</h2><ul>'+spec.pending.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+'</ul></section>';
  html+='<section class="card"><h2>需求与核对出处</h2><p>'+sourceLink(spec.source,'本页业务说明/需求来源')+'</p>'+
    (spec.area==='backend'||spec.area==='mobile'?'<p>'+sourceLink(spec.area+'/annotations/annotations.js','原有功能标注与口径')+' · '+sourceLink('docs/sequence.html','完整业务时序')+'</p>':'')+
    '<p>字段逐项依据当前原型代码、Mock数据、原有交互说明及交接后确认记录整理；未将待确认策略补写为既定接口。具体数据权限、真实接口、事务及幂等机制仍应按研发评审落地。</p><p><a href="https://shevy-z.github.io/activity-center-prototypes/index.html" target="_top" data-activity-home-button>← 返回活动中心原型首页</a></p></section>';
  root.innerHTML=html;
  var rows=Array.prototype.slice.call(root.querySelectorAll('tbody tr'));
  document.getElementById('search').addEventListener('input',function(event){
    var query=event.target.value.trim().toLowerCase(),count=0;
    rows.forEach(function(row){row.hidden=!!query&&row.textContent.toLowerCase().indexOf(query)<0;if(!row.hidden)count++;});
    document.getElementById('field-count').textContent=count+' / '+rows.length+'项';
    document.getElementById('no-results').hidden=count!==0;
  });
})();
