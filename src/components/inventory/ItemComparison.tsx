"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

// Types matching our Inventory logic
interface ComparisonItem {
    name: string;
    icon: string;
    primaryStat?: number;
    tierType: number;
    type: string; // "Armor" | "Weapon"
    stats?: Record<string, number>;
}

interface ItemComparisonProps {
    item1: ComparisonItem;
    item2: ComparisonItem;
    className?: string;
}

const STAT_LABELS: Record<string, string> = {
    mobility: "Mobility",
    resilience: "Resilience",
    recovery: "Recovery",
    discipline: "Discipline",
    intellect: "Intellect",
    strength: "Strength",
    // Weapon stats could be added here
};

export function ItemComparison({ item1, item2, className }: ItemComparisonProps) {
    // Collect all unique stat keys from both items
    const allStats = Array.from(new Set([
        ...Object.keys(item1.stats || {}),
        ...Object.keys(item2.stats || {})
    ]));

    const BUNGIE_ROOT = "https://www.bungie.net";
    const getIcon = (path: string) => path.startsWith("http") ? path : `${BUNGIE_ROOT}${path}`;

    return (
        <div className={cn("grid grid-cols-2 gap-4 bg-bg-secondary rounded-xl p-4 border border-border-subtle", className)}>
            {[item1, item2].map((item, index) => (
                <div key={index} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md bg-bg-tertiary overflow-hidden border border-border-medium">
                            <Image
                                src={getIcon(item.icon)}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-text-secondary">{item.type}</span>
                                {item.primaryStat && (
                                    <span className="text-gold-primary font-mono-stat font-bold">
                                        {item.primaryStat}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        {allStats.map((statKey) => {
                            const val1 = item1.stats?.[statKey] || 0;
                            const val2 = item2.stats?.[statKey] || 0;
                            const currentVal = index === 0 ? val1 : val2;
                            const otherVal = index === 0 ? val2 : val1;
                            const diff = currentVal - otherVal;

                            // Color logic: Green if higher, Red if lower (assuming higher is better)
                            const isBetter = diff > 0;
                            const isWorse = diff < 0;

                            return (
                                <div key={statKey} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-end text-xs">
                                        <span className="text-text-secondary uppercase tracking-wider font-semibold text-[10px]">
                                            {STAT_LABELS[statKey.toLowerCase()] || statKey}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className={cn("font-bold font-mono-stat", isBetter ? "text-status-success" : isWorse ? "text-status-error" : "text-white")}>
                                                {currentVal}
                                            </span>
                                            {diff !== 0 && (
                                                <span className={cn("text-[9px] flex items-center", isBetter ? "text-status-success" : "text-status-error")}>
                                                    {isBetter ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                                                    {Math.abs(diff)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bar */}
                                    <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden flex">
                                        <div
                                            className={cn("h-full transition-all", isBetter ? "bg-status-success" : isWorse ? "bg-status-error" : "bg-text-tertiary")}
                                            style={{ width: `${Math.min(currentVal, 100)}%` }}
                                        />
                                        {/* Show ghost bar of comparison? Maybe too complex for now */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
