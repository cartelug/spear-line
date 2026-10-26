// V7 interaction layer: ticker, route line, timeline, spotlight, magnetic controls, tilt and reading reveal.
// Everything is progressive. Default HTML/CSS is readable without it, and the shared Reduce motion preference wins.
export function createFx({root=document.documentElement,preference=matchMedia('(prefers-reduced-motion: reduce)')}={}) {
  const $=(selector,base=document)=>base.querySelector(selector);
  const $$=(selector,base=document)=>[...base.querySelectorAll(selector)];
  const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const reduced=()=>preference.matches||root.classList.contains('motion-reduced');
  const SVG='http://www.w3.org/2000/svg';
  let frame=0;
  const tasks=[];

  function schedule() {
    if(frame)return;
    frame=requestAnimationFrame(()=>{frame=0;for(const task of tasks)task();});
  }

  /* Ticker: runs by CSS once enabled; paused whenever it is offscreen or the tab is hidden. */
  const ticker=$('[data-ticker]');
  if(ticker) {
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{ticker.toggleAttribute('data-paused',!entry.isIntersecting);},{threshold:0}).observe(ticker);
    document.addEventListener('visibilitychange',()=>ticker.toggleAttribute('data-paused',document.hidden));
  }

  /* Route line: the spear travels the path as the section scrolls through the viewport. */
  const route=$('[data-route]');
  if(route) {
    const path=$('[data-route-path]',route), spear=$('[data-route-spear]',route), nodes=$('[data-route-nodes]',route), stops=$$('[data-route-stop]',route);
    const stage=$('.route-stage',route);
    if(path&&spear&&nodes&&stage&&path.getTotalLength) {
      const length=path.getTotalLength();
      const marks=[.02,.5,.98];
      const circles=marks.map(fraction=>{
        const point=path.getPointAtLength(length*fraction);
        const group=document.createElementNS(SVG,'g');group.setAttribute('class','route-node');
        const circle=document.createElementNS(SVG,'circle');
        circle.setAttribute('cx',point.x.toFixed(1));circle.setAttribute('cy',point.y.toFixed(1));circle.setAttribute('r','9');
        group.append(circle);nodes.append(group);return group;
      });
      path.style.strokeDasharray=String(length);
      const draw=progress=>{
        path.style.strokeDashoffset=String(length*(1-progress));
        const at=length*progress, ahead=path.getPointAtLength(Math.min(length,at+2)), here=path.getPointAtLength(at), behind=path.getPointAtLength(Math.max(0,at-2));
        const angle=Math.atan2(ahead.y-behind.y,ahead.x-behind.x)*180/Math.PI;
        spear.setAttribute('transform','translate('+here.x.toFixed(1)+' '+here.y.toFixed(1)+') rotate('+(angle+45).toFixed(1)+')');
        marks.forEach((fraction,i)=>{
          const on=progress>=fraction-.012;
          circles[i].classList.toggle('is-on',on);stops[i]?.classList.toggle('is-on',on);
        });
      };
      tasks.push(()=>{
        if(reduced()){draw(1);return;}
        const box=stage.getBoundingClientRect();
        draw(clamp((innerHeight*.9-box.top)/(box.height+innerHeight*.35)*1.15));
      });
      route.dataset.routeReady='true';
    }
  }

  /* Timeline: the line fills and each step lights as it passes the reading line. */
  const timeline=$('[data-timeline]');
  if(timeline) {
    const fill=$('[data-timeline-fill]',timeline), steps=$$('[data-timeline-step]',timeline);
    tasks.push(()=>{
      if(reduced()){fill?.style.setProperty('--p','1');steps.forEach(step=>step.classList.add('is-on'));return;}
      const box=timeline.getBoundingClientRect(), line=innerHeight*.62;
      fill?.style.setProperty('--p',String(clamp((line-box.top)/box.height)));
      steps.forEach(step=>step.classList.toggle('is-on',step.getBoundingClientRect().top<line));
    });
  }

  /* Reading reveal: words in the introduction statement light up in sequence. */
  const statement=$('.intro-statement');
  if(statement) {
    tasks.push(()=>{
      const words=$$('.motion-word',statement);
      if(!words.length)return;
      if(reduced()){words.forEach(word=>word.classList.add('is-lit'));return;}
      const box=statement.getBoundingClientRect();
      const progress=clamp((innerHeight*.88-box.top)/(innerHeight*.5+box.height*.4));
      const lit=Math.round(progress*words.length);
      words.forEach((word,i)=>word.classList.toggle('is-lit',i<lit));
    });
  }

  /* Bar card: the glass pours once when the card first comes into view. */
  const barCards=$$('.bar-card');
  if(barCards.length) {
    if('IntersectionObserver' in window) {
      const pour=new IntersectionObserver(entries=>{
        for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-poured');pour.unobserve(entry.target);}
      },{threshold:.55});
      barCards.forEach(card=>pour.observe(card));
    } else barCards.forEach(card=>card.classList.add('is-poured'));
  }

  /* FAQ index follows the group in view. */
  const index=$('[data-faq-index]');
  if(index&&'IntersectionObserver' in window) {
    const links=new Map($$('a',index).map(link=>[link.hash.slice(1),link]));
    const seen=new Map();
    const spy=new IntersectionObserver(entries=>{
      for(const entry of entries)seen.set(entry.target.id,entry.isIntersecting?entry.boundingClientRect.top:null);
      const current=[...seen].filter(([,top])=>top!==null).sort((a,b)=>Math.abs(a[1])-Math.abs(b[1]))[0];
      for(const [id,link]of links)link.toggleAttribute('aria-current',current?.[0]===id);
      for(const [id,link]of links)if(current?.[0]===id)link.setAttribute('aria-current','true');
    },{rootMargin:'-20% 0px -55% 0px'});
    for(const id of links.keys()){const el=document.getElementById(id);if(el)spy.observe(el);}
  }

  /* Pointer effects only run with a fine pointer and full motion. */
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reduced())return;
    const card=event.target.closest?.('[data-spotlight]');
    if(card) {
      const box=card.getBoundingClientRect();
      card.style.setProperty('--mx',(event.clientX-box.left).toFixed(0)+'px');card.style.setProperty('--my',(event.clientY-box.top).toFixed(0)+'px');
    }
    if(!finePointer.matches)return;
    const tilt=event.target.closest?.('[data-tilt]');
    if(tilt) {
      const box=tilt.getBoundingClientRect();
      const x=(event.clientX-box.left)/box.width-.5, y=(event.clientY-box.top)/box.height-.5;
      tilt.style.transform='perspective(1000px) rotateX('+(-y*4).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg)';
    }
    const magnet=event.target.closest?.('.button,.nav-cta,.round-button');
    if(magnet) {
      const box=magnet.getBoundingClientRect();
      const dx=event.clientX-(box.left+box.width/2), dy=event.clientY-(box.top+box.height/2);
      magnet.style.setProperty('--tx',clamp(dx*.14,-7,7).toFixed(1)+'px');magnet.style.setProperty('--ty',clamp(dy*.2,-5,5).toFixed(1)+'px');
    }
  },{passive:true});
  document.addEventListener('pointerout',event=>{
    const from=event.target.closest?.('[data-tilt],.button,.nav-cta,.round-button');
    if(!from||from.contains(event.relatedTarget))return;
    if(from.matches('[data-tilt]'))from.style.removeProperty('transform');
    from.style.removeProperty('--tx');from.style.removeProperty('--ty');
  },{passive:true});
  for(const el of $$('.service-photo,.detail-image,.story-main,.process-picture'))el.dataset.tilt='';

  const run=()=>schedule();
  if(tasks.length) {
    window.addEventListener('scroll',run,{passive:true});window.addEventListener('resize',run,{passive:true});
    document.addEventListener('spear:motion-preference',run);window.addEventListener('pageshow',run);
    schedule();
    // Words are split by the motion module after load; check again once it has settled.
    setTimeout(run,400);setTimeout(run,1400);
  }
  root.classList.add('fx-ready');
  return {refresh:run};
}
