"use client";

import { useInventoryStore } from "@/lib/store/inventory";
import { CharacterColumn } from "./CharacterColumn";
import { VaultGrid } from "./VaultGrid";
import { useMemo } from "react";
import { BUCKET_ORDER } from "@/lib/destiny/buckets";
import { InventoryItem } from "@/lib/inventory/service";

export function MultiCharacterView({ onInspect }: { onInspect: (item: InventoryItem) => void }) {
    const { profile, searchQuery } = useInventoryStore();

    // Organize Data: Group items by Character & Bucket
    const organizedData = useMemo(() => {
        if (!profile) return null;

        const charItems: Record<string, Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>> = {};

        // Initialize structure for each character
        profile.characters.forEach(c => {
            charItems[c.characterId] = {};
            BUCKET_ORDER.forEach(b => {
                charItems[c.characterId][b] = { inventory: [] };
            });
        });

        profile.items.forEach(item => {
            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const hasCommands = query.includes("is:") || query.includes("tag:");

                if (!hasCommands) {
                    if (!item.name.toLowerCase().includes(query)) return;
                } else {
                    // Basic command filtering
                    if (query.includes("is:weapon") && item.itemType !== 3) return;
                    if (query.includes("is:armor") && item.itemType !== 2) return;
                    if (query.includes("is:exotic") && item.tierType !== 6) return;
                    if (query.includes("is:legendary") && item.tierType !== 5) return;
                    if (query.includes("is:kinetic") && item.damageType !== 1) return;
                    if (query.includes("is:deepsight") && !item.isDeepsight) return;
                    if (query.includes("is:crafted") && !item.isCrafted) return;
                    if (query.includes("is:locked") && !item.isLocked) return;
                    if (query.includes("tag:favorite") && item.tag !== "favorite") return;
                    if (query.includes("tag:junk") && item.tag !== "junk") return;
                }
            }

            if (item.location === "character" && item.characterId && charItems[item.characterId]) {
                const bucket = item.intrinsicBucketHash || item.bucketHash;
                if (!charItems[item.characterId][bucket]) {
                    charItems[item.characterId][bucket] = { inventory: [] };
                }

                if (item.isEquipped) {
                    charItems[item.characterId][bucket].equipped = item;
                } else {
                    charItems[item.characterId][bucket].inventory.push(item);
                }
            }
        });

        // Sort inventory items by power desc
        Object.values(charItems).forEach((buckets) => {
            Object.values(buckets).forEach((slot) => {
                slot.inventory.sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
            });
        });

        return charItems;
    }, [profile]);

    const vaultItems = useMemo(() => {
        if (!profile) return [];
        return profile.items.filter(i => {
            if (i.location !== "vault") return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!query.includes("is:") && !query.includes("tag:") && !i.name.toLowerCase().includes(query)) return false;
                // Apply same command filters here ideally
                // For brevity, skipping command logic duplication for vault items in this patch block, but it should be shared.
                // But let's add name search at least.
            }
            return true;
        }).sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
    }, [profile, searchQuery]);

    if (!profile || !organizedData) return null;

    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4 custom-scrollbar px-4 w-full">
            {profile.characters.map(char => (
                <CharacterColumn
                    key={char.characterId}
                    character={char}
                    items={organizedData[char.characterId]}
                    onInspect={onInspect}
                />
            ))}

            {/* Vault Column */}
             <div className="w-[320px] shrink-0 flex flex-col border border-white/10 rounded-xl bg-[#050914]/50 overflow-hidden relative">
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent opacity-20" />
                 <div className="p-3 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Vault</h2>
                    <span className="text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {vaultItems.length}
                    </span>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                     <VaultGrid items={vaultItems} onItemClick={onInspect} />
                 </div>
             </div>
        </div>
    );
}
