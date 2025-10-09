"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import {
  searchUsers,
  sendFriendRequest,
  getOutgoingRequests,
} from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";

export default function FriendRequestSendPage() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const s = term ? await searchUsers(term) : [];
      setSuggestions(s);
    }, 250);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const reqs = await getOutgoingRequests(user.uid);
      setSent(reqs);
    })();
  }, [user]);

  const handleRequest = async (targetUid: string) => {
    if (!user) return;
    await sendFriendRequest(targetUid, "all");
    const updated = await getOutgoingRequests(user.uid);
    setSent(updated);
  };

  return (
    <main className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
      <Header />
      <div className="glass-effect rounded-2xl p-4 mb-4">
        <h2 className="font-semibold mb-2">Search for friends</h2>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg px-3 py-2 bg-background/60 border"
        />
        {!!suggestions.length && (
          <div className="mt-2 rounded-lg border divide-y">
            {suggestions.map((u) => {
              const initials = (u.displayName || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.photoURL || ""} alt="" />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequest(u.uid)}
                    className="px-3 py-1 rounded-md bg-primary text-primary-foreground flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" /> Request
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-effect rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Requests you sent</h2>
        <div className="space-y-2">
          {sent.map((r: any) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">{r.toEmail || "Unknown"}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {r.status}
                </div>
              </div>
              <span className="text-xs">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {!sent.length && (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          )}
        </div>
      </div>
      {/* </CHANGE> */}
    </main>
  );
}
