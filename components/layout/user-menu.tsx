"use client";

import * as React from "react";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



function toggleTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark");
  // Persist preference
  try {
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {}
}

export function UserMenu() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
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
      <DropdownMenuContent align="end" className="min-w-48">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {user?.displayName || user?.email || "Account"}
        </div>
        <DropdownMenuItem onClick={toggleTheme}>Toggle theme</DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            try {
              await signOut(getAuth());
            } catch (e) {
              console.log("signOut error:", (e as Error).message);
            }
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
