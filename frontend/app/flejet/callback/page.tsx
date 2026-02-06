"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader, Check } from "lucide-react";
import { toast } from "sonner";

export default function FlejetCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saveFlejetConfig = async () => {
      if (authLoading || !user) return;

      const workspaceId = searchParams.get("workspaceId");
      const apiKey = searchParams.get("apiKey");
      const flejetUserId = searchParams.get("userId");

      if (!workspaceId || !apiKey || !flejetUserId) {
        toast.error("Missing Flejet connection data");
        router.push("/");
        return;
      }

      setSaving(true);
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            flejetConfig: {
              workspaceId,
              apiKey,
              userId: flejetUserId,
            },
          },
          { merge: true },
        );

        setSuccess(true);
        toast.success("Successfully connected to Flejet!");

        // Wait a bit to show success state before redirecting
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        console.error("Failed to save Flejet config:", err);
        toast.error("Failed to save Flejet connection");
        router.push("/");
      } finally {
        setSaving(false);
      }
    };

    saveFlejetConfig();
  }, [user, authLoading, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full bg-card border-2 border-border p-8 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          {success ? (
            <Check className="text-primary" size={32} />
          ) : (
            <Loader className="animate-spin text-primary" size={32} />
          )}
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">
          {success ? "Connection Successful!" : "Connecting to Flejet..."}
        </h1>

        <p className="text-muted-foreground font-medium mb-0">
          {success
            ? "Your account is now linked. Redirecting you home..."
            : "We're saving your workspace credentials safely."}
        </p>

        {!user && !authLoading && (
          <p className="mt-4 text-rose-500 font-bold text-sm">
            Please log in to Habit Builder to complete the connection.
          </p>
        )}
      </div>
    </div>
  );
}
