import * as THREE from './vendor/three.js';
import {PRODUCTS,loadImg} from './common.js';
export {THREE};
export async function loadProducts(){
 const prof=await (await fetch('img/prof.json')).json();
 const imgs=await Promise.all(PRODUCTS.map(p=>loadImg('img/p_'+p.id+'.webp')));
 PRODUCTS.forEach((p,i)=>{const q=prof[p.id];p.image=imgs[i];p.prof=q;p.col=q.col;p.w=p.h*q.aspect;if(p.shape==='lathe'||p.shape==='carton')p.d=p.w*(p.shape==='carton'?.95:1)});return PRODUCTS}
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function tex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
function imgTex(p,fill){const im=p.image,c=cv(im.width,im.height),x=c.getContext('2d');if(fill){x.fillStyle=p.col;x.fillRect(0,0,c.width,c.height)}x.drawImage(im,0,0);return tex(c)}
const cache={};
const STD=(m)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.42,metalness:0},m));
function build(p){
 const w=p.w,h=p.h,d=p.d||.3;
 if(p.shape==='bag'){ // pillow: front+back sheets with exact cut-out silhouette
  const g=new THREE.PlaneGeometry(w,h,14,14),a=g.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i)/(w/2),y=a.getY(i)/(h/2);const f=Math.max(0,1-x*x)**.6*Math.max(0,1-Math.abs(y)**3)**.8;a.setZ(i,f*d/2)}
  g.computeVertexNormals();const t=imgTex(p,false);
  const m=STD({map:t,alphaTest:.5,side:THREE.DoubleSide,roughness:.3});
  const gr=new THREE.Group();const f=new THREE.Mesh(g,m);const bk=new THREE.Mesh(g,m);bk.rotation.y=Math.PI;gr.add(f,bk);return gr}
 if(p.shape==='lathe'){const r=p.prof.r,n=r.length;const pts=r.map((v,k)=>new THREE.Vector2(Math.max(.004,v*w),k/(n-1)*h-h/2));
  pts.unshift(new THREE.Vector2(0,-h/2));pts.push(new THREE.Vector2(0,h/2));
  const g=new THREE.LatheGeometry(pts,28),a=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<a.count;i++){uv.setXY(i,.5+a.getX(i)/w*(a.getZ(i)>=0?1:-1),(a.getY(i)+h/2)/h)}
  return new THREE.Mesh(g,STD({map:imgTex(p,true),roughness:p.id==='cola'?.12:.35}))}
 if(p.shape==='carton'){const f=.8,gr=new THREE.Group();const T=imgTex(p,true);
  const body=T.clone();body.repeat.set(1,f);body.needsUpdate=true;const top=T.clone();top.repeat.set(1,1-f);top.offset.set(0,f);top.needsUpdate=true;
  const side=STD({map:body});const b=new THREE.Mesh(new THREE.BoxGeometry(w,h*f,d),[side,side,STD({color:'#f4f4f4'}),side,side,side]);b.position.y=-h/2+h*f/2;gr.add(b);
  const rg=new THREE.BoxGeometry(w,h*(1-f),d),ra=rg.attributes.position;for(let i=0;i<ra.count;i++)if(ra.getY(i)>0)ra.setZ(i,0);rg.computeVertexNormals();
  const tm=STD({map:top});const roof=new THREE.Mesh(rg,[STD({color:p.col}),STD({color:p.col}),tm,tm,tm,tm]);roof.position.y=h/2-h*(1-f)/2;gr.add(roof);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(w,.06,.03),STD({color:'#f2f2f2'}));fin.position.y=h/2;gr.add(fin);return gr}
 // box
 const t=imgTex(p,true),fm=STD({map:t}),sm=STD({color:p.col});
 return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[sm,sm,sm,sm,fm,fm]);
}
export function productMesh(p){if(!cache[p.id])cache[p.id]=build(p);const m=cache[p.id].clone();m.userData.p=p;return m}
// supermarket shelf wall texture with real product art (bright)
export function shelfTexture(products){const c=cv(1024,1024),x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,0,1024);g.addColorStop(0,'#fff8ee');g.addColorStop(1,'#ffe9d0');x.fillStyle=g;x.fillRect(0,0,1024,1024);
 const rows=3,rh=1024/rows;let n=0;
 for(let r=0;r<rows;r++){const y0=r*rh;x.fillStyle='#fffaf3';x.fillRect(0,y0,1024,rh);
  let xx=6;n=r*4;
  while(xx<1020){const q=products[(n++)%products.length];if(!q.image){xx+=60;continue}
   const h=rh*((q.shape==='lathe'||q.shape==='carton')?.86:.7),w=q.image.width*h/q.image.height;
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
