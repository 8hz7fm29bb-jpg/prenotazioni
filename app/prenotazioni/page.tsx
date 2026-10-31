"use client";
import {useEffect,useMemo,useState} from "react";
import AppHeader from "../AppHeader";
import {supabase} from "../../lib/supabase";
type Reservation={id:string;guests:number;baby?:number;arrived?:boolean;notes:string|null;requests:string|null;created_at:string;created_by:string|null;customers:{name:string;phone:string}|null;taken_by?:string|null};
const iso=(d:Date)=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
// Measure the actual print styles at A4 width before opening the print dialog.
function preparePrintLayout(){
 const agenda=document.querySelector<HTMLElement>(".agenda");
 const list=agenda?.querySelector<HTMLElement>(".bookingList");
 if(!agenda||!list)return;
 const probe=document.createElement("div");
 probe.setAttribute("aria-hidden","true");
 probe.style.cssText="position:fixed;left:-10000px;top:0;width:190mm;visibility:hidden;pointer-events:none";
 document.body.appendChild(probe);
 try{
  const root=probe.attachShadow({mode:"closed"});
  const normal:string[]=[];const print:string[]=[];
  for(const sheet of Array.from(document.styleSheets)){
   try{for(const rule of Array.from(sheet.cssRules)){
    normal.push(rule.cssText);
    if(rule instanceof CSSMediaRule&&rule.conditionText.includes("print")){
     print.push(...Array.from(rule.cssRules).map(r=>r.cssText));
    }
   }}catch{/* Ignore inaccessible third-party stylesheets. */}
  }
  const style=document.createElement("style");
  style.textContent=normal.join("\n")+"\n"+print.join("\n")+"\nhtml,body{width:190mm!important;margin:0!important;padding:0!important} .agenda{width:190mm!important;max-width:none!important}";
  root.appendChild(style);
  const clone=agenda.cloneNode(true) as HTMLElement;
  const cloneList=clone.querySelector<HTMLElement>(".bookingList");
  if(!cloneList)return;
  cloneList.classList.remove("printTwoColumns");cloneList.classList.add("printOneColumn");
  root.appendChild(clone);
  const ruler=document.createElement("div");ruler.style.height="275mm";root.appendChild(ruler);
  const twoColumns=clone.getBoundingClientRect().height>ruler.getBoundingClientRect().height;
  list.classList.toggle("printTwoColumns",twoColumns);
  list.classList.toggle("printOneColumn",!twoColumns);
 }catch{
  const twoColumns=list.querySelectorAll(".booking").length>8;
  list.classList.toggle("printTwoColumns",twoColumns);
  list.classList.toggle("printOneColumn",!twoColumns);
 }finally{probe.remove()}
}
export default function ReservationsPage(){
 useEffect(()=>{window.addEventListener("beforeprint",preparePrintLayout);return()=>window.removeEventListener("beforeprint",preparePrintLayout)},[]);
 const [date,setDate]=useState(iso(new Date())); const [customDate,setCustomDate]=useState(false); const [futureDates,setFutureDates]=useState<string[]>([]); const [service,setService]=useState("cena"); const [rows,setRows]=useState<Reservation[]>([]); const [loading,setLoading]=useState(true);
 const tomorrow=()=>{const d=new Date();d.setDate(d.getDate()+1);setDate(iso(d));setCustomDate(false)};
 useEffect(()=>{let mounted=true;(async()=>{const {data:{session}}=await supabase.auth.getSession();if(!session){location.href="/login";return}const {data,error}=await supabase.from("reservations").select("reservation_date").gt("reservation_date",iso(new Date())).neq("status","cancellata").order("reservation_date",{ascending:true});if(mounted&&!error)setFutureDates([...new Set((data||[]).map((x:any)=>x.reservation_date))])})();return()=>{mounted=false}},[]);
 useEffect(()=>{let live=true;(async()=>{setLoading(true);const {data:{session}}=await supabase.auth.getSession();if(!session){location.href="/login";return}const {data,error}=await supabase.from("reservations").select("id,guests,baby,arrived,notes,requests,created_at,created_by,customers(name,phone)").eq("reservation_date",date).eq("service",service).neq("status","cancellata").order("created_at");if(live){if(error){console.error(error);setRows([])}else{const base=(data||[]) as unknown as Reservation[];const ids=[...new Set(base.map(r=>r.created_by).filter(Boolean))] as string[];let names:Record<string,string>={};if(ids.length){const {data:ps}=await supabase.from("profiles").select("id,username").in("id",ids);names=Object.fromEntries((ps||[]).map((x:any)=>[x.id,x.username]))}setRows(base.map(r=>({...r,taken_by:r.created_by?names[r.created_by]||null:null}))) }setLoading(false)}})();return()=>{live=false}},[date,service]);
 async function removeReservation(id:string){if(!confirm("Eliminare definitivamente questa prenotazione?"))return;const {error}=await supabase.from("reservations").delete().eq("id",id);if(error){alert(error.message);return}setRows(x=>x.filter(r=>r.id!==id))}
 async function setArrived(id:string,arrived:boolean){setRows(x=>x.map(r=>r.id===id?{...r,arrived}:r));const {error}=await supabase.from("reservations").update({arrived}).eq("id",id);if(error){setRows(x=>x.map(r=>r.id===id?{...r,arrived:!arrived}:r));alert("Impossibile salvare il flag di arrivo: "+error.message)}}
 function editReservation(r:Reservation){window.location.href="/?edit="+encodeURIComponent(r.id)}
 const totals=useMemo(()=>({bookings:rows.length,guests:rows.reduce((a,r)=>a+(r.guests||0),0),baby:rows.reduce((a,r)=>a+(r.baby||0),0)}),[rows]); async function share(){const title=`Prenotazioni ${new Date(date+"T12:00").toLocaleDateString("it-IT")} · ${service}`;const body=rows.map(r=>`${r.customers?.name||"Cliente"} — ${r.guests} coperti${r.baby?` · ${r.baby} baby`:""}${r.requests?` · ${r.requests}`:""}${r.notes?` · ${r.notes}`:""}`).join("\n");if(navigator.share)await navigator.share({title,text:title+"\n\n"+body});else await navigator.clipboard.writeText(title+"\n\n"+body)}
 return <main><AppHeader/><section className="card agenda"><div className="printBrand">Officina22</div><div className="agendaTitle"><div><h1>Prenotazioni</h1><p>{new Date(date+"T12:00:00").toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}</p></div><div className="agendaActions"><button onClick={()=>{try{preparePrintLayout()}finally{window.print()}}}>STAMPA</button><button onClick={share}>CONDIVIDI</button></div></div><label>DATA</label><div className="row"><button className={!customDate&&date===iso(new Date())?"selected":""} onClick={()=>{setDate(iso(new Date()));setCustomDate(false)}}>OGGI</button><button className={!customDate&&date===(()=>{const d=new Date();d.setDate(d.getDate()+1);return iso(d)})()?"selected":""} onClick={tomorrow}>DOMANI</button><label className={"datePicker "+(customDate?"selected":"")}><span>{customDate?new Date(date+"T12:00:00").toLocaleDateString("it-IT"):"SELEZIONA ALTRA DATA"}</span><input type="date" value={date} onChange={e=>{setDate(e.target.value);setCustomDate(true)}}/></label></div><label>PROSSIME PRENOTAZIONI</label><div className="archiveDays">{futureDates.length===0?<span className="archiveEmpty">Nessuna prenotazione futura</span>:futureDates.map(d=><button key={d} className={date===d?"selected":""} onClick={()=>{setDate(d);setCustomDate(true)}}>{new Date(d+"T12:00:00").toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"})}</button>)}</div><label>SERVIZIO</label><div className="two"><button className={service==="pranzo"?"selected":""} onClick={()=>setService("pranzo")}>PRANZO</button><button className={service==="cena"?"selected":""} onClick={()=>setService("cena")}>CENA</button></div><div className="summary"><div><strong>{totals.bookings}</strong><span>PRENOTAZIONI</span></div><div><strong>{totals.guests}</strong><span>COPERTI</span></div><div><strong>{totals.baby}</strong><span>BABY</span></div></div><div className="bookingList printOneColumn">{loading?<p className="empty">Caricamento…</p>:rows.length===0?<div className="empty"><b>Nessuna prenotazione</b><span>per questo servizio</span></div>:rows.map(r=><article className="booking" key={r.id}><label className="arrivalCheck" title="Cliente arrivato"><input type="checkbox" checked={!!r.arrived} onChange={e=>setArrived(r.id,e.target.checked)} aria-label={"Cliente arrivato: "+(r.customers?.name||"Cliente")}/><span></span></label><div className="bookingMain"><h2 className="bookingCustomer">{r.customers?.name||"Cliente"}</h2><div className="counts"><b>{r.guests}</b> coperti{(r.baby||0)>0&&<> · <b>{r.baby}</b> baby</>}</div></div><a className="phone" href={"tel:"+(r.customers?.phone||"")}>{r.customers?.phone||"—"}</a>{r.requests&&<div className="tags">{r.requests}</div>}{r.notes&&<p className="bookingNotes">{r.notes}</p>}<div className="bookingTakenBy">Presa da: <b>{r.taken_by||"Account non disponibile"}</b></div><div className="bookingActions"><button onClick={()=>editReservation(r)}>MODIFICA</button><button className="deleteBooking" onClick={()=>removeReservation(r.id)}>ELIMINA</button></div></article>)}</div></section></main>
}