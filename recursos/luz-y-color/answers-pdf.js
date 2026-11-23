'use strict';
// PDF local: una página apaisada por pregunta, con escenas rasterizadas a alta resolución.
const ColourAnswersPDF=(()=>{
 const encode=s=>new TextEncoder().encode(s);
 function assemble(pages){
  const parts=[],offsets=[0];let size=0;
  const push=value=>{const bytes=typeof value==='string'?encode(value):value;parts.push(bytes);size+=bytes.length;};
  const object=(id,body)=>{offsets[id]=size;push(`${id} 0 obj\n`);push(body);push('\nendobj\n');};
  push('%PDF-1.4\n');
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');
  object(2,`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
  pages.forEach((p,i)=>{const id=3+i*3;object(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im${i} ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);
   offsets[id+1]=size;push(`${id+1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`);push(p.bytes);push('\nendstream\nendobj\n');
   const stream=`q 841.89 0 0 595.28 0 0 cm /Im${i} Do Q\n`;object(id+2,`<< /Length ${encode(stream).length} >>\nstream\n${stream}endstream`);
  });
  const xref=size;push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);offsets.slice(1).forEach(o=>push(`${String(o).padStart(10,'0')} 00000 n \n`));push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result=new Uint8Array(size);let pos=0;parts.forEach(p=>{result.set(p,pos);pos+=p.length;});return result;
 }
 async function svgImage(svg){const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{return await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('No se pudo preparar una escena.'));img.src=url;});}finally{URL.revokeObjectURL(url);}}
 function wrap(ctx,text,x,y,width,lineHeight){let line='';for(const word of text.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word;}else line=next;}ctx.fillText(line,x,y);return y+lineHeight;}
 async function download({items,answers,names,scene,seed,version,channels}){
  await document.fonts.ready;await document.fonts.load('600 26px Barlow');
  const pages=[];
  // El mismo análisis que se muestra en pantalla, calculado sobre estas respuestas.
  const diagnosis=ColourReasoning.analyse(items,answers);
  const main=diagnosis.evidence.find(e=>e.id===diagnosis.predominant);
  const cover=document.createElement('canvas');cover.width=1600;cover.height=1131;
  const ctx=cover.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1600,1131);
  ctx.fillStyle='#204c66';ctx.fillRect(0,0,1600,130);ctx.fillStyle='#fff';ctx.font='700 40px Barlow';ctx.fillText('DiCoSTEM-TT · Mi informe de luz y color',60,65);ctx.font='400 26px Barlow';ctx.fillText('Interpretación orientativa y registro de respuestas',60,108);
  ctx.fillStyle='#204c66';ctx.font='600 30px Barlow';ctx.fillText('¿Qué sugieren tus respuestas?',60,180);
  ctx.font='600 28px Barlow';let y=wrap(ctx,main?main.title:'Sin un patrón predominante',60,224,1480,35);
  ctx.fillStyle='#182d3a';ctx.font='400 24px Barlow';y=wrap(ctx,main?main.explain:'Las respuestas no muestran una tendencia suficientemente clara hacia uno de los razonamientos comparados.',60,y+10,1480,31);
  y=wrap(ctx,'Orientación provisional sobre esta partida, no una característica fija de la persona. Esta versión todavía no tiene validación propia.',60,y+8,1480,31);
  if(diagnosis.contrast.plausible)y=wrap(ctx,'Preconcepción adicional plausible: falta de contraste. En '+diagnosis.contrast.supporting.map(id=>'P'+id).join(', ')+' se eligió «No se distinguirá del entorno» con luz y superficie coincidentes (criterio provisional: 2 de 3). Puede coexistir con otras tendencias.',60,y+8,1480,31);
  ctx.fillStyle='#204c66';ctx.font='600 24px Barlow';y+=18;
  if(main){ctx.fillText(`Coincidencias RGB: ${main.supporting.length}/${diagnosis.coreCount} · Preguntas: ${main.supporting.map(id=>'P'+id).join(', ')}`,60,y);y+=30;}
  ctx.fillStyle='#182d3a';ctx.font='400 21px Barlow';y=wrap(ctx,'Criterio provisional: al menos 4 de 6 coincidencias RGB y ventaja de 2. Las preguntas ampliadas no deciden la clasificación.',60,y+4,1480,27);
  const top=Math.max(530,y+12);ctx.fillStyle='#204c66';ctx.fillRect(60,top,1480,39);ctx.fillStyle='#fff';ctx.font='600 22px Barlow';ctx.fillText('Pregunta',75,top+27);ctx.fillText('Tu respuesta confirmada',235,top+27);ctx.fillText('Respuesta del modelo',880,top+27);
  items.forEach((q,i)=>{const row=top+40+i*32;ctx.fillStyle=i%2?'#fff':'#eef4f7';ctx.fillRect(60,row,1480,32);ctx.fillStyle='#182d3a';ctx.font='400 21px Barlow';ctx.fillText(String(i+1),85,row+23);ctx.fillText(names[answers[i]],235,row+23);ctx.fillText(names[q.answer],880,row+23);});
  ctx.fillStyle='#526570';ctx.font='400 19px Barlow';ctx.fillText(`${version} · Partida ${seed} · ${items.filter((q,i)=>q.answer===answers[i]).length}/12 respuestas correctas en el modelo`,60,1075);
  const coverBlob=await new Promise(resolve=>cover.toBlob(resolve,'image/jpeg',.94));if(!coverBlob)throw Error('No se pudo generar el resumen.');pages.push({width:cover.width,height:cover.height,bytes:new Uint8Array(await coverBlob.arrayBuffer())});
  for(let i=0;i<items.length;i++){
   const q=items[i],canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1131;const c=canvas.getContext('2d');
   c.fillStyle='#ffffff';c.fillRect(0,0,1600,1131);c.fillStyle='#204c66';c.fillRect(0,0,1600,130);c.fillStyle='#ffffff';c.font='700 40px Barlow';c.fillText('DiCoSTEM-TT · Luz y color',60,65);c.font='400 26px Barlow';c.fillText(`Mis respuestas · Pregunta ${i+1} de ${items.length}`,60,108);
   c.fillStyle='#204c66';c.font='600 30px Barlow';c.fillText('Pregunta · Foco encendido',60,190);c.fillText('Solución · Foco apagado',830,190);
   const [left,right]=await Promise.all([svgImage(scene(q,true)),svgImage(scene(q,false))]);c.drawImage(left,60,220,710,532.5);c.drawImage(right,830,220,710,532.5);
   c.fillStyle='#182d3a';c.font='600 27px Barlow';wrap(c,'Tu respuesta: '+names[answers[i]],60,802,710,34);wrap(c,'Respuesta del modelo: '+names[q.answer],830,802,710,34);
   c.font='400 25px Barlow';wrap(c,'Cuando se apague el foco blanco y quede encendida solo la bombilla, ¿cómo se verá la manzana?',60,885,710,33);wrap(c,`Llega: ${channels(q.light)}. Se refleja: ${channels(q.answer)}. La superficie no añade luz propia.`,830,885,710,33);
   c.fillStyle='#526570';c.font='400 20px Barlow';c.fillText(`Modelo RGB idealizado · Actividad experimental · ${version} · Partida ${seed}`,60,1040);c.fillText('Basada en trabajos previos · Naranjo Correa et al. (2016) · DOI: 10.1002/col.22017',60,1075);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));if(!blob)throw Error('No se pudo generar la página.');pages.push({width:canvas.width,height:canvas.height,bytes:new Uint8Array(await blob.arrayBuffer())});
  }
  const blob=new Blob([assemble(pages)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`DiCoSTEM-TT-respuestas-${seed}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 return {download,assemble};
})();
if(typeof module!=='undefined')module.exports=ColourAnswersPDF;
