import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/hooks/use-auth";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import HelpDeckWidget from "@/components/layout/HelpDeckWidget";
import { ClientLayout } from "@/components/layout/client-layout";
import { TasksProvider } from "@/hooks/use-tasks-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased selection:bg-primary/10 overflow-x-hidden`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <TasksProvider>
                <ClientLayout>{children}</ClientLayout>
                <HelpDeckWidget />
              </TasksProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
