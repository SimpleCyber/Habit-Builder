import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/hooks/use-auth";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import HelpDeckWidget from "@/components/layout/HelpDeckWidget";

export const metadata: Metadata = {
  title: "HabitX",
  description: "Created by satyam yadav",
  generator: "HabitX",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HabitX",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <HelpDeckWidget />
          </AuthProvider>
        </Suspense>
        <Analytics />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
