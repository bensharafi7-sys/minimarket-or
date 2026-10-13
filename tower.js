import {THREE,loadProducts,productMesh,shelfTexture,signTexture,makeRenderer,fit,blobShadow} from './kit.js';
import * as CANNON from './vendor/cannon.js';
import {store,sfx,audioUnlock,showResults,giftTease,toast,ICON} from './common.js';
const $=id=>document.getElementById(id);
$('pause').innerHTML=ICON.pause;$('gift').innerHTML=ICON.gift;
const app=$('app'),renderer=makeRenderer($('c'));
const scene=new THREE.Scene();const BG=0xfff0de;scene.background=new THREE.Color(BG);scene.fog=new THREE.Fog(BG,18,52);
const cam=new THREE.PerspectiveCamera(50,9/16,.1,100);
scene.add(new THREE.HemisphereLight(0xffffff,0xffd8b0,1.7));const sun=new THREE.DirectionalLight(0xffffff,1.8);sun.position.set(3,10,8);scene.add(sun);
const rim=new THREE.DirectionalLight(0xffb066,.9);rim.position.set(-6,4,-3);scene.add(rim);
const P=await loadProducts();
const M=(c,r=.5,mt=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:mt});
// environment: aisle behind
const st=shelfTexture(P);
for(const s of[-1,1]){const t=st.clone();t.needsUpdate=true;t.repeat.set(6,1);const w=new THREE.Mesh(new THREE.PlaneGeometry(36,9),new THREE.MeshStandardMaterial({map:t,roughness:.7}));
 w.rotation.y=-s*Math.PI/2;w.position.set(s*5.2,3.5,-14);scene.add(w);
 const cap=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,36),M(0xff7a00,.4));cap.position.set(s*5,8.2,-14);scene.add(cap)}
{const t=st.clone();t.needsUpdate=true;t.repeat.set(2,1);const w=new THREE.Mesh(new THREE.PlaneGeometry(11,9),new THREE.MeshStandardMaterial({map:t,roughness:.7}));w.position.set(0,3.5,-32);scene.add(w)}
const signM=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.7),new THREE.MeshBasicMaterial({map:signTexture([['מינימרקט',96,120],['אור',140,250]],'#ffffff','#111',512,280)}));
signM.material.map.image.getContext('2d');signM.position.set(3.3,5.2,-6);signM.rotation.y=-.55;signM.scale.setScalar(.8);scene.add(signM);
{const c=signM.material.map.image,x=c.getContext('2d');x.clearRect(0,140,512,140);x.fillStyle='#fff';x.fillRect(0,140,512,140);x.fillStyle='#ff7a00';x.font='900 140px Rubik';x.textAlign='center';x.fillText('אור',256,262);
 x.strokeStyle='#ff7a00';x.lineWidth=14;x.strokeRect(7,7,498,266);signM.material.map.needsUpdate=true}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,40),M(0xf1ece4,.25));floor.rotation.x=-Math.PI/2;floor.position.set(0,-3,-10);scene.add(floor);
const lights=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.CircleGeometry(.35,20),lights);l.rotation.x=Math.PI/2;l.position.set((i%2?1.8:-1.8),11,-i*5);scene.add(l)}
// shelf (the stage)
const SW=3.6;const shelf=new THREE.Group();scene.add(shelf);
{const top=new THREE.Mesh(new THREE.BoxGeometry(SW,.22,1.6),M(0xff7a00,.35));top.position.y=-.11;shelf.add(top);
 const lip=new THREE.Mesh(new THREE.BoxGeometry(SW+.1,.35,.08),M(0x1c1c1c,.4));lip.position.set(0,-.25,.82);shelf.add(lip);
 const price=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.26),new THREE.MeshBasicMaterial({map:signTexture([['מגדל אור · ₪9.90',64,90]],'#ffffff','#111',512,128)}));price.position.set(0,-.25,.87);shelf.add(price);
 const body=new THREE.Mesh(new THREE.BoxGeometry(SW,3,1.4),M(0x2a2a2a,.5));body.position.y=-1.85;shelf.add(body);
 const holes=new THREE.Mesh(new THREE.BoxGeometry(SW-.2,.06,1.5),M(0xffffff,.3));holes.position.y=.005;shelf.add(holes)}
// physics
const world=new CANNON.World({gravity:new CANNON.Vec3(0,-18,0)});world.allowSleep=true;world.broadphase=new CANNON.SAPBroadphase(world);
world.defaultContactMaterial.friction=.95;world.defaultContactMaterial.restitution=.04;world.solver.iterations=14;
const ground=new CANNON.Body({mass:0,shape:new CANNON.Box(new CANNON.Vec3(SW/2,.11,.8)),position:new CANNON.Vec3(0,-.11,0)});world.addBody(ground);
let bestRun=0,items=[],cur=null,state='menu',topY=0,best=store.best('tower'),swingT=0,waitT=0,camY=2,shake=0,count=0,coins=0,lastX=0,nextMile=100,lost=false,lostT=0;
const POOL=P;
function dims(p){return p.shape==='bottle'?{w:p.h,h:p.w,d:p.d,rot:Math.PI/2}:{w:p.w,h:p.h,d:p.d,rot:0}}
function makeItem(p){const g=new THREE.Group();const m=productMesh(p);m.scale.setScalar(1);const d=dims(p);if(d.rot)m.rotation.z=d.rot;g.add(m);g.userData={p,d};scene.add(g);return g}
function spawn(){const p=count===0?P.find(q=>q.id==='krembo'):POOL[Math.floor(Math.random()*POOL.length)];cur=makeItem(p);swingT=0;sfx.click()}
function drop(){if(!cur||state!=='play')return;const {d}=cur.userData;
 const body=new CANNON.Body({mass:d.w*d.h*1.0+.3,shape:new CANNON.Box(new CANNON.Vec3(d.w/2*.98,d.h/2*.98,.4)),position:new CANNON.Vec3(cur.position.x,cur.position.y,0),linearDamping:.08,angularDamping:.45});
 body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),cur.rotation.z);body.velocity.set(swingV()*.3,-2,0);
 body.linearFactor=new CANNON.Vec3(1,1,0);body.angularFactor=new CANNON.Vec3(0,0,1);body.sleepSpeedLimit=.15;
 let landed=false;body.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1.5)sfx.thud(Math.min(1,v/8));
   if(!landed){landed=true;const it=items.find(i=>i.body===body);if(it)onLand(it)}});
 world.addBody(body);items.push({g:cur,body,h:d.h});cur=null;waitT=.75;count++;sfx.drop()}
function onLand(it){const below=items.filter(i=>i!==it&&i.landed).sort((a,b)=>b.body.position.y-a.body.position.y)[0];it.landed=true;
 const dx=below?Math.abs(it.body.position.x-below.body.position.x):Math.abs(it.body.position.x);
 if(dx<.12){sfx.perfect();toast($('toast'),'מושלם! +5🪙');coins+=5}else{coins+=1}}
const AMP=1.15;function swingSpeed(){return 1.6+Math.min(1.6,count*.06)}
function swingX(){return Math.sin(swingT*swingSpeed())*AMP}
function swingV(){return Math.cos(swingT*swingSpeed())*AMP*swingSpeed()*.85}
function reset(){items.forEach(i=>{scene.remove(i.g);world.removeBody(i.body)});items=[];if(cur)scene.remove(cur);cur=null;topY=0;bestRun=0;camY=2.4;count=0;coins=0;nextMile=100;lost=false;
 // seed: a cola bottle lying on the shelf, like the key art
 const p=P.find(q=>q.id==='cola');cur=makeItem(p);cur.position.set(0,.3,0);state='play';drop();items[0].landed=true;count=0;state='menu';updHud()}
function cm(y){return Math.max(0,Math.round(y*20))}
function updHud(){$('score').textContent=cm(topY)+' ס"מ';$('dist').textContent=Math.max(best,cm(topY))+' ס"מ';$('coins').textContent=coins;
 const prev=nextMile-100;$('prog').style.width=Math.min(100,(cm(topY)-prev))+'%';$('progT').textContent=`עוד ${Math.max(0,nextMile-cm(topY))} ס"מ לבונוס`}
function start(){reset();state='play';$('hud').style.opacity=1;$('title').classList.add('off');setTimeout(()=>$('hint').style.opacity=0,3000);waitT=.3}
function lose(){if(lost)return;lost=true;state='dead';lostT=0;shake=.5;sfx.fall();toast($('toast'),'אוי! המגדל קרס!','#e8262b');
 items.forEach(i=>{i.body.wakeUp();i.body.angularVelocity.z+=(Math.random()-.5)*3});
 setTimeout(()=>{state='over';showResults({game:'tower',title:'מגדל אור',score:cm(bestRun),unit:' ס"מ',coins,extra:`<div style="font-weight:700">📦 ${count} מוצרים במגדל</div>`,onRetry:start})},2200)}
// input: one tap
app.addEventListener('pointerdown',e=>{if(e.target.closest('.rbtn,.overlay,.btn'))return;audioUnlock();drop()});
addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')drop()});
$('go').onclick=e=>{e.stopPropagation();audioUnlock();sfx.click();$('start').classList.remove('on');start()};
$('pause').onclick=()=>{if(state==='play'){state='pause';$('paused').classList.add('on')}};
$('resume').onclick=()=>{$('paused').classList.remove('on');state='play';last=performance.now()};
$('gift').onclick=async()=>{const was=state;if(state==='play')state='pause';await giftTease();if(was==='play'){state='play';last=performance.now()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play'){state='pause';$('paused').classList.add('on')}});
let last=performance.now(),tt=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;tt+=dt;
 const run=state==='play'||state==='dead'||state==='over'||state==='menu';
 if(run)world.step(1/60,dt,4);
 let maxY=0;
 for(const i of items){i.g.position.copy(i.body.position);i.g.quaternion.copy(i.body.quaternion);
  if(state==='play'&&i.body.position.y<-1.2)lose();
  if(i.landed&&i.body.position.y>-.3&&i.body.velocity.length()<1.5){const y=i.body.position.y+i.h/2;if(y>maxY)maxY=y}}
 if(state==='play'){topY=maxY;bestRun=Math.max(bestRun,maxY);
  if(cm(topY)>=nextMile){nextMile+=100;coins+=10;sfx.best();toast($('toast'),'בונוס! +10🪙')}
  if(!cur){waitT-=dt;if(waitT<=0)spawn()}
  if(cur){swingT+=dt;const y=Math.max(topY,0)+2.6;cur.position.set(swingX(),y+Math.sin(swingT*swingSpeed()*2)*.06,0);cur.rotation.z=-Math.cos(swingT*swingSpeed())*.18}
  updHud()}
 const target=(Math.max(0,topY)+2.9)/2-.1;camY+=(target-camY)*Math.min(1,dt*2.5);shake=Math.max(0,shake-dt);
 const dist=9.6+Math.max(0,topY)*.8;
 cam.position.set((Math.random()-.5)*shake*.4+(state==='menu'?Math.sin(tt*.5)*.6:0),camY+.9,dist);cam.lookAt(0,camY,0);
 renderer.render(scene,cam)}
reset();fit(renderer,cam,app);addEventListener('resize',()=>fit(renderer,cam,app));requestAnimationFrame(loop);
window.__game={dbg:()=>items.map(i=>[i.body.position.x.toFixed(2),i.body.position.y.toFixed(2),i.landed]),sx:()=>cur?cur.position.x:9,start,drop,get state(){return state},items:()=>items};
