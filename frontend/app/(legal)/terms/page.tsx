"use client";

import { FileText, ShieldCheck, Scale, Bell, Globe } from "lucide-react";

const sections = [
  {
    icon: Globe,
    title: "1. Agreement to Terms",
    content:
      "By accessing or using Habit Builder, you are entering into a legally binding agreement with us and agree to be bound by these Terms of Service. This includes our Privacy Policy and any other documents referenced herein.",
  },
  {
    icon: FileText,
    title: "2. Your Account",
    content:
      "You are responsible for safeguarding your account access and for any activity that occurs under your profile. We encourage the use of strong passwords and active monitoring of account activity.",
  },
  {
    icon: ShieldCheck,
    title: "3. User Content",
    content:
      "You retain all rights to the progress updates and media you post. By sharing content on Habit Builder, you grant us a worldwide, non-exclusive license to host and display your content to support platform functionality.",
  },
  {
    icon: Scale,
    title: "4. Rules of Conduct",
    content:
      "We believe in a supportive environment. Any form of harassment, unauthorized scraping, or use of the service for illegal activities is strictly prohibited and may result in account termination.",
  },
  {
    icon: Bell,
    title: "5. Modifications",
    content:
      "The digital landscape evolves, and so do we. We may update these terms to reflect changes in our service or the law. We will provide notice for any material changes.",
  },
];

export default function TermsPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          Legal Document
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Terms of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            Service
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          The fine print that ensures a safe and supportive community for
          everyone building better habits.
        </p>
        <div className="flex items-center gap-4 pt-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5 border-r border-white/10 pr-4">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Current Version
          </span>
          <span>Released Feb 6, 2026</span>
        </div>
      </header>

      {/* Grid of Content */}
      <div className="grid gap-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="group p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-md hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
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

      <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Have questions?</h3>
        <p className="text-zinc-400">
          Our team is here to help explain any part of these terms.
        </p>
        <button className="mt-4 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}
