"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const tweets = [
  {
    name: "Alex Chen",
    handle: "@alx_builds",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    content: "Day 45 of coding every day. Keeping the streak alive on HabitX is oddly satisfying. The green squares don't lie. 🟩🟩🟩",
    verified: true,
  },
  {
    name: "Sarah Jones",
    handle: "@sarah_designs",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    content: "Just hit 100 days of meditation! 🧘‍♀️ Couldn't have done it without the accountability group on HabitX. You guys rock!",
    verified: false,
  },
  {
    name: "Marcus Dev",
    handle: "@marcus_indi",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    content: "Productivity tip: Make your habits public. The fear of breaking the chain in front of my friends is the only thing getting me to the gym today. 🏋️‍♂️ #HabitX",
    verified: true,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Join the conversation</h2>
            <p className="text-gray-400">See what the community is building right now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tweets.map((tweet, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                            <AvatarImage src={tweet.avatar} />
                            <AvatarFallback>{tweet.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-white text-sm">{tweet.name}</span>
                                {tweet.verified && (
                                    <Badge variant="secondary" className="px-1 py-0 h-4 text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0">PRO</Badge>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{tweet.handle}</span>
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {tweet.content}
                    </p>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
