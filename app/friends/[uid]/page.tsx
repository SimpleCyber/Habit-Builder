"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getViewableTasksByFriend, getUserProfile } from "@/lib/firebase-db";
import { useAuth } from "@/hooks/use-auth";
import { TaskCard } from "@/components/tasks/task-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FriendTasksPage() {
  const { user } = useAuth();
  const params = useParams<{ uid: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user || !params?.uid) return;
    (async () => {
      const [t, p] = await Promise.all([
        getViewableTasksByFriend(params.uid, user.uid),
        getUserProfile(params.uid),
      ]);
      setTasks(t);
      setProfile(p);
    })();
  }, [user, params?.uid]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Header />
      {profile && (
        <div className="glass-effect rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.photoURL || ""} alt="" />
            <AvatarFallback>
              {(profile.displayName || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{profile.displayName}</div>
            <div className="text-sm text-muted-foreground">{profile.email}</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} readOnly />
        ))}
        {tasks.length === 0 && (
          <div className="text-sm text-muted-foreground col-span-full">
            No viewable tasks yet.
          </div>
        )}
      </div>
      {/* </CHANGE> */}
    </main>
  );
}
