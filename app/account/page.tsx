"use client";
import {FormEvent,useEffect,useState} from "react";
import AppHeader from "../AppHeader";
import {supabase} from "../../lib/supabase";

type P={id:string;username:string;role:string;active:boolean};

export default function Account(){
  const [rows,setRows]=useState<P[]>([]);
  const [me,setMe]=useState<P|null>(null);
  const [msg,setMsg]=useState("");
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState<"operatore"|"amministratore">("operatore");
  const [saving,setSaving]=useState(false); const [editing,setEditing]=useState<P|null>(null); const [editUsername,setEditUsername]=useState(""); const [editPassword,setEditPassword]=useState(""); const [editRole,setEditRole]=useState<"operatore"|"amministratore">("operatore");

  async function load(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){location.href="/login";return}
    const {data:m}=await supabase.from("profiles").select("id,username,role,active").eq("id",user.id).single();
    setMe(m);
    const {data}=await supabase.from("profiles").select("id,username,role,active").order("username");
    setRows((data||[]) as P[]);
  }

  useEffect(()=>{load()},[]);

  async function toggle(p:P){
    if(me?.role!=="amministratore"||p.id===me.id)return;
    const {error}=await supabase.from("profiles").update({active:!p.active}).eq("id",p.id);
    setMsg(error?error.message:"Account aggiornato");
    load();
  }

  async function createAccount(e:FormEvent){
    e.preventDefault();
    if(me?.role!=="amministratore")return;
    setMsg("");
    setSaving(true);
    const {data,error}=await supabase.functions.invoke("create-account",{
      body:{username:username.trim(),password,role}
    });
    setSaving(false);
    if(error||data?.error){
      setMsg(data?.error||"Impossibile creare l'account");
      return;
    }
    setMsg("Account "+data.username+" creato");
    setUsername("");
    setPassword("");
    setRole("operatore");
    await load();
  }

  function startEdit(p:P){
    setEditing(p);
    setEditUsername(p.username);
    setEditPassword("");
    setEditRole(p.role==="amministratore"?"amministratore":"operatore");
    setMsg("");
  }

  async function saveEdit(e:FormEvent){
    e.preventDefault();
    if(!editing||me?.role!=="amministratore")return;
    setSaving(true);
    setMsg("");
    const {data,error}=await supabase.functions.invoke("update-account",{
      body:{id:editing.id,username:editUsername.trim(),password:editPassword,role:editRole}
    });
    setSaving(false);
    if(error||data?.error){setMsg(data?.error||"Impossibile modificare l'account");return}
    setMsg("Account aggiornato");
    setEditing(null);
    setEditPassword("");
    await load();
  }

  async function logout(){
    await supabase.auth.signOut();
    location.href="/login";
  }

  return <main>
    <AppHeader/>
    <section className="card accountCard">
      <div className="accountTitle">
        <div>
          <h1>Account</h1>
          <p className="currentAccount">{me?.username} <span>·</span> {me?.role?.toUpperCase()}</p>
        </div>
        <button className="logoutBtn" onClick={logout}>ESCI</button>
      </div>

      <section className="accountSection">
        <div className="sectionHeading">
          <div>
            <h2>Account attivi</h2>
            <p>Utenti abilitati ad accedere a Prenotazioni.</p>
          </div>
        </div>
        <div className="accountList">
          {rows.map(p=><article className="accountRow" key={p.id}>
            <div className="accountIdentity">
              <b>{p.username}</b>
              <span>{p.role.toUpperCase()}</span>
            </div>
            <div className={p.active?"statusOn":"statusOff"}>{p.active?"ATTIVO":"DISATTIVATO"}</div>
            {me?.role==="amministratore"
              ? <div className="accountRowActions">
                  <button className="accountEdit" onClick={()=>startEdit(p)}>MODIFICA</button>
                  {p.id!==me.id?<button className="accountToggle" onClick={()=>toggle(p)}>{p.active?"DISATTIVA":"RIATTIVA"}</button>:<span className="accountSelf">TU</span>}
                </div>
              : <span className="accountSelf">{p.id===me?.id?"TU":""}</span>}
          </article>)}
        </div>
      </section>

      {me?.role==="amministratore"&&editing&&<section className="accountSection editAccount">
        <div className="sectionHeading">
          <div>
            <h2>Modifica account</h2>
            <p>Puoi cambiare USER, ruolo e, se necessario, impostare una nuova password.</p>
          </div>
        </div>
        <form onSubmit={saveEdit}>
          <div className="accountFields">
            <div>
              <label>USER</label>
              <input className="full" autoCapitalize="none" autoComplete="off" value={editUsername} onChange={e=>setEditUsername(e.target.value)} required minLength={3}/>
            </div>
            <div>
              <label>NUOVA PASSWORD <span className="optionalLabel">FACOLTATIVA</span></label>
              <input className="full" type="password" autoComplete="new-password" value={editPassword} onChange={e=>setEditPassword(e.target.value)} placeholder="Lascia vuoto per non cambiarla"/>
            </div>
          </div>
          <label>RUOLO</label>
          <div className="roleChoice">
            <button type="button" className={editRole==="operatore"?"selected":""} onClick={()=>setEditRole("operatore")}>OPERATORE</button>
            <button type="button" className={editRole==="amministratore"?"selected":""} onClick={()=>setEditRole("amministratore")}>AMMINISTRATORE</button>
          </div>
          <div className="editAccountActions">
            <button type="button" onClick={()=>setEditing(null)}>ANNULLA</button>
            <button className="confirm" type="submit" disabled={saving}>{saving?"SALVATAGGIO…":"SALVA MODIFICHE"}</button>
          </div>
        </form>
      </section>}

      {me?.role==="amministratore"&&<section className="accountSection newAccount">
        <div className="sectionHeading">
          <div>
            <h2>Nuovo account</h2>
            <p>Crea un nuovo accesso scegliendo USER, password e ruolo.</p>
          </div>
        </div>
        <form onSubmit={createAccount}>
          <div className="accountFields">
            <div>
              <label>USER</label>
              <input className="full" autoCapitalize="none" autoComplete="off" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Es. Cucina" required minLength={3}/>
            </div>
            <div>
              <label>PASSWORD</label>
              <input className="full" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimo 6 caratteri" required minLength={6}/>
            </div>
          </div>
          <label>RUOLO</label>
          <div className="roleChoice">
            <button type="button" className={role==="operatore"?"selected":""} onClick={()=>setRole("operatore")}>OPERATORE</button>
            <button type="button" className={role==="amministratore"?"selected":""} onClick={()=>setRole("amministratore")}>AMMINISTRATORE</button>
          </div>
          <button className="confirm createAccountBtn" type="submit" disabled={saving}>{saving?"CREAZIONE IN CORSO…":"CREA ACCOUNT"}</button>
        </form>
      </section>}
      {msg&&<p className="msg accountMsg">{msg}</p>}
    </section>
  </main>;
}