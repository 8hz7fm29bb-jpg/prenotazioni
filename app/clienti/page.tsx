"use client";
import {useEffect,useState} from "react"; import {supabase} from "../../lib/supabase";
import AppHeader from "../AppHeader";
type C={id:string;customer_code:string;name:string;phone:string|null;acquisition_channels:{name:string}|null};

type Cell = string | number | null | undefined;
function xml(value: Cell) {
 return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
// Store-only ZIP keeps the Excel export independent of external services.
function workbook(sheets: {name:string;rows:Cell[][]}[]) {
 const enc=new TextEncoder(), files:{name:string;data:Uint8Array}[]=[];
 const add=(name:string,body:string)=>files.push({name,data:enc.encode(body)});
 const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
 sheets.forEach((sheet,i)=>{
  const rows=sheet.rows.map((row,r)=>'<row r="'+(r+1)+'">'+row.map((v,c)=>{
   let col="",n=c+1;while(n){col=String.fromCharCode(65+(n-1)%26)+col;n=Math.floor((n-1)/26)}
   const ref=col+(r+1);
   return typeof v==="number"&&Number.isFinite(v)?'<c r="'+ref+'"><v>'+v+'</v></c>':'<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>';
  }).join("")+'</row>').join("");
  add("xl/worksheets/sheet"+(i+1)+".xml",'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="'+ns+'"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>'+rows+'</sheetData></worksheet>');
 });
 add("[Content_Types].xml",'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("")+'</Types>');
 add("_rels/.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 add("xl/workbook.xml",'<workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+sheets.map((s,i)=>'<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join("")+'</sheets></workbook>');
 add("xl/_rels/workbook.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join("")+'</Relationships>');
 const parts:Uint8Array<ArrayBuffer>[]=[];const central:Uint8Array<ArrayBuffer>[]=[];let offset=0;
 const crc=(data:Uint8Array)=>{let c=0xffffffff;for(const b of data){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0};
 for(const f of files){
  const name=enc.encode(f.name),sum=crc(f.data),h=new Uint8Array(30+name.length),v=new DataView(h.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,sum,true);v.setUint32(18,f.data.length,true);v.setUint32(22,f.data.length,true);v.setUint16(26,name.length,true);h.set(name,30);
  const c=new Uint8Array(46+name.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,sum,true);d.setUint32(20,f.data.length,true);d.setUint32(24,f.data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);c.set(name,46);
  parts.push(h,new Uint8Array(f.data));central.push(c);offset+=h.length+f.data.length;
 }
 const size=central.reduce((s,c)=>s+c.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);
 return new Blob([...parts,...central,end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}

export default function Clienti(){const [exporting,setExporting]=useState(false);const [msg,setMsg]=useState("");const [q,setQ]=useState("");const [rows,setRows]=useState<C[]>([]);
useEffect(()=>{(async()=>{let x=supabase.from("customers").select("id,customer_code,name,phone,acquisition_channels(name)").order("name");if(q.trim())x=x.or("name.ilike.%"+q+"%,phone.ilike.%"+q+"%,customer_code.ilike.%"+q+"%");const {data}=await x;setRows((data||[]) as unknown as C[])})()},[q]);

async function exportExcel(){
 if(exporting)return;setExporting(true);setMsg("");
 try{
  // Fetch every page, ignoring the archive search and preserving existing RLS.
  const all=async(table:string,select:string,order:string)=>{
   const result:any[]=[];let start=0;
   for(;;){const {data,error}=await supabase.from(table).select(select).order(order).order("id").range(start,start+499);
    if(error)throw error;if(!data?.length)break;result.push(...data);start+=data.length;
   }return result;
  };
  const [customers,reservations,profiles]=await Promise.all([
   all("customers","*,acquisition_channels(name)","name"),
   all("reservations","*","reservation_date"),
   all("profiles","id,username","id")
  ]);
  const people=new Map(customers.map(c=>[c.id,c])),staff=new Map(profiles.map(p=>[p.id,p.username]));
  const date=(v:string|null)=>v&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v.split("-").reverse().join("/"):v||"";
  const extraCustomers=[...new Set(customers.flatMap(c=>Object.keys(c)))].filter(k=>!["id","customer_code","name","phone","notes","acquisition_channels"].includes(k));
  const extraReservations=[...new Set(reservations.flatMap(r=>Object.keys(r)))].filter(k=>!["id","customer_id","reservation_date","service","guests","baby","status","requests","notes","created_by","acquisition_channels"].includes(k));
  const value=(v:any):Cell=>v==null?"":typeof v==="object"?JSON.stringify(v):typeof v==="boolean"?(v?"Sì":"No"):v;
  const counts=new Map<string,number>();reservations.forEach(r=>counts.set(r.customer_id,(counts.get(r.customer_id)||0)+1));
  const customerRows:Cell[][]=[["ID cliente","Nome","Telefono","Canale acquisizione","Note","Prenotazioni",...extraCustomers]];
  customers.forEach(c=>customerRows.push([c.customer_code,c.name,c.phone,c.acquisition_channels?.name,c.notes,counts.get(c.id)||0,...extraCustomers.map(k=>value(c[k]))]));
  const bookingRows:Cell[][]=[["ID cliente","Cliente","Telefono","ID prenotazione","Data","Servizio","Coperti","Baby","Stato","Richieste","Note prenotazione","Presa da",...extraReservations]];
  reservations.filter(r=>people.has(r.customer_id)).forEach(r=>{const c=people.get(r.customer_id);bookingRows.push([c.customer_code,c.name,c.phone,r.id,date(r.reservation_date),r.service,r.guests,r.baby,r.status,r.requests,r.notes,staff.get(r.created_by)||r.created_by,...extraReservations.map(k=>value(r[k]))])});
  const blob=workbook([{name:"Clienti",rows:customerRows},{name:"Prenotazioni",rows:bookingRows}]);
  const filename="Clienti_Officina22_"+new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Rome"})+".xlsx";
  const file=new File([blob],filename,{type:blob.type});
  if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file]});}catch(error){if((error as Error).name==="AbortError")return;throw error}
  }else{
   const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  setMsg("Esportazione completata: "+customers.length+" clienti.");
 }catch{setMsg("Esportazione non riuscita. Riprova.");}finally{setExporting(false)}
}

return <main><AppHeader/><section className="card"><div className="agendaTitle"><div><h1>Clienti</h1><p>Archivio e Storico</p></div><button onClick={exportExcel} disabled={exporting} aria-busy={exporting} style={{background:"var(--accent)",opacity:exporting ? 0.6 : 1}}>{exporting?"ESPORTAZIONE…":"ESPORTA EXCEL"}</button></div>{msg&&<p role="status" className="msg">{msg}</p>}<input className="full customerSearch" value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca nome, telefono o ID cliente"/><div className="customerList">{rows.map(c=><a href={"/clienti/"+c.id} className="customerRow" key={c.id}><div><b>{c.name}</b><span>{c.customer_code} · {c.phone||"Anagrafica incompleta"}</span></div><div className="customerMeta"><span className="openClient">APRI</span><strong>›</strong></div></a>)}</div></section></main>}