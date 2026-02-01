"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ChromeExtensionSection } from "@/components/landing/ChromeExtensionSection";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Force dark mode for landing page to match the premium "night mode" aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to home (dashboard)
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-green-500/30">
      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-xl sm:bg-[#0A0A0A]/80">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-base sm:text-xl font-black tracking-tighter flex items-center gap-2"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-green-500 flex items-center justify-center">
              <span className="text-black font-black text-sm sm:text-lg">
                H
              </span>
            </div>
            HabitX
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/home"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 rounded-full font-black text-xs sm:text-sm px-4 sm:px-6"
                  >
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <ChromeExtensionSection />

        {/* Final CTA */}
        <section className="py-20 sm:py-24 border-t border-white/5 bg-gradient-to-b from-[#0A0A0A] to-[#111]">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
              Start your streak today.
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto">
              Join thousands of high performers building the future of their
              habits.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-green-500 hover:bg-green-600 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
