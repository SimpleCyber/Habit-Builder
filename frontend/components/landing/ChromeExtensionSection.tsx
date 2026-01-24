"use client";

import { motion } from "framer-motion";
import {
  Chrome,
  Download,
  MousePointerClick,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Download",
    description: "Visit the Chrome Web Store and click 'Add to Chrome'.",
    icon: <Download className="w-6 h-6 text-green-400" />,
  },
  {
    title: "Install",
    description: "Confirm the installation in your browser's extension menu.",
    icon: <MousePointerClick className="w-6 h-6 text-green-400" />,
  },
  {
    title: "Get Productive",
    description:
      "Pin the extension and start tracking habits from any website.",
    icon: <Zap className="w-6 h-6 text-green-400" />,
  },
];

export function ChromeExtensionSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0A] border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Content */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                <Chrome className="w-4 h-4" />
                <span>Now available on Chrome Store</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Habits on the go with our <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  Chrome Extension
                </span>
              </h2>

              <p className="text-gray-400 text-lg mb-8 max-w-xl">
                Stay on top of your streaks without leaving your current tab.
                HabitX extension brings your productivity dashboard to every
                corner of the web.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full bg-green-500 hover:bg-green-600 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  onClick={() =>
                    window.open("https://chromewebstore.google.com", "_blank")
                  }
                >
                  Add to Chrome <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Steps Layout */}
              <div className="grid sm:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Fake Extension UI Mockup */}
              <div className="w-full max-w-[400px] mx-auto aspect-[4/5] bg-[#111] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header of Popup */}
                <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                      <span className="text-black font-extrabold text-[10px]">
                        H
                      </span>
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      HabitX
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {/* Content of Popup */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                        Today's Streak
                      </div>
                      <div className="text-3xl font-bold">12 Days 🔥</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${i === 1 ? "bg-green-500" : "bg-gray-700"}`}
                          />
                          <div className="h-2 w-24 bg-white/10 rounded-full" />
                        </div>
                        <div className="w-5 h-5 rounded bg-white/5 border border-white/10" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex gap-2">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 aspect-square rounded-sm ${i > 4 ? "bg-green-500" : "bg-green-900/50"}`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] text-gray-600 text-center">
                      Last 7 days activity
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
              </div>

              {/* Supporting elements for depth */}
              <div className="absolute -z-10 top-12 left-12 w-full h-full bg-green-500/5 rounded-3xl rotate-3" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
