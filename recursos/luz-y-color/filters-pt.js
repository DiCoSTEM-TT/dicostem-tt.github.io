 'use strict';
const ColourFilters=(()=>{
 const bits={black:0,blue:1,green:2,cyan:3,red:4,magenta:5,yellow:6,white:7};
 const hex={black:'#000000',blue:'#0000ff',green:'#00ff00',cyan:'#00d9ec',red:'#ff0000',magenta:'#ed38d0',yellow:'#ffe52e',white:'#ffffff'};
 const names={black:'O ecrã não recebe luz',blue:'Azul',green:'Verde',cyan:'Ciano',red:'Vermelho',magenta:'Magenta',yellow:'Amarelo',white:'Branco'};
 const key=n=>Object.keys(bits).find(k=>bits[k]===n);
 function model(a,b,{removed=false}={}){if(!['cyan','magenta','yellow'].includes(a)||!['cyan','magenta','yellow'].includes(b))throw Error('Filtro inválido');return {incoming:'white',middle:a,outgoing:removed?a:key(bits[a]&bits[b]),absorbedA:key(7&~bits[a]),absorbedB:removed?'black':key(bits[a]&~bits[b])};}
 const channels=k=>['red','green','blue'].filter(c=>bits[k]&bits[c]).map(c=>names[c].toLowerCase()).join(' + ')||'nenhum componente';
 let counter=0;
 function scene(a,b,{reveal=false,removed=false,components=false}={}){
 const m=model(a,b,{removed}),id='filter-scene-'+(++counter);
 components=components&&reveal;
 const plate=(x,k,n,out)=>`<g data-support="${n}" transform="translate(${x} 0)"><path d="M-12 314Q0 333 12 314M0 325V405M-26 405H26" fill="none" stroke="#90a7b5" stroke-width="6" stroke-linecap="round"/><text data-filter-label="${n}" x="0" y="447" text-anchor="middle" fill="#fff" font-size="20">${n} · ${names[k]}</text></g><g data-filter="${n}" class="filter-plate" style="transform:translate(${x}px,${out?-150:0}px)"><ellipse data-filter-glass cx="0" cy="258" rx="23" ry="62" fill="${hex[k]}" fill-opacity=".82" stroke="#dceaf3" stroke-width="7"/><rect x="-8" y="174" width="16" height="21" rx="5" fill="#dceaf3"/></g>`;
 const beam=(x1,x2,k)=>{
  if(k==='black')return '';
  if(components)return ['red','green','blue'].map((c,i)=>bits[k]&bits[c]?`<path d="M${x1} ${244+i*14}H${x2}" stroke="${hex[c]}" stroke-width="7"/><path d="M${(x1+x2)/2-5} ${240+i*14}l8 4-8 4" fill="none" stroke="#fff" stroke-width="1.5"/>`:'').join('');
  return `<path d="M${x1} 233H${x2}V283H${x1}Z" fill="${hex[k]}" opacity=".75"/><path d="M${(x1+x2)/2-8} 250l14 8-14 8" fill="none" stroke="#182d3a" stroke-width="3"/>`;
 };
 return `<svg class="filter-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" role="img" aria-labelledby="${id}"><title id="${id}">${reveal?`Luz branca, filtro ${names[a]}, ${removed?'segundo filtro retirado':`filtro ${names[b]}`}. Resultado: ${names[m.outgoing]}.`:'Fonte branca, filtros fora do feixe e resultado no ecrã por prever.'}</title><rect width="1000" height="500" rx="16" fill="#243e50"/><path d="M65 405H775" stroke="#90a7b5" stroke-width="2" opacity=".4"/>
 <g><rect x="65" y="220" width="95" height="76" rx="12" fill="#607c8e"/><ellipse cx="160" cy="258" rx="15" ry="38" fill="#fff"/><path d="M109 296V405M83 405h52" stroke="#90a7b5" stroke-width="6" stroke-linecap="round"/><text x="113" y="35" fill="#fff" font-size="21" text-anchor="middle">Fonte branca</text></g>
 <g data-beams>${beam(175,330,'white')}${beam(330,600,reveal?m.middle:'white')}${beam(600,750,reveal?m.outgoing:'white')}</g>
 ${plate(330,a,'1',!reveal)}${plate(600,b,'2',!reveal||removed)}
 <g><rect x="750" y="188" width="10" height="142" rx="4" fill="#eef2f4"/><path d="M755 330V405M734 405H776" stroke="#90a7b5" stroke-width="6" stroke-linecap="round"/><text x="747" y="154" text-anchor="middle" fill="#fff" font-size="17">Ecrã</text><text x="747" y="176" text-anchor="middle" fill="#d7e9f3" font-size="15">de perfil</text></g>
 <g><rect x="800" y="164" width="178" height="206" rx="12" fill="#eef2f4" stroke="#bdd0da" stroke-width="2"/><circle data-screen-spot cx="889" cy="265" r="55" fill="${reveal?hex[m.outgoing]:'#b1bbc2'}"/><text x="889" y="122" text-anchor="middle" fill="#fff" font-size="19">Vista frontal</text><text x="889" y="146" text-anchor="middle" fill="#d7e9f3" font-size="17">do ecrã</text><text data-screen-question x="889" y="279" text-anchor="middle" fill="${reveal?'transparent':'#243e50'}" font-size="44">?</text><path d="M768 340L795 340" stroke="#bdd0da" stroke-width="2" stroke-dasharray="4 4"/></g>
 <text data-status x="500" y="475" text-anchor="middle" fill="#d7e9f3" font-size="17">${reveal?(components?'Componentes RGB simbólicos · só passam os que cada filtro transmite':'Filtros em série · resultado na vista frontal'):'Resultado oculto · faz a tua previsão'}</text></svg>`;
 }

 return {bits,hex,names,model,channels,scene};
})();
if(typeof module!=='undefined')module.exports=ColourFilters;
