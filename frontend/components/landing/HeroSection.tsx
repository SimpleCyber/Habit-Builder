"use client";

import Link from "next/link";
import { ArrowRight, Flame, Users, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Mock data for the "Contribution Grid" background
const generateGrid = () => {
  return Array.from({ length: 140 }, (_, i) => ({
    id: i,
    level: Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0, // 0-3 intensity
  }));
};

const gridItems = generateGrid();

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] text-white pt-16 sm:pt-20">
      {/* --- Desktop Hero (Existing) --- */}
      <div className="hidden sm:block w-full">
        {/* Background Grid Animation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-wrap gap-1 content-center justify-center p-4 mask-image-gradient">
          {gridItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: Math.random() * 2 }}
              className={`w-4 h-4 rounded-sm sm:w-6 sm:h-6 ${
                item.level === 0
                  ? "bg-gray-800"
                  : item.level === 1
                    ? "bg-green-900"
                    : item.level === 2
                      ? "bg-green-600"
                      : "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
              }`}
            />
          ))}
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-8 text-sm font-medium border rounded-full border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-gray-300">
              Join 10,000+ builders shipping daily
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl mx-auto mb-4 sm:mb-6 text-4xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight"
          >
            Make Consistency <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Social & Addictive.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10 text-lg sm:text-xl text-gray-400"
          >
            HabitX is the social network for high performers. Track your work,
            share your streaks, and get addicted to the green squares.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/auth" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full bg-white text-black hover:bg-gray-200 transition-all hover:scale-105"
              >
                Claim Your Username
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
              onClick={() =>
                window.open("https://chromewebstore.google.com", "_blank")
              }
            >
              <Chrome className="mr-2 w-5 h-5 text-green-400" />
              Download Extension
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
          >
            <Link
              href="#feed"
              className="text-sm font-medium text-gray-500 hover:text-white transition-colors inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              Explore the Feed <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Live Stat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 sm:mt-20 flex flex-row justify-center gap-8 sm:gap-12 text-center"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2">
                2.4M{" "}
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 fill-orange-500" />
              </div>
              <div className="text-[10px] sm:text-sm text-gray-500 uppercase tracking-widest mt-1">
                Streaks Active
              </div>
            </div>
            <div className="w-px h-10 sm:h-12 bg-white/10" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                142
              </div>
              <div className="text-[10px] sm:text-sm text-gray-500 uppercase tracking-widest mt-1">
                Countries
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Mobile Hero (Moe Style) --- */}
      <div className="sm:hidden flex-1 w-full flex flex-col px-6 pt-4 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-20"
        >
          <h1 className="text-[52px] font-[900] leading-[0.9] tracking-tighter uppercase mb-2">
            GO FOR <br />
            <span className="text-[#50A65C]">BETTER</span> <br />
            <span className="text-[#50A65C]">HABITS</span> <br />
            WITH <br />
            HABITX
          </h1>

          {/* Squiggly underline SVG accent */}
          <svg
            width="120"
            height="12"
            viewBox="0 0 120 12"
            fill="none"
            className="text-[#50A65C]"
          >
            <path
              d="M2 9.5C12 9.5 18 2 28 2C38 2 44 9.5 54 9.5C64 9.5 70 2 80 2C90 2 96 9.5 106 9.5C116 9.5 118 4 118 4"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Mascot & Speech Bubble Container */}
        <div className="flex-1 flex flex-col justify-end items-end pb-12 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="relative z-10 mr-[-20px] mb-[-40px]"
          >
            <Link href="/auth">
              <img
                src="/images/moe.png"
                alt="Mascot Moe"
                className="w-72 h-auto cursor-pointer"
              />
            </Link>
          </motion.div>

          {/* Speech Bubble / CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute left-0 bottom-32 z-20"
          >
            <Link href="/auth">
              <div className="bg-[#F8FAED] text-black p-4 rounded-3xl rounded-bl-none shadow-xl border-2 border-black/5 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
                <p className="font-black italic text-sm leading-tight uppercase tracking-tight">
                  IT'S MORE FUN <br /> TOGETHER!
                </p>
                <div className="absolute top-1/2 -right-2 translate-x-full bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Floating accents */}
        <div className="absolute top-1/4 right-10 opacity-20 transform rotate-12">
          <Users className="w-12 h-12 text-[#50A65C]" />
        </div>
      </div>

      {/* Scroll indicator (Desktop only) */}
      <div className="hidden sm:block absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/20">
        <div className="w-1 h-8 rounded-full bg-white/20" />
      </div>
    </section>
  );
}
