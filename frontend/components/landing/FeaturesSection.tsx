"use client";

import { Share2, Trophy, Zap, Globe, ArrowUpRight, Check } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-[#050505] text-white">
      <div className="container px-4 mx-auto">
        <div className="mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Not just a tracker. <br className="hidden lg:block" />
            <span className="text-gray-500">A movement.</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl">
            We combined the best parts of habit tracking with the addictive
            nature of social media. Positive peer pressure works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          {/* Feature 1: Public Accountability */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 hover:border-white/20">
            <div className="p-8 pb-0">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-500">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Public Accountability</h3>
              <p className="text-gray-400 max-w-md">
                Your profile is your resume of discipline. Share your graph with
                the world and prove your consistency.
              </p>
            </div>
            {/* Visual: Contribution Graph Mockup */}
            <div className="mt-8 ml-8 rounded-tl-xl border-t border-l border-white/10 bg-[#0A0A0A] p-4 shadow-2xl">
              <div className="flex gap-1 overflow-hidden">
                {Array.from({ length: 8 }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-1">
                    {Array.from({ length: 5 }).map((_, d) => (
                      <div
                        key={d}
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${
                          Math.random() > 0.6
                            ? "bg-green-500"
                            : Math.random() > 0.3
                              ? "bg-green-900"
                              : "bg-white/5"
                        }`}
                      />
                    ))}
                  </div>
                ))}
                {/* Hidden columns on mobile */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: 4 }).map((_, w) => (
                    <div key={w + 8} className="flex flex-col gap-1">
                      {Array.from({ length: 5 }).map((_, d) => (
                        <div
                          key={d}
                          className="w-4 h-4 rounded-sm bg-white/5"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Share Wins */}
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:border-white/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Share Wins</h3>
              <p className="text-gray-400">
                Post your daily wins. Get kudos. Build momentum together.
              </p>
            </div>
            {/* Visual: Mini Tweet */}
            <div className="mt-6 p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-[10px] flex items-center justify-center font-bold">
                  JD
                </div>
                <div className="flex-1">
                  <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                  <div className="h-2 w-full bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Leaderboards */}
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:border-white/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 text-orange-500">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Leaderboards</h3>
              <p className="text-gray-400">
                Compete with friends or globally. See who can hold the longest
                streak.
              </p>
            </div>
            {/* Visual: Mini Rank List */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="font-bold text-green-500">1</div>
                <div className="flex-1 font-medium text-sm">You</div>
                <div className="text-xs text-green-400 font-mono">🔥 45</div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0A0A0A] border border-white/5 opacity-50">
                <div className="font-bold text-gray-500">2</div>
                <div className="flex-1 font-medium text-sm">Alex</div>
                <div className="text-xs text-gray-500 font-mono">🔥 42</div>
              </div>
            </div>
          </div>

          {/* Feature 4: Instant Sync */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 hover:border-white/20">
            <div className="p-8 pb-0">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Instant Sync & Offline First
              </h3>
              <p className="text-gray-400 max-w-md">
                Works everywhere. Updates instantly. Whether you're on the
                subway or at your desk, never miss a log.
              </p>
            </div>
            {/* Visual: Cross-Device Logic */}
            <div className="mt-8 flex justify-center gap-4 opacity-80">
              <div className="w-24 h-32 bg-[#0A0A0A] border border-white/10 rounded-t-xl p-2 flex flex-col items-center gap-2">
                <div className="w-full h-1 bg-white/10 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <div className="w-40 h-32 bg-[#0A0A0A] border border-white/10 rounded-t-xl p-2 flex flex-col gap-2">
                <div className="w-full h-1 bg-white/10 rounded-full" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Synced just now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
