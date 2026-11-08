/* COOL / CYCLE — interactive labs */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const shell=(el,tag,title,desc,body)=>{el.classList.add('lab');el.innerHTML=`<div class="lab-head"><span class="lab-tag">${tag}</span><h4>${title}</h4><p>${desc}</p></div>${body}`};
const rng=(id,label,min,max,step,val,unit)=>`<label class="ctl"><span>${label}: <b id="${id}v"></b> ${unit}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const g=id=>+$('#'+id).value, put=(id,t)=>{$('#'+id).textContent=t};
const mk=(W,H,xr,yr)=>({W,H,X:x=>40+(x-xr[0])/(xr[1]-xr[0])*(W-55),Y:y=>H-30-(y-yr[0])/(yr[1]-yr[0])*(H-45)});
const axes=m=>`<path class="ax" d="M40 15V${m.H-30}H${m.W-15}"/>`;
const line=(f,xr,m,n=60)=>'M'+Array.from({length:n+1},(_,i)=>{const x=xr[0]+(xr[1]-xr[0])*i/n;return m.X(x).toFixed(1)+' '+m.Y(f(x)).toFixed(1)}).join('L');
const txt=(x,y,t,c='')=>`<text class="pt ${c}" x="${x}" y="${y}">${t}</text>`;
const dot=(x,y)=>`<circle class="dot" cx="${x}" cy="${y}" r="7"/>`;

function split(el){
 shell(el,'TRY IT · PROPERTIES','Cut the system in half','Press the buttons and watch which properties change. Intensive ones stay put; extensive ones scale with the amount.',
 `<div class="btns"><button data-k="h">Cut in half</button><button data-k="d">Double it</button><button data-k="r">Reset</button></div><div class="beaker"><i id="spBar"></i></div><div class="cards" id="spCards"></div>`);
 let m=1;
 const draw=()=>{const f=(v,d=2)=>v.toFixed(d);
  const rows=[['Temperature','60 °C','int'],['Density','1.00 g/cm³','int'],['Mass',f(m,m<1?3:2)+' kg','ext'],['Volume',f(m,m<1?3:2)+' L','ext'],['Heat stored (above 20 °C)',f(m*4.18*40,1)+' kJ','ext']];
  $('#spCards').innerHTML=rows.map(r=>`<div class="card ${r[2]}"><small>${r[2]==='int'?'INTENSIVE':'EXTENSIVE'}</small><b>${r[1]}</b><span>${r[0]}</span></div>`).join('');
  $('#spBar').style.width=Math.min(100,m/4*100)+'%'};
 $$('button',el).forEach(b=>b.onclick=()=>{const k=b.dataset.k;m=k==='h'?Math.max(.125,m/2):k==='d'?Math.min(8,m*2):1;draw()});draw();
}

function process(el){
 const P=[['Isothermal','T constant',t=>[1+2*t,3/(1+2*t)],'Temperature is fixed, so the heat absorbed equals the work done by the gas.'],
 ['Isobaric','P constant',t=>[1+2*t,3],'Pressure is fixed. Heating makes the gas expand and push outwards.'],
 ['Isochoric','V constant',t=>[1,3-2.5*t],'Volume is fixed, so there is no expansion work. Removing heat lowers the pressure.'],
 ['Adiabatic','No heat exchange',t=>{const V=1+2*t;return[V,3*Math.pow(V,-1.4)]},'No heat flows. The gas uses its own energy to expand, so it cools.']];
 shell(el,'TRY IT · PROCESSES','P–V explorer','Pick a process, then drag the slider to move the gas from its start state. The ideal-gas temperature follows from T ∝ P × V.',
 `<div class="btns" id="prBtns">${P.map((p,i)=>`<button data-i="${i}">${p[0]}</button>`).join('')}</div>${rng('prT','Progress',0,1,.01,.5,'')}<div class="split"><svg id="prSvg" viewBox="0 0 320 220"></svg><div class="read"><p id="prDesc"></p><div class="cards"><div class="card"><small>VOLUME</small><b id="prV"></b></div><div class="card"><small>PRESSURE</small><b id="prP"></b></div><div class="card"><small>TEMPERATURE</small><b id="prTe"></b></div></div></div></div>`);
 const m=mk(320,220,[.8,3.2],[0,3.4]);let cur=0;
 const up=()=>{const t=g('prT');put('prTv','');const[V,Pp]=P[cur][2](t);
  const curves=P.map((p,i)=>{const pts='M'+Array.from({length:41},(_,k)=>{const[v,pr]=p[2](k/40);return m.X(v).toFixed(1)+' '+m.Y(pr).toFixed(1)}).join('L');return`<path class="cv ${i===cur?'':'faint'}" d="${pts}"/>`}).join('');
  $('#prSvg').innerHTML=axes(m)+curves+dot(m.X(V),m.Y(Pp))+txt(250,212,'Volume →')+txt(4,12,'Pressure ↑');
  put('prV',V.toFixed(2)+' L');put('prP',Pp.toFixed(2)+' atm');put('prTe',Math.round(100*V*Pp)+' K');put('prDesc',P[cur][1]+'. '+P[cur][3]);
  $$('#prBtns button').forEach((b,i)=>b.classList.toggle('on',i===cur))};
 $$('#prBtns button').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;up()});$('#prT').oninput=up;up();
}

function gibbs(el){
 shell(el,'TRY IT · FREE ENERGY','Will it happen on its own?','Change ΔH, ΔS and temperature. A reaction is spontaneous when ΔG = ΔH − TΔS is negative.',
 `${rng('gH','ΔH',-200,200,5,-100,'kJ')}${rng('gS','ΔS',-300,300,5,150,'J/K')}${rng('gT','Temperature',100,1000,10,298,'K')}<div class="split"><svg id="gSvg" viewBox="0 0 320 220"></svg><div class="read"><div class="verdict" id="gV"></div><p id="gN"></p></div></div>`);
 const up=()=>{const H=g('gH'),S=g('gS'),T=g('gT');put('gHv',H);put('gSv',S);put('gTv',T);
  const G=t=>H-t*S/1000,vals=[G(100),G(1000),0],lo=Math.min(...vals)-20,hi=Math.max(...vals)+20,m=mk(320,220,[100,1000],[lo,hi]);
  $('#gSvg').innerHTML=axes(m)+`<path class="zero" d="M40 ${m.Y(0)}H305"/>`+`<path class="cv" d="${line(G,[100,1000],m,2)}"/>`+dot(m.X(T),m.Y(G(T)))+txt(220,212,'Temperature →')+txt(4,12,'ΔG (kJ)')+txt(44,m.Y(0)-5,'ΔG = 0');
  const d=G(T),ok=d<0;$('#gV').className='verdict '+(ok?'good':'bad');$('#gV').innerHTML=`ΔG = ${d.toFixed(1)} kJ<br>${ok?'Spontaneous':'Not spontaneous (the reverse is)'}`;
  put('gN',H<0&&S>0?'ΔH < 0 and ΔS > 0: spontaneous at every temperature.':H>0&&S<0?'ΔH > 0 and ΔS < 0: never spontaneous.':S===0?'With ΔS = 0, only ΔH decides.':`The sign flips at T = ΔH/ΔS ≈ ${Math.round(H/S*1000)} K${H/S*1000>0?'':' (outside real temperatures)'}.`)};
 $$('input',el).forEach(i=>i.oninput=up);up();
}

function nernst(el){
 shell(el,'TRY IT · NERNST EQUATION','Electrode potential vs concentration','At 298 K: E = E° + (0.0591 / n) × log[Mⁿ⁺]. Slide the concentration and see E change.',
 `${rng('nE','E°',-1,1.5,.01,.34,'V')}${rng('nN','n (electrons)',1,3,1,2,'')}${rng('nC','log₁₀[Mⁿ⁺]',-6,1,.1,0,'')}<div class="split"><svg id="nSvg" viewBox="0 0 320 220"></svg><div class="read"><div class="cards"><div class="card"><small>CONCENTRATION</small><b id="nCc"></b></div><div class="card"><small>ELECTRODE POTENTIAL E</small><b id="nEo"></b></div></div><p id="nNote"></p></div></div>`);
 const up=()=>{const E0=g('nE'),n=g('nN'),x=g('nC');put('nEv',E0.toFixed(2));put('nNv',n);put('nCv',x.toFixed(1));
  const f=v=>E0+.0591/n*v,m=mk(320,220,[-6,1],[E0-.45,E0+.12]),E=f(x);
  $('#nSvg').innerHTML=axes(m)+`<path class="zero" d="M${m.X(0)} 15V190"/>`+`<path class="cv" d="${line(f,[-6,1],m,2)}"/>`+dot(m.X(x),m.Y(E))+txt(200,212,'log[Mⁿ⁺] →')+txt(4,12,'E (V)');
  put('nCc',(Math.pow(10,x)>=.01?Math.pow(10,x).toFixed(2):Math.pow(10,x).toExponential(1))+' M');put('nEo',E.toFixed(3)+' V');
  put('nNote',`Each 10× drop in concentration lowers E by ${(.0591/n).toFixed(3)} V. At 1 M, log = 0 and E = E°.`)};
 $$('input',el).forEach(i=>i.oninput=up);up();
}

function titration(el){
 shell(el,'TRY IT · TITRATION','Find the equivalence point','Add titrant a little at a time. The EMF jumps near 10 mL. Try the weak or dilute case, where the jump is hard to see and ΔE/ΔV helps.',
 `<div class="btns" id="tiBtns"><button data-k="1.2" class="on">Strong / concentrated</button><button data-k=".35">Weak / dilute</button></div>${rng('tiV','Titrant added',0,20,.1,3,'mL')}<div class="split"><svg id="tiA" viewBox="0 0 320 220"></svg><svg id="tiB" viewBox="0 0 320 220"></svg></div><p id="tiN" class="verdict"></p>`);
 let k=1.2;const s=v=>1/(1+Math.exp(-k*(v-10))),E=v=>250+250*s(v),D=v=>250*k*s(v)*(1-s(v));
 const up=()=>{const v=g('tiV');put('tiVv',v.toFixed(1));
  const a=mk(320,220,[0,20],[230,520]),b=mk(320,220,[0,20],[0,80]);
  $('#tiA').innerHTML=axes(a)+`<path class="dash" d="M${a.X(10)} 15V190"/>`+`<path class="cv" d="${line(E,[0,20],a)}"/>`+dot(a.X(v),a.Y(E(v)))+txt(60,212,'Volume (mL) →')+txt(4,12,'E (mV)');
  $('#tiB').innerHTML=axes(b)+`<path class="dash" d="M${b.X(10)} 15V190"/>`+`<path class="cv" d="${line(D,[0,20],b)}"/>`+dot(b.X(v),b.Y(D(v)))+txt(60,212,'Volume (mL) →')+txt(4,12,'ΔE/ΔV');
  const near=Math.abs(v-10)<.8;$('#tiN').className='verdict '+(near?'good':'');$('#tiN').textContent=near?'Equivalence point reached: ΔE/ΔV is at its peak.':`E = ${E(v).toFixed(0)} mV · ΔE/ΔV = ${D(v).toFixed(1)}`};
 $$('#tiBtns button').forEach(b=>b.onclick=()=>{k=+b.dataset.k;$$('#tiBtns button').forEach(x=>x.classList.toggle('on',x===b));up()});$('#tiV').oninput=up;up();
}

function quiz(el){
 const Q=[['Which property is intensive?',['Mass','Volume','Temperature','Total energy'],2,'Temperature does not change when you cut a system in half.'],
 ['Which process happens at constant temperature?',['Isothermal','Isobaric','Isochoric','Adiabatic'],0,'Iso-thermal means same temperature.'],
 ['ΔH < 0 and ΔS > 0. When is the reaction spontaneous?',['Only at high T','Only at low T','At every temperature','Never'],2,'Both terms push ΔG = ΔH − TΔS negative.'],
 ['In the Daniell cell, where does oxidation occur?',['Cu cathode','Zn anode','Salt bridge','Voltmeter'],1,'Zn → Zn²⁺ + 2e⁻ at the anode.'],
 ['n = 2 at 298 K. [Mⁿ⁺] falls 100×. How does E change?',['+0.0591 V','No change','−0.118 V','−0.0591 V'],3,'ΔE = (0.0591/2) × (−2) = −0.0591 V.'],
 ['In a potentiometric titration, the equivalence point is where…',['E is zero','ΔE/ΔV is at its peak','EMF is lowest','Volume is zero'],1,'The steepest rise of E is the peak of ΔE/ΔV.']];
 shell(el,'SELF-CHECK','Six quick questions','Pick an answer to see the explanation.','<div id="qz"></div>');
 let i=0,score=0;const box=$('#qz',el);
 const show=()=>{if(i>=Q.length){box.innerHTML=`<div class="verdict good">You scored ${score} / ${Q.length}</div><div class="btns"><button id="qr">Try again</button></div>`;$('#qr').onclick=()=>{i=0;score=0;show()};return}
  const q=Q[i];box.innerHTML=`<small class="qn">QUESTION ${i+1} / ${Q.length}</small><p class="qq">${q[0]}</p><div class="opts">${q[1].map((o,n)=>`<button data-n="${n}">${o}</button>`).join('')}</div><p id="qx" class="qx"></p>`;
  $$('.opts button',box).forEach(b=>b.onclick=()=>{if(box.dataset.done==i)return;box.dataset.done=i;const n=+b.dataset.n,ok=n===q[2];if(ok)score++;
   $$('.opts button',box).forEach((x,j)=>x.classList.add(j===q[2]?'right':j===n?'wrong':'dim'));
   $('#qx').innerHTML=`${ok?'Correct. ':'Not quite. '}${q[3]} <button id="qn">${i+1<Q.length?'Next →':'See score'}</button>`;$('#qn').onclick=()=>{i++;show()}})};
 show();
}
const map={split,process,gibbs,nernst,titration,quiz};
$$('[data-lab]').forEach(el=>map[el.dataset.lab]&&map[el.dataset.lab](el));
})();
