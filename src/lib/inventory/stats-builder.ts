/**
 * Stats Builder — DIM-style stat computation
 *
 * Computes item stats with proper interpolation from StatGroupDefinition,
 * handling both weapon stats (RPM, Range, Stability, etc.) and armor stats
 * (Mobility, Resilience, Recovery, etc.).
 *
 * Follows DIM's stats.ts approach:
 * 1. Get investment stats from definition
 * 2. Override with instance stats (which include mod/masterwork bonuses)
 * 3. Apply display interpolation from StatGroupDefinition
 * 4. Sort and label stats
 */

import { getDefinition, getAllDefinitions } from "@/lib/manifest/service";
import type {
    DestinyInventoryItemDefinition,
    DestinyStatDefinition,
    DestinyStatGroupDefinition,
} from "@/types";
import type { DimStat } from "@/types/dim-types";

// ─── Stat Hashes ───

export const ARMOR_STAT_HASHES = {
    mobility: 2996146975,
    resilience: 392767087,
    recovery: 1943323491,
    discipline: 1735777505,
    intellect: 144602215,
    strength: 4244567218,
} as const;

// Weapon stat display order (DIM's itemStatAllowList)
const WEAPON_STAT_ORDER: number[] = [
    4284893193,  // RPM (Rounds Per Minute)
    2961396640,  // Charge Time
    447667954,   // Draw Time
    3614673599,  // Blast Radius
    2523465841,  // Velocity
    3871231066,  // Persistence (unused mostly)
    2837207746,  // Swing Speed
    4043523819,  // Impact
    1240592695,  // Range
    1842278586,  // Shield Duration
    2762071195,  // Guard Efficiency
    209426660,   // Guard Resistance
    1591432999,  // Accuracy
    155624089,   // Stability
    943549884,   // Handling
    2578857883,  // Vent Speed / Charge Rate
    3022301683,  // Guard Endurance
    4188031367,  // Reload Speed
    1345609583,  // Aim Assistance
    2714457168,  // Airborne Effectiveness
    3555269338,  // Zoom
    3871231066,  // Ammo Generation (unused)
    // Heat Generated, Cooling Efficiency — new Dual Destiny era stats
    2715839340,  // Recoil Direction
    3871231066,  // Magazine  (overrides below)
    925767036,   // Ammo Capacity
];

// Magazine stat hash specifically
const STAT_MAGAZINE = 3871231066; // Note: This may vary; we use it as a flag
const STAT_RPM = 4284893193;
const STAT_CHARGE_TIME = 2961396640;
const STAT_DRAW_TIME = 447667954;
const STAT_RECOIL = 2715839340;

// Stats that show as just a number (no bar)
const STATS_NO_BAR = new Set([STAT_RPM, STAT_MAGAZINE, STAT_RECOIL, STAT_CHARGE_TIME, STAT_DRAW_TIME]);

// Stats where lower is better
const STATS_SMALLER_IS_BETTER = new Set([STAT_CHARGE_TIME, STAT_DRAW_TIME]);

// ─── Public API ───

/**
 * Build complete stat list for an item.
 * Returns null if the item has no meaningful stats.
 */
export function buildStats(
    itemDef: DestinyInventoryItemDefinition,
    instanceStats?: Record<string, { value: number }>,
): DimStat[] | null {
    if (!itemDef.stats?.statGroupHash) return null;

    const statGroup = getDefinition("DestinyStatGroupDefinition", itemDef.stats.statGroupHash) as DestinyStatGroupDefinition | null;
    if (!statGroup) return null;

    // Build a lookup of display interpolation by stat hash
    const scaledStatLookup = new Map(
        statGroup.scaledStats.map(s => [s.statHash, s])
    );

    // Determine which stat hashes this item has
    const statHashes = new Set<number>();

    // From definition stats
    if (itemDef.stats.stats) {
        for (const key of Object.keys(itemDef.stats.stats)) {
            statHashes.add(Number(key));
        }
    }

    // From investment stats
    if (itemDef.investmentStats) {
        for (const is of itemDef.investmentStats) {
            if (!is.isConditionallyActive) {
                statHashes.add(is.statTypeHash);
            }
        }
    }

    // From instance stats
    if (instanceStats) {
        for (const key of Object.keys(instanceStats)) {
            statHashes.add(Number(key));
        }
    }

    const isWeapon = itemDef.itemType === 3;
    const isArmor = itemDef.itemType === 2;
    const results: DimStat[] = [];

    for (const statHash of statHashes) {
        const statDef = getDefinition("DestinyStatDefinition", statHash) as DestinyStatDefinition | null;
        if (!statDef?.displayProperties?.name) continue;

        // Get base value from definition
        const baseValue = getBaseStatValue(itemDef, statHash);

        // Get live value (includes mods, masterwork, etc.)
        const liveValue = instanceStats?.[String(statHash)]?.value;
        const value = liveValue ?? baseValue;

        if (value === 0 && !isArmor) continue; // Skip zero stats for weapons (armor can have 0)

        // Get the scaled stat info for this stat
        const scaledStat = scaledStatLookup.get(statHash);

        // Apply display interpolation for weapons
        let displayValue = value;
        const displayMaximum = scaledStat?.maximumValue || statGroup.maximumValue || 100;

        if (scaledStat?.displayInterpolation && !scaledStat.displayAsNumeric) {
            displayValue = interpolateStat(value, scaledStat.displayInterpolation);
        }

        // Determine display properties
        const bar = !STATS_NO_BAR.has(statHash) && !scaledStat?.displayAsNumeric;
        const smallerIsBetter = STATS_SMALLER_IS_BETTER.has(statHash);

        // Sort order
        let sort: number;
        if (isWeapon) {
            const weaponOrder = WEAPON_STAT_ORDER.indexOf(statHash);
            sort = weaponOrder >= 0 ? weaponOrder : 999;
        } else if (isArmor) {
            const armorHashes = Object.values(ARMOR_STAT_HASHES) as readonly number[];
            const armorOrder = armorHashes.indexOf(statHash);
            sort = armorOrder >= 0 ? armorOrder : 999;
        } else {
            sort = 999;
        }

        // Skip stats not in our allowlists for clarity
        if (isWeapon && sort >= 999) continue;
        if (isArmor && sort >= 999) continue;

        results.push({
            statHash,
            name: statDef.displayProperties.name,
            description: statDef.displayProperties.description,
            value: displayValue,
            base: baseValue,
            displayMaximum,
            bar,
            smallerIsBetter,
            sort,
        });
    }

    // Sort by display order
    results.sort((a, b) => a.sort - b.sort);

    // Add total stat for armor
    if (isArmor && results.length > 0) {
        const total = results.reduce((sum, s) => sum + s.value, 0);
        const baseTotal = results.reduce((sum, s) => sum + s.base, 0);
        results.push({
            statHash: -1,
            name: "Total",
            value: total,
            base: baseTotal,
            displayMaximum: 800,
            bar: false,
            smallerIsBetter: false,
            sort: 100,
        });
    }

    return results.length > 0 ? results : null;
}

/**
 * Get the stat names for the existing simple Record<string, number> stats
 * that NEXA currently stores — used to bridge old and new systems.
 */
export function getStatNameMap(): Record<number, string> {
    const allStats = getAllDefinitions("DestinyStatDefinition");
    if (!allStats) return {};

    const map: Record<number, string> = {};
    for (const [hash, def] of Object.entries(allStats)) {
        const typedDef = def as DestinyStatDefinition;
        if (typedDef.displayProperties?.name) {
            map[Number(hash)] = typedDef.displayProperties.name;
        }
    }
    return map;
}

// ─── Internal Helpers ───

/**
 * Get the base stat value from the item definition.
 */
function getBaseStatValue(
    itemDef: DestinyInventoryItemDefinition,
    statHash: number,
): number {
    // From definition stats
    const defStat = itemDef.stats?.stats?.[String(statHash)];
    if (defStat) return defStat.value;

    // From investment stats
    if (itemDef.investmentStats) {
        const inv = itemDef.investmentStats.find(s => s.statTypeHash === statHash && !s.isConditionallyActive);
        if (inv) return inv.value;
    }

    return 0;
}

/**
 * Apply display interpolation to a stat value.
 * DIM's interpolation uses the displayInterpolation array from StatGroupDefinition
 * to map raw values to display values (typically 0-100 for bar display).
 */
function interpolateStat(
    value: number,
    interpolation: Array<{ value: number; weight: number }>,
): number {
    if (interpolation.length === 0) return value;

    // Sort by value ascending
    const sorted = [...interpolation].sort((a, b) => a.value - b.value);

    // Clamp to range
    if (value <= sorted[0].value) return sorted[0].weight;
    if (value >= sorted[sorted.length - 1].value) return sorted[sorted.length - 1].weight;

    // Find the two points to interpolate between
    for (let i = 0; i < sorted.length - 1; i++) {
        const lower = sorted[i];
        const upper = sorted[i + 1];

        if (value >= lower.value && value <= upper.value) {
            // Linear interpolation
            const range = upper.value - lower.value;
            if (range === 0) return lower.weight;
            const t = (value - lower.value) / range;
            return Math.round(lower.weight + t * (upper.weight - lower.weight));
        }
    }

    return value;
}
