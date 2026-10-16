import * as THREE from 'three';
import './style.css';
import {N,S} from './data/scenario';
import {MORE,QZ} from './data/content';
import {sc,cam,R,cv,rings,LED,box,cyl,label,moveCars} from './scene/city';

/* ===== 4. ДВИЖОК: грузовики, шаги, воспроизведение ===== */
const V=(id)=>new THREE.Vector3(N[id].x,0,N[id].z),SPEED=11;
let cur=0,T=0,endT=0,trucks=[],extras=[],auto=false,mode='s';
function mkTruck(c,l){const g=new THREE.Group(),col=new THREE.Color(c);
 g.add(box(1.7,.3,3.2,0x111827,0,.5,.1),box(1.8,1.3,2,col,0,1.25,-.5,col.clone().multiplyScalar(.3)),box(1.84,.18,2.04,0xffffff,0,1.3,-.5),box(1.6,.95,.95,0x1b2536,0,1,1.05),box(1.3,.4,.05,0x9be4ff,0,1.25,1.55,0x4488aa),box(.3,.2,.1,0xffffcc,-.5,.65,1.7,0xffffaa),box(.3,.2,.1,0xffffcc,.5,.65,1.7,0xffffaa),box(1.4,.2,.1,0xff3030,0,.65,-1.7,0xaa0000));[-1,1].forEach(sx=>[-.9,.1,1.1].forEach(wz=>{const w=cyl(.36,.36,.3,0x0b0f1a,sx*.88,.38,wz,12);w.rotation.z=Math.PI/2;g.add(w)}));
 const s=label(l,{size:.8,bg:c,fg:'#0b1220'});s.position.set(0,3,0);g.add(s);sc.add(g);g.visible=false;return g}
function clearStep(){trucks.forEach(t=>sc.remove(t.g));extras.forEach(e=>sc.remove(e));trucks=[];extras=[]}
function build(){const lossOn=$('loss').checked;let prevEnd=0;endT=0;let list=S[cur].tr.map(o=>({...o}));
 if(lossOn){list.filter(o=>o.loss).forEach(o=>list.push({...o,loss:0,after:1,l:'Повтор: '+o.l}))}
 list.forEach(o=>{const lose=lossOn&&o.loss,pts=o.p.map(V),lens=[];let tot=0;
  for(let i=1;i<pts.length;i++){const d=pts[i].distanceTo(pts[i-1]);lens.push(d);tot+=d}
  const dur=tot*(lose?.5:1)/SPEED,st=o.after?prevEnd:(o.d||0);prevEnd=st+dur+.3;endT=Math.max(endT,st+dur);
  trucks.push({g:mkTruck(lose?'#ff7b7b':o.c,o.l),pts,lens,tot,st,dur,lose,fin:false,end:o.p[o.p.length-1]})})}
function place(k,s){let i=0;while(i<k.lens.length-1&&s>k.lens[i]){s-=k.lens[i];i++}
 const a=k.pts[i],b=k.pts[i+1],f=Math.min(1,s/k.lens[i]);k.g.position.lerpVectors(a,b,f);k.g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);return k.g.position}
function go(i){cur=Math.max(0,Math.min(S.length-1,i));clearStep();T=0;build();
 const st=S[cur],hl=st.hl||[st.f];for(const id in rings)rings[id].userData.on=hl.includes(id);
 fly.f.copy(cs.t);fly.fd=cs.d;cg.t.copy(V(st.f));cg.d=st.d;fly.p=0;fly.lift=cs.t.distanceTo(cg.t)*.5;T=-1.4;ui()}
function tick(dt){T+=dt;moveCars(dt);
 trucks.forEach(k=>{const u=(T-k.st)/k.dur;
  if(u>=0&&u<1){k.g.visible=true;const e=.5*u+.5*ease(u);place(k,e*k.tot*(k.lose?.5:1));k.g.scale.setScalar(Math.min(1,u*10,(1-u)*10+.2))}
  else if(u>=1&&!k.fin){k.fin=true;k.g.visible=false;if(rings[k.end])rings[k.end].userData.pulse=1;
   if(k.lose){const e=label('потерян!',{size:.9,bg:'#ff4d4d'});e.position.copy(place(k,k.tot*.5));e.position.y=2.5;sc.add(e);extras.push(e)}}});
 if(auto&&T>endT+1.8){if(cur<S.length-1)go(cur+1);else if($('loop').checked)go(0);else{auto=false;ui()}}}

/* ===== 5. КАМЕРА (орбита вручную) ===== */
const cs={az:.75,pol:1,d:70,t:new THREE.Vector3(0,0,4)},cg={d:56,t:new THREE.Vector3(0,0,4)};
let drag=null;const fly={p:1,f:new THREE.Vector3(),fd:0,lift:0},ease=x=>x*x*(3-2*x);
cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointerup',()=>drag=null);
cv.addEventListener('pointermove',e=>{if(!drag)return;cs.az-=(e.clientX-drag[0])*.005;cs.pol=Math.max(.35,Math.min(1.4,cs.pol-(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY]});
cv.addEventListener('wheel',e=>{e.preventDefault();cg.d=Math.max(14,Math.min(90,cg.d*(1+e.deltaY*.001)))},{passive:false});
function size(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();

/* ===== 6. ИНТЕРФЕЙС ===== */
const $=(id:string):any=>document.getElementById(id),dots=$('dots');
S.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Шаг '+(i+1)+': '+s.t);b.onclick=()=>go(i);dots.appendChild(b)});
function ui(){const s=S[cur];$('no').textContent='Шаг '+(cur+1)+' из '+S.length;$('ti').textContent=s.t;$('tx').textContent=mode=='s'?s.s:s.x;
 $('prev').disabled=cur==0;$('next').disabled=cur==S.length-1;$('auto').setAttribute('aria-pressed',auto);
 $('mS').setAttribute('aria-pressed',mode=='s');$('mT').setAttribute('aria-pressed',mode=='t');
 [...dots.children].forEach((b,i)=>b.className=i==cur?'on':i<cur?'done':'')}
$('prev').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);$('again').onclick=()=>go(cur);
$('auto').onclick=()=>{auto=!auto;ui()};$('mS').onclick=()=>{mode='s';ui()};$('mT').onclick=()=>{mode='t';ui()};
$('loss').onchange=()=>go(cur);$('loop').onchange=()=>{if($('loop').checked)auto=true;ui()};
addEventListener('keydown',e=>{if(D.open)return;if(e.key=='ArrowRight')go(cur+1);if(e.key=='ArrowLeft')go(cur-1)});

/* ===== Окно: подробнее и квиз ===== */
const D=$('dlg'),DC=$('dc'),esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function view(h){DC.innerHTML=h;auto=false;ui();if(!D.open)D.showModal();$('cl').onclick=()=>D.close()}
const CL='<div class="row"><button id="cl">Закрыть</button>';
let qs=[],qi=0,ok=0,miss=[];
function quiz(list){qs=list;qi=0;ok=0;miss=[];qview()}
function qview(){const q=qs[qi];if(!q)return qend();let done=false;
 view('<div class="bar"><i style="width:'+qi/qs.length*100+'%"></i></div><p style="color:var(--mute);margin:0 0 6px">Вопрос '+(qi+1)+' из '+qs.length+'</p><h3>'+q.q+'</h3>'+q.o.map((o,i)=>'<button class="opt" data-i="'+i+'">'+o+'</button>').join('')+'<div id="fb"></div>'+CL+'</div>');
 DC.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(done)return;done=true;const i=+b.dataset.i;
  DC.querySelectorAll('.opt')[q.a].classList.add('ok');if(i==q.a)ok++;else{b.classList.add('bad');miss.push(q.s)}
  $('fb').innerHTML='<div class="ex">'+(i==q.a?'Верно. ':'Не совсем. ')+q.e+'</div><button class="p" id="nq">'+(qi<qs.length-1?'Дальше':'Результат')+'</button>';
  $('nq').onclick=()=>{qi++;qview()};$('nq').focus()})}
function qend(){const u=[...new Set(miss)],pc=Math.round(ok/qs.length*100);
 view('<h3>Результат: '+ok+' из '+qs.length+' ('+pc+'%)</h3><p>'+(pc==100?'Без ошибок. Вы понимаете, как устроен путь запроса.':pc>=60?'Хорошо. Повторите шаги, где были ошибки:':'Стоит пройти сценарий ещё раз, особенно эти шаги:')+'</p>'+u.map(s=>'<button class="opt" data-s="'+s+'">Шаг '+(s+1)+': '+S[s].t+'</button>').join('')+'<div class="row"><button class="p" id="rq">Пройти ещё раз</button><button id="cl">Закрыть</button></div>');
 DC.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{D.close();go(+b.dataset.s)});$('rq').onclick=()=>quiz(qs)}
$('more').onclick=()=>{const m=MORE[cur];view('<h3>'+S[cur].t+'</h3><p>'+m.t+'</p><p style="margin-bottom:6px">Попробуйте сами:</p><pre>'+esc(m.c)+'</pre><div class="row"><button class="p" id="qh">Вопросы по этому шагу</button><button id="cl">Закрыть</button></div>');
 $('qh').onclick=()=>quiz(QZ.filter(q=>q.s==cur))};
$('quiz').onclick=()=>quiz(QZ);
/* ===== 7. ЦИКЛ ===== */
const clk=new THREE.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);tick(dt);
 if(fly.p<1){fly.p=Math.min(1,fly.p+dt/2);const e=ease(fly.p);cs.t.lerpVectors(fly.f,cg.t,e);cs.d=fly.fd+(cg.d-fly.fd)*e+Math.sin(Math.PI*fly.p)*(10+fly.lift);cs.az+=dt*.15*Math.sin(Math.PI*fly.p)}else{cs.t.lerp(cg.t,.05);cs.d+=(cg.d-cs.d)*.05;if(!drag)cs.az+=dt*.02}
 cam.position.set(cs.t.x+cs.d*Math.sin(cs.pol)*Math.sin(cs.az),cs.d*Math.cos(cs.pol),cs.t.z+cs.d*Math.sin(cs.pol)*Math.cos(cs.az));cam.lookAt(cs.t);
 const p=.55+.35*Math.sin(performance.now()/300);
 for(const id in rings){const r=rings[id],u=r.userData;u.pulse=Math.max(0,(u.pulse||0)-dt*1.5);r.scale.setScalar(1+u.pulse*.6);r.material.opacity+=((u.on?p:0)+u.pulse*.6-r.material.opacity)*.15}
 const tt=performance.now()/1000;LED.forEach((m,i)=>m.emissiveIntensity=.3+.7*Math.abs(Math.sin(tt*2.2+i*1.7)));R.render(sc,cam)}
go(0);loop();
