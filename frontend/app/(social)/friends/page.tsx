"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, User, Loader } from "lucide-react";
import {
  getMyFriends,
  getReceivedRequests,
  getOutgoingRequests,
  respondToRequest,
  unfollowUser,
} from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FriendsPage() {
  const { user } = useAuth();

  // States for different tabs
  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsList, received, outgoing] = await Promise.all([
        getMyFriends(user.uid),
        getReceivedRequests(user.uid),
        getOutgoingRequests(user.uid),
      ]);
      setFriends(friendsList);
      setIncoming(received);
      setSent(outgoing);
    } catch (error) {
      console.error("Error loading friends data:", error);
      toast.error("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (
    reqId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      await respondToRequest(reqId, status);
      toast.success(
        status === "accepted" ? "Request accepted!" : "Request rejected",
      );
      loadAllData();
    } catch (error) {
      console.error("Response error:", error);
      toast.error("Action failed");
    }
  };

  const handleUnfollow = async (friendUid: string) => {
    if (!user) return;
    try {
      await unfollowUser(user.uid, friendUid);
      toast.success("Unfollowed successfully");
      setFriends((prev) => prev.filter((f) => f.uid !== friendUid));
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error("Failed to unfollow");
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please login to access Friends.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4  border-border sticky top-0 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Friends</h1>
        {loading && (
          <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <Tabs defaultValue="friends" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start h-14 bg-transparent border-b border-border rounded-none px-4 gap-6 p-0">
          <TabsTrigger
            value="friends"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all border-b-2 border-transparent"
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all relative border-b-2 border-transparent"
          >
            Requests Received
            {incoming.length > 0 && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all border-b-2 border-transparent"
          >
            Sent
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Friends List */}
          <TabsContent value="friends" className="m-0 focus-visible:ring-0">
            {friends.length > 0 ? (
              <div className="divide-y divide-border">
                {friends.map((f) => (
                  <div
                    key={f.uid}
                    className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group"
                  >
                    <Link
                      href={`/${f.username || f.uid}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={f.photoURL} alt={f.name} />
                        <AvatarFallback>
                          {(f.name?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-base truncate">
                          {f.name || "Unknown User"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          @{f.username || "user"}
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full px-4 font-bold transition-opacity"
                      onClick={() => handleUnfollow(f.uid)}
                    >
                      Following
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    No friends yet. Start connecting!
                  </p>
                </div>
              )
            )}
          </TabsContent>

          {/* Incoming Requests */}
          <TabsContent value="requests" className="m-0 focus-visible:ring-0">
            {incoming.length > 0 ? (
              <div className="divide-y divide-border">
                {incoming.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <Link
                      href={`/${r.fromUsername || r.fromUid}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={r.fromPhotoURL} alt={r.fromName} />
                        <AvatarFallback>
                          {(r.fromName?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-base truncate">
                          {r.fromName || r.fromEmail || "Unknown User"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          @{r.fromUsername || "user"}
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(r.id, "accepted")}
                        className="rounded-full px-4 h-9 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRespond(r.id, "rejected")}
                        className="rounded-full px-4 h-9 font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    No pending requests.
                  </p>
                </div>
              )
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent" className="m-0 focus-visible:ring-0">
            {sent.length > 0 ? (
              <div className="divide-y divide-border">
                {sent.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <Link
                      href={`/${r.toUsername || r.toUid}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={r.toPhotoURL} alt={r.toName} />
                        <AvatarFallback>
                          {(r.toName?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-bold text-base truncate">
                          {r.toName || r.toEmail || "Unknown User"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          @{r.toUsername || "user"}
                        </div>
                      </div>
                    </Link>
                    <div className="text-sm font-medium px-4 py-1.5 rounded-full border border-border text-muted-foreground bg-secondary/20">
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    You haven't sent any requests.
                  </p>
                </div>
              )
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
