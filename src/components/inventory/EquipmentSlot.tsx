"use client";

import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/service";
// ...
import Image from "next/image";
import { DroppableZone } from "./dnd/DroppableZone";
import { DraggableItem } from "./dnd/DraggableItem";

interface EquipmentSlotProps {
    item?: InventoryItem;
    category: string;
    bucketHash?: number;
    onClick?: () => void;
    compact?: boolean;
}

export function EquipmentSlot({ item, category, bucketHash, onClick, compact = false }: EquipmentSlotProps) {
    const BUNGIE_ROOT = "https://www.bungie.net";
    const slotId = bucketHash ? `equipment-${bucketHash}` : "unknown-slot";

    if (!item) {
        return (
            <DroppableZone id={slotId} data={{ type: "equipment", bucketHash }} className="h-full w-full rounded-sm">
                <div className="relative aspect-square rounded-sm border border-white/5 bg-white/5 flex items-center justify-center group hover:bg-white/10 transition-colors cursor-pointer" onClick={onClick}>
                    {!compact && <span className="text-[8px] uppercase font-bold text-white/20 group-hover:text-white/40 tracking-widest">{category}</span>}
                </div>
            </DroppableZone>
        );
    }

    const isMasterwork = item.isMasterwork;
    const isExotic = item.tierType === 6;

    const draggable = (
        <DraggableItem
            id={item.itemInstanceId || `hash-${item.itemHash}`}
            data={{ type: "item", item, fromBucket: bucketHash }}
            item={item}
            className="h-full w-full"
        >
            <div
                className="group relative aspect-square cursor-pointer transition-transform hover:scale-105 h-full w-full"
                onClick={onClick}
            >
                {/* 🖼️ Item Icon */}
                <div className={cn(
                    "relative h-full w-full overflow-hidden rounded-sm border bg-[#1e293b]",
                    isExotic ? "border-yellow-500" : isMasterwork ? "border-gold-primary" : "border-white/20"
                )}>
                    {/* Reverted to <img> to avoid constructor crash -> Now using Next Image properly */}
                    <Image
                        src={`${BUNGIE_ROOT}${item.icon}`}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />

                    {/* 🌑 Overlay Gradient (Bottom) */}
                    {!compact && <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />}

                    {/* ⚡ Power Level */}
                    {item.primaryStat && (
                        <div className="absolute bottom-0 right-0.5 text-[10px] font-bold text-yellow-400 font-mono-stat drop-shadow-md leading-none">
                            {item.primaryStat}
                        </div>
                    )}
                </div>

                {/* ✨ Masterwork Overlay */}
                {isMasterwork && (
                    <div className="absolute -inset-0.5 rounded-sm bg-gold-primary/30 blur-sm -z-10 group-hover:bg-gold-primary/50 transition-all" />
                )}
            </div>
        </DraggableItem>
    );

    return (
        <DroppableZone id={slotId} data={{ type: "equipment", bucketHash }} className="h-full w-full rounded-sm">
            {draggable}
        </DroppableZone>
    );
}
