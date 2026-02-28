"use client";

import { Clock, Trophy } from "lucide-react";

export function RecentActivity() {
    const activities = [
        {
            title: "Crucible Control",
            time: "2h ago",
            stats: "2.4 KD | 32 Defeats",
            result: "VICTORY",
            icon: Trophy,
            color: "text-wd-danger",
            bg: "bg-wd-danger/10",
            resultColor: "text-wd-success",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/crucible_burnout.jpg",
        },
        {
            title: "Grandmaster Nightfall",
            time: "5h ago",
            stats: "Platinum | 25m 12s",
            result: "COMPLETED",
            icon: Trophy,
            color: "text-wd-primary-400",
            bg: "bg-wd-primary-600/10",
            resultColor: "text-wd-success",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/strikes/strike_fallen_saber.jpg",
        },
        {
            title: "Raid: Root of Nightmares",
            time: "Yesterday",
            stats: "Full Clear | 1h 20m",
            result: "COMPLETED",
            icon: Trophy,
            color: "text-wd-lilac",
            bg: "bg-wd-lilac/10",
            resultColor: "text-wd-success",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/raid_nemesis.jpg",
        },
    ];

    return (
        <div className="wd-card p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-wd-lilac/5 to-transparent pointer-events-none" />

            <h3 className="text-xs font-bold text-wd-lilac uppercase tracking-[0.15em] mb-4 flex items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-wd-lilac/15 flex items-center justify-center">
                    <Clock size={14} />
                </div>
                Recent Sessions
            </h3>
            <div className="space-y-3 relative z-10">
                {activities.map((activity, i) => (
                    <div
                        key={i}
                        className="relative rounded-xl overflow-hidden group border border-border-subtle hover:border-border-medium transition-all cursor-pointer"
                        style={{ backgroundImage: `url(${activity.bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-bg-secondary/[0.92] group-hover:bg-bg-secondary/[0.85] transition-all duration-500" />

                        <div className="relative z-10 flex gap-3 items-center p-3">
                            <div className={`w-9 h-9 rounded-xl ${activity.bg} flex items-center justify-center ${activity.color} shrink-0`}>
                                <activity.icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-text-primary group-hover:text-wd-primary-400 transition-colors truncate">{activity.title}</h4>
                                <p className="text-[10px] text-text-tertiary font-mono truncate">{activity.stats}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className={`text-[10px] font-black ${activity.resultColor} uppercase tracking-wider`}>{activity.result}</span>
                                <p className="text-[10px] text-text-tertiary mt-0.5">{activity.time}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
