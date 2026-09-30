import "./globals.css";
import AuthGuard from "./AuthGuard";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "22 Booking",
  description: "Gestione prenotazioni Officina22",
  applicationName: "22 Booking",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "22 Booking",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=7", type: "image/png", sizes: "180x180" },
      { url: "/icon-512.png?v=7", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=7", type: "image/png", sizes: "180x180" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "22 Booking",
  },
};

export const viewport: Viewport = {
  themeColor: "#22AEEF",
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=7" />
        <link rel="manifest" href="/manifest.webmanifest?v=7" />
      </head>
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
