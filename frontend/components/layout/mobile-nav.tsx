"use client";

import { Home, Newspaper, Mail, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onAddClick?: () => void;
}

export function MobileNav({ onAddClick }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Users, label: "Friends", href: "/friends" },
    { icon: Newspaper, label: "Community", href: "/community" },
    { icon: Mail, label: "Messages", href: "/messages" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-between h-20 px-2 sm:px-6">
        {/* Left items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(0, 2).map((item) => {
            const isActive =
              item.href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-6 h-6 ${isActive ? "fill-primary/10" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Specialized Add Button - Centered */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 -translate-y-4 border-4 border-background mt-8"
          >
            <Plus className="w-7 h-7 stroke-[3px]" />
          </button>
        </div>

        {/* Right items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(2).map((item) => {
            const isProfileActive =
              item.href === "/profile" &&
              pathname.startsWith("/") &&
              pathname !== "/home" &&
              !pathname.startsWith("/community") &&
              !pathname.startsWith("/friends") &&
              !pathname.startsWith("/auth") &&
              !pathname.startsWith("/onboarding");
            const isActive = pathname.startsWith(item.href) || isProfileActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-6 h-6 ${isActive ? "fill-primary/10" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
