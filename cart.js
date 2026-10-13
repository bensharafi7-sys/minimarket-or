import {THREE,loadProducts,productMesh,shelfTexture,signTexture,makeRenderer,fit,blobShadow} from './kit.js';
import {store,sfx,audioUnlock,showResults,giftTease,toast,ICON} from './common.js';
const $=id=>document.getElementById(id);
$('pause').innerHTML=ICON.pause;$('gift').innerHTML=ICON.gift;
const app=$('app'),renderer=makeRenderer($('c'));
const scene=new THREE.Scene();const SKY=0xfff1e0;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,30,95);
const cam=new THREE.PerspectiveCamera(58,9/16,.1,140);cam.position.set(0,4.3,7.4);cam.lookAt(0,1.0,-8);
scene.add(new THREE.HemisphereLight(0xffffff,0xffd2a8,1.6));const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(2,8,6);scene.add(sun);
const P=await loadProducts();
const GOD=location.search.includes('god');const LANE=1.3,LEN=120;
// floor: glossy tiles
const ft=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#f4f1ec';x.fillRect(0,0,256,256);
 x.fillStyle='#e7e2da';x.fillRect(0,0,128,128);x.fillRect(128,128,128,128);x.strokeStyle='#d8d2c8';x.lineWidth=3;x.strokeRect(0,0,256,256);x.strokeRect(0,0,128,128);x.strokeRect(128,128,128,128);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,LEN/2.2);t.anisotropy=8;return t})();
const floor=new THREE.Mesh(new THREE.PlaneGeometry(7.2,LEN),new THREE.MeshStandardMaterial({map:ft,roughness:.18,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.position.z=-LEN/2+8;scene.add(floor);
// orange lane guide stripe at edges
for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.PlaneGeometry(.18,LEN),new THREE.MeshBasicMaterial({color:0xff8a1c}));st.rotation.x=-Math.PI/2;st.position.set(s*2.9,.01,-LEN/2+8);scene.add(st)}
// shelves
const stex=shelfTexture(P);stex.repeat.set(LEN/5,1);
const shelves=[];
for(const s of[-1,1]){const t=stex.clone();t.needsUpdate=true;const m=new THREE.Mesh(new THREE.PlaneGeometry(LEN,4.6),new THREE.MeshStandardMaterial({map:t,roughness:.6}));
 m.rotation.y=-s*Math.PI/2;m.position.set(s*3.5,2.3,-LEN/2+8);scene.add(m);shelves.push({t,s});
 const cap=new THREE.Mesh(new THREE.BoxGeometry(.7,.35,LEN),new THREE.MeshStandardMaterial({color:0xff7a00,roughness:.4}));cap.position.set(s*3.3,4.75,-LEN/2+8);scene.add(cap)
 const base=new THREE.Mesh(new THREE.BoxGeometry(.6,.25,LEN),new THREE.MeshStandardMaterial({color:0x222222}));base.position.set(s*3.25,.12,-LEN/2+8);scene.add(base)}
// ceiling + light strips
const ceil=new THREE.Mesh(new THREE.PlaneGeometry(9,LEN),new THREE.MeshBasicMaterial({color:0xe9e4dc}));ceil.rotation.x=Math.PI/2;ceil.position.set(0,6.2,-LEN/2+8);scene.add(ceil);
const lights=[];const lg=new THREE.BoxGeometry(2.6,.08,.5),lm=new THREE.MeshBasicMaterial({color:0xfffbf0});
for(let i=0;i<14;i++){const l=new THREE.Mesh(lg,lm);l.position.set(0,6.1,-i*8);scene.add(l);lights.push(l)}
// back wall with fridges + store sign
const back=new THREE.Group();scene.add(back);back.position.z=-LEN+12;
{const w=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshBasicMaterial({color:0xf6efe6}));w.position.set(0,3,-.1);back.add(w)}
const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.3),new THREE.MeshBasicMaterial({map:signTexture([['מינימרקט אור',120,165]],'#ff7a00','#fff',1024,256)}));sign.position.set(0,5,0);back.add(sign);
for(let i=-2;i<=2;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(1.7,3.4,.2),new THREE.MeshBasicMaterial({color:0xdcefff}));f.position.set(i*1.8,1.7,0);back.add(f)}
// ---------- player: kid + cart
const M=(c,r=.55)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const player=new THREE.Group();scene.add(player);
const cart=new THREE.Group();player.add(cart);
const wire=new THREE.MeshStandardMaterial({color:0xd6dbe2,metalness:.7,roughness:.25});
const basket=new THREE.Group();cart.add(basket);basket.position.y=.95;
{const W=1.25,H=.75,D=1.5;const bar=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wire);m.position.set(x,y,z);basket.add(m)};
 for(let i=0;i<=8;i++){const z=-D/2+i*D/8;bar(.03,H,.03,-W/2,0,z);bar(.03,H,.03,W/2,0,z)}
 for(let i=0;i<=6;i++){const x=-W/2+i*W/6;bar(.03,H,.03,x,0,-D/2);bar(.03,H,.03,x,0,D/2)}
 for(const y of[-H/2,0,H/2]){bar(W,.04,.04,0,y,-D/2);bar(W,.04,.04,0,y,D/2);bar(.04,.04,D,-W/2,y,0);bar(.04,.04,D,W/2,y,0)}
 bar(W,.04,D,0,-H/2,0);
 const h=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,W+.2,10),M(0xff7a00,.35));h.rotation.z=Math.PI/2;h.position.set(0,.5,D/2+.25);basket.add(h);
 for(const s of[-1,1]){bar(.04,.04,.35,s*W/2,.45,D/2+.12)}
 const fr=M(0x9aa1a8,.3);for(const [x,z] of [[-.5,-.6],[.5,-.6],[-.5,.6],[.5,.6]]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.05,.62,.05),fr);leg.position.set(x,.33,z);cart.add(leg);
  const wh=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,14),M(0x1a1a1a));wh.rotation.z=Math.PI/2;wh.position.set(x,.12,z);cart.add(wh)}}
const loot=new THREE.Group();basket.add(loot);
function addLoot(p){if(loot.children.length>=9)loot.remove(loot.children[0]);const m=productMesh(p);const n=loot.children.length;
 m.position.set(((n%3)-1)*.38,.05+Math.floor(n/3)*.25,((n*7)%3-1)*.35);m.rotation.set(-.3+Math.random()*.4,Math.random()*.6-.3,Math.random()*.5-.25);m.scale.setScalar(.5);loot.add(m)}
for(const id of['bamba','cola','milk','krembo','elite'])addLoot(P.find(p=>p.id===id));
const kid=new THREE.Group();player.add(kid);kid.position.z=1.5;kid.scale.setScalar(.9);
const skin=M(0xf2b48c,.6),red=M(0xe8262b,.7),jean=M(0x3d6fb6,.8),shoe=M(0xff7a00,.4),hair=M(0x5a2f17,.8);
const legL=new THREE.Group(),legR=new THREE.Group();
for(const [g,x] of [[legL,-.17],[legR,.17]]){g.position.set(x,.78,0);const l=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.5,4,10),jean);l.position.y=-.33;g.add(l);
 const s=new THREE.Mesh(new THREE.BoxGeometry(.22,.16,.38),shoe);s.position.set(0,-.7,.05);g.add(s);const so=new THREE.Mesh(new THREE.BoxGeometry(.23,.05,.4),M(0xffffff));so.position.set(0,-.78,.05);g.add(so);kid.add(g)}
const torso=new THREE.Group();torso.position.y=.8;torso.rotation.x=-.45;kid.add(torso);
{const b=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.45,6,14),red);b.position.y=.38;b.scale.set(1.05,1,.8);torso.add(b);
 const hood=new THREE.Mesh(new THREE.TorusGeometry(.2,.08,8,16),red);hood.position.set(0,.78,.12);hood.rotation.x=1.2;torso.add(hood);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.28,20,16),skin);head.position.set(0,1.02,-.02);torso.add(head);
 for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),skin);e.position.set(s*.27,1.0,0);torso.add(e)}
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2,k=i%3;const h=new THREE.Mesh(new THREE.SphereGeometry(.13+.03*k,10,8),hair);
  const rr=.2+.06*(i%2);h.position.set(Math.cos(a)*rr,1.14+.08*Math.sin(a*3)+(i%2)*.06,Math.sin(a)*rr+.02);torso.add(h)}
 const top=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),hair);top.position.set(0,1.2,.06);torso.add(top);
 for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.55,4,8),red);arm.position.set(s*.33,.55,-.32);arm.rotation.x=-1.25;torso.add(arm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.08,8,8),skin);hand.position.set(s*.33,.5,-.66);torso.add(hand)}
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(.62,.07,.45),M(0xffffff));stripe.position.y=.0;torso.add(stripe)}
const pshadow=blobShadow(2.4);pshadow.position.set(0,.02,.6);pshadow.scale.set(1,1.4,1);scene.add(pshadow);
// ---------- coins
const coinTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(50,45,5,64,64,64);g.addColorStop(0,'#fff3a0');g.addColorStop(.6,'#ffb321');g.addColorStop(1,'#e07800');
 x.fillStyle=g;x.fillRect(0,0,128,128);x.strokeStyle='#fff6c8';x.lineWidth=7;x.beginPath();x.arc(64,64,50,0,7);x.stroke();x.fillStyle='#c25f00';x.font='900 64px Rubik';x.textAlign='center';x.fillText('★',64,88);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
const coinG=new THREE.CylinderGeometry(.34,.34,.08,24);coinG.rotateX(Math.PI/2);
const coinM=[new THREE.MeshStandardMaterial({color:0xffa500,emissive:0x995500,metalness:.6,roughness:.3}),new THREE.MeshStandardMaterial({map:coinTex,emissive:0x553300,emissiveMap:coinTex,metalness:.3,roughness:.3}),new THREE.MeshStandardMaterial({map:coinTex,emissive:0x553300,emissiveMap:coinTex})];
// ---------- obstacles
function wetSign(){const g=new THREE.Group();const t=signTexture([['⚠',120,130],['זהירות!',58,200],['רצפה רטובה',46,245]],'#ffd21a','#111',256,280);
 const m=new THREE.MeshStandardMaterial({map:t,roughness:.4});for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.8,1.0,.04),[M(0xffd21a),M(0xffd21a),M(0xffd21a),M(0xffd21a),m,m]);
 p.position.set(0,.5,s*.16);p.rotation.x=s*.28;g.add(p)}return g}
function display(){const g=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(1.4,.5,1.0),M(0xff7a00,.5));base.position.y=.25;g.add(base);
 const bs=signTexture([['מבצע!',90,120]],'#ff7a00','#fff',256,160);const b2=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.45),new THREE.MeshBasicMaterial({map:bs}));b2.position.set(0,.25,.51);g.add(b2);
 const items=[];let y=.5;for(let r=0;r<4;r++){const n=3-Math.floor(r/1.5);for(let i=0;i<n;i++){const p=P[(r*3+i+Math.floor(Math.random()*5))%P.length];const m=productMesh(p);m.scale.setScalar(.55);
  m.position.set((i-(n-1)/2)*.45,y+p.h*.27,0);m.rotation.z=(Math.random()-.5)*.15;g.add(m);items.push(m)}y+=.62}
 g.userData.items=items;return g}
function spill(){const g=new THREE.Group();for(let i=0;i<7;i++){const p=P[Math.floor(Math.random()*P.length)];const m=productMesh(p);m.scale.setScalar(.5);
 m.position.set((Math.random()-.5)*1.2,.15,(Math.random()-.5)*.8);m.rotation.set(Math.PI/2*(Math.random()>.5?1:0),Math.random()*3,Math.random()>.5?Math.PI/2:0);g.add(m)}
 const tipped=new THREE.Mesh(new THREE.BoxGeometry(1.2,.4,.5),M(0xff7a00));tipped.position.set(.1,.2,.3);tipped.rotation.y=.4;g.add(tipped);return g}
function banner(){const g=new THREE.Group();const t=signTexture([['🔥 מבצע חם! 🔥',72,110],['2 ב-10 ₪',60,190]],'#e8262b','#fff',512,230);
 const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,.06),[M(0xe8262b),M(0xe8262b),M(0xe8262b),M(0xe8262b),new THREE.MeshBasicMaterial({map:t}),new THREE.MeshBasicMaterial({map:t})]);b.position.y=1.75;g.add(b);
 for(const s of[-1,1]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,4),M(0x333333));r.position.set(s*.6,3.9,0);g.add(r)}return g}
function granny(){const g=new THREE.Group();const purple=M(0x7d3c98,.7),grey=M(0xe6e6ea,.9);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.6,6,12),purple);body.position.y=.95;g.add(body);
 const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.3,.42,.55,14),M(0x4b3a6b));skirt.position.y=.45;g.add(skirt);
 for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.3),skin);l.position.set(s*.13,.12,0);g.add(l)}
 const head=new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),skin);head.position.y=1.65;g.add(head);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const h=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),grey);h.position.set(Math.cos(a)*.22,1.78+.05*Math.sin(a*2),Math.sin(a)*.2-.03);g.add(h)}
 const bun=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),grey);bun.position.set(0,1.98,-.05);g.add(bun);
 const gm=M(0x222222,.3);for(const s of[-1,1]){const gl=new THREE.Mesh(new THREE.TorusGeometry(.085,.018,6,16),gm);gl.position.set(s*.1,1.66,.25);g.add(gl);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),gm);eye.position.set(s*.1,1.66,.24);g.add(eye)}
 const mouth=new THREE.Mesh(new THREE.TorusGeometry(.06,.02,6,12,Math.PI),M(0x8a2020));mouth.position.set(0,1.52,.25);mouth.rotation.z=Math.PI;g.add(mouth);
 // her cart in front of her (toward player = +z)
 const c=new THREE.Group();c.position.set(0,0,.95);g.add(c);const bx=new THREE.Mesh(new THREE.BoxGeometry(.95,.6,1.0),new THREE.MeshStandardMaterial({color:0xd6dbe2,metalness:.6,roughness:.3,wireframe:true}));bx.position.y=.85;c.add(bx);
 const hb=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.0),M(0xe8262b));hb.rotation.z=Math.PI/2;hb.position.set(0,1.2,-.6);c.add(hb);
 for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.4,4,8),purple);arm.position.set(s*.32,1.15,.3);arm.rotation.x=1.3;g.add(arm)}
 for(let i=0;i<4;i++){const m=productMesh(P[[4,5,3,8][i]]);m.scale.setScalar(.45);m.position.set((i%2-.5)*.4,1.1,(Math.floor(i/2)-.5)*.4);c.add(m)}
 for(const [x,z] of [[-.4,-.45],[.4,-.45],[-.4,.45],[.4,.45]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.07,10),M(0x111111));w.rotation.z=Math.PI/2;w.position.set(x,.1,z);c.add(w)}
 g.rotation.y=0;return g}
// ---------- state
let objs=[],state='menu',speed,dist,score,coins,items,lane,tx,jumpV,jy,slideT,spawnZ,t0,shake=0,nextMile;
function reset(){objs.forEach(o=>scene.remove(o.m));objs=[];speed=13;dist=0;score=0;coins=0;items=0;lane=0;tx=0;jumpV=0;jy=0;slideT=0;spawnZ=-30;nextMile=250;player.position.set(0,0,0);player.rotation.set(0,0,0);kid.rotation.set(0,0,0);updHud()}
function add(m,type,ln,z,extra={}){m.position.set(ln*LANE,extra.y||0,z);scene.add(m);objs.push(Object.assign({m,type,ln,z},extra))}
function spawnChunk(z){
 const r=Math.random();const dif=Math.min(1,dist/1500);
 const free=[-1,0,1];const pick=()=>free.splice(Math.floor(Math.random()*free.length),1)[0];
 const nObs=Math.random()<.35+dif*.4?2:1;
 for(let i=0;i<nObs;i++){const ln=pick();const k=Math.random();
  if(k<.28)add(wetSign(),'wet',ln,z);
  else if(k<.48)add(display(),'display',ln,z);
  else if(k<.62)add(spill(),'spill',ln,z);
  else if(k<.8)add(banner(),'banner',ln,z);
  else add(granny(),'granny',ln,z-6,{vz:4+dif*3});}
 const cl=free[Math.floor(Math.random()*free.length)];
 if(Math.random()<.25){const p=P[Math.floor(Math.random()*P.length)];const m=productMesh(p);m.scale.setScalar(.7);add(m,'item',cl,z+3,{y:1,p})}
 else for(let i=0;i<6;i++){const m=new THREE.Mesh(coinG,coinM);add(m,'coin',cl,z+5-i*1.6,{y:.8})}
 // coins arc over a jumpable obstacle
 objs.filter(o=>o.z===z&&(o.type==='wet'||o.type==='spill')&&Math.random()<.6).forEach(o=>{for(let i=0;i<5;i++){const m=new THREE.Mesh(coinG,coinM);add(m,'coin',o.ln,z+3.2-i*1.6,{y:.8+Math.sin(i/4*Math.PI)*1.6})}})
}
function updHud(){$('score').textContent=Math.floor(score).toLocaleString('he-IL');$('dist').textContent=Math.floor(dist)+" מ'";$('coins').textContent=coins;
 const prev=nextMile-250;$('prog').style.width=Math.min(100,(dist-prev)/250*100)+'%';$('progT').textContent=`עוד ${Math.max(0,Math.ceil(nextMile-dist))} מ' לבונוס`}
// ---------- input
function act(a){if(state!=='play')return;
 if(a==='L'&&lane>-1){lane--;sfx.lane()}if(a==='R'&&lane<1){lane++;sfx.lane()}
 if(a==='U'&&jy<=0.01){jumpV=9.5;slideT=0;sfx.jump()} if(a==='D'){slideT=.75;if(jy>0)jumpV=-14;sfx.slide()}}
let sx,sy,st,done=false;
app.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;done=false},{passive:true});
app.addEventListener('touchmove',e=>{if(done)return;const t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.hypot(dx,dy)>28){done=true;act(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'))}},{passive:true});
let md=null;app.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')md=[e.clientX,e.clientY]});
app.addEventListener('pointerup',e=>{if(md){const dx=e.clientX-md[0],dy=e.clientY-md[1];if(Math.hypot(dx,dy)>28)act(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'));md=null}});
addEventListener('keydown',e=>{const k={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',' ':'U'}[e.key];if(k)act(k)});
$('go').onclick=()=>{audioUnlock();sfx.click();$('start').classList.remove('on');start()};
$('pause').onclick=()=>{if(state==='play'){state='pause';$('paused').classList.add('on')}};
$('resume').onclick=()=>{$('paused').classList.remove('on');state='play';last=performance.now()};
$('gift').onclick=async()=>{const was=state;if(state==='play')state='pause';await giftTease();if(was==='play'){state='play';last=performance.now()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play'){state='pause';$('paused').classList.add('on')}});
function start(){reset();state='play';$('hud').style.opacity=1;$('title').classList.add('off');setTimeout(()=>$('hint').style.opacity=0,3500);for(let z=-42;z>-100;z-=16)spawnChunk(z);spawnZ=-100}
function crash(o){state='dead';sfx.crash();shake=.6;
 if(o.m.userData.items)o.m.userData.items.forEach(m=>{m.userData.v=new THREE.Vector3((Math.random()-.5)*6,4+Math.random()*5,4+Math.random()*4);m.userData.r=Math.random()*8});
 o.hit=true;
 setTimeout(()=>{state='over';showResults({game:'cart',title:'שוד העגלה',score:Math.floor(score),unit:'',coins,extra:`<div style="font-weight:700">🏁 ${Math.floor(dist)} מ' · 🛒 ${items} מוצרים</div>`,onRetry:start})},1300)}
// ---------- loop
let last=performance.now(),tt=0;
function loop(now){requestAnimationFrame(loop);let dt=Math.min(.05,(now-last)/1000);last=now;tt+=dt;
 const live=state==='play',dying=state==='dead';
 if(live){speed=Math.min(32,speed+dt*.32);const dz=speed*dt;dist+=dz*.5;score+=dz*.5;
  if(dist>=nextMile){nextMile+=250;score+=200;toast($('toast'),'בונוס +200!');sfx.perfect()}
  for(const s of shelves)s.t.offset.x-=s.s*dz/5*(-1);ft.offset.y+=dz/2.2*1;
  lights.forEach(l=>{l.position.z+=dz;if(l.position.z>8)l.position.z-=14*8});
  spawnZ+=dz;if(spawnZ>-84){spawnChunk(spawnZ-16);spawnZ-=16}
  for(let i=objs.length-1;i>=0;i--){const o=objs[i];o.z+=dz+(o.vz||0)*dt;o.m.position.z=o.z;
   if(o.type==='coin'){o.m.rotation.y+=dt*5}else if(o.type==='item'){o.m.rotation.y+=dt*2.5;o.m.position.y=1+Math.sin(tt*4)*.15}
   else if(o.type==='granny'){o.m.position.y=Math.abs(Math.sin(tt*9))*.06}
   if(o.type==='display'&&o.z>-14&&!o.wob){o.wob=1}
   if(o.wob)o.m.userData.items.forEach((m,k)=>{m.rotation.z=Math.sin(tt*14+k)*.08})
   // collide
   if(!o.hit&&o.ln===lane&&Math.abs(player.position.x-o.ln*LANE)<.8){const dzp=o.z-0.4;
    if(o.type==='coin'||o.type==='item'){if(Math.abs(dzp)<.9&&Math.abs((o.m.position.y)-(jy+.9))<1.2){o.hit=true;scene.remove(o.m);objs.splice(i,1);
      if(o.type==='coin'){coins++;score+=10;sfx.coin()}else{items++;score+=50;sfx.item();addLoot(o.p);toast($('toast'),o.p.name+' +50')}continue}}
    else{const depth=o.type==='granny'?1.4:o.type==='display'?.7:.5;if(dzp>-depth&&dzp<depth+.6){
      const ok=(o.type==='wet'&&jy>.75)||(o.type==='spill'&&jy>.45)||(o.type==='banner'&&slideT>0);
      if(!ok&&!GOD){crash(o);break}}}}
   if(o.z>12){scene.remove(o.m);objs.splice(i,1)}}
  updHud()}
 if(dying)objs.forEach(o=>{if(o.m.userData.items)o.m.userData.items.forEach(m=>{const v=m.userData.v;if(!v)return;v.y-=20*dt;m.position.addScaledVector(v,dt);if(m.position.y<.2){m.position.y=.2;v.y*=-.4;v.x*=.7;v.z*=.7}m.rotation.x+=m.userData.r*dt})});
 // player motion
 tx=lane*LANE;player.position.x+=(tx-player.position.x)*Math.min(1,dt*14);player.rotation.z=(player.position.x-tx)*.08;player.rotation.y=(player.position.x-tx)*.06;
 if(live||dying){jumpV-=26*dt;jy=Math.max(0,jy+jumpV*dt);if(jy===0)jumpV=0}
 player.position.y=jy;slideT=Math.max(0,slideT-dt);
 const run=live?tt*speed*.9:0;legL.rotation.x=Math.sin(run)*.9;legR.rotation.x=-Math.sin(run)*.9;kid.position.y=live?Math.abs(Math.cos(run))*.06:0;
 torso.rotation.x=slideT>0?-1.1:-.45;kid.scale.y=slideT>0?.72:.9;
 if(dying){kid.rotation.x=Math.min(.5,kid.rotation.x+dt*2)}
 pshadow.position.x=player.position.x;pshadow.material.opacity=1-Math.min(.7,jy/3);
 // idle menu camera drift
 shake=Math.max(0,shake-dt);const sh=shake*.25;
 cam.position.set(player.position.x*.35+(Math.random()-.5)*sh,4.3+(Math.random()-.5)*sh+(state==='menu'?Math.sin(tt)*.1:0),7.4);cam.lookAt(player.position.x*.2,1.0,-8);
 renderer.render(scene,cam)}
reset();fit(renderer,cam,app);addEventListener('resize',()=>fit(renderer,cam,app));requestAnimationFrame(loop);
window.__game={start,act,get state(){return state},set speedv(v){speed=v}};
