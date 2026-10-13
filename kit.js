import * as THREE from './vendor/three.js';
import {PRODUCTS,loadImg} from './common.js';
export {THREE};
export async function loadProducts(){const imgs=await Promise.all(PRODUCTS.map(p=>loadImg(p.img)));PRODUCTS.forEach((p,i)=>p.image=imgs[i]);return PRODUCTS}
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function tex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
function faceTex(p,w=256,h=256,repeat=1){const c=cv(w*repeat,h),x=c.getContext('2d');x.fillStyle=p.col;x.fillRect(0,0,c.width,c.height);
 for(let r=0;r<repeat;r++){ if(p.image){ // contain-fit then stretch slightly
  const im=p.image,s=Math.min(w/im.width,h/im.height),iw=im.width*s,ih=im.height*s; x.drawImage(im,r*w+(w-iw)/2,(h-ih)/2,iw,ih)}}
 return tex(c)}
const cache={};
export function productMesh(p){
 const k=p.id; const S=(m)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.45,metalness:0},m));
 let mesh;
 if(p.shape==='box'||p.shape==='bag'){
  if(!cache[k]){const ft=faceTex(p,256,Math.round(256*p.h/p.w)); const side=S({color:p.col});
   let g=new THREE.BoxGeometry(p.w,p.h,p.d,p.shape==='bag'?8:1,p.shape==='bag'?8:1,1);
   if(p.shape==='bag'){const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i)/(p.w/2),y=a.getY(i)/(p.h/2),z=a.getZ(i);
     const f=Math.max(0,1-Math.pow(Math.abs(x),3))*Math.max(0,1-Math.pow(Math.abs(y),4));a.setZ(i,z*(.25+.9*f));
     if(Math.abs(y)>.92)a.setX(i,a.getX(i)*1.04)}g.computeVertexNormals()}
   cache[k]={g,m:[side,side,side,side,S({map:ft,roughness:p.shape==='bag'?.3:.5}),S({map:ft})]}}
  mesh=new THREE.Mesh(cache[k].g,cache[k].m);
 }else{
  if(!cache[k]){const r=p.w/2,h=p.h;let pts;
   if(p.shape==='bottle')pts=[[0,0],[r*.85,0],[r,.04*h],[r,.55*h],[r*.95,.62*h],[r*.42,.8*h],[r*.3,.9*h],[r*.32,.93*h],[r*.3,1*h],[0,1*h]];
   else pts=[[0,0],[r*.82,0],[r,h*.95],[r*1.03,h],[0,h]];
   const g=new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1]-h/2)),24);
   // remap v to height so the label maps straight
   const a=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<a.count;i++)uv.setY(i,(a.getY(i)+h/2)/h);
   const c=cv(512,256),x=c.getContext('2d');x.fillStyle=p.col;x.fillRect(0,0,512,256);
   if(p.image){const im=p.image;const s=256/im.height,iw=im.width*s;for(let j=0;j<2;j++){x.save();x.translate(j*256+128,0);
     const sc=p.shape==='bottle'?Math.min(1.8,200/iw):1; x.drawImage(im,-iw*sc/2,0,iw*sc,256);x.restore()}}
   cache[k]={g,m:S({map:tex(c),roughness:p.shape==='bottle'?.15:.4,transparent:false})}}
  mesh=new THREE.Mesh(cache[k].g,cache[k].m);
 }
 mesh.userData.p=p;return mesh;
}
// supermarket shelf wall texture with real product art (bright)
export function shelfTexture(products){const c=cv(1024,1024),x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,0,1024);g.addColorStop(0,'#fff8ee');g.addColorStop(1,'#ffe9d0');x.fillStyle=g;x.fillRect(0,0,1024,1024);
 const rows=4,rh=1024/rows;let n=0;
 for(let r=0;r<rows;r++){const y0=r*rh;x.fillStyle='#fffaf3';x.fillRect(0,y0,1024,rh);
  let xx=6;n=r*4;
  while(xx<1020){const q=products[(n++)%products.length];if(!q.image){xx+=60;continue}
   const h=rh*(q.shape==='bottle'?.86:.7),w=q.image.width*h/q.image.height;
   for(let k=0;k<2&&xx<1020;k++){x.drawImage(q.image,xx,y0+rh-26-h,w,h);xx+=w+2}xx+=8}
  x.fillStyle='#ff7a00';x.fillRect(0,y0+rh-26,1024,20);x.fillStyle='#fff';x.fillRect(0,y0+rh-26,1024,4);
  for(let t=40;t<1024;t+=170){x.fillStyle='#fff';x.fillRect(t,y0+rh-24,44,15);x.fillStyle='#111';x.font='bold 12px Rubik';x.fillText('₪'+(5+((t+r)%13))+'.90',t+3,y0+rh-12)}
  x.fillStyle='#d9d9d9';x.fillRect(0,y0+rh-6,1024,6)}
 const t=tex(c);t.wrapS=THREE.RepeatWrapping;return t}
export function signTexture(lines,bg='#ff7a00',fg='#fff',w=512,h=256){const c=cv(w,h),x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);
 x.fillStyle=fg;x.textAlign='center';x.direction='rtl';lines.forEach((l,i)=>{x.font=`900 ${l[1]}px Rubik`;x.fillText(l[0],w/2,l[2])});return tex(c)}
export function makeRenderer(canvas){const r=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.15;return r}
export function fit(renderer,camera,el){const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
export function blobShadow(size=1){const c=cv(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');
 x.fillStyle=g;x.fillRect(0,0,64,64);const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:tex(c),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;return m}
