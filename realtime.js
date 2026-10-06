"use strict";
// Firebase REST streams deliver an initial snapshot followed by put/patch deltas.
const FirebaseFeed=(()=>{
 function setAt(root,path,value){
  const parts=path.split('/').filter(Boolean);
  if(parts.some(p=>['__proto__','prototype','constructor'].includes(p)))throw new Error('unsafe path');
  if(!parts.length)return value;
  if(!root||typeof root!=='object')root={};
  let node=root;for(const part of parts.slice(0,-1)){if(!node[part]||typeof node[part]!=='object')node[part]={};node=node[part];}
  if(value===null)delete node[parts.at(-1)];else node[parts.at(-1)]=value;return root;
 }
 function apply(root,type,event){
  if(!event||typeof event.path!=='string'||!('data' in event))throw new Error('invalid event');
  if(type==='put')return setAt(root,event.path,event.data);
  if(!event.data||typeof event.data!=='object'||Array.isArray(event.data))throw new Error('invalid patch');
  for(const [key,value] of Object.entries(event.data))root=setAt(root,event.path+'/'+key,value);
  return root;
 }
 function watch(key,onData,onState){
  let source=null,raw=null,timer=null,stopped=false,live=false;
  const flush=()=>{timer=null;if(!stopped)onData(raw);};
  const stop=()=>{stopped=true;live=false;clearTimeout(timer);source?.close();};
  if(typeof EventSource==='undefined'){onState('fallback');return{stop,get isLive(){return false;}};}
  source=new EventSource(`${DB}/${key}.json`);
  const receive=type=>event=>{if(stopped)return;try{raw=apply(raw,type,JSON.parse(event.data));live=true;onState('connected');if(timer===null)timer=setTimeout(flush,250);}catch{live=false;onState('error');source.close();}};
  for(const type of ['put','patch'])source.addEventListener(type,receive(type));
  source.onerror=()=>{if(!stopped){live=false;onState('reconnecting');}};
  for(const type of ['cancel','auth_revoked'])source.addEventListener(type,()=>{if(!stopped){live=false;clearTimeout(timer);timer=null;source.close();onState('denied');}});
  return{stop,get isLive(){return live;}};
 }
 return{apply,watch};
})();
