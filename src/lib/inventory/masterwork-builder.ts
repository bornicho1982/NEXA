/**
 * Masterwork Builder — Extract masterwork info from item sockets
 *
 * Detects masterwork by examining socket plugs for known masterwork
 * plug category identifiers and extracts the stat bonus.
 */

import { getDefinition } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition, DestinyStatDefinition } from "@/types";
import type { DimSocket, MasterworkInfo } from "@/types/dim-types";

// Known masterwork plug category identifiers
const MASTERWORK_PLUG_CATEGORIES = [
    "v400.plugs.weapons.masterworks.stat",
    "v400.plugs.weapons.masterworks.trackers",
    "v400.plugs.armor.masterworks.stat",
    "masterworks.stat",
    "intrinsics",
];


/**
 * Build masterwork info from an item's sockets.
 */
export function buildMasterwork(
    sockets: DimSocket[] | undefined,
    itemState: number,
): MasterworkInfo | null {
    const isMasterwork = (itemState & 4) === 4;
    if (!isMasterwork) return null;

    if (!sockets?.length) {
        return { tier: 10 }; // Masterworked but no socket data
    }

    // Find the masterwork socket
    for (const socket of sockets) {
        const plugCatId = socket.plug.plugCategoryIdentifier || "";

        const isMwPlug = MASTERWORK_PLUG_CATEGORIES.some(c => plugCatId.includes(c));
        if (!isMwPlug) continue;

        // Extract masterwork stat and tier from the plug's investment stats
        const plugDef = getDefinition("DestinyInventoryItemDefinition", socket.plug.plugHash) as DestinyInventoryItemDefinition | null;
        if (!plugDef?.investmentStats?.length) continue;

        // Find the main stat bonus (non-conditional, non-zero)
        for (const stat of plugDef.investmentStats) {
            if (stat.isConditionallyActive || stat.value === 0) continue;

            const statDef = getDefinition("DestinyStatDefinition", stat.statTypeHash) as DestinyStatDefinition | null;

            return {
                tier: 10, // MW items are always tier 10 in D2 current
                statHash: stat.statTypeHash,
                statName: statDef?.displayProperties?.name,
                statValue: stat.value,
            };
        }
    }

    return { tier: 10 };
}
