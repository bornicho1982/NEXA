import { ClarityLine } from "@/lib/clarity/types";

// ─── DIM-Level Item Types ───
// Inspired by DIM's item-types.ts — used by the enrichment pipeline

/** A single stat on an item (weapon or armor) */
export interface DimStat {
    statHash: number;
    name: string;
    description?: string;
    value: number;       // Final value (with mods, masterwork, etc.)
    base: number;        // Base value from definition
    displayMaximum: number; // Max for the stat bar
    bar: boolean;        // Show as bar (true) or just number (false)
    smallerIsBetter: boolean;
    sort: number;        // Display ordering
}

/** A single plug (perk, mod, intrinsic, cosmetic, etc.) */
export interface DimPlug {
    plugHash: number;
    name: string;
    icon: string;
    description?: string;
    isEnabled: boolean;
    isActive: boolean;       // Is this the currently selected plug in the socket?
    energyCost?: number;
    stats?: Record<number, number>; // stat bonuses provided by this plug
    perks?: Array<{
        name: string;
        icon: string;
        description: string;
    }>;
    plugCategoryIdentifier?: string;
    plugCategoryHash?: number;
    clarityInfo?: ClarityLine[];
}

/** A socket on an item (a slot that holds a plug) */
export interface DimSocket {
    socketIndex: number;
    plug: DimPlug;           // Currently active plug
    plugOptions: DimPlug[];  // All available plugs for this socket
    isPerk: boolean;
    isMod: boolean;
    isIntrinsic: boolean;
    socketCategoryHash: number;
}

/** A category of sockets (e.g. "WEAPON PERKS", "ARMOR MODS") */
export interface DimSocketCategory {
    categoryHash: number;
    categoryName: string;
    categoryStyle: number;
    sockets: DimSocket[];
}

/** Objective progress (catalysts, bounties, deepsight, etc.) */
export interface ObjectiveProgress {
    objectiveHash: number;
    progress: number;
    completionValue: number;
    complete: boolean;
    description?: string;
}

/** Masterwork information extracted from sockets */
export interface MasterworkInfo {
    tier: number;          // 1-10
    statHash?: number;
    statName?: string;
    statValue?: number;    // Bonus from masterwork
}

/** Crafted item information */
export interface CraftedInfo {
    isCrafted: boolean;
    date?: string;         // ISO date of crafting
    level?: number;        // Weapon level
}

/** Deepsight resonance progress */
export interface DeepsightInfo {
    hasDeepsight: boolean;
    complete: boolean;
    progress: number;      // 0-1
    objectiveHash?: number;
}

/** Exotic catalyst information */
export interface CatalystInfo {
    unlocked: boolean;
    complete: boolean;
    inserted: boolean;     // Is the catalyst inserted?
    objectives?: ObjectiveProgress[];
}

/** Breaker type (champion mods) */
export interface BreakerInfo {
    breakerType: number;
    breakerTypeHash: number;
    name: string;
    icon: string;
    description?: string;
}
