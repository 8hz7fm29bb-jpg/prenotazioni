import "./globals.css";
import AuthGuard from "./AuthGuard";

export const metadata={
  title:"22 Booking",
  description:"Gestione prenotazioni Officina22",
  applicationName:"22 Booking",
  appleWebApp:{
    capable:true,
    title:"22 Booking",
    statusBarStyle:"default"
  },
  icons:{
    icon:"/icon",
    apple:"/apple-icon"
  }
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="it"><body><AuthGuard>{children}</AuthGuard></body></html>
}
