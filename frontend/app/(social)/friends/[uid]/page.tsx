"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getViewableTasksByFriend, getUserProfile } from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { TaskCard } from "@/components/tasks/task-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, UserX } from "lucide-react";
import Link from "next/link";

export default function FriendTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ uid: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !params?.uid) return;
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [t, p] = await Promise.all([
          getViewableTasksByFriend(params.uid, user.uid),
          getUserProfile(params.uid),
        ]);
        if (isMounted) {
          setTasks(t || []);
          setProfile(p);
          if (!p) {
            setError("Friend profile not found.");
          }
        }
      } catch (err: any) {
        console.error("Error loading friend tasks:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load friend habits.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, params?.uid]);

  return (
    <main className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6 pb-20">
      <Header />

      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground mb-2 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading habits...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 p-6 rounded-2xl glass-effect border border-border">
          <UserX className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h2 className="text-lg font-bold mb-1">Unable to Load Friend</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Link href="/friends">
            <Button variant="outline" className="rounded-full">
              Back to Friends
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {profile && (
            <div className="glass-effect rounded-2xl p-4 mb-6 flex items-center gap-4 border border-border shadow-sm">
              <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20">
                <AvatarImage src={profile.photoURL || ""} alt={profile.displayName || "Avatar"} />
                <AvatarFallback className="rounded-2xl font-bold text-lg">
                  {(profile.displayName || profile.email || "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg truncate">{profile.displayName || profile.name}</div>
                {profile.username && (
                  <div className="text-sm text-orange-500 font-semibold truncate">
                    @{profile.username}
                  </div>
                )}
                {profile.email && !profile.username && (
                  <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                )}
              </div>
              {profile.username && (
                <Link href={`/${profile.username}`}>
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    View Profile
                  </Button>
                </Link>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
              Active Habits ({tasks.length})
            </h3>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} history={task.history} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-border text-muted-foreground">
                <p className="font-semibold mb-1">No shared habits yet</p>
                <p className="text-xs">
                  This user hasn't shared any habits with you or made their habits public.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
