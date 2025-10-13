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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!term.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(term);
        // Filter out current user from suggestions
        const filtered = results.filter((u) => u.uid !== user?.uid);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [term, user]);

  useEffect(() => {
    if (!user) return;

    const loadSentRequests = async () => {
      try {
        const requests = await getOutgoingRequests(user.uid);
        setSent(requests);
      } catch (error) {
        console.error("Error loading sent requests:", error);
      }
    };

    loadSentRequests();
  }, [user]);

  const handleRequest = async (targetUid: string, targetUser: any) => {
    if (!user) return;

    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      // Refresh the sent requests list
      const updated = await getOutgoingRequests(user.uid);
      setSent(updated);
      // Clear search term and suggestions
      setTerm("");
      setSuggestions([]);
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    }
  };

  // Helper function to get display name for sent requests
  const getDisplayName = (request: any) => {
    return request.toName || request.toEmail || "Unknown User";
  };

  // Helper function to get initials for avatar fallback
  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
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

        {loading && (
          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
        )}

        {!loading && !!suggestions.length && (
          <div className="mt-2 rounded-lg border divide-y">
            {suggestions.map((u) => {
              const initials = getInitials(u.displayName, u.email);
              return (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.photoURL || ""} alt={u.displayName} />
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
                    onClick={() => handleRequest(u.uid, u)}
                    className="px-3 py-1 rounded-md bg-primary text-primary-foreground flex items-center gap-1 hover:bg-primary/90"
                  >
                    <UserPlus className="w-4 h-4" /> Request
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && term && !suggestions.length && (
          <p className="mt-2 text-sm text-muted-foreground">No users found</p>
        )}
      </div>

      <div className="glass-effect rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Requests you sent</h2>
        <div className="space-y-2">
          {sent.map((r: any) => {
            const displayName = getDisplayName(r);
            const initials = getInitials(displayName, r.toEmail);

            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.toPhotoURL || ""} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.toEmail || "No email available"}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize mt-1">
                      Status:{" "}
                      <span
                        className={
                          r.status === "accepted"
                            ? "text-green-600"
                            : r.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.createdAt?.toLocaleString?.() ||
                    new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
            );
          })}
          {!sent.length && (
            <p className="text-sm text-muted-foreground">
              No requests sent yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
