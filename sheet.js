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
export const SB='https://xggvdizqwmnnsrzrkios.supabase.co';
export const SBK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ3ZkaXpxd21ubnNyenJraW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDEyODUsImV4cCI6MjEwNzQ3NzI4NX0.kgKbPI_kEfhWhb_tn8KvpCdTol4TooJ19VsM96axhrI'; // public anon key (writes are PIN-checked on the server)
export async function rpc(fn,body){const r=await fetch(SB+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:SBK,Authorization:'Bearer '+SBK},body:JSON.stringify(body||{}),cache:'no-store'});const d=await r.json().catch(()=>({error:'אין חיבור'}));if(!r.ok)throw new Error((d&&d.message)||'שגיאה');return d}
// Reads the store backend (prices/deals edited in admin.html) with offline cache + bundled fallback.
export async function loadTab(tab){
 const key='mo_sheet_'+tab;
 try{const d=await rpc('mm_data');
  const P=d.products.map(p=>[p.name,p.price,p.img,p.cat]),D=d.deals.map(x=>[x.title,x.price,x.until,x.img]);
  const at=Date.now();localStorage.setItem('mo_sheet_מוצרים',JSON.stringify({at,rows:P}));localStorage.setItem('mo_sheet_מבצעים',JSON.stringify({at,rows:D}));
  return {rows:tab=='מבצעים'?D:P,src:'live'}}
 catch(e){const c=localStorage.getItem(key);if(c){const o=JSON.parse(c);return {rows:o.rows,src:'cache',at:o.at}}
  return {rows:FALLBACK[tab]||[],src:'fallback'}}}
export function price(v){v=(v||'').toString().trim();if(!v)return null;const n=v.replace(/[^\d.]/g,'');return n?'₪'+(+n).toFixed(2).replace(/\.00$/,''):v}
export const esc=s=>(s||'').toString().replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function safeImg(u){u=(u||'').trim();return /^(https:\/\/|img\/)/.test(u)?u:''}
export const FB_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V14h2.7v8z"/></svg>';
