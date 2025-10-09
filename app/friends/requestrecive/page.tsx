"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { getReceivedRequests, respondToRequest } from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FriendRequestReceivePage() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const loadRequests = async () => {
      setLoading(true);
      try {
        const requests = await getReceivedRequests(user.uid);
        setIncoming(requests);
      } catch (error) {
        console.error("Error loading requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [user]);

  const handleRespond = async (
    reqId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      await respondToRequest(reqId, status);
      // Refresh the list
      const updated = await getReceivedRequests(user!.uid);
      setIncoming(updated);
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to respond to request");
    }
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
      <div className="glass-effect rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Incoming requests</h2>
        
        {loading && (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        )}
        
        <div className="space-y-2">
          {!loading && incoming.map((r: any) => {
            const displayName = r.fromName || r.fromEmail || "Unknown";
            const initials = getInitials(displayName, r.fromEmail);
            
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.fromPhotoURL || ""} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.type === "all"
                        ? "Request all tasks"
                        : "Request selected tasks"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(r.id, "accepted")}
                    className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, "rejected")}
                    className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && !incoming.length && (
            <p className="text-sm text-muted-foreground">
              No incoming requests.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}