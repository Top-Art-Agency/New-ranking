'use strict';
const el=id=>document.getElementById(id);
let sessionId;
try{sessionId=sessionStorage.getItem('triki-load-session');}catch{}
if(!/^browser_[a-f0-9]{32}$/.test(sessionId||'')){sessionId='browser_'+crypto.randomUUID().replaceAll('-','');try{sessionStorage.setItem('triki-load-session',sessionId);}catch{}}
const testBase=FIREBASE_ROOT+'/__load_tests/'+sessionId;
let running=false,stopping=false;
el('session').textContent='Sesja: '+sessionId;
el('game').innerHTML=GAMES.map(g=>`<option value="${g.key}">${g.label}</option>`).join('')+'<option value="all">Wszystkie gry</option>';
function links(){const game=el('game').value==='all'?'ninja':el('game').value;el('panel').href=`index.html?test=${sessionId}&game=${game}`;el('tv').href=`tv.html?test=${sessionId}&game=${game}`;if(!el('screen').hidden)el('screen').src=el('tv').href;}
links();el('game').onchange=links;el('preview').onclick=()=>{el('screen').hidden=false;el('screen').src=el('tv').href;el('preview').hidden=true;};
function controls(busy){running=busy;for(const id of ['start','clean','count','workers','game'])el(id).disabled=busy;el('stop').disabled=!busy;}
async function request(path,method='GET',body){if(!/^browser_[a-f0-9]{32}$/.test(sessionId))throw Error('Nieprawidłowa sesja');const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);try{const r=await fetch(testBase+path+'.json',{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
el('stop').onclick=()=>{stopping=true;el('stop').disabled=true;el('status').textContent='Zatrzymywanie — czekamy na już wysłane żądania…';};
el('start').onclick=async()=>{
 if(running)return;controls(true);stopping=false;const count=Number(el('count').value),workers=Number(el('workers').value),selection=el('game').value;let next=0,ok=0,fail=0,done=0;const durations=[],expected=[],failures=[];let started=0;
 const draw=()=>{el('progress').value=done;el('ok').textContent=ok;el('errors').textContent=fail;el('speed').textContent=(ok/Math.max(.001,(performance.now()-started)/1000)).toFixed(1);if(durations.length){const s=[...durations].sort((a,b)=>a-b);el('p95').textContent=(s[Math.min(s.length-1,Math.ceil(s.length*.95)-1)]/1000).toFixed(2)+' s';}el('status').textContent=`${stopping?'Zatrzymywanie':'Wysyłanie'}: ${done}/${count} · ${ok} potwierdzonych · ${fail} błędów`;};
 el('progress').max=count;el('progress').value=0;el('log').textContent='';el('ok').textContent='0';el('errors').textContent='0';el('speed').textContent='—';el('p95').textContent='—';el('status').textContent='Sprawdzanie sesji testowej…';
 try{
  const old=await request('');const existing=GAMES.reduce((n,g)=>n+Object.keys(old?.[g.key]||{}).length,0);if(existing+count>10000)throw Error('Limit 10 000 wpisów w sesji. Najpierw usuń dane testowe.');
  started=performance.now();
  async function worker(){while(!stopping){const i=next++;if(i>=count)return;const game=selection==='all'?GAMES[i%GAMES.length].key:selection;const id='entry_'+crypto.randomUUID();const player='TEST_'+String(i+1).padStart(5,'0');const payload=game==='snake1v1'?{winner:player,loser:'TEST_Rywal_'+i,ts:{'.sv':'timestamp'}}:{name:player,score:Math.floor(Math.random()*100000),jury:i%workers+1,ts:{'.sv':'timestamp'}};expected.push({game,id,payload});const t=performance.now();try{await request('/'+game+'/'+id,'PUT',payload);durations.push(performance.now()-t);ok++;}catch(e){fail++;if(failures.length<10)failures.push(`${game}: ${e.message}`);if(fail>=10)stopping=true;}done++;draw();}}
  await Promise.all(Array.from({length:workers},worker));el('status').textContent='Sprawdzanie zapisanych danych w Firebase…';const stored=await request('');let found=0,mismatch=0;for(const x of expected){const row=stored?.[x.game]?.[x.id];if(row){found++;if(Object.entries(x.payload).some(([k,v])=>k!=='ts'&&row[k]!==v)||!Number.isFinite(row.ts))mismatch++;}}
  const seconds=(performance.now()-started)/1000;el('status').textContent=`${stopping?'Test zatrzymany':'Test zakończony'}. Potwierdzono odczytem ${found}/${expected.length} wysłanych wpisów. Niezgodne dane: ${mismatch}.`;
  el('log').textContent=`Nowa partia: ${expected.length} żądań\nPotwierdzone odpowiedzi: ${ok}\nBłędy odpowiedzi: ${fail}\nZnalezione w bazie: ${found}\nNiezgodne dane: ${mismatch}\nCzas z weryfikacją: ${seconds.toFixed(1)} s\nRównoległość: ${workers}\n${failures.join('\n')}`;
  if(fail)el('log').textContent+='\nBłąd odpowiedzi nie zawsze oznacza brak zapisu — rozstrzyga odczyt kontrolny.';
 }catch(e){el('status').textContent='Test nieukończony: '+e.message+'. Dane mogą pozostać w tej sesji; możesz je usunąć przyciskiem powyżej.';}finally{controls(false);}
};
el('clean').onclick=async()=>{if(running||!confirm('Usunąć wszystkie wyniki tej sesji testowej? Prawdziwe wyniki wydarzenia pozostaną bez zmian.'))return;controls(true);el('stop').disabled=true;el('status').textContent='Usuwanie danych testowych…';try{await request('','DELETE');if(await request('')!==null)throw Error('Nie potwierdzono usunięcia');el('status').textContent='Dane sesji usunięte. Możesz uruchomić nowy test.';el('progress').value=0;}catch(e){el('status').textContent='Nie potwierdzono usunięcia: '+e.message;}finally{controls(false);}};
