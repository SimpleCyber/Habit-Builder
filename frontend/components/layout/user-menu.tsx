"use client";

import * as React from "react";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  UserPlus,
  UserRoundCheck,
  UserRoundSearch,
  UserSquare,
  UserCircle,
} from "lucide-react";
import { getUserData } from "@/lib/firebase-db";

function toggleTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark");
  try {
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {}
}

export function UserMenu() {
  const [user, setUser] = React.useState<User | null>(null);
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        getUserData(u.uid).then((data) => {
          if (data?.username) setUsername(data.username);
        });
      }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const initials =
    user?.displayName
      ?.split(" ")
      ?.map((n) => n[0])
      .join("")
      .slice(0, 2)
      ?.toUpperCase() || (user?.email ? user.email[0].toUpperCase() : "U");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open user menu" className="outline-none">
        <Avatar className="h-9 w-9 ring-1 ring-black/5 dark:ring-white/10">
          <AvatarImage src={user?.photoURL || ""} alt="User avatar" />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-52">
        {/* User Info */}
        <div className="px-3 py-2 text-xs text-muted-foreground border-b border-muted">
          {user?.displayName || user?.email || "Account"}
        </div>

        {/* Friends Section */}
        <DropdownMenuItem asChild>
          <Link href="/friends" className="flex items-center gap-2">
            <UserSquare className="w-4 h-4" />
            Your Friends
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/friends/requestrecive"
            className="flex items-center gap-2"
          >
            <UserRoundCheck className="w-4 h-4" />
            Requests Received
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/friends/requestsend" className="flex items-center gap-2">
            <UserRoundSearch className="w-4 h-4" />
            Search Friends
          </Link>
        </DropdownMenuItem>

        {username && (
          <DropdownMenuItem asChild>
            <Link href={`/${username}`} className="flex items-center gap-2 font-bold text-orange-500">
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Theme Toggle & Logout */}
        <DropdownMenuItem onClick={toggleTheme}>Toggle theme</DropdownMenuItem>

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            try {
              await signOut(getAuth());
            } catch (e) {
              console.error("signOut error:", (e as Error).message);
            }
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
