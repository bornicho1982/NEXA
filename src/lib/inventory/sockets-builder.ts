/**
 * Sockets Builder — DIM-style socket processing
 * 
 * Parses Bungie socket data into categorized, structured DimSocket[] grouped
 * into DimSocketCategory[]. Handles:
 * - Socket categories (Weapon Perks, Armor Mods, Intrinsic, Cosmetics)
 * - Current plug + available plug options (from reusable plugs)
 * - Perk columns with all rollable alternatives
 */

import { getDefinition } from "@/lib/manifest/service";
import type {
    DestinyInventoryItemDefinition,
    DestinySocketCategoryDefinition,
    DestinySocketTypeDefinition,
} from "@/types";
import type { DimSocket, DimSocketCategory, DimPlug } from "@/types/dim-types";
import type { ClarityDatabase } from "@/lib/clarity/types";

// ─── Known Socket Category Styles (from Bungie) ───
// 0 = Unknown, 1 = Reusable, 2 = Consumable, 3 = Unlockable, 4 = Intrinsic, 5 = EnergyMeter, 6 = LargePerk, 7 = Abilities, 8 = Supers
const PERK_CATEGORY_STYLES = [0, 1, 2, 3]; // Styles that typically represent perks/traits
// Intrinsic: both style 4 (classic Intrinsic) and style 6 (LargePerk, used by weapon frames)
const INTRINSIC_CATEGORY_STYLES = [4, 6];

// Known plug category identifiers that are cosmetic / non-functional
const COSMETIC_PLUG_CATEGORIES = [
    "shader",
    "hologram",
    "emote_collection",
    "ornaments",
    "armor_skins_empty",
    "weapon_ornament",
    "vehicle_skins",
    "ghost_skins",
];

// Known plug category identifiers for mods
const MOD_PLUG_CATEGORIES = [
    "enhancements.general",
    "enhancements.head",
    "enhancements.arms",
    "enhancements.chest",
    "enhancements.legs",
    "enhancements.class_item",
    "enhancements.activity",
    "enhancements.raid",
    "enhancements.seasonal",
    "v400.weapon.mod_empty",
    "v400.weapon.mod_damage",
    "v400.weapon.mod_magazine",
    "v400.weapon.mod_guns",
];

// ─── Bungie Raw Socket Types ───

interface BungieSocketState {
    plugHash?: number;
    isEnabled: boolean;
    isVisible: boolean;
    enableFailIndexes?: number[];
}

interface BungieReusablePlug {
    plugItemHash: number;
    canInsert: boolean;
    enabled: boolean;
}

// ─── Public API ───

/**
 * Build the full socket structure for an item.
 * 
 * @param itemDef - The item's manifest definition
 * @param socketStates - Live socket states from the profile (component 305)
 * @param reusablePlugs - Reusable plug data from the profile (component 310)
 */
export function buildSockets(
    itemDef: DestinyInventoryItemDefinition,
    socketStates?: BungieSocketState[],
    reusablePlugs?: Record<number, BungieReusablePlug[]>,
    clarityDb?: ClarityDatabase,
): { sockets: DimSocket[]; socketCategories: DimSocketCategory[] } | null {
    if (!itemDef.sockets?.socketEntries?.length) {
        return null;
    }

    const allSockets: DimSocket[] = [];

    // Build each socket
    for (let i = 0; i < itemDef.sockets.socketEntries.length; i++) {
        const entry = itemDef.sockets.socketEntries[i];
        const state = socketStates?.[i];

        // Determine the current plug hash
        const currentPlugHash = state?.plugHash ?? entry.singleInitialItemHash;
        if (!currentPlugHash) continue;

        // Get the socket type definition for categorization
        const socketTypeDef = getDefinition("DestinySocketTypeDefinition", entry.socketTypeHash) as DestinySocketTypeDefinition | null;
        const socketCategoryHash = socketTypeDef?.socketCategoryHash ?? 0;

        // Build the current plug
        const currentPlug = buildPlug(currentPlugHash, true, state?.isEnabled ?? true, clarityDb);
        if (!currentPlug) continue;

        // Build plug options (alternatives)
        const plugOptions: DimPlug[] = [];

        // 1. From reusable plugs (component 310) — live data
        if (reusablePlugs?.[i]?.length) {
            for (const rp of reusablePlugs[i]) {
                const plug = buildPlug(rp.plugItemHash, rp.plugItemHash === currentPlugHash, rp.enabled, clarityDb);
                if (plug) plugOptions.push(plug);
            }
        }

        // 2. From definition's reusablePlugSetHash — fallback if no live data
        if (plugOptions.length === 0 && entry.reusablePlugSetHash) {
            const plugSetDef = getDefinition("DestinyPlugSetDefinition", entry.reusablePlugSetHash);
            if (plugSetDef && typeof plugSetDef === "object" && "reusablePlugItems" in plugSetDef) {
                const typedPlugSet = plugSetDef as { reusablePlugItems: Array<{ plugItemHash: number; currentlyCanItRoll: boolean }> };
                for (const rpi of typedPlugSet.reusablePlugItems) {
                    if (!rpi.currentlyCanItRoll) continue;
                    const plug = buildPlug(rpi.plugItemHash, rpi.plugItemHash === currentPlugHash, true, clarityDb);
                    if (plug) plugOptions.push(plug);
                }
            }
        }

        // 3. From randomizedPlugSetHash — random rolls
        if (plugOptions.length === 0 && entry.randomizedPlugSetHash) {
            const plugSetDef = getDefinition("DestinyPlugSetDefinition", entry.randomizedPlugSetHash);
            if (plugSetDef && typeof plugSetDef === "object" && "reusablePlugItems" in plugSetDef) {
                const typedPlugSet = plugSetDef as { reusablePlugItems: Array<{ plugItemHash: number; currentlyCanItRoll: boolean }> };
                for (const rpi of typedPlugSet.reusablePlugItems) {
                    const plug = buildPlug(rpi.plugItemHash, rpi.plugItemHash === currentPlugHash, true, clarityDb);
                    if (plug) plugOptions.push(plug);
                }
            }
        }

        // Ensure current plug is in options
        if (!plugOptions.find(p => p.plugHash === currentPlugHash)) {
            plugOptions.unshift(currentPlug);
        }

        // Classify the socket
        const plugCatId = currentPlug.plugCategoryIdentifier || "";
        const isPerk = PERK_CATEGORY_STYLES.includes(getCategoryStyle(socketCategoryHash))
            && !COSMETIC_PLUG_CATEGORIES.some(c => plugCatId.includes(c))
            && !MOD_PLUG_CATEGORIES.some(c => plugCatId.includes(c));
        const isMod = MOD_PLUG_CATEGORIES.some(c => plugCatId.includes(c));
        const isIntrinsic = INTRINSIC_CATEGORY_STYLES.includes(getCategoryStyle(socketCategoryHash));

        allSockets.push({
            socketIndex: i,
            plug: currentPlug,
            plugOptions,
            isPerk,
            isMod,
            isIntrinsic,
            socketCategoryHash,
        });
    }

    // Group sockets into categories
    const socketCategories = buildSocketCategories(itemDef, allSockets);

    return { sockets: allSockets, socketCategories };
}

// ─── Internal Helpers ───

/**
 * Build a DimPlug from a plug hash.
 */
function buildPlug(
    plugHash: number,
    isActive: boolean,
    isEnabled: boolean,
    clarityDb?: ClarityDatabase,
): DimPlug | null {
    const plugDef = getDefinition("DestinyInventoryItemDefinition", plugHash) as DestinyInventoryItemDefinition | null;
    if (!plugDef || !plugDef.displayProperties?.name) return null;

    // Extract stats provided by this plug
    const stats: Record<number, number> = {};
    if (plugDef.investmentStats) {
        for (const s of plugDef.investmentStats) {
            if (!s.isConditionallyActive && s.value !== 0) {
                stats[s.statTypeHash] = s.value;
            }
        }
    }

    // Extract perks from the plug
    const perks = plugDef.perks?.filter(p => p.isActive)?.map(p => {
        const perkDef = getDefinition("DestinySandboxPerkDefinition", p.perkHash);
        const typedPerk = perkDef as { displayProperties?: { name?: string; icon?: string; description?: string }; isDisplayable?: boolean } | null;
        if (!typedPerk?.displayProperties?.name || !typedPerk.isDisplayable) return null;
        return {
            name: typedPerk.displayProperties.name,
            icon: typedPerk.displayProperties.icon || "",
            description: typedPerk.displayProperties.description || "",
        };
    }).filter(Boolean) as DimPlug["perks"];

    // Extract Clarity info
    const clarityInfo = clarityDb?.[plugHash.toString()]?.descriptions?.en;

    return {
        plugHash,
        name: plugDef.displayProperties.name,
        icon: plugDef.displayProperties.icon || "",
        description: plugDef.displayProperties.description,
        isEnabled,
        isActive,
        energyCost: plugDef.plug?.energyCost?.energyCost,
        stats: Object.keys(stats).length > 0 ? stats : undefined,
        perks: perks && perks.length > 0 ? perks : undefined,
        plugCategoryIdentifier: plugDef.plug?.plugCategoryIdentifier,
        plugCategoryHash: plugDef.plug?.plugCategoryHash,
        clarityInfo,
    };
}

/**
 * Get the category style from a socket category hash.
 */
function getCategoryStyle(socketCategoryHash: number): number {
    const catDef = getDefinition("DestinySocketCategoryDefinition", socketCategoryHash) as DestinySocketCategoryDefinition | null;
    return catDef?.categoryStyle ?? 0;
}

/**
 * Group sockets into DimSocketCategory[] using the item definition's socketCategories.
 */
function buildSocketCategories(
    itemDef: DestinyInventoryItemDefinition,
    allSockets: DimSocket[],
): DimSocketCategory[] {
    if (!itemDef.sockets?.socketCategories) return [];

    const categories: DimSocketCategory[] = [];
    const socketsByIndex = new Map(allSockets.map(s => [s.socketIndex, s]));

    for (const cat of itemDef.sockets.socketCategories) {
        const catDef = getDefinition("DestinySocketCategoryDefinition", cat.socketCategoryHash) as DestinySocketCategoryDefinition | null;

        const categorySockets = cat.socketIndexes
            .map(i => socketsByIndex.get(i))
            .filter((s): s is DimSocket => s !== undefined);

        if (categorySockets.length === 0) continue;

        categories.push({
            categoryHash: cat.socketCategoryHash,
            categoryName: catDef?.displayProperties?.name || "Unknown",
            categoryStyle: catDef?.categoryStyle ?? 0,
            sockets: categorySockets,
        });
    }

    return categories;
}
