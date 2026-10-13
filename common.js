// shared: products, storage, sfx, results
export const PRODUCTS=[
 {id:'bamba',name:'במבה',img:'img/bamba.png',shape:'bag',w:1.0,h:1.35,d:.38,col:'#f2b21b'},
 {id:'bissli',name:'ביסלי',img:'img/bissli.png',shape:'bag',w:1.0,h:1.3,d:.38,col:'#e2a020'},
 {id:'tapuchips',name:'תפוצ\'יפס',img:'img/tapuchips.png',shape:'bag',w:1.0,h:1.4,d:.38,col:'#d8252a'},
 {id:'cola',name:'קוקה-קולה',img:'img/cola.png',shape:'bottle',w:.42,h:1.5,d:.42,col:'#7a1d1a'},
 {id:'milk',name:'חלב תנובה',img:'img/milk.png',shape:'box',w:.62,h:1.25,d:.62,col:'#e9f1f4'},
 {id:'tara',name:'חלב טרה',img:'img/tara.jpg',shape:'box',w:.62,h:1.2,d:.62,col:'#f4f6fa'},
 {id:'elite',name:'שוקולד עלית',img:'img/elite.jpg',shape:'box',w:1.05,h:.9,d:.16,col:'#c3151c'},
 {id:'para',name:'פרה עלית',img:'img/para.png',shape:'box',w:1.4,h:.66,d:.2,col:'#c8151c'},
 {id:'krembo',name:'קרמבו',img:'img/krembo.jpg',shape:'box',w:1.5,h:.62,d:.62,col:'#f3e7d2'},
 {id:'pasta',name:'פסטה אסם',img:'img/pasta.png',shape:'box',w:.9,h:1.25,d:.34,col:'#1d4fa8'},
 {id:'cottage',name:'קוטג\' תנובה',img:'img/cottage.png',shape:'tub',w:.9,h:.8,d:.9,col:'#f4f4f4'},
 {id:'milky',name:'מילקי',img:'img/milky.png',shape:'tub',w:.7,h:.75,d:.7,col:'#5b2b74'},
 {id:'shoko',name:'שוקו',img:'img/shoko.png',shape:'bottle',w:.4,h:1.3,d:.4,col:'#5a3423'},
];
export const PHONE='03-9443449';
const K='mo_';
export const store={
 best(g){return +localStorage.getItem(K+'best_'+g)||0},
 setBest(g,v){const b=this.best(g);if(v>b){localStorage.setItem(K+'best_'+g,v);return true}return false},
 coins(){return +localStorage.getItem(K+'coins')||0},
 addCoins(n){localStorage.setItem(K+'coins',this.coins()+n)},
 get muted(){return localStorage.getItem(K+'mute')==='1'},
 set muted(v){localStorage.setItem(K+'mute',v?'1':'0')}
};
// ---- synthesized punchy SFX (no files, zero latency)
let AC=null,master=null;
export function audioUnlock(){ if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.55;master.connect(AC.destination)} if(AC.state==='suspended')AC.resume(); }
function tone(f0,f1,dur,type='square',vol=.4,delay=0){ if(!AC||store.muted)return; const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
 o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(f1,20),t+dur);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol=.5,fc=1200,delay=0){ if(!AC||store.muted)return; const t=AC.currentTime+delay,n=AC.sampleRate*dur,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n)**2; const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=fc;
 const g=AC.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(master);s.start(t)}
export const sfx={
 coin(){tone(1320,1320,.07,'square',.18);tone(1760,1760,.16,'square',.18,.06)},
 item(){tone(660,1320,.12,'triangle',.35);tone(990,1980,.18,'triangle',.25,.08)},
 jump(){tone(260,720,.18,'sine',.4)},
 slide(){noise(.22,.35,900)},
 lane(){tone(500,380,.06,'triangle',.25)},
 crash(){noise(.5,.9,2200);tone(180,40,.45,'sawtooth',.4)},
 drop(){tone(420,200,.12,'triangle',.3)},
 thud(v=1){noise(.12,.6*v,500);tone(130,60,.14,'sine',.6*v)},
 perfect(){[784,988,1175,1568].forEach((f,i)=>tone(f,f,.12,'square',.15,i*.06))},
 fall(){tone(700,90,.9,'sawtooth',.25);noise(.6,.5,800,.3)},
 click(){tone(900,600,.05,'square',.2)},
 best(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,f,.16,'square',.16,i*.09))}
};
// ---- texture helper: draw packaging onto a canvas sized for a face
export function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
// ---- results overlay
export function showResults({game,title,score,unit,coins,extra,onRetry}){
 const ov=document.getElementById('results'); const isBest=store.setBest(game,score); store.addCoins(coins||0);
 const best=store.best(game);
 const txt=`הגעתי ל-${score}${unit} ב"${title}" של מינימרקט אור! 🛒 נסו לעקוף אותי: ${location.href.split('#')[0]}`;
 ov.innerHTML=`<div class="card">
  <img src="img/logo.png" style="width:84px;position:absolute;top:-52px;left:50%;transform:translateX(-50%);filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))">
  <h2 class="chunky" style="font-size:38px;margin-top:30px">${isBest?'שיא חדש!':'כל הכבוד!'}</h2>
  <div class="big">${score}<span style="font-size:26px">${unit}</span></div>
  <div style="margin:6px 0;font-weight:700;color:#444">🏆 השיא שלך: ${best}${unit} &nbsp;·&nbsp; 🪙 +${coins||0}</div>
  ${extra||''}
  <button class="btn" id="rRetry">שחקו שוב</button>
  <div class="row"><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">שתפו בוואטסאפ</a><a class="btn dk" href="index.html">לכל המשחקים</a></div>
  <div class="coupon">🎁 קופון למינימרקט אור – בקרוב!<small>אספו מטבעות עכשיו, והם יחכו לכם כשהקופונים יעלו · ${PHONE}</small></div>
 </div>`;
 ov.classList.add('on'); if(isBest&&score>0)sfx.best();
 ov.querySelector('#rRetry').onclick=()=>{sfx.click();ov.classList.remove('on');onRetry()};
}
export function giftTease(){
 const ov=document.getElementById('results');
 ov.innerHTML=`<div class="card"><div style="font-size:64px">🎁</div><h2 class="chunky" style="font-size:36px">קופון בקרוב!</h2>
 <p style="font-weight:600;font-size:17px">בקרוב תוכלו להמיר מטבעות לקופון אמיתי במינימרקט אור.<br>יש לכם כבר <b style="color:#ff7a00">🪙 ${store.coins()}</b> מטבעות.</p>
 <a class="btn dk" href="tel:${PHONE}">📞 ${PHONE}</a><button class="btn" id="gClose">חזרה למשחק</button></div>`;
 ov.classList.add('on'); return new Promise(r=>ov.querySelector('#gClose').onclick=()=>{ov.classList.remove('on');r()});
}
export function toast(el,text,color='#ff7a00'){el.textContent=text;el.style.color=color;el.style.opacity=1;el.style.transform='scale(1.15)';
 clearTimeout(el._t);el._t=setTimeout(()=>{el.style.opacity=0;el.style.transform='scale(1)'},650)}
export const ICON={pause:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>',
 gift:'<svg viewBox="0 0 24 24"><path d="M3 9h18v4H3zM4 13h7v8H5a1 1 0 0 1-1-1zM13 13h7v7a1 1 0 0 1-1 1h-6zM11 9h2v12h-2zM12 9C9 3 5 5 7 8M12 9c3-6 7-4 5-1" stroke="#fff" stroke-width="1.6" fill="#fff"/></svg>'};
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js');
