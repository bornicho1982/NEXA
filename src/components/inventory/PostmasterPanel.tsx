"use client";

import { useInventoryStore } from "@/lib/store/inventory";
import { ItemCard } from "./ItemCard";
import { cn } from "@/lib/utils";
import { DroppableZone } from "./dnd/DroppableZone";

interface PostmasterPanelProps {
    characterId: string;
}

export function PostmasterPanel({ characterId }: PostmasterPanelProps) {
    const { profile } = useInventoryStore();

    // Filter items
    const items = profile?.items.filter(i =>
        i.location === "postmaster" && i.characterId === characterId
    ) || [];

    const count = items.length;
    const isFull = count >= 21;

    return (
        <DroppableZone
            id={`postmaster-${characterId}`}
            data={{ type: "postmaster", characterId }}
            className={cn(
                "p-3 rounded-lg border bg-black/20 backdrop-blur-sm transition-colors",
                isFull ? "border-red-500/50 bg-red-500/5 animate-pulse" : "border-white/10 hover:border-white/20"
            )}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                    Postmaster
                    {isFull && <span className="text-red-400">(!)</span>}
                </h3>
                <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded",
                    isFull ? "bg-red-500 text-white" : "bg-white/10 text-text-tertiary"
                )}>
                    {count}/21
                </span>
            </div>

            <div className="flex flex-wrap gap-1 min-h-[50px]">
                {items.map(item => (
                    <ItemCard
                        key={item.itemInstanceId || item.itemHash}
                        item={item}
                        compact
                        // No onClick for now, dragging is primary
                    />
                ))}
                {items.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-text-tertiary italic opacity-50">
                        Empty
                    </div>
                )}
            </div>
        </DroppableZone>
    );
}
