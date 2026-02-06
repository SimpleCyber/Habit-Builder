"use client";

import { usePathname, useRouter } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import React from "react";
import { useAppBadge } from "@/hooks/use-app-badge";
import { cn } from "@/lib/utils";

import { SocialSidebar } from "@/components/layout/social-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Badge count management
  useAppBadge();

  // Pages where MobileNav and Sidebars should be visible
  const isSocialPage =
    pathname === "/community" ||
    pathname === "/friends" ||
    pathname === "/profile" ||
    pathname === "/messages" ||
    (pathname.startsWith("/") &&
      pathname.length > 1 &&
      !["/auth", "/onboarding", "/_next", "/api", "/settings", "/home"].some(
        (p) => pathname.startsWith(p),
      ) &&
      !pathname.includes("."));

  const isMessagesPage = pathname === "/messages";

  const handleAddClick = () => {
    if (pathname === "/home") {
      window.dispatchEvent(new CustomEvent("open-add-task"));
    } else {
      router.push("/home?action=add-task");
    }
  };

  if (!isSocialPage) {
    return <main className="min-h-[100dvh] pb-24 lg:pb-0">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="flex w-full max-w-[1265px]">
        {/* Sidebar (Desktop) */}
        <SocialSidebar />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 min-w-0 w-full border-x border-zinc-200 dark:border-zinc-800 min-h-screen pb-32 lg:pb-0",
            isMessagesPage ? "max-w-none" : "max-w-2xl",
          )}
        >
          {children}
        </main>

        {/* Right Sidebar (Desktop) */}
        {!isMessagesPage && <RightSidebar />}
      </div>
      <MobileNav onAddClick={handleAddClick} />
    </div>
  );
}
