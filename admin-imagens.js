export async function validarArquivo(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Escolha uma foto JPG, PNG ou WebP.');
 if(!file.size||file.size>5*1024*1024)throw Error('A foto deve ter até 5 MB.');
 const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const jpg=b[0]===255&&b[1]===216&&b[2]===255;
 const png=[137,80,78,71,13,10,26,10].every((x,i)=>b[i]===x);
 const texto=String.fromCharCode(...b),webp=texto.startsWith('RIFF')&&texto.slice(8)==='WEBP';
 if(!({ 'image/jpeg':jpg,'image/png':png,'image/webp':webp })[file.type])throw Error('O conteúdo do arquivo não corresponde a uma foto válida.');
}
export async function comprimirImagem(file){
 await validarArquivo(file);
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try{
  const escala=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*escala));canvas.height=Math.max(1,Math.round(bitmap.height*escala));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Seu navegador não conseguiu preparar a foto.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));
  if(!blob||blob.type!=='image/webp'||blob.size>5*1024*1024)throw Error('Não foi possível gerar WebP. Use um navegador atualizado.');
  return blob;
 }finally{bitmap.close();}
}
