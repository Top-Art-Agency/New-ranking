'use strict';
const TrikiRanking=(()=>{
 const identity=name=>String(name??'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('pl');
 const compare=(a,b)=>b.score-a.score||(Number(a.ts)||0)-(Number(b.ts)||0)||String(a.id).localeCompare(String(b.id));
 function best(items){const players=new Map();for(const row of items){const key=identity(row.name),old=players.get(key);if(!old||compare(row,old)<0)players.set(key,row);}return [...players.values()];}
 return{identity,compare,best};
})();
