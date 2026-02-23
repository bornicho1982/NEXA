import { useMemo } from "react";
import { useInventoryStore } from "@/lib/store/inventory";
import { BUCKET_ORDER } from "@/lib/destiny/buckets";
import { InventoryItem } from "@/lib/inventory/service";

export function useInventoryData(search: string = "") {
    const { profile } = useInventoryStore();

    const organizedData = useMemo(() => {
        if (!profile) return null;

        const charItems: Record<string, Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>> = {};

        // Initialize
        profile.characters.forEach(c => {
            charItems[c.characterId] = {};
            BUCKET_ORDER.forEach(b => {
                charItems[c.characterId][b] = { inventory: [] };
            });
        });

        profile.items.forEach(item => {
            // Filter by search
            if (search) {
                const query = search.toLowerCase();
                // Simple search for now, could be advanced
                // Check if search contains commands
                const hasCommands = query.includes("is:") || query.includes("tag:");

                if (!hasCommands) {
                    if (!item.name.toLowerCase().includes(query)) return;
                } else {
                     // Parse commands (basic)
                     // Implementation of filter logic moved here or kept simple?
                     // Let's implement basic checks
                     if (query.includes("is:weapon") && item.itemType !== 3) return;
                     if (query.includes("is:armor") && item.itemType !== 2) return;
                     if (query.includes("is:exotic") && item.tierType !== 6) return;
                     if (query.includes("is:legendary") && item.tierType !== 5) return;
                     if (query.includes("is:kinetic") && item.damageType !== 1) return; // 1 is Kinetic? Check types
                     if (query.includes("is:energy") && item.damageType !== 2 && item.damageType !== 3 && item.damageType !== 4) return;
                     // ...
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

        // Sort
        Object.values(charItems).forEach((buckets) => {
            Object.values(buckets).forEach((slot) => {
                slot.inventory.sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
            });
        });

        return charItems;
    }, [profile, search]);

    const vaultItems = useMemo(() => {
        if (!profile) return [];
        return profile.items.filter(i => {
            if (i.location !== "vault") return false;
            if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false; // Basic check
            return true;
        }).sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
    }, [profile, search]);

    return { organizedData, vaultItems };
}
