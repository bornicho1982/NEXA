"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/service";
import { DraggableItem } from "./dnd/DraggableItem";
import { DroppableZone } from "./dnd/DroppableZone";
import { ItemTooltip } from "./ItemTooltip";
import { DIMItemTile } from "./DIMItemTile";

export interface ItemCardProps {
    item?: InventoryItem;
    bucketHash?: number;
    category?: string;
    onClick?: () => void;
    compact?: boolean;
    isEquipped?: boolean;
    className?: string;
}

export function ItemCard({ item, bucketHash, category, onClick, compact = false, isEquipped = false, className }: ItemCardProps) {
    const slotId = bucketHash ? `equipment-${bucketHash}` : "unknown-slot";

    // Tooltip State
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const hovering = !!anchorEl;

    // 1. Empty Slot State
    if (!item) {
        return (
            <DroppableZone id={slotId} data={{ type: "equipment", bucketHash }} className={cn("rounded-sm relative group", compact ? "w-[48px] h-[48px]" : "w-[68px] h-[68px]")}>
                <div className={cn(
                    "w-full h-full border border-white/5 bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10",
                    isEquipped ? "border-white/10" : ""
                )}>
                    {!compact && category && (
                        <span className="text-[8px] uppercase font-bold text-white/20 group-hover:text-white/40 tracking-widest">{category[0]}</span>
                    )}
                    {/* Overlay for equipment slot specific styling if needed */}
                    {isEquipped && <div className="absolute inset-0 border border-white/10 pointer-events-none" />}
                </div>
            </DroppableZone>
        );
    }

    // 2. Item Card Content (Authentic DIM Style)
    const cardContent = (
        <div
            className="relative cursor-pointer transition-all hover:scale-[1.03] active:scale-95 w-fit h-fit"
            onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
            onMouseLeave={() => setAnchorEl(null)}
        >
            <DIMItemTile
                item={item}
                onClick={onClick}
                compact={compact}
            />
            {/* Tooltip Portal */}
            <ItemTooltip item={item} anchorEl={anchorEl} visible={hovering} />
        </div>
    );

    // 3. Wrapper Logic (Draggable vs Just Card)
    const fromBucket = bucketHash || item.bucketHash;

    return (
        <DraggableItem
            id={item.itemInstanceId || item.itemHash.toString()}
            data={{ type: "item", item, fromBucket }}
            item={item}
            className={className}
        >
            {isEquipped ? (
                <DroppableZone id={slotId} data={{ type: "equipment", bucketHash }} className="">
                    {cardContent}
                </DroppableZone>
            ) : (
                cardContent
            )}
        </DraggableItem>
    );
}
