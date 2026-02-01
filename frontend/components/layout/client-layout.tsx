"use client";

import { usePathname, useRouter } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import React from "react";
import { useAppBadge } from "@/hooks/use-app-badge";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Badge count management
  useAppBadge();

  // Pages where MobileNav should be visible
  const showMobileNav =
    pathname === "/home" ||
    pathname === "/community" ||
    pathname === "/friends" ||
    pathname === "/profile" ||
    (pathname.startsWith("/") &&
      pathname.length > 1 &&
      !["/auth", "/onboarding", "/_next", "/api"].some((p) =>
        pathname.startsWith(p),
      ) &&
      !pathname.includes("."));

  const handleAddClick = () => {
    if (pathname === "/home") {
      window.dispatchEvent(new CustomEvent("open-add-task"));
    } else {
      router.push("/home?action=add-task");
    }
  };

  return (
    <>
      <main
        className={`min-h-[100dvh] ${showMobileNav ? "pb-32" : "pb-24"} lg:pb-0`}
      >
        {children}
      </main>
      {showMobileNav && <MobileNav onAddClick={handleAddClick} />}
    </>
  );
}
