"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Flame, UserPlus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getSuggestedUsers,
  sendFriendRequest,
  getOutgoingRequests,
  searchUsers,
} from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RightSidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load suggested users (active + mixed)
    getSuggestedUsers(3).then((users) => {
      setTopUsers(users);
    });

    if (user) {
      getOutgoingRequests(user.uid).then((reqs) => {
        const sent = new Set(
          reqs.filter((r) => r.status === "pending").map((r) => r.toUid),
        );
        setSentRequests(sent);
      });
    }
  }, [user]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFollow = async (targetUid: string) => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }
    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      setSentRequests((prev) => new Set(prev).add(targetUid));
      toast.success("Request sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request");
    }
  };

  return (
    <aside className="hidden xl:flex flex-col w-[380px] pl-8 py-4 space-y-6 sticky top-0 h-screen">
      <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
        {/* Search Bar */}
        <div className="relative group z-50">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Search users..."
            className="pl-12 h-12 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Search Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <Link
                      key={result.uid}
                      href={`/${result.username || result.uid}`}
                      className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                      onClick={() => setSearchQuery("")}
                    >
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={result.photoURL} />
                        <AvatarFallback>
                          {(result.name?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">
                          {result.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          @{result.username || "user"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No users found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Who to follow */}
        <div className="bg-secondary/30 rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-bold text-lg leading-none">Who to follow</h2>
          </div>

          <div className="divide-y divide-border/50">
            {topUsers.map((u) => {
              const isMe = user?.uid === u.uid;
              const isSent = sentRequests.has(u.uid);

              return (
                <div
                  key={u.uid}
                  className="p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                >
                  <Link href={`/${u.username || u.uid}`}>
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={u.photoURL} />
                      <AvatarFallback>
                        {(u.name?.[0] || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/${u.username || u.uid}`}
                      className="font-bold hover:underline truncate"
                    >
                      {u.name || "User"}
                    </Link>
                    <div className="text-muted-foreground text-xs truncate flex items-center gap-1">
                      @{u.username || "unknown"}
                      {u.streak > 0 && (
                        <span className="text-orange-500 flex items-center gap-0.5 ml-1 bg-orange-500/10 px-1 rounded-sm">
                          <Flame className="w-3 h-3 fill-orange-500" />{" "}
                          {u.streak}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isMe && (
                    <Button
                      size="sm"
                      variant={isSent ? "outline" : "default"}
                      className={`rounded-full px-4 h-8 font-bold ${isSent ? "text-muted-foreground" : "bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black"}`}
                      onClick={() => !isSent && handleFollow(u.uid)}
                      disabled={isSent}
                    >
                      {isSent ? "Sent" : "Follow"}
                    </Button>
                  )}
                </div>
              );
            })}

            {topUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Links */}
      <div className="flex flex-wrap text-xs text-muted-foreground gap-x-4 gap-y-2 px-6 pt-4 border-t border-border/30">
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/cookies" className="hover:underline">
          Cookie Policy
        </Link>
        <Link href="/accessibility" className="hover:underline">
          Accessibility
        </Link>
        <span className="w-full mt-1 opacity-70">© 2026 Habit Builder</span>
      </div>
    </aside>
  );
}
