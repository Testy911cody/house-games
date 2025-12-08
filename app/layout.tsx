import type { Metadata, Viewport } from "next";
import "./globals.css";
import HomeButton from "./components/HomeButton";

export const metadata: Metadata = {
  title: "House Games - Neon Arcade",
  description: "A neon arcade where friends come to play social games together",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "House Games",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  // Prevent caching for rapid multiplayer sync
  robots: {
    noindex: false,
    nofollow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#00ffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="neon-bg scanlines">
        <div className="grid-bg"></div>
        <div className="relative z-10">
          <HomeButton />
          {children}
        </div>
      </body>
    </html>
  );
}
