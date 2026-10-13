// Reads Ben's Google Sheet (gviz CSV) with offline cache + bundled fallback.
export const SHEET_ID='1uPjgqkHdXJwjzMgcimpNEglFJR6aolPeVEZUXuJFlho';
export const FB='https://www.facebook.com/share/1EAB5bpqLv/';
const B='img/';
const FALLBACK={
 'מוצרים':[['במבה אסם 80 גרם','','p_bamba','חטיפים'],['ביסלי גריל','','p_bissli','חטיפים'],["תפוצ'יפס טבעי 50 גרם",'','p_tapuchips','חטיפים'],['פסטה אסם מסולסלים','','p_pasta','מזון יבש'],['קרמבו וניל – מארז 8','','p_krembo','ממתקים'],['שוקולד פרה חלב עלית 100 גרם','','p_elite','ממתקים'],['קוקה-קולה 1.5 ליטר','','p_cola','משקאות'],['שוקו יטבתה 1 ליטר','','p_shoko','משקאות'],['חלב תנובה 3% 1 ליטר','','p_milk','מוצרי חלב'],['חלב טרה 3% 1 ליטר','','p_tara','מוצרי חלב'],["קוטג' תנובה 5% 250 גרם",'','p_cottage','מוצרי חלב'],['מילקי שוקולד','','p_milky','מוצרי חלב']].map(r=>[r[0],r[1],B+r[2]+'.webp',r[3]]),
 'מבצעים':[]
};
export function parseCSV(t){const rows=[];let row=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
  else if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c!='\r')f+=c}
 if(f!==''||row.length){row.push(f);rows.push(row)}return rows}
export async function loadTab(tab){
 const key='mo_sheet_'+tab;let src='live';
 try{const r=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&t=${Date.now()}`,{cache:'no-store'});
  if(!r.ok)throw 0;const t=await r.text();if(t.trim().startsWith('<'))throw 0;
  const rows=parseCSV(t).slice(1).filter(r=>r.some(x=>x.trim()));localStorage.setItem(key,JSON.stringify({at:Date.now(),rows}));return {rows,src}}
 catch(e){const c=localStorage.getItem(key);if(c){const o=JSON.parse(c);return {rows:o.rows,src:'cache',at:o.at}}
  return {rows:FALLBACK[tab]||[],src:'fallback'}}}
export function price(v){v=(v||'').toString().trim();if(!v)return null;const n=v.replace(/[^\d.]/g,'');return n?'₪'+(+n).toFixed(2).replace(/\.00$/,''):v}
export const esc=s=>(s||'').toString().replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function safeImg(u){u=(u||'').trim();return /^(https:\/\/|img\/)/.test(u)?u:''}
export const FB_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V14h2.7v8z"/></svg>';
