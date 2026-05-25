import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Agendei. | SaaS Control Center",
  description: "Painel de controle central de telemetria e parceiros do Agendei.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        {/* Leaflet CSS for Map renders */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
      </head>
      <body className={`${jakarta.variable} font-sans antialiased bg-slate-50 dark:bg-[#050506] text-zinc-900 dark:text-white transition-colors duration-300 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
