"use client";

import { ClanBanner } from "@/components/clan/ClanBanner";
import { ClanRoster } from "@/components/clan/ClanRoster";
import { motion } from "framer-motion";
import { Sword, Target, Shield, MessageSquare, Trophy, TrendingUp, Users, Star } from "lucide-react";

export default function ClanPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <ClanBanner />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Roster */}
                <div className="lg:col-span-2">
                    <ClanRoster />
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Clan Stats — WowDash Mini Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Members", value: "42", icon: Users, color: "text-wd-primary-400", bg: "bg-wd-primary-600/10" },
                            { label: "Clan Level", value: "6", icon: Star, color: "text-wd-warning", bg: "bg-wd-warning/10" },
                            { label: "Weekly XP", value: "85k", icon: TrendingUp, color: "text-wd-success", bg: "bg-wd-success/10" },
                            { label: "Raid Clears", value: "312", icon: Trophy, color: "text-wd-lilac", bg: "bg-wd-lilac/10" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-bg-secondary rounded-xl border border-border-subtle p-4 flex flex-col items-center gap-1.5 hover:border-border-medium transition-all group"
                            >
                                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={16} className={stat.color} />
                                </div>
                                <span className="text-xl font-black text-text-primary">{stat.value}</span>
                                <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Clan Bounties — WowDash Card */}
                    <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-wd-warning/15 flex items-center justify-center">
                                <Sword size={16} className="text-wd-warning" />
                            </div>
                            <h3 className="text-sm font-bold text-text-primary">Clan Bounties</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {[
                                { title: "Raid Night", desc: "Complete Last Wish with clanmates.", reward: "Powerful Gear", icon: Sword, progress: 60, color: "bg-wd-warning" },
                                { title: "Crucible Glory", desc: "Win 5 matches in Competitive.", reward: "+100 Clan XP", icon: Target, progress: 40, color: "bg-wd-danger" },
                                { title: "Nightfall Mastery", desc: "Score 100k in the Nightfall.", reward: "Enhancement Core", icon: Shield, progress: 85, color: "bg-wd-success" },
                            ].map((bounty, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="p-3.5 rounded-xl bg-bg-primary border border-border-subtle hover:border-wd-primary-600/30 transition-colors group"
                                >
                                    <div className="flex gap-3 items-start mb-2.5">
                                        <div className="p-2 bg-bg-tertiary rounded-lg text-text-tertiary group-hover:text-wd-primary-400 transition-colors shrink-0">
                                            <bounty.icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-bold text-text-primary truncate">{bounty.title}</h4>
                                                <span className="text-[10px] text-wd-warning font-bold uppercase tracking-wider shrink-0">{bounty.reward}</span>
                                            </div>
                                            <p className="text-xs text-text-tertiary mt-0.5">{bounty.desc}</p>
                                        </div>
                                    </div>
                                    {/* WowDash Progress Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                                            <div className={`h-full rounded-full ${bounty.color} transition-all duration-500`} style={{ width: `${bounty.progress}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-text-secondary">{bounty.progress}%</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Discord — Enhanced */}
                    <div className="bg-gradient-to-br from-indigo-900/30 via-indigo-800/20 to-purple-900/20 rounded-2xl border border-indigo-500/20 p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)]" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 mx-auto shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                <MessageSquare size={26} />
                            </div>
                            <h3 className="text-white font-black mb-1">Discord Connected</h3>
                            <p className="text-xs text-indigo-200/60 mb-4">Join the voice channels to coordinate.</p>
                            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-600/25">
                                Open Discord
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
