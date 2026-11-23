 'use strict';
const ColourRandom = (() => {
 const VERSION='explora-0.3';
 const keys=['red','green','blue','cyan','magenta','yellow','white','black'];
 const bits={red:4,green:2,blue:1,cyan:3,magenta:5,yellow:6,white:7,black:0};
 const name=n=>keys.find(k=>bits[k]===n);
 const reflect=(surface,light)=>name(bits[surface]&bits[light]);
 function random(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function generate(seed){
 const r=random(seed), primary=['red','green','blue'];
 const first=shuffle(primary.flatMap(surface=>primary.map(light=>({surface,light,block:'primary',control:surface===light}))),r);
 // Two different compound surfaces with a shared, but incomplete, reflected spectrum.
 const partial=shuffle(['cyan','magenta','yellow'].flatMap(surface=>['cyan','magenta','yellow'].filter(light=>light!==surface).map(light=>({surface,light,block:'extended',control:false}))),r);
 const one=partial[0],two=partial.find(q=>q.surface!==one.surface&&q.light!==one.light);
 const white={surface:'white',light:shuffle(['cyan','magenta','yellow'],r)[0],block:'extended',control:true};
 return [...first,...shuffle([one,two,white],r)].map((q,i)=>{
 const answer=reflect(q.surface,q.light);
 const core=[...new Set([answer,q.surface,q.light,name(bits[q.surface]|bits[q.light]),'black','indistinguishable'])];
 const extra=shuffle(keys.filter(k=>!core.includes(k)),r);
 const options=shuffle([...core,...extra.slice(0,7-core.length)],r);
 return {...q,id:i+1,answer,options};
 });
 }
 return {VERSION,keys,bits,reflect,generate};
})();
if(typeof module!=='undefined')module.exports=ColourRandom;
