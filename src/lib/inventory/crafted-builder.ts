/**
 * Crafted Builder — Extract crafted item information from sockets
 *
 * Crafted items have special sockets with date, level, and enhanced perks.
 */

import type { CraftedInfo } from "@/types/dim-types";

/**
 * Build crafted info from item state.
 */
export function buildCraftedInfo(
    itemState: number,
): CraftedInfo | null {
    const isCrafted = (itemState & 8) === 8;
    if (!isCrafted) return null;

    return {
        isCrafted: true,
        // Date and level would need objectives component data (309)
        // which is parsed at a higher level. For now, we flag it as crafted.
        date: undefined,
        level: undefined,
    };
}

