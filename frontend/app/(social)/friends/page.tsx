"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, User, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  respondToRequest,
  unfollowUser,
  getCategorizedFriends,
  sendFriendRequest,
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
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { following, followers, connections } = await getCategorizedFriends(
        user.uid,
      );
      setFollowing(following);
      setFollowers(followers);
      setConnections(connections);
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
      setFollowing((prev: any[]) =>
        prev.filter((f: any) => f.uid !== friendUid),
      );
      setConnections((prev: any[]) =>
        prev.filter((f: any) => f.uid !== friendUid),
      );
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error("Failed to unfollow");
    }
  };

  const handleFollowBack = async (targetUid: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      toast.success("Follow request sent!");
      loadAllData(); // Refresh to update status
    } catch (error) {
      console.error("Follow back error:", error);
      toast.error("Failed to follow back");
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

      <Tabs defaultValue="following" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start h-14 bg-transparent border-b border-border rounded-none px-4 gap-6 p-0 overflow-x-auto">
          <TabsTrigger
            value="following"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all border-b-2 border-transparent shrink-0"
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="followers"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all border-b-2 border-transparent shrink-0"
          >
            Followers
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-muted-foreground data-[state=active]:text-foreground transition-all border-b-2 border-transparent shrink-0"
          >
            Connections
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Following List */}
          <TabsContent value="following" className="m-0 focus-visible:ring-0">
            {following.length > 0 ? (
              <div className="divide-y divide-border">
                {following.map((f) => (
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
                      variant={
                        f.status === "accepted" ? "secondary" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "rounded-full px-4 font-bold transition-opacity",
                        f.status === "pending" &&
                          "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() =>
                        f.status === "accepted" && handleUnfollow(f.uid)
                      }
                    >
                      {f.status === "accepted" ? "Following" : "Requested"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    You're not following anyone yet.
                  </p>
                </div>
              )
            )}
          </TabsContent>

          {/* Followers List */}
          <TabsContent value="followers" className="m-0 focus-visible:ring-0">
            {followers.length > 0 ? (
              <div className="divide-y divide-border">
                {followers.map((f) => (
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
                    {f.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRespond(f.requestId, "accepted")}
                          className="rounded-full px-4 h-9 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRespond(f.requestId, "rejected")}
                          className="rounded-full px-4 h-9 font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                        >
                          Decline
                        </Button>
                      </div>
                    ) : (
                      !following.some((fol) => fol.uid === f.uid) && (
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-full px-4 font-bold bg-primary text-primary-foreground"
                          onClick={() => handleFollowBack(f.uid)}
                        >
                          Follow Back
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    No followers yet.
                  </p>
                </div>
              )
            )}
          </TabsContent>

          {/* Connections List */}
          <TabsContent value="connections" className="m-0 focus-visible:ring-0">
            {connections.length > 0 ? (
              <div className="divide-y divide-border">
                {connections.map((f) => (
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
                    <Link href="/messages">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4 font-bold border-primary text-primary hover:bg-primary/5"
                      >
                        Message
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">
                    No mutual connections yet.
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
