"use client";

import { HandMetal, Laptop, Mail, Users } from "lucide-react";

const principles = [
  {
    icon: Laptop,
    title: "Technological Inclusion",
    content:
      "We design our interfaces to be compatible with major screen readers and assistive technologies, ensuring that your habit-building journey is accessible from any device.",
  },
  {
    icon: Users,
    title: "Universal Design",
    content:
      "Our goal is simple: an app that is usable for everyone. We follow WCAG 2.1 Level AA guidelines to provide a high standard of accessibility across the platform.",
  },
  {
    icon: HandMetal,
    title: "Continuous Progress",
    content:
      "Accessibility is a journey, not a destination. We regularly audit our platform to identify and remove barriers, building a truly digital inclusive space.",
  },
  {
    icon: Mail,
    title: "Support & Feedback",
    content:
      "If you encounter any issues, our team is ready to help. We value your feedback on how we can improve accessibility for everyone.",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Accessibility for All
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Accessibility <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Statement
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
          We are committed to ensuring Habit Builder is a tool that empowers
          everyone, regardless of physical or cognitive ability.
        </p>
      </header>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {principles.map((principle, idx) => {
          const Icon = principle.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-md flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {principle.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-light">
                  {principle.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Banner */}
      <div className="p-1 border border-white/5 rounded-[2.5rem] bg-zinc-900/20">
        <div className="p-12 rounded-[2.2rem] bg-gradient-to-br from-zinc-800/50 to-transparent flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Need assistance?</h3>
            <p className="text-zinc-400 max-w-sm">
              Our team is committed to helping you navigate any part of our
              service.
            </p>
          </div>
          <button className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
            Email Support
          </button>
        </div>
      </div>
    </div>
  );
}
