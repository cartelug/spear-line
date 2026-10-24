// Progressive motion: readable HTML first, finite animations, and one shared preference.
const EASE = 'cubic-bezier(.22,.68,0,1)';
const STORAGE_KEY = 'spear-line-motion';

export function createMotion({root=document.documentElement,preference=matchMedia('(prefers-reduced-motion: reduce)')}={}) {
  const $=(selector,base=document)=>base.querySelector(selector);
  const $$=(selector,base=document)=>[...base.querySelectorAll(selector)];
  const phone=()=>matchMedia('(max-width:599px)').matches;
  let saved=false;
  try { saved=localStorage.getItem(STORAGE_KEY)==='reduce'; } catch { /* Preferences are optional. */ }
  let reduced=preference.matches||saved;
  const supported=typeof Element.prototype.animate==='function';
  const active=new Set(), targets=new Set(), groups=new Map(), played=new Set();
  const detailAnimations=new Map();
  let observer=null, menuAnimations=[], menuGeneration=0;

  function register(el,kind) {
    if(!el)return;
    targets.add(el); el.dataset.motionKind=kind;
  }
  function audit() {
    root.dataset.motionTargets=String(targets.size);
    root.dataset.motionPlayed=String(played.size);
    root.dataset.motionState=reduced?'reduced':'full';
  }
  function animate(el,frames,{duration=580,delay=0,easing=EASE,fill='none'}={}) {
    if(reduced||!supported||!el||!el.isConnected)return null;
    if(!targets.has(el))register(el,'interaction');
    let animation;
    try {
      animation=el.animate(frames,{duration,delay,easing,fill});
      active.add(animation); played.add(el); el.dataset.motionPlayed='true'; audit();
      animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));
    } catch { return null; }
    return animation;
  }
  function splitText(el,characters=false) {
    if(el.dataset.motionText)return $$('[data-motion-word]',el);
    el.dataset.motionText=characters?'characters':'words';
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{
      acceptNode(node) {
        if(!node.textContent.trim())return NodeFilter.FILTER_REJECT;
        if(node.parentElement.closest('a,button,input,textarea,select,svg,[data-motion-word]'))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
    const words=[];
    for(const node of nodes) {
      const parts=characters?[...node.textContent]:node.textContent.split(/(\s+)/);
      const fragment=document.createDocumentFragment();
      for(const part of parts) {
        if(!part)continue;
        if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));continue;}
        const word=document.createElement('span');
        word.className=characters?'motion-char':'motion-word';word.dataset.motionWord='';
        word.textContent=part;fragment.append(word);words.push(word);register(word,characters?'letter':'word');
      }
      node.replaceWith(fragment);
    }
    return words;
  }
  function group(el,kind,items=null) {
    if(!el||groups.has(el))return;
    const entry={el,kind,items:items||[el],seen:false,delay:el.matches('.hero-actions')?180:0};
    groups.set(el,entry);el.dataset.motionGroup=kind;
    if(kind!=='text')register(el,kind);
    observer?.observe(el);
  }
  function play(entry,{replay=false,delay=0}={}) {
    if(!entry||reduced)return;
    if(entry.seen&&!replay)return;
    delay+=entry.delay;
    entry.seen=true;observer?.unobserve(entry.el);
    const small=phone();
    if(entry.kind==='text') {
      const total=entry.items.length;
      const interval=Math.min(small?25:34,360/Math.max(1,total-1));
      entry.items.forEach((word,i)=>animate(word,[
        {opacity:0,transform:`translate3d(0,${small?16:25}px,0) rotate(${i%2?'.8':'-.8'}deg)`},
        {opacity:1,transform:'translate3d(0,0,0) rotate(0deg)'}
      ],{duration:small?500:690,delay:delay+i*interval,fill:'backwards'}));
    } else if(entry.kind==='image') {
      animate(entry.el,[{opacity:0,clipPath:'inset(7% 0 0 0)',transform:'translateY(18px)'},{opacity:1,clipPath:'inset(0% 0 0 0)',transform:'translateY(0px)'}],{duration:small?650:900,delay});
    } else if(entry.kind==='rule') {
      animate(entry.el,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:small?600:900,delay});
    } else if(entry.kind==='club-card') {
      const resting=getComputedStyle(entry.el).transform;
      animate(entry.el,[{opacity:0,transform:'translateY(28px) rotate(-12deg) rotateX(13deg)'},{opacity:1,transform:resting==='none'?'none':resting}],{duration:small?850:1100,delay});
      $$('.club-card-top,.club-card-title,.club-card-bottom',entry.el).forEach((part,i)=>{
        register(part,'card-detail');animate(part,[{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0px)'}],{duration:520,delay:delay+170+i*85,fill:'backwards'});
      });
    } else {
      animate(entry.el,[{opacity:0,transform:`translateY(${small?12:20}px)`},{opacity:1,transform:'translateY(0px)'}],{duration:small?460:650,delay});
    }
  }
  function revealEntries() {
    if(reduced)return;
    for(const entry of groups.values()) {
      if(entry.seen||entry.el.closest('[hidden]'))continue;
      const box=entry.el.getBoundingClientRect();
      if(!box.width||!box.height)continue;
      if(box.bottom<0) { entry.seen=true;observer?.unobserve(entry.el);continue; }
      if(box.top<innerHeight*.98&&box.right>0&&box.left<innerWidth)play(entry);
    }
  }
  let settle;
  function settleScroll(){clearTimeout(settle);settle=setTimeout(revealEntries,130);}
  function updatePreference() {
    reduced=preference.matches||saved;
    root.classList.toggle('motion-reduced',reduced);
    if(reduced) {
      for(const animation of active)animation.cancel();active.clear();
      for(const [step,record] of detailAnimations){step.open=record.open;step.style.removeProperty('overflow');}
      detailAnimations.clear();
      menuGeneration++;root.classList.remove('menu-closing','intro','intro-out');
      const nav=$('#site-menu');if(nav)nav.inert=false;
    }
    $$('[data-motion-toggle]').forEach(button=>{
      button.hidden=false;
      button.setAttribute('aria-pressed',String(reduced));
      button.textContent=reduced?'Motion reduced':'Reduce motion';
    });
    audit();document.dispatchEvent(new CustomEvent('spear:motion-preference'));
  }
  // Cleanup is registered before any animation can run. No text is hidden in default CSS.
  function settleAll() {
    for(const animation of active)animation.cancel();active.clear();
    root.classList.remove('menu-closing');
    for(const [step,record] of detailAnimations){step.open=record.open;step.style.removeProperty('overflow');}
    detailAnimations.clear();
  }
  window.addEventListener('pagehide',settleAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settleAll();});
  window.addEventListener('pageshow',()=>{updatePreference();revealEntries();});
  preference.addEventListener('change',updatePreference);
  window.addEventListener('storage',event=>{
    if(event.key===STORAGE_KEY){saved=event.newValue==='reduce';updatePreference();}
  });
  $$('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{
    saved=!reduced;
    try { if(saved)localStorage.setItem(STORAGE_KEY,'reduce');else localStorage.removeItem(STORAGE_KEY); } catch { /* No storage is required. */ }
    updatePreference();
  }));

  if(supported) {
    if('IntersectionObserver' in window)observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)play(groups.get(entry.target));
    },{rootMargin:'0px 0px 24px 0px',threshold:.06});

    const texts=$$('main h1,main h2,main h3,main .eyebrow,main .lede,main .hero-description,main .section-head>p,main .service-copy>p,main .club-copy>p,main .club-tagline,main .club-description,.closing-content>p');
    for(const el of texts) {
      if(el.closest('.club-card,[aria-hidden="true"]')||el.querySelector('input,textarea,button,a'))continue;
      const words=splitText(el);if(words.length)group(el,'text',words);
    }
    const wordmark=$('.footer-wordmark');if(wordmark)group(wordmark,'text',splitText(wordmark,true));
    for(const el of $$('.service-photo,.story-main,.story-inset,.detail-image,.brief-image,.wide-image,.enquiry-aside-image,.process-picture,.gallery-item>div'))group(el,'image');
    for(const el of $$('.club-card'))group(el,'club-card');
    for(const el of $$('main .intro-detail>p,main .story-copy>p,main .detail-copy>p,main .brief-layout>div>p,main .principles>article>p,.picture-caption,.story-index,.club-stage-caption,.service-tags>li,.footer-top>div,.club-launch-note,.field,.hero-actions,.subhero-content>.button')) {
      if(!groups.has(el)&&!el.querySelector('[data-motion-text]')&&!el.dataset.motionText)group(el,'copy');
    }
    for(const head of $$('.section-head')) {
      const line=document.createElement('span');line.className='motion-rule';line.setAttribute('aria-hidden','true');head.append(line);group(line,'rule');
    }
    for(const el of $$('[data-reveal],[data-draw]')) {
      if(!groups.has(el)&&!el.querySelector('[data-motion-group]'))group(el,'copy');
    }
    for(const el of $$('a.button,button,.text-link,.mobile-dock>a,.site-nav li>a,.mobile-service-strip>a,summary,.choice-options label'))register(el,'control');
    for(const el of $$('.field>label'))register(el,'field-label');
    for(const el of $$('.club-card-top,.club-card-title,.club-card-bottom'))register(el,'card-detail');

    // Entrance timelines stay short on phones and wait for the desktop logo curtain.
    const introDelay=root.classList.contains('intro')?850:0;
    for(const entry of groups.values()) {
      const box=entry.el.getBoundingClientRect();
      if(!box.width||!box.height||entry.el.closest('[hidden]'))continue;
      if(box.top<innerHeight&&box.bottom>0&&box.left<innerWidth&&box.right>0)play(entry,{delay:introDelay});
    }
    const hero=$('.hero-image img,.subhero .photo-bg img');
    if(hero){register(hero,'hero-image');animate(hero,[{transform:'scale(1.045)'},{transform:'scale(1)'}],{duration:phone()?1200:1800,delay:introDelay});}
    const brand=$('.site-header .brand');if(brand){register(brand,'brand');animate(brand,[{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0px)'}],{duration:480,delay:introDelay});}
    if(!phone())$$('.site-nav li>a,.site-nav .nav-cta').forEach((el,i)=>{if(el.getBoundingClientRect().width)animate(el,[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0px)'}],{duration:480,delay:introDelay+50+i*45});});
    const dock=$('.mobile-dock');if(dock&&getComputedStyle(dock).display!=='none'){
      register(dock,'dock');animate(dock,[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0px)'}],{duration:520,delay:180});
      $$('a',dock).forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0px)'}],{duration:300,delay:210+i*35,fill:'backwards'}));
    }
    window.addEventListener('scroll',settleScroll,{passive:true});window.addEventListener('resize',settleScroll,{passive:true});
    document.addEventListener('pointerdown',event=>{
      if(reduced)return;
      const control=event.target.closest('a.button,button,.mobile-dock>a,.mobile-service-strip>a');
      if(!control||control.disabled||control.hasAttribute('data-motion-toggle'))return;
      animate(control,[{transform:'scale(1)'},{transform:'scale(.96)',offset:.4},{transform:'scale(1)'}],{duration:250});
    },{passive:true});
    document.addEventListener('focusin',event=>{
      const label=event.target.closest('.field')?.querySelector('label');
      if(label)animate(label,[{transform:'translateY(2px)',opacity:.7},{transform:'translateY(0px)',opacity:1}],{duration:240});
    });
    root.classList.add('motion-ready');
  }
  updatePreference();audit();
  return {
    get disabled(){return reduced||!supported;},
    accordionOpen(step){return detailAnimations.get(step)?.open??step.open;},
    panel(panel) {
      if(reduced)return;
      for(const entry of groups.values())if(panel.contains(entry.el))play(entry,{replay:true,delay:entry.kind==='image'?0:60});
    },
    menu(open,nav) {
      menuGeneration++;const generation=menuGeneration;
      menuAnimations.forEach(animation=>animation?.cancel());menuAnimations=[];
      root.classList.remove('menu-closing');nav.inert=false;
      if(reduced||!supported||matchMedia('(min-width:900px)').matches)return;
      if(!open){root.classList.add('menu-closing');nav.inert=true;}
      const animation=animate(nav,open?[
        {opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(-8px)'},
        {opacity:1,clipPath:'inset(0 0 0% 0)',transform:'translateY(0px)'}
      ]:[{opacity:1,transform:'translateY(0px)'},{opacity:0,transform:'translateY(-14px)'}],{duration:open?470:210});
      menuAnimations.push(animation);
      if(open)$$('.menu-heading,li>a,.nav-cta,.menu-foot',nav).forEach((el,i)=>{
        register(el,'menu-item');menuAnimations.push(animate(el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0px)'}],{duration:400,delay:70+i*35,fill:'backwards'}));
      });
      if(!open&&animation)animation.finished.then(()=>{
        if(generation===menuGeneration){root.classList.remove('menu-closing');nav.inert=false;}
      },()=>{});
    },
    accordion(step,open) {
      if(reduced){step.open=open;return;}
      const before=step.getBoundingClientRect().height;
      const previous=detailAnimations.get(step);if(previous)previous.animation.cancel();
      if(open)step.open=true;
      const after=open?step.getBoundingClientRect().height:step.querySelector('summary').getBoundingClientRect().height;
      step.style.overflow='hidden';
      const animation=animate(step,[{height:before+'px'},{height:after+'px'}],{duration:phone()?300:390});
      if(!animation){step.open=open;step.style.removeProperty('overflow');return;}
      detailAnimations.set(step,{animation,open});
      if(open)animate(step.querySelector('.step-content'),[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0px)'}],{duration:300,delay:70});
      animation.finished.then(()=>{
        if(detailAnimations.get(step)?.animation===animation){step.open=open;step.style.removeProperty('overflow');detailAnimations.delete(step);}
      },()=>{});
    },
    gallery(status) {if(status)animate(status,[{opacity:.25,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0px)'}],{duration:220});},
    message(el) {if(el)animate(el,[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0px)'}],{duration:300});}
  };
}
