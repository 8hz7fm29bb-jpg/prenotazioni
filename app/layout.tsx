import "./globals.css";
import AuthGuard from "./AuthGuard";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "22 Booking",
  description: "Gestione prenotazioni Officina22",
  applicationName: "22 Booking",
  manifest: "/manifest.webmanifest?v=14",
  icons: {
    icon: [
      { url: "/api/app-icon?v=14", sizes: "180x180", type: "image/png" },
    ],
    apple: [
      { url: "/api/app-icon?v=14", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "22 Booking",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "22 Booking",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff0000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
