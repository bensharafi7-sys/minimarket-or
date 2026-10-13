import {THREE,loadProducts,productMesh,shelfTexture,signTexture,makeRenderer,fit,blobShadow} from './kit.js';
import {store,sfx,audioUnlock,showResults,giftTease,toast,ICON} from './common.js';
const $=id=>document.getElementById(id);
$('pause').innerHTML=ICON.pause;$('gift').innerHTML=ICON.gift;
const app=$('app'),renderer=makeRenderer($('c'));
const scene=new THREE.Scene();const SKY=0xfff1e0;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,30,95);
const cam=new THREE.PerspectiveCamera(58,9/16,.1,140);cam.position.set(0,4.3,7.4);cam.lookAt(0,1.0,-8);
scene.add(new THREE.HemisphereLight(0xffffff,0xffd2a8,1.6));const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(2,8,6);scene.add(sun);
const P=await loadProducts();
const M=(c,r=.55)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const LANE=1.3,LEN=120;
// floor: glossy tiles
const ft=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#f4f1ec';x.fillRect(0,0,256,256);
 x.fillStyle='#e7e2da';x.fillRect(0,0,128,128);x.fillRect(128,128,128,128);x.strokeStyle='#d8d2c8';x.lineWidth=3;x.strokeRect(0,0,256,256);x.strokeRect(0,0,128,128);x.strokeRect(128,128,128,128);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,LEN/2.2);t.anisotropy=8;return t})();
const floor=new THREE.Mesh(new THREE.PlaneGeometry(7.2,LEN),new THREE.MeshStandardMaterial({map:ft,roughness:.18,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.position.z=-LEN/2+8;scene.add(floor);
// orange lane guide stripe at edges
for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.PlaneGeometry(.18,LEN),new THREE.MeshBasicMaterial({color:0xff8a1c}));st.rotation.x=-Math.PI/2;st.position.set(s*2.9,.01,-LEN/2+8);scene.add(st)}
// shelves
const stex=shelfTexture(P);stex.repeat.set(LEN/4.2,1);
const shelves=[];
for(const s of[-1,1]){const t=stex.clone();t.needsUpdate=true;const m=new THREE.Mesh(new THREE.PlaneGeometry(LEN,4.6),new THREE.MeshStandardMaterial({map:t,roughness:.6}));
 m.rotation.y=-s*Math.PI/2;m.position.set(s*3.5,2.3,-LEN/2+8);scene.add(m);shelves.push({t,s});
 const cap=new THREE.Mesh(new THREE.BoxGeometry(.7,.35,LEN),new THREE.MeshStandardMaterial({color:0xff7a00,roughness:.4}));cap.position.set(s*3.3,4.75,-LEN/2+8);scene.add(cap)
 const base=new THREE.Mesh(new THREE.BoxGeometry(.6,.25,LEN),new THREE.MeshStandardMaterial({color:0x222222}));base.position.set(s*3.25,.12,-LEN/2+8);scene.add(base)}
// ceiling + light strips
const ceil=new THREE.Mesh(new THREE.PlaneGeometry(9,LEN),new THREE.MeshBasicMaterial({color:0xe9e4dc}));ceil.rotation.x=Math.PI/2;ceil.position.set(0,6.2,-LEN/2+8);scene.add(ceil);
const lights=[];const lg=new THREE.CylinderGeometry(.45,.45,.06,20),lm=new THREE.MeshBasicMaterial({color:0xfffbf0});
for(let i=0;i<14;i++){const l=new THREE.Mesh(lg,lm);l.position.set(i%2?-1.4:1.4,6.1,-i*8);scene.add(l);lights.push(l)}
// richer aisle: 3D price rails, hanging category signs, round lights
for(const sd of[-1,1])for(let k=0;k<4;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,LEN),new THREE.MeshStandardMaterial({color:k%2?0xff7a00:0xffffff,roughness:.4}));r.position.set(sd*3.4,.15+k*1.15,-LEN/2+8);scene.add(r)}
const CATS=['חטיפים','משקאות','מוצרי חלב','מבצעים!','ממתקים','מינימרקט אור'];const hang=[];
for(let i=0;i<6;i++){const g=new THREE.Group();const t=signTexture([[CATS[i],i===5?84:110,150]],i%2?'#111111':'#ff7a00','#ffffff',512,220);
 const b=new THREE.Mesh(new THREE.BoxGeometry(2.0,.85,.08),[M(0xff7a00),M(0xff7a00),M(0xff7a00),M(0xff7a00),new THREE.MeshBasicMaterial({map:t}),new THREE.MeshBasicMaterial({map:t})]);g.add(b);
 for(const sd of[-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,1.2),M(0x555555));w.position.set(sd*.85,1.0,0);g.add(w)}
 g.position.set((i%2?-1:1)*1.3,5.5,-12-i*20);scene.add(g);hang.push(g)}
// back wall with fridges + store sign
const back=new THREE.Group();scene.add(back);back.position.z=-LEN+12;
{const w=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshBasicMaterial({color:0xf6efe6}));w.position.set(0,3,-.1);back.add(w)}
const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.3),new THREE.MeshBasicMaterial({map:signTexture([['מינימרקט אור',120,165]],'#ff7a00','#fff',1024,256)}));sign.position.set(0,5,0);back.add(sign);
for(let i=-2;i<=2;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(1.7,3.4,.2),new THREE.MeshBasicMaterial({color:0xe8f6ff}));f.position.set(i*1.8,1.7,0);back.add(f)}
// ---------- player: Pixar-style sprite (AI video -> rembg -> sheet, same pipeline as Efratushka)
const SPR=await (await fetch('img/sprites.json')).json();
const sprTex={};
for(const k of ['kid','granny']){const t=await new THREE.TextureLoader().loadAsync('img/spr_'+k+'.webp');t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(1/SPR[k].cols,1/SPR[k].rows);sprTex[k]=t}
function sprite(k,H){const m=SPR[k],t=sprTex[k].clone();t.needsUpdate=true;const W=H*m.fw/m.fh;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.25,depthWrite:true,fog:true}));mesh.position.y=H/2;
 mesh.userData.setFrame=(f)=>{f=Math.floor(f)%m.n;t.offset.set((f%m.cols)/m.cols,1-(Math.floor(f/m.cols)+1)/m.rows)};mesh.userData.setFrame(0);return mesh}
const player=new THREE.Group();scene.add(player);
const kid=sprite('kid',2.55);player.add(kid);kid.position.z=.6;
function addLoot(){}
const pshadow=blobShadow(2.2);pshadow.position.set(0,.02,.6);pshadow.scale.set(1,1.3,1);scene.add(pshadow);
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
function granny(){const g=new THREE.Group();const sp=sprite('granny',2.5);g.add(sp);g.userData.spr=sp;const sh=blobShadow(1.8);sh.position.y=.02;g.add(sh);return g}
// ---------- state
let kidF=0,objs=[],state='menu',speed,dist,score,coins,items,lane,tx,jumpV,jy,slideT,spawnZ,t0,shake=0,nextMile;
function reset(){objs.forEach(o=>scene.remove(o.m));objs=[];speed=13;dist=0;score=0;coins=0;items=0;lane=0;tx=0;jumpV=0;jy=0;slideT=0;spawnZ=-30;nextMile=250;player.position.set(0,0,0);player.rotation.set(0,0,0);updHud()}
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
  lights.forEach(l=>{l.position.z+=dz;if(l.position.z>8)l.position.z-=14*8});hang.forEach(h=>{h.position.z+=dz;if(h.position.z>8)h.position.z-=120});
  spawnZ+=dz;if(spawnZ>-84){spawnChunk(spawnZ-16);spawnZ-=16}
  for(let i=objs.length-1;i>=0;i--){const o=objs[i];o.z+=dz+(o.vz||0)*dt;o.m.position.z=o.z;
   if(o.type==='coin'){o.m.rotation.y+=dt*5}else if(o.type==='item'){o.m.rotation.y+=dt*2.5;o.m.position.y=1+Math.sin(tt*4)*.15}
   else if(o.type==='granny'){o.m.userData.spr.userData.setFrame(tt*12)}
   if(o.type==='display'&&o.z>-14&&!o.wob){o.wob=1}
   if(o.wob)o.m.userData.items.forEach((m,k)=>{m.rotation.z=Math.sin(tt*14+k)*.08})
   // collide
   if(!o.hit&&o.ln===lane&&Math.abs(player.position.x-o.ln*LANE)<.8){const dzp=o.z-0.4;
    if(o.type==='coin'||o.type==='item'){if(Math.abs(dzp)<.9&&Math.abs((o.m.position.y)-(jy+.9))<1.2){o.hit=true;scene.remove(o.m);objs.splice(i,1);
      if(o.type==='coin'){coins++;score+=10;sfx.coin()}else{items++;score+=50;sfx.item();toast($('toast'),o.p.name+' +50')}continue}}
    else{const depth=o.type==='granny'?1.4:o.type==='display'?.7:.5;if(dzp>-depth&&dzp<depth+.6){
      const ok=(o.type==='wet'&&jy>.75)||(o.type==='spill'&&jy>.45)||(o.type==='banner'&&slideT>0);
      if(!ok){crash(o);break}}}}
   if(o.z>12){scene.remove(o.m);objs.splice(i,1)}}
  updHud()}
 if(dying)objs.forEach(o=>{if(o.m.userData.items)o.m.userData.items.forEach(m=>{const v=m.userData.v;if(!v)return;v.y-=20*dt;m.position.addScaledVector(v,dt);if(m.position.y<.2){m.position.y=.2;v.y*=-.4;v.x*=.7;v.z*=.7}m.rotation.x+=m.userData.r*dt})});
 // player motion
 tx=lane*LANE;player.position.x+=(tx-player.position.x)*Math.min(1,dt*14);player.rotation.z=(player.position.x-tx)*.08;player.rotation.y=(player.position.x-tx)*.06;
 if(live||dying){jumpV-=26*dt;jy=Math.max(0,jy+jumpV*dt);if(jy===0)jumpV=0}
 player.position.y=jy;slideT=Math.max(0,slideT-dt);
 kidF+=live?dt*(14+speed*.35):0;kid.userData.setFrame(kidF);
 const sq=slideT>0?.62:1;kid.scale.set(1/Math.sqrt(sq)*(sq<1?1.1:1),sq,1);kid.position.y=2.55*sq/2;
 if(dying){kid.rotation.z=Math.min(.6,kid.rotation.z+dt*2.5);kid.material.color.setRGB(1,.85,.85)}else{kid.rotation.z=0;kid.material.color.setRGB(1,1,1)}
 pshadow.position.x=player.position.x;pshadow.material.opacity=1-Math.min(.7,jy/3);
 // idle menu camera drift
 shake=Math.max(0,shake-dt);const sh=shake*.25;
 cam.position.set(player.position.x*.35+(Math.random()-.5)*sh,4.3+(Math.random()-.5)*sh+(state==='menu'?Math.sin(tt)*.1:0),7.4);cam.lookAt(player.position.x*.2,1.0,-8);
 renderer.render(scene,cam)}
reset();fit(renderer,cam,app);addEventListener('resize',()=>fit(renderer,cam,app));requestAnimationFrame(loop);
window.__game={start,act,get state(){return state},set speedv(v){speed=v}};
