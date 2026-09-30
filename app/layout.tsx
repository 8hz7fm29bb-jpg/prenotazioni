import "./globals.css";
import AuthGuard from "./AuthGuard";
export const metadata={title:"Prenotazioni",description:"Gestione prenotazioni Officina22"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="it"><body><AuthGuard>{children}</AuthGuard></body></html>}