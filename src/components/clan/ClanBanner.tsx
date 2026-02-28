"use client";

import { motion } from "framer-motion";
import { Users, Shield, TrendingUp, Crown, Calendar } from "lucide-react";

export function ClanBanner() {
    return (
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-border-medium group">
            {/* Bungie PGCR Background — CSS bg */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://www.bungie.net/img/destiny_content/pgcr/raid_kings_fall.jpg)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/85 to-bg-primary/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
            </div>

            <div className="relative z-10 flex items-center p-8 lg:p-10 min-h-[240px]">
                <div className="flex gap-8 items-center">
                    {/* Clan Emblem — WowDash Avatar Style */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-28 h-28 rounded-2xl bg-bg-secondary/80 border-2 border-wd-primary-600/50 flex items-center justify-center shadow-[0_0_30px_rgba(72,127,255,0.2)] backdrop-blur-sm shrink-0 relative overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: "url(https://www.bungie.net/img/profile/avatars/cc22.jpg)" }}
                    >
                        <Shield size={48} className="text-white/50 relative z-10" />
                    </motion.div>

                    {/* Clan Info */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-wider">Ascendant Guard</h1>
                                <span className="px-2.5 py-1 rounded-lg bg-wd-warning/15 border border-wd-warning/20 text-wd-warning text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Crown size={10} /> Level 6
                                </span>
                            </div>
                            <p className="text-wd-primary-400 italic font-serif text-lg">&quot;We stand where others fall.&quot;</p>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-6 text-sm"
                        >
                            <div className="flex items-center gap-2 text-white/70">
                                <div className="w-7 h-7 rounded-lg bg-wd-primary-600/15 flex items-center justify-center">
                                    <Users size={14} className="text-wd-primary-400" />
                                </div>
                                <span className="font-semibold">82 / 100 Members</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <div className="w-7 h-7 rounded-lg bg-wd-success/15 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-wd-success" />
                                </div>
                                <span className="font-semibold">Season 24</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <div className="w-7 h-7 rounded-lg bg-wd-warning/15 flex items-center justify-center">
                                    <Calendar size={14} className="text-wd-warning" />
                                </div>
                                <span className="font-semibold">Founded 2019</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Weekly XP Contribution</span>
                                <span className="text-[10px] text-wd-primary-400 font-bold">85,400 / 100,000</span>
                            </div>
                            <div className="w-72 h-2 bg-bg-tertiary/50 rounded-full overflow-hidden backdrop-blur-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-wd-primary-600 to-wd-primary-400 rounded-full shadow-[0_0_8px_rgba(72,127,255,0.4)]"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
