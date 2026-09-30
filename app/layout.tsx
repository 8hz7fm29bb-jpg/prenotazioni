import "./globals.css";
import AuthGuard from "./AuthGuard";

export const metadata={
  title:"22 Booking",
  description:"Gestione prenotazioni Officina22",
  applicationName:"22 Booking",
  manifest:"/manifest.webmanifest",
  appleWebApp:{
    capable:true,
    title:"22 Booking",
    statusBarStyle:"default"
  }
};

export const viewport={
  themeColor:"#22AEEF",
  width:"device-width",
  initialScale:1,
  viewportFit:"cover"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="it"><body><AuthGuard>{children}</AuthGuard></body></html>;
}
