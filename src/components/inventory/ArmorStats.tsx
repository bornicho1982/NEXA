"use client";

import type { InventoryItem } from "@/lib/inventory/service";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface ArmorStatsProps {
    dimStats: any[];
    item: InventoryItem;
}

// Map Destiny stat hashes to English short names for the radar chart
const STAT_NAMES: Record<number, string> = {
    2996146975: "Mobility",
    392767087: "Resilience",
    1943323491: "Recovery",
    1735777505: "Discipline",
    144602215: "Intellect",
    4244567218: "Strength",
};

// Order for the polygon to draw cleanly (Clockwise)
const STAT_ORDER = [
    2996146975, // Mobility (Top)
    392767087,  // Resilience (Top Right)
    1943323491, // Recovery (Bottom Right)
    1735777505, // Discipline (Bottom)
    144602215,  // Intellect (Bottom Left)
    4244567218, // Strength (Top Left)
];

export function ArmorStats({ dimStats, item }: ArmorStatsProps) {
    if (!dimStats || dimStats.length === 0) {
        return <div className="text-center text-xs text-text-tertiary py-10">No armor stats available</div>;
    }

    const totalStat = dimStats.find(s => s.statHash === -1)?.value || 0;

    // Build data array for RadarChart
    const radarData = STAT_ORDER.map(hash => {
        const stat = dimStats.find(s => s.statHash === hash);
        return {
            subject: STAT_NAMES[hash] || "Unknown",
            base: stat?.base || 0,
            value: stat?.value || 0,
            // A realistic single-piece max is around 32-42 depending on mods
            fullMark: 42
        };
    });

    return (
        <div className="flex flex-col items-center pt-2">
            <div className="w-full h-[220px] -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="#ffffff" strokeOpacity={0.1} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />

                        {/* Base Stats (White/Grey Polygon) */}
                        <Radar
                            name="Base"
                            dataKey="base"
                            stroke="rgba(255,255,255,0.4)"
                            fill="rgba(255,255,255,0.1)"
                            fillOpacity={1}
                        />

                        {/* Modified Stats (Cyan Polygon overlay) */}
                        <Radar
                            name="Total"
                            dataKey="value"
                            stroke="#487fff"
                            strokeWidth={2}
                            fill="#3b6ee8"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Linear List below the Radar for exact numbers */}
            <div className="w-full grid grid-cols-2 gap-x-6 gap-y-1.5 px-2 mt-2">
                {STAT_ORDER.map(hash => {
                    const stat = dimStats.find(s => s.statHash === hash);
                    if (!stat) return null;
                    const delta = stat.value - stat.base;

                    return (
                        <div key={hash} className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary">{STAT_NAMES[hash]}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                                {delta > 0 && <span className="text-wd-primary-400 text-[10px]">(+{delta})</span>}
                                {delta < 0 && <span className="text-wd-danger text-[10px]">({delta})</span>}
                                <span className={delta > 0 ? "text-wd-primary-300 font-bold" : "text-white"}>{stat.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Stat */}
            <div className="w-full flex justify-between items-center mt-3 pt-3 border-t border-border-subtle px-2">
                <span className="text-xs font-bold uppercase tracking-widest text-wd-warning">Total Base</span>
                <span className="font-mono font-bold text-wd-warning">{totalStat}</span>
            </div>

            {/* Masterwork stat info */}
            {item.masterworkInfo?.statName && (
                <div className="w-full flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border-subtle text-xs text-wd-warning font-medium tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-sm bg-wd-warning animate-pulse" />
                    <span>Masterwork: <span className="text-white">+{item.masterworkInfo.statValue} All Stats</span></span>
                </div>
            )}
        </div>
    );
}
