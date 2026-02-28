import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/service";

interface WeaponStatsProps {
    dimStats: any[];
    item: InventoryItem;
}

export function WeaponStats({ dimStats, item }: WeaponStatsProps) {
    if (!dimStats || dimStats.length === 0) {
        return <div className="text-center text-xs text-text-tertiary py-10">No weapon stats available</div>;
    }

    const weaponStats = dimStats.filter(s => s.statHash !== -1);

    return (
        <div className="space-y-2 pt-2">
            {weaponStats.map((stat) => {
                // Calculate percentages for the bars
                const max = stat.displayMaximum || 100;
                const basePct = Math.min(100, Math.max(0, (stat.base / max) * 100));
                const totalPct = Math.min(100, Math.max(0, (stat.value / max) * 100));

                // Determine if we have a positive or negative delta from perks
                const delta = stat.value - stat.base;
                const isPositive = delta > 0;
                const isNegative = delta < 0;

                return (
                    <div key={stat.statHash} className="flex items-center gap-3 text-sm group">
                        <span className="text-text-secondary w-32 text-right text-xs truncate group-hover:text-white transition-colors">{stat.name}</span>

                        {stat.bar ? (
                            <div className="flex-1 h-3.5 bg-bg-primary/60 border border-border-subtle rounded-sm overflow-hidden relative flex">
                                {/* Base Stat Bar */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-white/30 rounded-l-sm transition-all duration-300"
                                    style={{ width: `${basePct}%` }}
                                />

                                {/* Positive Delta Bar (Green) */}
                                {isPositive && (
                                    <div
                                        className="absolute inset-y-0 bg-wd-success/80 transition-all duration-300"
                                        style={{ left: `${basePct}%`, width: `${totalPct - basePct}%` }}
                                    />
                                )}

                                {/* Negative Delta Bar (Red over Base) */}
                                {isNegative && (
                                    <div
                                        className="absolute inset-y-0 bg-wd-danger/80 transition-all duration-300"
                                        style={{ left: `${totalPct}%`, width: `${basePct - totalPct}%` }}
                                    />
                                )}

                                {/* Segments overlay (10 segments) */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-[#050914]/40 last:border-0 h-full" />
                                    ))}
                                </div>
                            </div>
                        ) : <div className="flex-1" />}

                        <div className="w-12 flex justify-end items-baseline gap-1 font-mono text-xs">
                            <span className={cn(
                                "font-bold",
                                isPositive ? "text-wd-success" : isNegative ? "text-wd-danger" : "text-white/90"
                            )}>{stat.value}</span>
                        </div>
                    </div>
                );
            })}

            {/* Masterwork stat info */}
            {item.masterworkInfo?.statName && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border-subtle text-xs text-wd-warning font-medium tracking-wide bg-wd-warning/5 rounded py-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-wd-warning animate-pulse" />
                    <span>Masterwork: <span className="text-white">+{item.masterworkInfo.statValue} {item.masterworkInfo.statName}</span></span>
                </div>
            )}
        </div>
    );
}
