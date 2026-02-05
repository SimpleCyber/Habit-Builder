"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, User } from "lucide-react";
import { getMyFriends } from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);

  // While fixing this issue https://github.com/SimpleCyber/Habit-Builder/issues/2
  // Initally the react loads friends list [] is empty ( as data loads after verifing auth)
  // till ten it shows the "No friends yet"
  // We can fix this is using the loading

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const frs = await getMyFriends(user.uid);
      setFriends(frs);
      setLoading(false);
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
    <div className="">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-bold">Friends</h1>
      </div>

      {loading ? ( // ✅ Show loader while fetching
        <div className="glass-effect rounded-2xl p-8 text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300">Loading friends...</p>
        </div>
      ) : friends.length != 0 ? (
        <div className="p-4 sm:p-6">
          <div className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-3">
            Your Friends
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-3">
            {friends.map((f) => (
              <Link
                key={f.uid}
                href={`/${f.username || f.uid}`}
                className="rounded-md border border-[var(--border)] p-3 flex items-center justify-between hover:bg-[var(--glass-hover)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
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
                    <div className="text-sm font-bold truncate text-foreground">
                      {f.name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{f.username || "user"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl p-8 text-center mt-8">
          <Link
            href="/friends/requestrecive"
            className="flex items-center gap-2"
          >
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          </Link>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            No friends yet!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add friends to start building your circle.
          </p>
        </div>
      )}
    </div>
  );
}
