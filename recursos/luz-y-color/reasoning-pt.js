'use strict';
// Reglas educativas provisionales; no son los baremos del instrumento histórico.
const ColourReasoning=(()=>{
 const bits={red:4,green:2,blue:1,cyan:3,magenta:5,yellow:6,white:7,black:0};
 const colour=value=>Object.keys(bits).find(k=>bits[k]===value);
 const models=[
  {id:'scientific',title:'Compatível com o modelo científico',predict:q=>q.answer,explain:'As tuas respostas tendem a selecionar os componentes da luz disponível que a superfície pode refletir.'},
  {id:'addition',title:'Tendência para somar a cor do objeto e a da luz',predict:q=>colour(bits[q.surface]|bits[q.light]),explain:'Várias respostas são compatíveis com somar a cor habitual da superfície e a da lâmpada. Uma superfície iluminada não acrescenta luz própria: reflete parte da que recebe.'},
  {id:'object',title:'Tendência para manter a cor habitual do objeto',predict:q=>q.surface,explain:'Várias respostas mantêm a cor que a superfície apresenta com luz branca. Se a lâmpada não fornecer os componentes necessários, a superfície não os pode refletir.'},
  {id:'light',title:'Tendência para atribuir ao objeto a cor da lâmpada',predict:q=>q.light,explain:'Várias respostas coincidem com a luz da lâmpada. A superfície não devolve necessariamente toda essa luz: pode absorver alguns componentes.'}
 ];
 function analyse(items,answers){
  if(items.length!==12||answers.length!==12||answers.some((a,i)=>!items[i].options.includes(a)))throw Error('É necessária uma partida completa válida.');
  const core=items.map((q,i)=>({...q,index:i})).filter(q=>q.block==='primary'&&q.surface!==q.light);
  const evidence=models.map(m=>{const supporting=[],contradicting=[],extendedSupporting=[],extendedContradicting=[];
   core.forEach(q=>(answers[q.index]===m.predict(q)?supporting:contradicting).push(q.id));
   items.forEach((q,i)=>{if(q.block!=='extended')return;const p=m.predict(q);if(models.filter(other=>other.predict(q)===p).length!==1)return;(answers[i]===p?extendedSupporting:extendedContradicting).push(q.id);});
   return {id:m.id,title:m.title,explain:m.explain,supporting,contradicting,extendedSupporting,extendedContradicting};
  });
  const ranked=[...evidence].sort((a,b)=>b.supporting.length-a.supporting.length);
  // Al menos 4 de 6 coincidencias y ventaja de 2. No confundir con validación.
  const predominant=ranked[0].supporting.length>=4&&ranked[0].supporting.length-ranked[1].supporting.length>=2?ranked[0].id:null;
  const same=items.map((q,i)=>({...q,index:i})).filter(q=>q.block==='primary'&&q.surface===q.light);
  const absence=same.filter(q=>answers[q.index]==='black').map(q=>q.id);
  const contrastSupporting=same.filter(q=>answers[q.index]==='indistinguishable').map(q=>q.id);
  const contrastContradicting=same.filter(q=>answers[q.index]!=='indistinguishable').map(q=>q.id);
  const contrast={supporting:contrastSupporting,contradicting:contrastContradicting,total:same.length,plausible:contrastSupporting.length>=2};
  return {predominant,evidence,absence,contrast,coreCount:core.length};
 }
 return {analyse};
})();
if(typeof module!=='undefined')module.exports=ColourReasoning;
