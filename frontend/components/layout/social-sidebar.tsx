"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, UserPlus, User, LogOut, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Community", href: "/community", icon: Users },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "Friends", href: "/friends", icon: UserPlus },
];

export function SocialSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isCollapsed = pathname === "/messages";

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex-col justify-between border-r border-zinc-200 dark:border-zinc-800 px-2 py-4 hidden lg:flex transition-all duration-300",
        isCollapsed ? "w-[88px]" : "w-[275px]",
      )}
    >
      <div className="space-y-4">
        <div className={cn("px-4 py-2", isCollapsed && "px-2")}>
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center shrink-0">
              <span className="text-black font-black text-lg">H</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight">HabitX</span>
            )}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-full text-xl font-medium transition-colors duration-200",
                  isCollapsed ? "justify-center px-0" : "px-4",
                  isActive
                    ? "font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon
                  className={cn("w-7 h-7", isActive && "fill-current")}
                />
                {!isCollapsed && item.label}
              </Link>
            );
          })}

          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-full text-xl font-medium transition-colors duration-200",
              isCollapsed ? "justify-center px-0" : "px-4",
              pathname === "/profile" || pathname === `/${user?.displayName}`
                ? "font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            )}
            title={isCollapsed ? "Profile" : ""}
          >
            <User
              className={cn(
                "w-7 h-7",
                (pathname === "/profile" ||
                  pathname === `/${user?.displayName}`) &&
                  "fill-current",
              )}
            />
            {!isCollapsed && "Profile"}
          </Link>
        </nav>
      </div>

      {/* User Profile Footer */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 overflow-hidden p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors mt-auto mb-2",
                isCollapsed
                  ? "justify-center p-0 w-12 h-12 mx-auto"
                  : "justify-between",
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="font-bold text-sm truncate">
                      {user.displayName}
                    </span>
                    <span className="text-zinc-500 text-sm truncate">
                      @{user.displayName?.toLowerCase().replace(/\s+/g, "")}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && <div className="text-zinc-500">•••</div>}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem
              className="font-bold text-red-500 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out @{user.displayName}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </aside>
  );
}
