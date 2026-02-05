"use client";

import { ReactNode } from "react";
import { SocialSidebar } from "./social-sidebar";

export function SocialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="flex w-full max-w-[1265px]">
        {/* Sidebar (Desktop) */}
        <SocialSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full max-w-2xl border-x border-zinc-200 dark:border-zinc-800 min-h-screen">
          {children}
        </main>

        {/* Right Sidebar (Optional placeholder for future: Trends, Suggested Users) */}
        {/* <aside className="hidden lg:block w-[350px] pl-8 py-4 space-y-4">
           Search, Trends, Suggested 
        </aside> */}
      </div>
    </div>
  );
}
