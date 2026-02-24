"use client";

import { ItemCard } from "@/components/inventory/ItemCard";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/service";

export function BucketSection({ label, bucket, data, simple = false, compact = false, onItemClick }: { label: string, bucket: number, data?: { equipped?: InventoryItem, inventory: InventoryItem[] }, simple?: boolean, compact?: boolean, onItemClick?: (item: InventoryItem) => void }) {
    if (!data) return null;

    return (
        <div id={`bucket-${bucket}`} className={cn("rounded group/bucket", simple ? "" : "mb-1")}>
            {/* Header */}
            {!simple && (
                <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider group-hover/bucket:text-text-secondary transition-colors">{label}</span>
                </div>
            )}

            <div className={cn("flex items-start flex-wrap", simple ? "flex-col items-center gap-1" : "flex-row")} style={{ gap: simple ? undefined : "5px" }}>
                {/* 🟢 Equipped Item */}
                <div className="shrink-0 relative">
                    {!simple && <div className="absolute -left-1.5 inset-y-2 w-0.5 bg-gold-primary/50 rounded-full opacity-60" />}
                    <ItemCard
                        item={data.equipped}
                        category={label}
                        bucketHash={bucket}
                        compact={compact}
                        isEquipped={true}
                        onClick={() => data.equipped && onItemClick?.(data.equipped)}
                    />
                </div>

                {/* 🔳 Inventory Grid (Larger Items - 4 cols) */}
                {!simple && (
                    <div className="flex flex-wrap w-[287px]" style={{ gap: "5px" }}>
                        {data.inventory.slice(0, 9).map((item, index) => (
                            <ItemCard
                                key={`${item.itemInstanceId || item.itemHash}-${index}`}
                                item={item}
                                compact={compact}
                                onClick={() => onItemClick?.(item)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
