"use client";

import { ItemCard } from "./ItemCard";
import type { InventoryItem } from "@/lib/inventory/service";
import { DroppableZone } from "./dnd/DroppableZone";

interface VaultGridProps {
    items: InventoryItem[];
    onItemClick?: (item: InventoryItem) => void;
}

export function VaultGrid({ items, onItemClick }: VaultGridProps) {
    return (
        <DroppableZone id="vault-main" data={{ type: "vault" }} className="h-full w-full">
            <div className="flex flex-wrap content-start" style={{ gap: "5px" }}>
                {items.map((item, index) => (
                    <ItemCard
                        key={`${item.itemInstanceId || item.itemHash}-${index}`}
                        item={item}
                        compact={false}
                        bucketHash={138197802}
                        onClick={() => onItemClick?.(item)}
                    />
                ))}
            </div>
        </DroppableZone>
    );
}
