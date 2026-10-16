import * as THREE from 'three';
import {N,E} from '../data/scenario';

/* ===== 3. СЦЕНА ===== */
const cv=document.getElementById('c') as HTMLCanvasElement,R=new THREE.WebGLRenderer({canvas:cv,antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.35;
const sc=new THREE.Scene();sc.background=new THREE.Color(0x0a1220);sc.fog=new THREE.Fog(0x0a1220,90,230);
const cam=new THREE.PerspectiveCamera(50,1,.5,300);
sc.add(new THREE.HemisphereLight(0x8fb3ff,0x1a2233,.9));
const sun=new THREE.DirectionalLight(0xbcd0ff,.9);sun.position.set(-40,70,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:80,bottom:-80,far:250});sun.shadow.bias=-.0005;sc.add(sun);
const M=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0,});
const box=(w,h,d,c,x,y,z,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,e));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m};
function label(text:string,o:{size?:number,bg?:string,fg?:string}={}){const k=o.size||1,cn=document.createElement('canvas'),g=cn.getContext('2d'),f='600 26px Onest,system-ui,sans-serif';
 g.font=f;const w=Math.ceil(g.measureText(text).width)+28;cn.width=w;cn.height=46;g.font=f;
 g.fillStyle=o.bg||'rgba(8,14,26,.82)';g.beginPath();g.roundRect?g.roundRect(0,0,w,46,12):g.rect(0,0,w,46);g.fill();
 g.fillStyle=o.fg||'#fff';g.textBaseline='middle';g.fillText(text,14,24);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cn),transparent:true,depthTest:false}));
 s.scale.set(w*.05*k,46*.05*k,1);s.renderOrder=5;return s}
const rings:Record<string,THREE.Mesh>={},LED:THREE.MeshLambertMaterial[]=[];
const WT=(()=>{const mk=(lit,off)=>{const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.fillStyle=off;g.fillRect(0,0,128,256);let s=3;for(let r=0;r<10;r++)for(let q=0;q<4;q++){s=(s*16807)%2147483647;if(s%100<55){g.fillStyle=lit;g.fillRect(8+q*30,10+r*24,18,14)}}return new THREE.CanvasTexture(c)};return{map:mk('#ffe2a8','#1d2b46'),em:mk('#ffd089','#000')}})();
const winMat=c=>new THREE.MeshLambertMaterial({color:new THREE.Color(c).lerp(new THREE.Color(0xffffff),.5),map:WT.map,emissive:0xffffff,emissiveMap:WT.em,emissiveIntensity:.8});
const FM=winMat(0xffffff);
function cyl(r1,r2,h,c,x,y,z,seg,e){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||16),M(c,e));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m}
function led(c,x,y,z,s){const m=box(s,s,s,0,x,y,z,c);LED.push(m.material);return m}
function tree(x,z){sc.add(cyl(.2,.25,1.2,0x5a3d2b,x,.6,z,6));[[1.3,2.2,1.8],[.95,1.6,2.7]].forEach(([r,hh,y])=>{const k=new THREE.Mesh(new THREE.ConeGeometry(r,hh,7),M(0x2f8f5b));k.position.set(x,y,z);sc.add(k)})}
const cars=[];
function mkCars(){const cl=[0xe5e7eb,0xf87171,0x60a5fa,0xfacc15,0x34d399];
 for(let i=0;i<30;i++){const g=new THREE.Group();g.add(box(1,.55,2.1,cl[i%5],0,.5,0),box(.9,.45,1,0x1b2536,0,1,-.15),box(.25,.15,.05,0xffffcc,-.3,.55,1.07,0xffffaa),box(.25,.15,.05,0xffffcc,.3,.55,1.07,0xffffaa));
  sc.add(g);cars.push({g,e:E[i%E.length],t:Math.random(),d:i%2?1:-1,v:3+Math.random()*3})}}
function moveCars(dt){cars.forEach(c=>{const p=N[c.e[0]],q=N[c.e[1]],dx=q.x-p.x,dz=q.z-p.z,L=Math.hypot(dx,dz);c.t=(c.t+c.d*c.v*dt/L+1)%1;const s=.1+.8*c.t;
 c.g.position.set(p.x+dx*s-dz/L*.6*c.d,0,p.z+dz*s+dx/L*.6*c.d);c.g.rotation.y=Math.atan2(dx*c.d,dz*c.d)})}
function mkSky(){const p=[];for(let i=0;i<500;i++){const a=Math.random()*6.28,b=Math.random()*1.3+.15,r=240;p.push(Math.cos(a)*Math.cos(b)*r,Math.sin(b)*r,Math.sin(a)*Math.cos(b)*r)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));sc.add(new THREE.Points(g,Object.assign(new THREE.PointsMaterial({color:0xcfe0ff,size:1.5,sizeAttenuation:false}),{fog:false})));
 const m=new THREE.Mesh(new THREE.SphereGeometry(8,16,12),Object.assign(new THREE.MeshBasicMaterial({color:0xfff3d6}),{fog:false}));m.position.set(-120,110,-160);sc.add(m)}
function props(){const lm=new THREE.MeshBasicMaterial({color:0xffe6a8});
 E.forEach(([a,b])=>{const p=N[a],q=N[b],dx=q.x-p.x,dz=q.z-p.z,L=Math.hypot(dx,dz);
  for(let d=6;d<L-5;d+=7){const x=p.x+dx/L*d-dz/L*1.9,z=p.z+dz/L*d+dx/L*1.9;sc.add(cyl(.08,.08,2.6,0x56627a,x,1.3,z,6));const hd=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),lm);hd.position.set(x,2.7,z);sc.add(hd)}})}
function detail(id,g,c){const add=(...a)=>a.forEach(o=>g.add(o));
 if(id=='home'){add(box(4.4,2.6,4,0xe9c9a0,0,1.3,0));const r=new THREE.Mesh(new THREE.ConeGeometry(3.7,1.9,4),M(0xb4543a));r.position.y=3.55;r.rotation.y=Math.PI/4;add(r,box(.7,1.6,.7,0x7a4a3a,1.2,3.9,-.8),box(.9,1.5,.12,0x6b3f2a,-1,.75,2.03),box(1,.9,.1,0x9be4ff,1.2,1.6,2.03,0x9be4ff),box(.1,.9,1,0x9be4ff,-2.23,1.6,0,0x9be4ff),box(.8,.55,.1,0x66ccff,1.2,1.5,2.1,0x2288cc));
  [-2.7,2.7].forEach(x=>{const b=new THREE.Mesh(new THREE.SphereGeometry(.55,8,6),M(0x2f8f5b));b.position.set(x,.5,2.4);add(b)});return 6}
 if(id=='router'){add(cyl(1.5,1.7,.7,0x273449,0,.35,0,20),cyl(1.2,1.2,.3,c,0,.8,0,20));[-.8,0,.8].forEach(x=>add(led(0x33ff88,x,.55,1.55,.18)));
  [-.8,0,.8].forEach(x=>{const a=cyl(.07,.07,2.2,0xffffff,x,1.9,0,6);a.rotation.z=-x*.35;add(a)});
  [.6,1,1.4].forEach((R,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(R,.06,6,16,Math.PI*.7),M(c,c));t.position.y=3.2+i*.15;t.rotation.z=Math.PI/2-Math.PI*.35;add(t)});return 5.4}
 if(id=='isp'){add(box(6.4,3.4,4.2,0xffffff,0,1.7,0),box(6.7,.3,4.5,0x39465e,0,3.55,0),box(2.4,.2,1.3,c,0,2.2,2.6),box(1,1.6,.1,0x1b2536,0,.8,2.12),box(.2,2.6,.2,0xffffff,-2.3,4.9,0));
  (g.children[0] as THREE.Mesh).material=winMat(c);
  const d=new THREE.Mesh(new THREE.SphereGeometry(1.1,14,7,0,Math.PI*2,0,Math.PI/2),M(0xe8edf5));d.position.set(1.6,3.9,0);d.rotation.x=-.9;add(d,led(0xff4040,-2.3,6.3,0,.3));return 7.8}
 if(id=='dns'){add(cyl(1.8,1.8,5,0xffffff,0,2.5,0,16),cyl(2.5,2.5,.3,0x39465e,0,.15,0,20));(g.children[0] as THREE.Mesh).material=winMat(c);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(cyl(.18,.18,1.5,0xe8edf5,Math.cos(a)*2.4,.9,Math.sin(a)*2.4,8))}
  [1.2,2.5,3.8].forEach(y=>{const t=new THREE.Mesh(new THREE.TorusGeometry(1.85,.08,6,20),M(0xffffff));t.rotation.x=Math.PI/2;t.position.y=y;add(t)});
  const dm=new THREE.Mesh(new THREE.SphereGeometry(1.8,16,8,0,Math.PI*2,0,Math.PI/2),M(c));dm.position.y=5;add(dm,cyl(.05,.05,1.5,0xffffff,0,6.9,0,6));return 8.8}
 if(['root','tld','auth'].includes(id)){const hh={root:9,tld:7,auth:5.5}[id];add(box(3,hh,3,0xffffff,0,hh/2,0),box(2,1.5,2,0x39465e,0,hh+.75,0),cyl(.06,.06,1.8,0xffffff,0,hh+2.3,0,6),led(0xff4040,0,hh+3.2,0,.35));(g.children[0] as THREE.Mesh).material=winMat(c);
  if(id=='root'){const s=new THREE.Mesh(new THREE.SphereGeometry(.8,14,10),M(c,c));s.position.y=hh+2;add(s)}
  return hh+4}
 if(id=='ix'){const t=new THREE.Mesh(new THREE.TorusGeometry(3.8,.5,8,32),M(0x39465e));t.rotation.x=Math.PI/2;t.position.y=.4;add(t,cyl(3.3,3.3,.25,0x2f6f4b,0,.15,0,28),cyl(.8,1,.7,c,0,.5,0,12),cyl(.12,.12,2.2,c,0,1.8,0,6));
  add(box(16,.45,2.2,0x2a3447,0,2,0),box(16,.1,.15,c,0,2.3,1,c),box(16,.1,.15,c,0,2.3,-1,c),box(.9,2,2,0x56627a,-5,1,0),box(.9,2,2,0x56627a,5,1,0));return 4.6}
 if(id=='fw'){g.rotation.y=Math.PI/2;[-3.2,3.2].forEach(x=>add(cyl(.5,.6,4.2,0x56627a,x,2.1,0,10),led(0xff3030,x,4.5,0,.45)));
  add(box(7.4,1,.5,0x1b2536,0,4.3,0),box(6,.5,.55,c,0,4.3,0,c),box(4.6,.22,.22,0xffffff,-1.2,1.3,0),box(1.2,.22,.22,0xff3030,1.8,1.3,0),box(1.8,2,1.6,0x39465e,4.8,1,1.5),box(1.2,.7,.1,0x9be4ff,4.8,1.4,2.32,0x9be4ff));
  [-1,1].forEach(s=>add(box(5,1.8,.3,0x56627a,s*7.2,.9,0)));return 6.6}
 if(id=='srv'){add(box(7.4,3.2,5,0x2a3750,0,1.6,0),box(7.6,.3,5.2,0x39465e,0,3.35,0),box(3,.5,.2,c,0,3.9,2.4,c));
  for(let r=0;r<3;r++)for(let q=0;q<7;q++)add(led(q%3?0x33ff88:0x4ea8ff,-2.7+q*.9,.8+r*.8,2.55,.28));
  [-2,2].forEach(x=>{add(cyl(1,1,.6,0xcbd5e1,x,3.8,-.8,16),cyl(.8,.8,.1,0x1b2536,x,4.12,-.8,16))});return 6}
 return 0}
function building(id){const n=N[id],g=new THREE.Group(),c=n.c;const h=detail(id,g,c);g.position.set(n.x,0,n.z);sc.add(g);
 const l=label(n.n);l.position.set(n.x,h+1.2,n.z);sc.add(l);
 const r=new THREE.Mesh(new THREE.RingGeometry(4.4,5,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,side:THREE.DoubleSide}));
 r.rotation.x=-Math.PI/2;r.position.set(n.x,.08,n.z);sc.add(r);rings[id]=r}
function world(){const gr=new THREE.Mesh(new THREE.PlaneGeometry(600,600),M(0x0f1b2e));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
 E.forEach(([a,b])=>{const p=N[a],q=N[b],dx=q.x-p.x,dz=q.z-p.z,L=Math.hypot(dx,dz),y=Math.atan2(dx,dz);
  const r=box(2.2,.1,L,0x2a3447,(p.x+q.x)/2,.05,(p.z+q.z)/2);r.rotation.y=y;sc.add(r);
  const l=box(.14,.12,L,0x6b5a2a,(p.x+q.x)/2,.1,(p.z+q.z)/2,0x3a2f10);l.rotation.y=y;sc.add(l)});
 Object.keys(N).forEach(building);props();mkCars();mkSky();
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const dEdge=(x,z)=>Math.min(...E.map(([a,b])=>{const p=N[a],q=N[b],dx=q.x-p.x,dz=q.z-p.z,t=Math.max(0,Math.min(1,((x-p.x)*dx+(z-p.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-p.x-t*dx,z-p.z-t*dz)}));
 for(let i=0;i<520;i++){const x=(rnd()-.5)*220,z=(rnd()-.5)*170;
  if(Object.values(N).some(n=>Math.hypot(n.x-x,n.z-z)<8)||dEdge(x,z)<4)continue;
  const h=2+rnd()*5+Math.min(14,Math.hypot(x,z)/8)*rnd()*2,w=2+rnd()*2.5;rnd()<.3?tree(x,z):sc.add(Object.assign(box(w,h,w,0xffffff,x,h/2,z),{material:FM}))}}
world();


export {cv,sc,cam,R,rings,LED,box,cyl,label,moveCars};
