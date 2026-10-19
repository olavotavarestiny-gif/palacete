import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { validateSubmission, type PalaceSubmission } from '@/lib/forms';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export async function POST(request:Request) {
  try {
    const internalUrl=new URL(request.url),allowed=new Set([internalUrl.origin]);
    const host=request.headers.get('host');
    if(host&&/^[a-z0-9.\-:[\]]+$/i.test(host))allowed.add(new URL(`${internalUrl.protocol}//${host}`).origin);
    if(process.env.NEXT_PUBLIC_SITE_URL)allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    if(!allowed.has(request.headers.get('origin')||''))return json({error:'Origem do pedido não autorizada.'},403);
    if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Pedido inválido.'},415);
    const key=request.headers.get('idempotency-key')||'';
    if(!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(key))return json({error:'Identificador do pedido inválido.'},400);
    const reader=request.body?.getReader();if(!reader)return json({error:'Pedido vazio.'},400);
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();return json({error:'Pedido demasiado grande.'},413);}chunks.push(value);}
    let input:Record<string,unknown>;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json({error:'Pedido inválido.'},400);}
    if(!input||typeof input!=='object'||input.kind!=='reservation'||input.website)return json({error:'Pedido inválido.'},400);
    const field=(name:string,max:number)=>{const value=input[name];if(value===undefined||value===null)return '';if(typeof value!=='string'||value.length>max)throw new Error('invalid-field');return value.trim();};
    let data:PalaceSubmission;
    try{data={kind:'reservation',name:field('name',100),phone:field('phone',50),email:field('email',254),date:field('date',10),time:field('time',5),guests:field('guests',2),occasion:field('occasion',160),notes:field('notes',1000),consent:input.consent===true};}catch{return json({error:'Verifique os dados introduzidos.'},400);}
    const errors=validateSubmission(data);
    if(Object.keys(errors).length)return json({error:Object.values(errors)[0],fields:errors},400);
    const secret=process.env.PALACE_RESERVATION_SECRET,base=process.env.PALACE_STUDIO_URL;
    if(!secret||secret.length<32||!base)return json({error:'O serviço de reservas está temporariamente indisponível. Tente novamente mais tarde.'},503);
    const endpoint=new URL('/api/integrations/reservations',base);
    if(!['http:','https:'].includes(endpoint.protocol)||(process.env.NODE_ENV==='production'&&process.env.ALLOW_HTTP_LOCAL!=='1'&&endpoint.protocol!=='https:'))return json({error:'O serviço de reservas está temporariamente indisponível.'},503);
    let client='global';
    // Only use proxy-supplied addresses behind a proxy that overwrites these headers.
    if(process.env.PALACE_TRUST_PROXY==='1'){
      const address=(request.headers.get('x-forwarded-for')||'').split(',')[0].trim();
      if(isIP(address))client=createHmac('sha256',secret).update(address).digest('hex');
    }
    const raw=JSON.stringify({name:data.name,phone:data.phone,email:data.email||'',date:data.date,time:data.time,guests:Number(data.guests),occasion:data.occasion||'',notes:data.notes||'',privacyAccepted:data.consent});
    const timestamp=String(Math.floor(Date.now()/1000));
    const signature=createHmac('sha256',secret).update(`${timestamp}.${client}.${key}.${raw}`).digest('hex');
    let response:Response;
    try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key,'X-Palace-Timestamp':timestamp,'X-Palace-Signature':signature,'X-Palace-Client':client},body:raw,cache:'no-store',signal:AbortSignal.timeout(12000)});}
    catch{return json({error:'Não foi possível contactar o restaurante. O pedido ainda não foi confirmado como recebido. Tente novamente.'},503);}
    const result=await response.json();
    if(!response.ok)return json({error:[400,409,429].includes(response.status)&&typeof result.error==='string'?result.error:'Não foi possível guardar o pedido. Tente novamente.'},[400,409,429].includes(response.status)?response.status:503);
    if(result.received!==true||typeof result.reference!=='string')return json({error:'Não foi possível verificar a recepção do pedido. Tente novamente.'},503);
    return json({received:true,reference:result.reference},response.status===201?201:200);
  }catch{
    console.error('Reservation proxy failed');
    return json({error:'Não foi possível enviar o pedido. Verifique a ligação e tente novamente.'},503);
  }
}
