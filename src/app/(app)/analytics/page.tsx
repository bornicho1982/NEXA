"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/analytics/StatCard";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { WeaponUsageChart } from "@/components/analytics/WeaponUsageChart";
import { Crosshair, Trophy, Clock, Skull, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
    return (
        <div className="h-full overflow-y-auto bg-bg-primary p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-text-primary"
                    >
                        Performance Analytics
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-text-secondary"
                    >
                        Track your statistics across all activities.
                    </motion.p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="K/D Ratio"
                        value="2.45"
                        icon={<Crosshair size={20} />}
                        trend={{ value: 12, label: "vs last week", isPositive: true }}
                        delay={0}
                    />
                    <StatCard
                        title="Win Rate"
                        value="68%"
                        icon={<Trophy size={20} />}
                        trend={{ value: 5, label: "vs last week", isPositive: true }}
                        delay={0.1}
                    />
                    <StatCard
                        title="Time Played"
                        value="1,240h"
                        icon={<Clock size={20} />}
                        className="border-gold-primary/20 bg-gold-primary/5" // Highlight
                        delay={0.2}
                    />
                    <StatCard
                        title="Combat Efficiency"
                        value="94.2"
                        icon={<Activity size={20} />}
                        trend={{ value: 2, label: "vs last week", isPositive: false }}
                        delay={0.3}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ActivityHeatmap />
                    </div>
                    <div className="lg:col-span-1">
                        <WeaponUsageChart />
                    </div>
                </div>

                {/* Recent Activity Table (Mock) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-lg bg-bg-secondary border border-border-subtle overflow-hidden"
                >
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center">
                        <h3 className="font-medium text-text-primary uppercase tracking-wider">Recent Sessions</h3>
                        <button className="text-xs text-gold-primary hover:text-gold-highlight">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-bg-tertiary text-text-secondary uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Activity</th>
                                    <th className="px-6 py-3">Result</th>
                                    <th className="px-6 py-3">Kills</th>
                                    <th className="px-6 py-3">Duration</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {[
                                    { name: "Trials of Osiris", result: "Victory", kills: 14, duration: "12m", date: "2h ago" },
                                    { name: "Grandmaster Nightfall", result: "Completed", kills: 142, duration: "45m", date: "5h ago" },
                                    { name: "Iron Banner", result: "Defeat", kills: 8, duration: "10m", date: "1d ago" },
                                    { name: "Root of Nightmares", result: "Completed", kills: 312, duration: "1h 20m", date: "2d ago" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-bg-tertiary/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-text-primary">{row.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-1 rounded text-xs",
                                                row.result === "Victory" || row.result === "Completed" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                            )}>
                                                {row.result}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{row.kills}</td>
                                        <td className="px-6 py-4 text-text-secondary">{row.duration}</td>
                                        <td className="px-6 py-4 text-text-tertiary">{row.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
