'use strict';
// Reglas educativas provisionales; no son los baremos del instrumento histórico.
const ColourReasoning=(()=>{
 const bits={red:4,green:2,blue:1,cyan:3,magenta:5,yellow:6,white:7,black:0};
 const colour=value=>Object.keys(bits).find(k=>bits[k]===value);
 const models=[
  {id:'scientific',title:'Compatible with the scientific model',predict:q=>q.answer,explain:'Your answers tend to select the components of the available light that the surface can reflect.'},
  {id:'addition',title:'Tendency to add the object’s colour and the light’s colour',predict:q=>colour(bits[q.surface]|bits[q.light]),explain:'Several answers fit adding the surface’s usual colour and the bulb’s colour. An illuminated surface does not add its own light: it reflects some of the light it receives.'},
  {id:'object',title:'Tendency to retain the object’s usual colour',predict:q=>q.surface,explain:'Several answers retain the colour that the surface shows under white light. If the bulb does not supply the necessary components, the surface cannot reflect them.'},
  {id:'light',title:'Tendency to assign the bulb’s colour to the object',predict:q=>q.light,explain:'Several answers match the bulb’s light. The surface does not necessarily return all of that light: it may absorb some components.'}
 ];
 function analyse(items,answers){
  if(items.length!==12||answers.length!==12||answers.some((a,i)=>!items[i].options.includes(a)))throw Error('A complete valid session is required.');
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
