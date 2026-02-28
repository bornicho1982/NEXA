"use client";

import { useBuildStore } from "@/lib/store/build-crafter";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

// Stat Hashes (Centralized in mechanics/stats.ts ideally, but inline for speed now)
const STAT_OPTIONS = [
    { hash: 2996146975, name: "Mobility", icon: "🍃" },
    { hash: 392767087, name: "Health", icon: "❤️" }, // Resilience -> Health
    { hash: 1943323491, name: "Recovery", icon: "❤️‍🩹" },
    { hash: 1735777505, name: "Discipline", icon: "💣" },
    { hash: 144602215, name: "Intellect", icon: "🧠" },
    { hash: 4244567218, name: "Strength", icon: "👊" },
];

interface ArtificeSelectorProps {
    bucketHash: number;
    className?: string;
}

export function ArtificeSelector({ bucketHash, className }: ArtificeSelectorProps) {
    const { artificeMods, setArtificeMod, armor } = useBuildStore();
    const [isOpen, setIsOpen] = useState(false);

    const equippedItem = armor[bucketHash];
    const selectedHash = artificeMods[bucketHash];
    const selectedOption = STAT_OPTIONS.find(o => o.hash === selectedHash);

    // Only show if armor is Artifice (Mocked check: In real app check item.sockets for Artifice socket)
    // For manual testing, we'll assume any Masterworked Legendary/Exotic *could* be Artifice in this UI demo
    // or strictly check a flag. Let's make it always visible if an item is equipped for Phase 8 demo.
    if (!equippedItem) return null;

    // MOCK: In production, check `if (!equippedItem.isArtifice) return null;`
    // For now, we show it for all items to demonstrate the mechanic.

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1 bg-bg-tertiary border border-border-subtle rounded text-xs hover:bg-bg-secondary transition-colors w-full justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="text-wd-primary-400 text-[10px] uppercase font-bold tracking-wider">Artifice</span>
                    {selectedOption ? (
                        <span className="flex items-center gap-1 text-text-primary">
                            <span>{selectedOption.icon}</span>
                            <span>{selectedOption.name}</span>
                        </span>
                    ) : (
                        <span className="text-text-tertiary italic">Select Bonus...</span>
                    )}
                </div>
                <ChevronDown size={12} className={cn("text-text-tertiary transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-medium rounded shadow-xl z-50 overflow-hidden">
                    {STAT_OPTIONS.map((option) => (
                        <button
                            key={option.hash}
                            onClick={() => {
                                setArtificeMod(bucketHash, option.hash);
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-bg-tertiary transition-colors text-left"
                        >
                            <span className="flex items-center gap-2 text-text-secondary group-hover:text-text-primary">
                                <span>{option.icon}</span>
                                <span>{option.name} (+3)</span>
                            </span>
                            {selectedHash === option.hash && <Check size={12} className="text-wd-primary-400" />}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setArtificeMod(bucketHash, null);
                            setIsOpen(false);
                        }}
                        className="w-full px-3 py-2 text-[10px] text-text-tertiary hover:text-red-400 hover:bg-bg-tertiary text-left uppercase tracking-wider"
                    >
                        Remove Mod
                    </button>
                </div>
            )}
        </div>
    );
}
