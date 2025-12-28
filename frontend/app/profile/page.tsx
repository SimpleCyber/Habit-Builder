"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/lib/firebase-db";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirect() {
      if (authLoading) return;
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const p = await getUserProfile(user.uid);
        if (p?.username) {
          router.replace(`/${p.username}`);
        } else {
          // If no username, maybe redirect to onboarding or home
          router.replace("/home");
        }
      } catch (e) {
        router.replace("/home");
      } finally {
        setLoading(false);
      }
    }
    redirect();
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center text-neutral-500">
      <div className="animate-pulse">Redirecting to your profile...</div>
    </div>
  );
}
