"use client";
import {useEffect,useState} from "react";import {useParams} from "next/navigation";import {supabase} from "../../../lib/supabase";
import AppHeader from "../../AppHeader";
type C={id:string;customer_code:string;name:string;phone:string|null;acquisition_channel_id:number|null;notes:string|null};type R={id:string;reservation_date:string;service:string;guests:number;baby:number;status:string;requests:string|null;notes:string|null;created_by:string|null;taken_by?:string|null};
export default function Cliente(){const {id}=useParams<{id:string}>();const [c,setC]=useState<C|null>(null);const [rows,setRows]=useState<R[]>([]);const [edit,setEdit]=useState(false);const [msg,setMsg]=useState("");
async function load(){const {data}=await supabase.from("customers").select("*").eq("id",id).single();setC(data);const r=await supabase.from("reservations").select("id,reservation_date,service,guests,baby,status,requests,notes,created_by").eq("customer_id",id).order("reservation_date",{ascending:false});const base=(r.data||[]) as R[];const ids=[...new Set(base.map(x=>x.created_by).filter(Boolean))] as string[];let names:Record<string,string>={};if(ids.length){const {data:ps}=await supabase.from("profiles").select("id,username").in("id",ids);names=Object.fromEntries((ps||[]).map((x:any)=>[x.id,x.username]))}setRows(base.map(x=>({...x,taken_by:x.created_by?names[x.created_by]||null:null})))}useEffect(()=>{load()},[id]);
async function save(){
 if(!c)return;
 setMsg("");
 const phone=(c.phone||"").trim();
 if(phone){
   const {data:other}=await supabase.from("customers").select("id,name,customer_code").eq("phone",phone).neq("id",id).maybeSingle();
   if(other){
     setMsg("Questo numero è già associato a "+other.name+" ("+other.customer_code+").");
     return;
   }
 }
 const {error}=await supabase.from("customers").update({name:c.name.trim(),phone:phone||null,notes:c.notes}).eq("id",id);
 setMsg(error?"Impossibile salvare le modifiche.": "Dati cliente aggiornati");
 if(!error)setEdit(false)
}
async function deleteCustomer(){
 if(!c)return;
 const count=rows.length;
 const ok=confirm(count>0?`Eliminare definitivamente ${c.name} e anche ${count} prenotazione${count===1?"":"i"} collegate?`:`Eliminare definitivamente ${c.name}?`);
 if(!ok)return;
 if(count>0){
   const {error:re}=await supabase.from("reservations").delete().eq("customer_id",id);
   if(re){setMsg(re.message);return}
 }
 const {error}=await supabase.from("customers").delete().eq("id",id);
 if(error){setMsg(error.message);return}
 window.location.href="/clienti";
}
if(!c)return <main><section className="card">Caricamento…</section></main>;const covers=rows.filter(r=>r.status!=="cancellata"&&r.status!=="no_show").reduce((a,r)=>a+r.guests,0);
return <main><AppHeader/><section className="card"><div className="clientHead"><div><span className="clientId">{c.customer_code}</span><h1>{c.name}</h1></div><div className="clientHeadActions"><button onClick={()=>setEdit(!edit)}>{edit?"ANNULLA":"MODIFICA"}</button><button className="deleteClient" onClick={deleteCustomer}>ELIMINA</button></div></div>{edit?<div className="editClient"><label>NOME</label><input className="full" value={c.name} onChange={e=>setC({...c,name:e.target.value})}/><label>TELEFONO <span className="optionalLabel">FACOLTATIVO</span></label><input className="full" value={c.phone||""} onChange={e=>setC({...c,phone:e.target.value})} placeholder="Numero di telefono (facoltativo)"/><label htmlFor="customerNotes">NOTE</label><textarea id="customerNotes" placeholder="Note sul cliente" value={c.notes||""} onChange={e=>setC({...c,notes:e.target.value})}/><button className="confirm" onClick={save}>SALVA MODIFICHE</button></div>:<>{c.phone?<a className="clientPhone" href={"tel:"+c.phone}>{c.phone}</a>:<div className="clientPhoneMissing">Telefono non disponibile</div>}{c.notes?.trim()&&<section aria-labelledby="customerNotesTitle" style={{marginTop:22,padding:"14px 16px",border:"1px solid var(--line)",borderRadius:12,background:"#fffdf7"}}><h2 id="customerNotesTitle" style={{margin:0,fontSize:11,fontWeight:800,letterSpacing:".1em",color:"#555"}}>NOTE</h2><p className="customerGeneralNotes" style={{marginBottom:0}}>{c.notes}</p></section>}<div className="summary"><div><strong>{rows.length}</strong><span>PRENOTAZIONI</span></div><div><strong>{covers}</strong><span>COPERTI</span></div><div><strong>{rows.reduce((a,r)=>a+(r.baby||0),0)}</strong><span>BABY</span></div></div><label>STORICO PRENOTAZIONI</label><div className="history">{rows.map(r=><div key={r.id}><b>{new Date(r.reservation_date+"T12:00").toLocaleDateString("it-IT")}</b><span>{r.service.toUpperCase()} · {r.guests} coperti{r.baby?" · "+r.baby+" baby":""}{r.requests&&<strong className="historyRequests">{r.requests}</strong>}{r.notes&&<span className="historyNotes">{r.notes}</span>}<em className="historyTakenBy">Presa da: {r.taken_by||"—"}</em></span><small>{r.status}</small></div>)}</div></>}{msg&&<p className="msg">{msg}</p>}</section></main>}