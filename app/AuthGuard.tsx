"use client";
import {useEffect,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {supabase} from "../lib/supabase";

export default function AuthGuard({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const router=useRouter();
  const [ready,setReady]=useState(pathname==="/login");

  useEffect(()=>{
    let mounted=true;
    (async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(!mounted)return;
      if(pathname==="/login"){
        if(session){router.replace("/");return}
        setReady(true);
        return;
      }
      if(!session){
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
    return()=>{mounted=false};
  },[pathname,router]);

  if(!ready)return <main className="loginPage"><section className="loginCard"><div className="loginBrand"><b>PRENOTAZIONI</b><span>Officina22</span></div><p className="msg">Accesso in corso…</p></section></main>;
  return <>{children}</>;
}