"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkUsernameAvailable, claimUsername, getUserData } from "@/lib/firebase-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user already has a username
  useEffect(() => {
    async function checkExisting() {
       if (user) {
          // Force fetch latest data to check if username exists
          const userData: any = await getUserData(user.uid); 
          // Note: getUserData currently returns {streak, lastCheckIn}, we might need to fetch the raw doc 
          // or update getUserData to return username. 
          // Ideally we check the user object context, but let's assume if they are here they need it.
          // Or we can rely on the redirect logic in global auth guard later.
       }
    }
    checkExisting();
  }, [user]);

  // Debounce check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username.length >= 3) {
        setIsChecking(true);
        const available = await checkUsernameAvailable(username);
        setIsAvailable(available);
        setIsChecking(false);
      } else {
        setIsAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAvailable) return;

    setIsSubmitting(true);
    try {
      await claimUsername(user.uid, username);
      toast.success("Welcome to the community!");
      // Force reload to update AuthProvider state and redirect to home
      window.location.href = "/home";
    } catch (error: any) {
      toast.error(error.message);
      setIsAvailable(false); // Assume taken if error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Claim your username</h1>
            <p className="text-gray-400">
                Choose a unique handle to track your habits and compete on the leaderboard.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative">
                    <Input 
                        value={username}
                        onChange={(e) => {
                            // strictly alphanumeric + underscore
                            const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
                            setUsername(val);
                        }}
                        placeholder="habit_builder"
                        className="bg-black/50 border-white/10 h-12 text-lg px-4 focus:ring-green-500/50"
                        minLength={3}
                        maxLength={20}
                        required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isChecking ? (
                            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                        ) : isAvailable === true ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isAvailable === false ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                        ) : null}
                    </div>
                </div>
                {isAvailable === false && (
                    <p className="text-xs text-red-400">Username is already taken.</p>
                )}
                <p className="text-xs text-gray-500">
                    Only letters, numbers, and underscores. Min 3 chars.
                </p>
            </div>

            <Button 
                type="submit" 
                disabled={!isAvailable || isSubmitting || username.length < 3}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-lg"
            >
                {isSubmitting ? "Claiming..." : "Continue"}
            </Button>
        </form>
      </div>
    </div>
  );
}
