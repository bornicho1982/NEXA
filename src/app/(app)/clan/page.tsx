"use client";

import { ClanBanner } from "@/components/clan/ClanBanner";
import { ClanRoster } from "@/components/clan/ClanRoster";
import { motion } from "framer-motion";
import { Sword, Target, Shield, MessageSquare } from "lucide-react";

export default function ClanPage() {
    return (
        <div className="h-full overflow-y-auto bg-bg-primary p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <ClanBanner />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Roster */}
                    <div className="lg:col-span-2">
                        <ClanRoster />
                    </div>

                    {/* Right Column: Active Challenges */}
                    <div className="space-y-6">
                        <div className="bg-bg-secondary rounded-xl border border-border-subtle p-6">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
                                Clan Bounties
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: "Raid Night", desc: "Complete Last Wish with clanmates.", reward: "Powerful Gear", icon: <Sword size={16} /> },
                                    { title: "Crucible Glory", desc: "Win 5 matches in Competitive.", reward: "+100 Clan XP", icon: <Target size={16} /> },
                                    { title: "Nightfall Mastery", desc: "Score 100k in the Nightfall.", reward: "Enhancement Core", icon: <Shield size={16} /> },
                                ].map((bounty, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="flex gap-4 p-3 rounded-lg bg-bg-tertiary/30 border border-white/5 hover:border-gold-primary/30 transition-colors group"
                                    >
                                        <div className="p-2 bg-black/40 rounded h-fit text-text-tertiary group-hover:text-gold-primary transition-colors">
                                            {bounty.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-text-primary">{bounty.title}</h4>
                                            <p className="text-xs text-text-secondary mb-1">{bounty.desc}</p>
                                            <span className="text-[10px] text-gold-primary uppercase tracking-wide font-medium">{bounty.reward}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/20 p-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-white font-bold mb-1">Discord Connected</h3>
                            <p className="text-xs text-indigo-200/60 mb-4">Join the voice channels to coordinate.</p>
                            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-sm transition-colors">
                                Open Discord
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
