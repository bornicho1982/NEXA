"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/analytics/StatCard";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { WeaponUsageChart } from "@/components/analytics/WeaponUsageChart";
import { Crosshair, Trophy, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* KPI Grid — WowDash Gradient Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="K/D Ratio"
                    value="2.45"
                    icon={<Crosshair size={22} />}
                    trend={{ value: 12, label: "vs last week", isPositive: true }}
                    delay={0}
                    gradient="red"
                />
                <StatCard
                    title="Win Rate"
                    value="68%"
                    icon={<Trophy size={22} />}
                    trend={{ value: 5, label: "vs last week", isPositive: true }}
                    delay={0.1}
                    gradient="orange"
                />
                <StatCard
                    title="Time Played"
                    value="1,240h"
                    icon={<Clock size={22} />}
                    delay={0.2}
                    gradient="blue"
                />
                <StatCard
                    title="Combat Efficiency"
                    value="94.2"
                    icon={<Activity size={22} />}
                    trend={{ value: 2, label: "vs last week", isPositive: false }}
                    delay={0.3}
                    gradient="purple"
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

            {/* Recent Sessions — WowDash Table Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-wd-primary-600/15 flex items-center justify-center">
                            <Activity size={18} className="text-wd-primary-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-text-primary text-sm">Recent Sessions</h3>
                            <p className="text-[10px] text-text-tertiary">Your latest game activities</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-wd-primary-400 hover:text-wd-primary-300 px-3 py-1.5 rounded-lg bg-wd-primary-600/10 hover:bg-wd-primary-600/15 transition-colors">View All</button>
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
                                            row.result === "Victory" || row.result === "Completed" ? "bg-wd-success/10 text-wd-success" : "bg-wd-danger/10 text-wd-danger"
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
    );
}
