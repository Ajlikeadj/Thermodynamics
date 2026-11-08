/* COOL / CYCLE — experience layer v2 (original, site palette, root only) */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Loader */
const loader=$('#sxLoader'),pct=$('#sxPct'),bar=$('#sxBar');
let p=0;
function dismissLoader(){document.body.classList.add('sx-loaded');loader?.setAttribute('aria-hidden','true');setTimeout(()=>loader?.remove(),1200)}
const timer=setInterval(()=>{p=Math.min(100,p+8+Math.random()*10);if(pct)pct.textContent=Math.round(p)+'%';if(bar)bar.style.width=p+'%';
 if(p>=100){clearInterval(timer);setTimeout(dismissLoader,250)}},90);
setTimeout(dismissLoader,2500);

/* Circle cursor + faint trail (native cursor is hidden via CSS) */
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
if(fine&&!reduced){
 const cur=$('#sxCursor'),ring=$('#sxRing'),cv=$('#sxInk'),cx=cv.getContext('2d');
 let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,trail=[];
 const size=()=>{cv.width=innerWidth;cv.height=innerHeight};size();addEventListener('resize',size);
 addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(Math.random()<.6)trail.push({x:mx,y:my,r:2+Math.random()*4,a:.5,c:Math.random()<.5?'247,125,83':'165,220,225'});if(trail.length>24)trail.shift()},{passive:true});
 document.addEventListener('mouseover',e=>{ring?.classList.toggle('is-hover',!!e.target.closest('a,button,.graph-point,.sx-panel'))});
 (function loop(){
  rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
  if(cur)cur.style.transform='translate('+mx+'px,'+my+'px)';
  if(ring)ring.style.transform='translate('+rx+'px,'+ry+'px) scale('+(ring.classList.contains('is-hover')?1.5:1)+')';
  cx.clearRect(0,0,cv.width,cv.height);
  trail=trail.filter(t=>t.a>.02);
  for(const t of trail){t.a*=.93;cx.beginPath();cx.arc(t.x,t.y,t.r*t.a+.5,0,6.283);cx.fillStyle='rgba('+t.c+','+(t.a*.5)+')';cx.fill()}
  requestAnimationFrame(loop);
 })();
}

/* Molecule journey: panels reveal on scroll; clicking a panel jumps to + syncs the real cycle story */
const panelIO=new IntersectionObserver(es=>es.forEach(e=>{e.target.classList.toggle('in',e.isIntersecting)}),{threshold:.4});
$$('.sx-panel').forEach((el,i)=>{el.dataset.step=i;panelIO.observe(el);
 el.addEventListener('click',()=>{
  $$('.sx-panel').forEach(x=>x.classList.remove('on'));el.classList.add('on');
  const step=i; // panels 0-2 map to cycle steps 0-2 (1:1 with story order)
  const target=$$('.story')[step];target?.click();
  $('#cycle')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
 });
});
$$('.story').forEach((s,i)=>s.addEventListener('click',()=>{$$('.sx-panel').forEach((x,j)=>x.classList.toggle('on',j===i))}));

/* Frame-close for existing sections */
const fIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('in',e.isIntersecting)),{threshold:.08});
$$('.laws-section,.cycle-section,.system-section,.entropy-section').forEach(el=>{el.classList.add('sx-framed');fIO.observe(el)});

/* Giant word parallax */
const words=$$('.sx-word>span');
if(!reduced)addEventListener('scroll',()=>{words.forEach(w=>{const r=w.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;w.style.transform='translateX('+((r.top/innerHeight-.5)*-50)+'px)'})},{passive:true});

/* Entropy vortex — a hot core spirals out into cold disorder;
   stirring injects work, and the swirl scatters outward. */
const vc=$('#sxVortex');
if(vc){
 const vctx=vc.getContext('2d');
 let W=0,H=0,parts=[],mx=-999,my=-999,pvx=0,pvy=0,visible=true,flash=0,raf=0,swirl=1,lastT=0;
 const coarse=matchMedia('(pointer:coarse)').matches,nearR=coarse?230:170;
 const maxR=()=>Math.max(W,H)*.72;
 const resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);W=vc.offsetWidth||600;H=vc.offsetHeight||360;vc.width=W*dpr;vc.height=H*dpr;vctx.setTransform(dpr,0,0,dpr,0,0)};
 resize();addEventListener('resize',()=>{resize();parts.length=Math.min(parts.length,Math.round(Math.min(240,Math.max(110,W*H/3600))))});
 const spawn=p=>{p.a=Math.random()*6.283;p.r=18+Math.random()*maxR();p.z=.45+Math.random()*.55;p.tw=Math.random()*6.283;p.twS=.02+Math.random()*.06;p.eject=Math.random()<.05;p.px=0;p.py=0;p.born=false;return p};
 parts=Array.from({length:Math.round(Math.min(240,Math.max(110,W*H/3600)))},()=>spawn({}));
 const hot=[247,125,83],cold=[165,220,225];
 const mix=(a,b,t)=>Math.round(a+(b-a)*t);
 const col=(pt,t)=>'rgba('+mix(hot[0],cold[0],t)+','+mix(hot[1],cold[1],t)+','+mix(hot[2],cold[2],t)+',';
 const draw=()=>{
  vctx.clearRect(0,0,W,H);const cx0=W/2,cy0=H/2,R=maxR();
  /* faint spiral arms */
  vctx.save();vctx.globalAlpha=.10;vctx.strokeStyle='#a9aea6';vctx.lineWidth=1;
  for(let s=0;s<3;s++){vctx.beginPath();for(let r=10;r<R;r+=6){const a=s*2.094+r*.028,x=cx0+Math.cos(a)*r,y=cy0+Math.sin(a)*r*.62;r===10?vctx.moveTo(x,y):vctx.lineTo(x,y)}vctx.stroke()}
  vctx.restore();
  /* hot core glow — breathes slowly (~11 breaths/min) and brightens with speed */
  const now=performance.now(),dt=Math.min(100,lastT?now-lastT:16.7);lastT=now;
  const breathe=.75+.25*Math.sin(now/2800),speedGlow=Math.min(1,Math.abs(swirl-1))*.35;
  const g=vctx.createRadialGradient(cx0,cy0,0,cx0,cy0,R*.42);
  g.addColorStop(0,'rgba(247,125,83,'+((.28+flash*.3+speedGlow)*breathe)+')');g.addColorStop(.5,'rgba(247,125,83,.08)');g.addColorStop(1,'rgba(247,125,83,0)');
  vctx.fillStyle=g;vctx.fillRect(cx0-R*.42,cy0-R*.3,R*.84,R*.6);
  /* Stir WITH the spin (clockwise, matching particle rotation) to speed up;
     stir AGAINST it to brake. Signed angular velocity of the pointer:
     w>0 same direction as particles, w<0 opposite. The speed eases toward
     the target so it coasts back to normal slowly after you leave. */
  let target=1;
  if(mx>-900){const px=mx-cx0,py=(my-cy0)/.62,r2=px*px+py*py;
   if(r2>900){const w=(px*(pvy/.62)-py*pvx)/r2;target=Math.max(.15,Math.min(3.2,1+w*9))}}
  /* exponential ease, time constant ~1s → ~3s to mostly settle (frame-rate independent) */
  swirl+=(target-swirl)*(1-Math.exp(-dt/1000));
  const stir=Math.min(3,Math.hypot(pvx,pvy)/38)*Math.min(1,Math.abs(swirl-1)+.15);
  pvx*=.9;pvy*=.9;flash*=.92;
  for(const pt of parts){
   pt.tw+=pt.twS;
   const d=Math.hypot(mx-(cx0+Math.cos(pt.a)*pt.r),my-(cy0+Math.sin(pt.a)*pt.r*.62));
   const near=d<nearR?1-d/nearR:0;
   pt.a+=(((2600/(pt.r+60))*.0016)*swirl+near*stir*.02)*pt.z*(1+flash*2.5);
   pt.r+=pt.eject?.28:-.05+near*stir*.55;
   if(pt.r>R+30){spawn(pt);pt.r=R+20}
   if(pt.r<12){pt.r=14;pt.eject=Math.random()<.3}
   const x=cx0+Math.cos(pt.a)*pt.r,y=cy0+Math.sin(pt.a)*pt.r*.62;
   const t=Math.max(0,Math.min(1,pt.r/R));
   const alpha=(.25+.75*pt.z)*(.7+.3*Math.sin(pt.tw))*(1+near*.6);
   if(pt.born){vctx.strokeStyle=col(pt,t)+alpha*(.45+Math.min(1,Math.abs(swirl-1))*.4)+')';vctx.lineWidth=(.8+Math.min(1,Math.abs(swirl-1))*.8)*pt.z;vctx.beginPath();vctx.moveTo(pt.px,pt.py);vctx.lineTo(x,y);vctx.stroke()}
   pt.px=x;pt.py=y;pt.born=true;
   vctx.beginPath();vctx.arc(x,y,.7+1.7*pt.z,0,6.283);vctx.fillStyle=col(pt,t)+alpha+')';vctx.fill();
  }
  vctx.beginPath();vctx.arc(cx0,cy0,3+flash*7,0,6.283);vctx.fillStyle='rgba(247,125,83,'+(.7+flash*.3)+')';vctx.fill();
 };
 vc.addEventListener('pointermove',e=>{const b=vc.getBoundingClientRect(),nx=e.clientX-b.left,ny=e.clientY-b.top;pvx=(nx-mx)*.7+pvx*.3;pvy=(ny-my)*.7+pvy*.3;mx=nx;my=ny},{passive:true});
 const clearPtr=()=>{mx=-999;my=-999;pvx=pvy=0};
 vc.addEventListener('pointerleave',clearPtr);
 vc.addEventListener('pointerup',clearPtr);
 vc.addEventListener('pointercancel',clearPtr);
 vc.addEventListener('pointerdown',e=>{const b=vc.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;flash=1;for(const pt of parts)if(Math.hypot(mx-(cx0(W)+Math.cos(pt.a)*pt.r),my-(cy0(H)+Math.sin(pt.a)*pt.r*.62))<200)pt.eject=true},{passive:true});
 function cx0(w){return w/2}function cy0(h){return h/2}
 new IntersectionObserver(es=>{const vis=es[0].isIntersecting;if(vis&&!raf)loop();visible=vis},{threshold:.05}).observe(vc);
 if(reduced){draw()}else{(function loop(){raf=requestAnimationFrame(loop);if(visible)draw()})()}
}
})();
