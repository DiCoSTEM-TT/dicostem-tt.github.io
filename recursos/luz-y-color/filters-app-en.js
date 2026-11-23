 'use strict';
(()=>{
const F=ColourFilters,stage=document.querySelector('#filter-scene'),form=document.querySelector('#filter-prediction'),result=document.querySelector('#filter-result');let revealed=false,removed=false,initial,busy=false,components=false;
const a=document.querySelector('#filter-a'),b=document.querySelector('#filter-b');
const options=['red','green','blue','cyan','magenta','yellow','black'];
document.querySelector('#filter-options').innerHTML=options.map(k=>`<label class="colour-option"><input required type="radio" name="prediction" value="${k}"><span class="swatch" style="--swatch:${F.hex[k]}" aria-hidden="true"></span>${F.names[k]}</label>`).join('');
function draw(){
 const markup=F.scene(a.value,b.value,{reveal:revealed,removed,components});
 const current=stage.querySelector('svg');
 if(!current)stage.innerHTML=markup;
 else{
  const template=document.createElement('template');template.innerHTML=markup;const next=template.content.querySelector('svg');
  current.querySelector('title').textContent=next.querySelector('title').textContent;
  current.querySelector('[data-beams]').replaceChildren(...next.querySelector('[data-beams]').childNodes);
  for(const n of ['1','2']){
   const plate=current.querySelector(`[data-filter="${n}"]`),fresh=next.querySelector(`[data-filter="${n}"]`);
   plate.setAttribute('style',fresh.getAttribute('style'));plate.querySelector('[data-filter-glass]').setAttribute('fill',fresh.querySelector('[data-filter-glass]').getAttribute('fill'));
   current.querySelector(`[data-filter-label="${n}"]`).textContent=next.querySelector(`[data-filter-label="${n}"]`).textContent;
  }
  for(const selector of ['[data-screen-spot]','[data-screen-question]'])current.querySelector(selector).setAttribute('fill',next.querySelector(selector).getAttribute('fill'));
  current.querySelector('[data-status]').textContent=next.querySelector('[data-status]').textContent;
 }
 document.querySelector('#filter-toolbar').hidden=!revealed;document.querySelector('#show-rgb').setAttribute('aria-pressed',String(components));document.querySelector('#show-rgb').textContent=components?'Hide RGB components':'Show RGB components';
if(revealed){const m=F.model(a.value,b.value,{removed});document.querySelector('#filter-explanation').innerHTML=`<p><strong>Result for this arrangement: ${F.names[m.outgoing]}.</strong></p><dl class="light-path"><div><dt>Reaches the first filter</dt><dd>White light: red + green + blue</dd></div><div><dt>After the first filter</dt><dd>${F.channels(m.middle)}</dd></div><div><dt>Reaches the screen</dt><dd>${F.channels(m.outgoing)}</dd></div></dl><p>First filter: absorbs ${F.channels(m.absorbedA)}. ${removed?'The second filter is outside the beam.':`Second filter: of the light it receives, it absorbs ${F.channels(m.absorbedB)}.`} Neither filter adds light components.</p>`;document.querySelector('#remove-filter').textContent=removed?'Replace the second filter':'Remove the second filter';}}
function reset(){revealed=false;removed=false;components=false;initial=null;result.hidden=true;form.hidden=false;form.reset();draw();}
a.onchange=reset;b.onchange=reset;
form.onsubmit=e=>{e.preventDefault();const answer=new FormData(form).get('prediction');if(!options.includes(answer))return;initial={a:a.value,b:b.value,answer,correct:F.model(a.value,b.value).outgoing};form.hidden=true;document.querySelector('#filter-toolbar').hidden=false;result.hidden=false;document.querySelector('#filter-verdict').textContent=answer===initial.correct?'Your prediction matches the model.':'Compare your prediction with the light reaching the screen.';document.querySelector('#filter-answer-record').textContent=`Your initial prediction: ${F.names[answer]}. Initial arrangement: ${F.names[initial.a]} → ${F.names[initial.b]}. Initial result: ${F.names[initial.correct]}.`;move('reveal',()=>{revealed=true;});};
async function move(kind,commit){
 if(busy)return;busy=true;const toolbar=document.querySelector('#filter-toolbar');
 // Mantener las piezas y los controles dentro del mismo encuadre.
 toolbar.scrollIntoView({block:'start',behavior:'instant'});
 const controls=[...document.querySelectorAll('#filter-toolbar button, .filter-controls select')];controls.forEach(el=>el.disabled=true);
 const animations=[];
 try{
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   for(const n of ['1','2']){
    if(kind==='remove'&&n==='1')continue;
    const plate=stage.querySelector(`[data-filter="${n}"]`),from=plate.style.transform;
    let frames;
    if(kind==='swap'){
     const x=n==='1'?330:600,to=n==='1'?600:330,lift=n==='1'?-150:-15;
     frames=[{transform:from,offset:0},{transform:`translate(${x}px,${lift}px)`,offset:.22},{transform:`translate(${to}px,${lift}px)`,offset:.78},{transform:`translate(${to}px,0px)`,offset:1}];
    }else frames=[{transform:from},{transform:`translate(${n==='1'?330:600}px,${kind==='reveal'?0:removed?0:-150}px)`}];
    animations.push(plate.animate(frames,{duration:kind==='swap'?1100:650,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}));
   }
   await Promise.all(animations.map(animation=>animation.finished));
  }
  commit();draw();
 }finally{animations.forEach(animation=>animation.cancel());controls.forEach(el=>el.disabled=false);busy=false;}
}
document.querySelector('#swap-filters').onclick=()=>move('swap',()=>{[a.value,b.value]=[b.value,a.value];removed=false;});
document.querySelector('#remove-filter').onclick=()=>move('remove',()=>{removed=!removed;});document.querySelector('#new-prediction').onclick=reset;document.querySelector('#show-rgb').onclick=()=>{if(busy||!revealed)return;components=!components;draw();};draw();
})();
