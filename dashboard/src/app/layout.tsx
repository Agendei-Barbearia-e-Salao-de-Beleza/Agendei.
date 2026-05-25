import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Agendei. | Dashboard Administrativo",
  description: "Gestão inteligente para barbearias e salões de beleza.",
};

import { ThemeProvider } from "@/components/ThemeProvider";
import MobileBlocker from "@/components/MobileBlocker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <Toaster richColors position="top-right" />
          <Suspense fallback={null}>
            <FirebaseAnalytics />
          </Suspense>
          <MobileBlocker />
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}

