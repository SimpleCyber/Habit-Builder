"use client";

import { Cookie, Info, Settings, ShieldAlert } from "lucide-react";

const sections = [
  {
    icon: Cookie,
    title: "Essential Cookies",
    content:
      "These are necessary for the website to function. They handle authentication, security, and basic navigation. Without these, the app cannot operate correctly.",
  },
  {
    icon: Info,
    title: "Preference Cookies",
    content:
      "These allow us to remember choices you've made—like your theme preference or language—to provide a more personalized experience.",
  },
  {
    icon: Settings,
    title: "Analytics Cookies",
    content:
      "We use these to understand how users interact with our platform. They provide anonymized data on which features are most used, helping us build a better product.",
  },
  {
    icon: ShieldAlert,
    title: "Your Consent",
    content:
      "By using Habit Builder, you consent to the use of essential cookies. You can manage your preferences for non-essential cookies through your browser settings.",
  },
];

export default function CookiePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <header className="space-y-6 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
          Experience Tracking
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight font-sans">
          Cookie <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            Policy
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mx-auto md:mx-0 font-light">
          Understanding how tiny bits of data help us deliver a smooth,
          high-performance experience for your habit-building journey.
        </p>
      </header>

      {/* Cards Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm shadow-xl shadow-black/20 flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {section.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-light italic">
                  "{section.content}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <div className="text-sm text-zinc-500 flex items-center gap-3 bg-zinc-900/50 px-6 py-3 rounded-full border border-white/5">
          <span>Need to reset your preferences?</span>
          <button className="text-orange-400 hover:text-white font-bold transition-colors underline decoration-2 underline-offset-4">
            {" "}
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  );
}
