"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-primary/30">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Navigation Header */}
        <header className="w-full max-w-5xl px-6 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-sm sticky top-0 bg-black/50">
          <Link href="/community" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="group text-zinc-400 hover:text-white transition-colors gap-2"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Community
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
              H
            </div>
            <span className="font-bold tracking-tight">Habit Builder</span>
          </div>
        </header>

        <div className="w-full max-w-4xl px-6 py-16 md:py-24">
          <main className="relative">{children}</main>
        </div>

        <footer className="w-full max-w-5xl px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Habit Builder</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-8">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
