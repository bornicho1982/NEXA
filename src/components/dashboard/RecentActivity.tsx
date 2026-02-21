"use client";

import { Clock, Trophy } from "lucide-react";

export function RecentActivity() {
    const activities = [
        {
            title: "Crucible Control",
            time: "2h ago",
            stats: "2.4 KD | 32 Defeats",
            result: "Victory",
            icon: Trophy,
            color: "text-gold-primary"
        },
        {
            title: "Grandmaster Nightfall",
            time: "5h ago",
            stats: "Platinum | 25m 12s",
            result: "Completed",
            icon: Trophy,
            color: "text-blue-500"
        },
        {
            title: "Raid: Root of Nightmares",
            time: "Yesterday",
            stats: "Full Clear",
            result: "Completed",
            icon: Trophy,
            color: "text-purple-500"
        }
    ];

    return (
        <div className="nexa-card p-5 border-l-2 border-l-purple-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                <Clock size={14} /> Recent Sessions
            </h3>
            <div className="space-y-4 relative z-10">
                {activities.map((activity, i) => (
                    <div key={i} className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0 group">
                        <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/20 transition-colors ${activity.color}`}>
                            <activity.icon size={16} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-gold-primary transition-colors">{activity.title}</h4>
                            <p className="text-xs text-text-secondary mt-0.5 font-mono">{activity.stats}</p>
                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-1 block">
                                {activity.time} • <span className="text-green-400">{activity.result}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
