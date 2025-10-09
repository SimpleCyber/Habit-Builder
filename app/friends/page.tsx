"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, ContactRound } from "lucide-react";
import { getMyFriends } from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const frs = await getMyFriends(user.uid);
      setFriends(frs);
      // </CHANGE>
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p>Please login to access Friends.</p>
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
        <Header />

        {friends.length === 0 ? (
          <div className="glass-effect rounded-2xl p-8 text-center">
            <Link
              href="/friends/requestrecive"
              className="flex items-center gap-2"
            >
              <ContactRound className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              No friends yet!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add friends to start building your circle.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-3">
              Your Friends
            </div>
            {friends.map((f) => (
              <Link
                key={f.uid}
                href={`/friends/${f.uid}`}
                className="rounded-md border border-[var(--border)] p-3 flex items-center justify-between hover:bg-[var(--glass-hover)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={f.photoURL || ""} alt="" />
                    <AvatarFallback className="text-xs">
                      {(f.name || f.email || "?")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {f.name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {f.email}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
