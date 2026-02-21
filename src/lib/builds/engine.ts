import { ensureManifestLoaded, getAllDefinitions } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition } from "@/types";

// ─── Types ───

/** Armor stat array: [mob, res, rec, dis, int, str] */
export type StatArray = [number, number, number, number, number, number];

export const STAT_ORDER = [
    "Mobility", "Resilience", "Recovery",
    "Discipline", "Intellect", "Strength",
] as const;

export const STAT_HASHES: Record<string, number> = {
    Mobility: 2996146975,
    Resilience: 392767087,
    Recovery: 1943323491,
    Discipline: 1735777505,
    Intellect: 144602215,
    Strength: 4244567218,
};

/** Armor slot bucket hashes */
const BUCKET_HELMET = 3448274439;
const BUCKET_GAUNTLETS = 3551918588;
const BUCKET_CHEST = 14239492;
const BUCKET_LEGS = 20886954;
const BUCKET_CLASS_ITEM = 1585787867;

const ARMOR_BUCKETS = [BUCKET_HELMET, BUCKET_GAUNTLETS, BUCKET_CHEST, BUCKET_LEGS, BUCKET_CLASS_ITEM];

export interface ArmorPiece {
    hash: number;
    name: string;
    icon: string;
    bucket: number;
    tierType: number;
    classType: number;
    stats: StatArray;
    isExotic: boolean;
}

export interface BuildObjectives {
    classType: number;           // 0=Titan, 1=Hunter, 2=Warlock
    statPriority: StatArray;     // Target minimum per stat (e.g. [0, 100, 100, 0, 0, 0])
    maxExotics?: number;         // Default: 1 (Destiny rule)
    minimumTier?: number;        // Minimum total tier
    assumeMasterwork?: boolean;  // Add +2 per stat per armor piece
}

export interface BuildResult {
    pieces: ArmorPiece[];        // 5 armor pieces (helmet, gauntlets, chest, legs, class)
    stats: StatArray;            // Total stats
    tiers: StatArray;            // Tiers (stat / 10, capped at 10)
    totalTier: number;           // Sum of all tiers
    wastedStats: number;         // Stats beyond tier breakpoints
    score: number;               // Overall score
}

// ─── Build Engine ───

/**
 * Find optimal armor builds based on objectives.
 * Uses pre-filtering + branch-and-bound to efficiently search the space.
 */
export async function findOptimalBuilds(
    objectives: BuildObjectives,
    inventoryItems: Array<{
        itemHash: number;
        itemInstanceId?: string;
        primaryStat?: number;
        itemType: number;
        classType: number;
        bucketHash: number;
    }>,
    maxResults = 10
): Promise<BuildResult[]> {
    await ensureManifestLoaded();

    const allDefs = getAllDefinitions("DestinyInventoryItemDefinition");
    if (!allDefs) throw new Error("Manifest not loaded");

    // Step 1: Extract and filter armor pieces
    const armorPieces = extractArmorPieces(
        inventoryItems,
        allDefs,
        objectives.classType
    );

    // Step 2: Group by bucket
    const grouped = groupByBucket(armorPieces);

    // Step 3: Ensure at least one piece per slot
    for (const bucket of ARMOR_BUCKETS) {
        if (!grouped.has(bucket) || grouped.get(bucket)!.length === 0) {
            return []; // Missing a slot — no valid builds possible
        }
    }

    // Step 4: Branch-and-bound search
    const results = searchBuilds(
        grouped,
        objectives,
        maxResults
    );

    return results.sort((a, b) => b.score - a.score);
}

// ─── Pre-filtering ───

function extractArmorPieces(
    items: Array<{
        itemHash: number;
        itemType: number;
        classType: number;
        bucketHash: number;
    }>,
    defs: Record<string, unknown>,
    targetClass: number
): ArmorPiece[] {
    const pieces: ArmorPiece[] = [];

    for (const item of items) {
        // Only armor
        if (item.itemType !== 2) continue;
        // Must match class or be universal (classType 3)
        if (item.classType !== targetClass && item.classType !== 3) continue;
        // Must be in an armor bucket
        if (!ARMOR_BUCKETS.includes(item.bucketHash)) continue;

        const def = defs[String(item.itemHash)] as DestinyInventoryItemDefinition | undefined;
        if (!def) continue;
        // Only Legendary and Exotic
        if (!def.inventory || (def.inventory.tierType !== 5 && def.inventory.tierType !== 6)) continue;

        const stats = extractStats(def);

        pieces.push({
            hash: item.itemHash,
            name: def.displayProperties.name,
            icon: def.displayProperties.icon || "",
            bucket: item.bucketHash,
            tierType: def.inventory.tierType,
            classType: item.classType,
            stats,
            isExotic: def.inventory.tierType === 6,
        });
    }

    return pieces;
}

function extractStats(def: DestinyInventoryItemDefinition): StatArray {
    const stats: StatArray = [0, 0, 0, 0, 0, 0];
    if (!def.stats?.stats) return stats;

    const entries = Object.entries(STAT_HASHES);
    for (let i = 0; i < entries.length; i++) {
        const [, hash] = entries[i];
        const val = def.stats.stats[String(hash)]?.value ?? 0;
        stats[i] = val;
    }

    return stats;
}

function groupByBucket(pieces: ArmorPiece[]): Map<number, ArmorPiece[]> {
    const map = new Map<number, ArmorPiece[]>();
    for (const piece of pieces) {
        if (!map.has(piece.bucket)) map.set(piece.bucket, []);
        map.get(piece.bucket)!.push(piece);
    }
    return map;
}

// ─── Branch-and-Bound Search ───

function searchBuilds(
    grouped: Map<number, ArmorPiece[]>,
    objectives: BuildObjectives,
    maxResults: number
): BuildResult[] {
    const slots = ARMOR_BUCKETS.map((b) => grouped.get(b) || []);
    const results: BuildResult[] = [];
    const maxExotics = objectives.maxExotics ?? 1;
    const mwBonus = objectives.assumeMasterwork ? 2 : 0;

    let worstAcceptedScore = -Infinity;

    function dfs(slotIdx: number, current: ArmorPiece[], exoticCount: number, runningStats: StatArray) {
        // Base case: all 5 slots filled
        if (slotIdx === 5) {
            const finalStats: StatArray = [...runningStats];
            // Add masterwork bonus
            if (mwBonus > 0) {
                for (let i = 0; i < 6; i++) {
                    finalStats[i] += mwBonus * current.length;
                }
            }

            const tiers: StatArray = [0, 0, 0, 0, 0, 0];
            let totalTier = 0;
            let wastedStats = 0;

            for (let i = 0; i < 6; i++) {
                tiers[i] = Math.min(Math.floor(finalStats[i] / 10), 10);
                totalTier += tiers[i];
                wastedStats += finalStats[i] % 10;
            }

            const score = calculateScore(finalStats, tiers, totalTier, wastedStats, objectives);

            if (score <= worstAcceptedScore && results.length >= maxResults) return;

            const result: BuildResult = {
                pieces: [...current],
                stats: finalStats,
                tiers,
                totalTier,
                wastedStats,
                score,
            };

            results.push(result);
            results.sort((a, b) => b.score - a.score);
            if (results.length > maxResults) results.pop();
            if (results.length === maxResults) {
                worstAcceptedScore = results[results.length - 1].score;
            }

            return;
        }

        const slotPieces = slots[slotIdx];

        for (const piece of slotPieces) {
            // Exotic constraint
            if (piece.isExotic && exoticCount >= maxExotics) continue;

            // Upper bound pruning: check if remaining slots can still meet minimums
            const newStats: StatArray = [...runningStats];
            for (let i = 0; i < 6; i++) {
                newStats[i] += piece.stats[i];
            }

            // Simple bound: if even with max stats from remaining pieces we can't meet priorities
            const remainingSlots = 4 - slotIdx; // Slots left after this one
            let canMeetPriority = true;
            for (let i = 0; i < 6; i++) {
                if (objectives.statPriority[i] > 0) {
                    // Assume max ~30 per remaining piece per stat for bound
                    const upperBound = newStats[i] + remainingSlots * 30 + (mwBonus * (remainingSlots + 1));
                    if (upperBound < objectives.statPriority[i]) {
                        canMeetPriority = false;
                        break;
                    }
                }
            }

            if (!canMeetPriority) continue;

            current.push(piece);
            dfs(
                slotIdx + 1,
                current,
                exoticCount + (piece.isExotic ? 1 : 0),
                newStats
            );
            current.pop();
        }
    }

    dfs(0, [], 0, [0, 0, 0, 0, 0, 0]);
    return results;
}

// ─── Scoring ───

function calculateScore(
    stats: StatArray,
    tiers: StatArray,
    totalTier: number,
    wastedStats: number,
    objectives: BuildObjectives
): number {
    let score = 0;

    // Base: total tiers × 100
    score += totalTier * 100;

    // Bonus for meeting priority targets
    for (let i = 0; i < 6; i++) {
        if (objectives.statPriority[i] > 0) {
            if (stats[i] >= objectives.statPriority[i]) {
                score += 500; // Met the target
                // Extra for exceeding tier
                const targetTier = Math.floor(objectives.statPriority[i] / 10);
                score += (tiers[i] - targetTier) * 50;
            } else {
                // Penalty for missing target
                const deficit = objectives.statPriority[i] - stats[i];
                score -= deficit * 10;
            }
        }
    }

    // Penalty for wasted stats (diminishing)
    score -= wastedStats * 2;

    // Bonus for reaching high tiers on priority stats
    for (let i = 0; i < 6; i++) {
        if (objectives.statPriority[i] > 0 && tiers[i] >= 10) {
            score += 200; // Tier 10 bonus
        }
    }

    return score;
}
