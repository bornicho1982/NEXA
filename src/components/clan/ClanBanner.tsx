"use client";

import { motion } from "framer-motion";
import { Users, Shield, TrendingUp } from "lucide-react";

export function ClanBanner() {
    return (
        <div className="relative h-64 rounded-xl overflow-hidden mb-8 border border-border-medium group">
            {/* Background Image / Pattern */}
            <div className="absolute inset-0 bg-bg-secondary">
                <div className="absolute inset-0 bg-[url('https://www.bungie.net/img/theme/destiny/icons/icon_clan_banner.png')] opacity-10 bg-repeat bg-[length:100px_100px]" />
                <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-center p-10">
                <div className="flex gap-8 items-center">
                    {/* Clan Standard */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-44 bg-[#0f1014] border-2 border-gold-primary relative shadow-2xl skew-x-[-10deg]"
                    >
                        {/* Mock Banner Design */}
                        <div className="absolute inset-2 border border-white/10 flex items-center justify-center">
                            <Shield size={64} className="text-white" />
                        </div>
                    </motion.div>

                    {/* Clan Info */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-4xl font-black text-white uppercase tracking-wider">Ascendant Guard</h1>
                            <p className="text-gold-primary italic font-serif text-lg">"We stand where others fall."</p>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-6 text-sm"
                        >
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Users size={16} />
                                <span>82 / 100 Members</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <TrendingUp size={16} />
                                <span>Level 6 (Max)</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="w-64 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                <div className="h-full bg-gold-primary w-[85%]" />
                            </div>
                            <div className="flex justify-between text-xs text-text-tertiary mt-1">
                                <span>Weekly XP Contribution</span>
                                <span>85,400 / 100,000</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
