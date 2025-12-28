"use client";

import Link from "next/link";
import { ArrowRight, Flame, Users } from "lucide-react";
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] text-white pt-20">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-wrap gap-1 content-center justify-center p-4 mask-image-gradient">
        {gridItems.map((item) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: Math.random() * 2 }}
                className={`w-4 h-4 rounded-sm sm:w-6 sm:h-6 ${
                    item.level === 0 ? "bg-gray-800" :
                    item.level === 1 ? "bg-green-900" :
                    item.level === 2 ? "bg-green-600" :
                    "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                }`}
            />
        ))}
      </div>

      <div className="container relative z-10 px-4 text-center">
        
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium border rounded-full border-white/10 bg-white/5 backdrop-blur-sm"
        >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-gray-300">Join 10,000+ builders shipping daily</span>
        </motion.div>

        <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl mx-auto mb-6 text-6xl font-extrabold tracking-tight leading-tight sm:text-7xl lg:text-8xl"
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
            className="max-w-2xl mx-auto mb-10 text-xl text-gray-400"
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
          <Link href="/auth">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full bg-white text-black hover:bg-gray-200 transition-all hover:scale-105">
              Claim Your Username
            </Button>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
             <span>or</span>
             <Link href="#feed" className="flex items-center gap-1 text-white hover:underline underline-offset-4">
                Explore the Feed <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </motion.div>

        {/* Live Stat */}
        <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1 }}
             className="mt-20 flex justify-center gap-12 text-center"
        >
            <div>
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                    2.4M <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Streaks Active</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
                <div className="text-3xl font-bold text-white">
                    142
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Countries</div>
            </div>
        </motion.div>

      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/20">
        <div className="w-1 h-8 rounded-full bg-white/20" />
      </div>

    </section>
  );
}
