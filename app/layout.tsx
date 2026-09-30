import "./globals.css";
import AuthGuard from "./AuthGuard";

export const metadata={
  title:"22 Booking",
  description:"Gestione prenotazioni Officina22",
  applicationName:"22 Booking"
};

export const viewport={
  themeColor:"#2EB1E8",
  width:"device-width",
  initialScale:1,
  viewportFit:"cover"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="it">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-title" content="22 Booking"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <link rel="manifest" href="/manifest.webmanifest"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3"/>
        <link rel="icon" type="image/png" sizes="180x180" href="/favicon.png?v=3"/>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=3"/>
      </head>
      <body><AuthGuard>{children}</AuthGuard></body>
    </html>
  );
}
