"use client";

import { usePathname } from "next/navigation";

export default function AppHeader(){
  const pathname=usePathname();
  const active=(href:string)=>{
    if(href==="/") return pathname==="/";
    return pathname===href || pathname.startsWith(href+"/");
  };
  return (
    <header className="appHeader">
      <a className="brand" href="/">
        <b>PRENOTAZIONI</b>
        <span>Officina22</span>
      </a>
      <nav className="mainNav">
        <a className={active("/")?"activeMenu":""} href="/">+ NUOVA</a>
        <a className={active("/prenotazioni")?"activeMenu":""} href="/prenotazioni">PRENOTAZIONI</a>
        <a className={active("/clienti")?"activeMenu":""} href="/clienti">CLIENTI</a>
        <a className={"account "+(active("/account")?"activeMenu":"")} href="/account">ACCOUNT</a>
      </nav>
    </header>
  );
}
