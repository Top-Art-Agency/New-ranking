'use strict';
const FIREBASE_ROOT='https://triki-ranking-2-default-rtdb.europe-west1.firebasedatabase.app';
const TEST_SESSION=(()=>{const id=typeof location==='undefined'?null:new URLSearchParams(location.search).get('test');if(id!==null&&!/^browser_[a-f0-9]{32}$/.test(id))throw new Error('Nieprawidłowy identyfikator testu — połączenie z bazą zatrzymane.');return id;})();
const DB=TEST_SESSION?`${FIREBASE_ROOT}/__load_tests/${TEST_SESSION}`:FIREBASE_ROOT;
function testLink(path){if(!TEST_SESSION)return path;const url=new URL(path,location.href);url.searchParams.set('test',TEST_SESSION);return url.href;}
if(TEST_SESSION&&typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
 const badge=document.createElement('div');badge.textContent='TRYB TESTOWY · osobna baza wyników';badge.style.cssText='position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;background:#cefa64;color:#111;padding:3px 14px;border-radius:0 0 8px 8px;font:700 12px Arial;pointer-events:none';document.body.appendChild(badge);
 document.querySelectorAll('a[href="index.html"],a.brand').forEach(a=>a.href=testLink('index.html'));
});
const GAMES=[
 {key:'ninja',label:'Ninja Frog',short:'NF',color:'#cefa64',logo:'Ninja%20Frog'},
 {key:'bokser',label:'Bokser',short:'BX',color:'#ffa6b3',logo:'Boxer'},
 {key:'toss',label:'Toss',short:'TS',color:'#ffce84',logo:'Toss'},
 {key:'snake',label:'Snake',short:'SN',color:'#7ee8c2',logo:'Snake'},
 {key:'snake1v1',label:'Snake 1v1',short:'1v1',color:'#c8aaff',logo:'Snake_1vs1'},
 {key:'pilka',label:'Piłka Nożna',short:'PN',color:'#ffb383',logo:'Pilka-nozna'},
 {key:'galaxy',label:'Galaxy',short:'GX',color:'#9ebdff',logo:null,asset:'assets/galaxy.jpg'},
 {key:'wyscigi',label:'Wyścigi',short:'WY',color:'#7edfff',logo:null,asset:'assets/wyscigi.png'},
 {key:'frogjumper',label:'Frog Jumper',short:'FJ',color:'#b5ee72',logo:null,asset:'assets/frogjumper.jpg'},
 {key:'flickbattle',label:'Flick Battle',short:'FB',color:'#f6a6e5',logo:null,asset:'assets/flickbattle.jpg'}
];
