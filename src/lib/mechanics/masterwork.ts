import type { ItemProps } from "@/components/inventory/ItemCard";

/**
 * Calculates the stats contributed by Masterworking.
 * In Destiny 2, a fully masterworked item (Tier 10) grants +2 to all stats.
 * Class items also grant +2 to all stats when masterworked.
 */
export function getMasterworkBonus(item: ItemProps['item']): Record<string, number> {
    const bonus: Record<string, number> = {
        Mobility: 0,
        Resilience: 0, // Will be mapped to Health later
        Recovery: 0,
        Discipline: 0,
        Intellect: 0,
        Strength: 0
    };

    // Check if item is Masterworked
    // Note: In our ItemProps, isMasterwork is a boolean pre-calculated by the inventory service.
    // This simplifies checks compared to inspecting energy capacity manually.
    const isMasterworked = item?.itemInstanceId && item.isMasterwork;

    if (isMasterworked) {
        for (const key of Object.keys(bonus)) {
            bonus[key] = 2;
        }
    }

    return bonus;
}

/**
 * Calculates bonuses from Artifice Armor sockets.
 * Assumes the plug selector will pass the chosen stat hash.
 */
export function getArtificeBonus(selectedArtificeStatHash: number | null): Record<string, number> {
    const bonus: Record<string, number> = {
        Mobility: 0,
        Resilience: 0,
        Recovery: 0,
        Discipline: 0,
        Intellect: 0,
        Strength: 0
    };

    if (!selectedArtificeStatHash) return bonus;

    // Map Hash to Name (Simplified for MVP, ideally centralized)
    const STAT_MAP: Record<number, string> = {
        2996146975: "Mobility",
        392767087: "Resilience",
        1943323491: "Recovery",
        1735777505: "Discipline",
        144602215: "Intellect",
        4244567218: "Strength"
    };

    const statName = STAT_MAP[selectedArtificeStatHash];
    if (statName) {
        bonus[statName] = 3; // Artifice gives +3 free stat
    }

    return bonus;
}
