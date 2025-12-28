"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, ArrowRight, CheckCircle2, Flame, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";


export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for premium feel

  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  useEffect(() => {
      // Force dark mode
      document.documentElement.classList.add("dark");
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);

    const { user, error } = isLogin
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password);

    if (error) {
      setError(error);
      setAuthLoading(false);
    } else if (user) {
      router.push("/home");
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setAuthLoading(true);

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(error);
      setAuthLoading(false);
    } else if (user) {
      router.push("/home");
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0A0A0A] text-white">
      
      {/* LEFT SIDE: Brand & Aesthetic */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#050505] border-r border-white/5 overflow-hidden">
        
        {/* Background Grid - Reusing the aesthetic */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
            <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
                    <span className="text-black font-bold text-lg">H</span>
                </div>
                HabitX
            </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
                Join the top 1% of <br />
                <span className="text-green-500">consistent builders.</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
                "HabitX changed the way I look at my daily routine. It's not just a tracker, it's a lifestyle."
            </p>
            
            <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                         <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-700 flex items-center justify-center overflow-hidden`}>
                             <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                         </div>
                    ))}
                 </div>
                 <div className="text-sm font-medium text-gray-400">
                    Join 10,000+ others
                 </div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-sm text-gray-500">
            <span>© 2026 HabitX</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
        </div>

      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">
                    {isLogin ? "Welcome back" : "Create an account"}
                </h2>
                <p className="text-gray-400 mt-2">
                    {isLogin ? "Enter your details to access your dashboard." : "Start your journey to consistency today."}
                </p>
            </div>

            <div className="flex gap-4 p-1 bg-white/5 rounded-xl">
                 <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isLogin ? "bg-white/10 text-white shadow-lg" : "text-gray-400 hover:text-white"
                    }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        !isLogin ? "bg-white/10 text-white shadow-lg" : "text-gray-400 hover:text-white"
                    }`}
                >
                    Sign Up
                </button>
            </div>

             <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <Input
                        type="email"
                        placeholder="hello@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border-white/10 focus:border-green-500/50 text-white h-12"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/5 border-white/10 focus:border-green-500/50 text-white h-12"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
                >
                    {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        isLogin ? "Sign In" : "Get Started"
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0A0A0A] px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium gap-3"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Google
            </Button>

            <p className="text-center text-sm text-gray-500">
                By clicking continue, you agree to our{" "}
                <Link href="#" className="underline hover:text-white">Terms of Service</Link>{" "}
                and{" "}
                <Link href="#" className="underline hover:text-white">Privacy Policy</Link>.
            </p>

        </div>
      </div>
    </div>
  );
}
