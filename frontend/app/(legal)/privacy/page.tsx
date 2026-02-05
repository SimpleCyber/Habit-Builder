"use client";

import { Eye, Shield, Share2, Lock, Smartphone } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "1. Information Collection",
    content:
      "We collect information you directly provide, such as when you create an account, post habit check-ins, or communicate with us. This includes your name, email, profile photo, and habit progress data.",
  },
  {
    icon: Shield,
    title: "2. Use of Data",
    content:
      "Your information allows us to provide a personalized habit-tracking experience, facilitate community interactions, and improve our services through anonymized analytics.",
  },
  {
    icon: Share2,
    title: "3. Social Sharing",
    content:
      "Habit Builder is social by nature. Your check-ins and community posts are visible to other users based on your privacy settings. We never sell your personal contact info to third-party marketers.",
  },
  {
    icon: Lock,
    title: "4. Data Protection",
    content:
      "We implement industry-standard security measures to safeguard your personal data. This includes encryption for sensitive data and secure server environments.",
  },
  {
    icon: Smartphone,
    title: "5. Your Controls",
    content:
      "You have full control over your data. You can access, update, or delete your profile information and manage who sees your habit progress within the account settings.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          Privacy First
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Privacy <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Policy
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Transparent, simple, and built with your privacy in mind. Here is how
          we protect your data.
        </p>
      </header>

      {/* Content Blocks */}
      <div className="grid gap-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="group p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-md hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-lg text-zinc-400 leading-relaxed font-light">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-12 rounded-3xl bg-blue-900/20 border border-blue-900/30">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h3 className="text-xl font-bold text-white">
            Your Data, Your Choice
          </h3>
          <p className="text-zinc-400 font-light">
            You can request a full export of your habit data or request account
            deletion at any time via your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
