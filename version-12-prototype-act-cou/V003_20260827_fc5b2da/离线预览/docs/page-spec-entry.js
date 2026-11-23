(function () {
  'use strict';
  var script = document.currentScript;
  var area = script.getAttribute('data-area');
  var fixedPage = script.getAttribute('data-page');
  var docsRoot = new URL('./', script.src);
  var dialog, frame, previousFocus;
  function pageKey() {
    if (fixedPage) return fixedPage;
    var route = window.getCurrentPage ? window.getCurrentPage() : location.hash.slice(1).split('?')[0];
    if (area === 'backend') {
      var drawerTitle=document.querySelector('#detailDrawer.open .drawer-head h2');
      var drawers={'二维码详情':'qr','活动参与详情':'participation','券实例详情':'claim','卡券核销详情':'redemption','活动互斥关系详情':'mutex'};
      if(drawerTitle && drawers[drawerTitle.textContent])return 'backend.drawer-'+drawers[drawerTitle.textContent];
      route = route || 'activity-overview';
      var step = route === 'activity-create' && document.querySelector('.activity-step.active');
      return 'backend.' + route + (step ? '.step' + step.getAttribute('data-form-step') : '');
    }
    return 'mobile.' + (route || 'sa-select');
  }
  function helpURL() {
    var url = new URL('page-spec.html', docsRoot);
    url.searchParams.set('page',pageKey());
    url.searchParams.set('back',location.href);
    var mode = document.querySelector('.activity-mode-bar');
    if (mode) url.searchParams.set('context',mode.innerText.replace(/\s+/g,' ').slice(0,160));
    return url.href;
  }
  function close() { if (dialog && dialog.open) dialog.close(); }
  function open() {
    previousFocus = document.activeElement;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.setAttribute('aria-label','当前页面功能说明');
      dialog.style.cssText = 'position:fixed;inset:0;margin:auto;width:min(1440px,98vw);height:94dvh;max-width:none;max-height:none;padding:0;border:1px solid #dce3ed;border-radius:8px;overflow:hidden;z-index:2147483647;box-shadow:0 20px 80px rgba(0,0,0,.3)';
      frame = document.createElement('iframe');
      frame.title = '当前页面功能说明';
      frame.style.cssText = 'display:block;width:100%;height:100%;border:0;background:#f7f9fc';
      dialog.appendChild(frame);
      document.body.appendChild(dialog);
      dialog.addEventListener('click',function(event){if(event.target === dialog)close();});
      dialog.addEventListener('close',function(){frame.removeAttribute('src');if(previousFocus && previousFocus.isConnected)previousFocus.focus();});
    }
    frame.src = helpURL();
    dialog.showModal();
  }
  function syncLinks() {
    if(area==='backend')document.querySelectorAll('#detailDrawer.open .drawer-head,#businessModal.open .business-modal-head').forEach(function(head){
      if(!head.querySelector('[data-page-spec]')){
        var button=document.createElement('button');button.type='button';button.textContent='功能说明';button.setAttribute('data-page-spec','');
        button.style.cssText='margin-left:auto;margin-right:12px;padding:5px 9px;border:1px solid #b9cfee;background:#f1f6ff;color:#245eb2;cursor:pointer';
        head.insertBefore(button,head.querySelector('button'));
      }
    });
    document.querySelectorAll('a[data-page-spec]').forEach(function(a){var href=helpURL();if(a.href!==href)a.href=href;});
  }
  document.addEventListener('click',function(event){
    var target=event.target.closest('[data-page-spec]');
    if(!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    open();
  });
  window.addEventListener('message',function(event){
    if(frame && event.source===frame.contentWindow && event.data && event.data.type==='employee-page-spec-close')close();
  });
  window.addEventListener('hashchange',syncLinks);
  new MutationObserver(syncLinks).observe(document.body,{childList:true,subtree:true});
  window.EmployeePageSpec={open:open,close:close,url:helpURL,key:pageKey};
  syncLinks();
})();
