"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { DraggableItem } from "./DraggableItem";
import { Search, Filter } from "lucide-react";
import { VirtualGrid } from "@/components/inventory/VirtualGrid"; // Reusing VirtualGrid for performance
// We need to adapt VirtualGrid to render DraggableItem instead of ItemCard, 
// OR we make DraggableItem a wrapper around ItemCard and let VirtualGrid render it?
// VirtualGrid renders ItemCard directly. We might need a "DraggableVirtualGrid" or make VirtualGrid generic.
// For now, let's just render a standard flex grid since filtered views might not be massive, 
// or copy VirtualGrid logic if needed. Let's stick to standard grid for simplicity first.

import { Input } from "@/components/ui/components"; // Assuming Input exists
import { cn } from "@/lib/utils";

interface ItemPickerProps {
    className?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ItemPicker({ className }: ItemPickerProps) {
    const { data, error, isLoading } = useSWR("/api/inventory", fetcher);
    // data.items is InventoryItem[]

    const [search, setSearch] = useState("");
    const [filterBucket, setFilterBucket] = useState<number | null>(null); // e.g. only Helmets

    const items = data?.items || [];

    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter((item: any) => {
            // Filter by name
            if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;

            // Filter by bucket (if implemented later)
            // if (filterBucket && item.bucketHash !== filterBucket) return false;

            // Exclude items that are not functional/equippable (materials, etc) - though getProfile usually returns instances
            // We want weapons and armor
            if (item.itemType !== 2 && item.itemType !== 3) return false;

            return true;
        });
    }, [items, search, filterBucket]);

    return (
        <div className={cn("flex flex-col h-full bg-bg-secondary border-l border-border-subtle", className)}>
            <div className="p-4 border-b border-border-subtle space-y-3">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Filter size={16} className="text-gold-primary" />
                    Vault Storage
                </h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 text-text-tertiary" size={14} />
                    <input
                        className="w-full bg-bg-tertiary border border-border-medium rounded-md py-2 pl-8 pr-3 text-xs text-text-primary focus:border-gold-primary outline-none transition-colors"
                        placeholder="Search gear..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-bg-tertiary rounded-sm animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 pb-20">
                        {filteredItems.map((item: any) => (
                            <DraggableItem
                                key={item.itemInstanceId || item.itemHash}
                                id={item.itemInstanceId || String(item.itemHash)}
                                item={item}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
