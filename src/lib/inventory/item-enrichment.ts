/**
 * Item Enrichment Pipeline — DIM-style item processing orchestrator
 *
 * Central module that calls all builders (sockets, stats, masterwork, crafted,
 * deepsight) to produce a fully enriched InventoryItem.
 *
 * Inspired by DIM's d2-item-factory.ts makeItem() function.
 */

import { getDefinition } from "@/lib/manifest/service";
import type {
    DestinyInventoryItemDefinition,
    DestinyDamageTypeDefinition,
    DestinyLoreDefinition,
    DestinyStatDefinition,
} from "@/types";
import type {
    DimStat,
    DimSocketCategory,
    MasterworkInfo,
    CraftedInfo,
    DeepsightInfo,
    BreakerInfo,
} from "@/types/dim-types";
import { buildSockets } from "./sockets-builder";
import { buildStats } from "./stats-builder";
import { buildMasterwork } from "./masterwork-builder";
import { buildCraftedInfo } from "./crafted-builder";
import { buildDeepsightInfo } from "./deepsight-builder";

// ─── Types ───

/** Raw Bungie item from the profile response */
interface BungieItemRaw {
    itemHash: number;
    itemInstanceId?: string;
    quantity: number;
    bucketHash: number;
    transferStatus: number;
    state: number;
}

/** Instance data from component 300 */
interface InstanceData {
    primaryStat?: { value: number };
    damageType?: number;
    damageTypeHash?: number;
    isEquipped?: boolean;
    gearTier?: number;
    energy?: {
        energyTypeHash: number;
        energyType: number;
        energyCapacity: number;
        energyUsed: number;
        energyUnused: number;
    };
}

/** Socket state from component 305 */
interface SocketState {
    plugHash?: number;
    isEnabled: boolean;
    isVisible: boolean;
}

/** Reusable plug from component 310 */
interface ReusablePlug {
    plugItemHash: number;
    canInsert: boolean;
    enabled: boolean;
}

/** Instance stats from component 304 */
type InstanceStats = Record<string, { value: number }>;

/** The enriched item output — extends existing InventoryItem */
export interface EnrichedItemData {
    // ─── Existing fields (unchanged) ───
    itemInstanceId?: string;
    itemHash: number;
    quantity: number;
    bucketHash: number;
    intrinsicBucketHash: number;
    location: "character" | "vault" | "postmaster";
    characterId?: string;
    transferStatus: number;
    state: number;
    name: string;
    icon: string;
    tierType: number;
    itemType: number;
    itemSubType: number;
    classType: number;
    damageType?: number;
    damageTypeIcon?: string;
    ammoType?: number;
    iconWatermark?: string;
    iconWatermarkFeatured?: string;
    primaryStat?: number;
    isEquipped: boolean;
    isLocked: boolean;
    primaryStatIcon?: string; // Highest stat icon for Armor
    isMasterwork: boolean;
    isCrafted: boolean;
    isDeepsight: boolean;
    isOrnamented?: boolean;
    maxStackSize: number;
    stats?: Record<string, number>;
    sockets?: Array<{
        socketIndex: number;
        plugHash: number;
        isEnabled: boolean;
        isVisible: boolean;
        name?: string;
        icon?: string;
        description?: string;
        itemTypeDisplayName?: string;
    }>;

    // ─── NEW DIM-level fields ───
    tier?: number;              // Gear tier (1-5, Edge of Fate)
    iconOverlay?: string;       // Full-size season/watermark overlay path
    weaponArchetypeIcon?: string; // Intrinsic frame icon for non-exotic weapons
    description?: string;
    flavorText?: string;
    typeName?: string;
    screenshot?: string;
    secondaryIcon?: string;
    loreDescription?: string;
    loreSubtitle?: string;
    collectibleHash?: number;
    breakerInfo?: BreakerInfo;
    weaponStats?: DimStat[];
    armorStats?: DimStat[];
    socketCategories?: DimSocketCategory[];
    masterworkInfo?: MasterworkInfo;
    craftedInfo?: CraftedInfo;
    deepsightInfo?: DeepsightInfo;
    itemCategoryHashes?: number[];
    traitHashes?: number[];
}

/**
 * Fully enrich a raw Bungie item with all DIM-level data.
 */
export function enrichItemFull(
    item: BungieItemRaw,
    instanceData: InstanceData | undefined,
    instanceStats: InstanceStats | undefined,
    socketStates: SocketState[] | undefined,
    reusablePlugs: Record<number, ReusablePlug[]> | undefined,
    location: "character" | "vault" | "postmaster",
    characterId?: string,
    isEquipped = false,
): EnrichedItemData | null {
    const def = getDefinition("DestinyInventoryItemDefinition", item.itemHash) as DestinyInventoryItemDefinition | null;
    if (!def || !def.displayProperties?.name) return null;

    // ── Damage type ──
    const damageTypeHash = instanceData?.damageTypeHash || instanceData?.damageType || def.defaultDamageTypeHash;
    const damageDef = damageTypeHash
        ? getDefinition("DestinyDamageTypeDefinition", damageTypeHash) as DestinyDamageTypeDefinition | null
        : null;

    // ── Sockets (DIM-style) ──
    const socketResult = buildSockets(def, socketStates, reusablePlugs);
    const dimSockets = socketResult?.sockets;
    const socketCategories = socketResult?.socketCategories;

    // ── Legacy sockets (backward compat with existing UI) ──
    const legacySockets = socketStates?.map((s, i) => {
        if (!s.isVisible || !s.plugHash) return null;
        const plugDef = getDefinition("DestinyInventoryItemDefinition", s.plugHash) as DestinyInventoryItemDefinition | null;
        if (!plugDef) return null;
        return {
            socketIndex: i,
            plugHash: s.plugHash,
            isEnabled: s.isEnabled,
            isVisible: s.isVisible,
            name: plugDef.displayProperties.name,
            icon: plugDef.displayProperties.icon,
            description: plugDef.displayProperties.description,
            itemTypeDisplayName: plugDef.itemTypeDisplayName,
        };
    }).filter(Boolean) as EnrichedItemData["sockets"];

    // ── Stats (DIM-style) ──
    const dimStats = buildStats(def, instanceStats);
    const isWeapon = def.itemType === 3;
    const isArmor = def.itemType === 2;

    // ── Legacy stats (backward compat) ──
    const STAT_HASHES: Record<string, number> = {
        mobility: 2996146975,
        resilience: 392767087,
        recovery: 1943323491,
        discipline: 1735777505,
        intellect: 144602215,
        strength: 4244567218,
    };
    let legacyStats: Record<string, number> | undefined;
    let maxStatVal = -1;
    let maxStatHash = 0;

    if (isArmor || isWeapon) {
        const stats: Record<string, number> = {};
        let has = false;
        for (const [name, hash] of Object.entries(STAT_HASHES)) {
            const val = instanceStats?.[String(hash)]?.value || def.stats?.stats?.[String(hash)]?.value || 0;
            if (val > 0) {
                stats[name] = val;
                has = true;
            }
            // Track max for Armor icon
            if (isArmor && val > maxStatVal) {
                maxStatVal = val;
                maxStatHash = hash;
            }
        }
        legacyStats = has ? stats : undefined;
    }

    // ── Armor Primary Stat Icon (Highest Stat) ──
    let primaryStatIcon: string | undefined;
    if (isArmor && maxStatHash) {
        const statDef = getDefinition("DestinyStatDefinition", maxStatHash) as DestinyStatDefinition | null;
        if (statDef?.displayProperties?.icon) {
            primaryStatIcon = statDef.displayProperties.icon;
        }
    }

    // ── Masterwork ──
    const masterworkInfo = buildMasterwork(dimSockets || undefined, item.state);

    // ── Crafted ──
    const craftedInfo = buildCraftedInfo(item.state);

    // ── Deepsight ──
    const deepsightInfo = buildDeepsightInfo(item.state);

    // ── Breaker Type (Champion mods) ──
    let breakerInfo: BreakerInfo | undefined;
    if (def.breakerType && def.breakerTypeHash) {
        // Breaker types are simple enum-based
        const breakerNames: Record<number, string> = {
            1: "Shield-Piercing",
            2: "Disruption",
            3: "Stagger",
        };
        breakerInfo = {
            breakerType: def.breakerType,
            breakerTypeHash: def.breakerTypeHash,
            name: breakerNames[def.breakerType] || "Unknown",
            icon: "", // Would need DestinyBreakerTypeDefinition
        };
    }

    // ── Lore ──
    let loreDescription: string | undefined;
    let loreSubtitle: string | undefined;
    if (def.loreHash) {
        const loreDef = getDefinition("DestinyLoreDefinition", def.loreHash) as DestinyLoreDefinition | null;
        if (loreDef) {
            loreDescription = loreDef.displayProperties?.description;
            loreSubtitle = loreDef.subtitle;
        }
    }

    // ── Ornament detection ──
    const isOrnamented = dimSockets?.some(s =>
        s.plug.isEnabled && s.plug.plugCategoryIdentifier?.includes("ornament")
    ) || legacySockets?.some(s =>
        s.isEnabled && s.itemTypeDisplayName?.includes("Ornament")
    );

    // ── Weapon archetype frame icon (intrinsic plug, DIM: getWeaponArchetype) ──
    // DIM shows this for non-exotic weapons only (or Ergo Sum special case)
    // Use plugCategoryIdentifier === "intrinsics" as the reliable detection method
    // (socket.isIntrinsic uses categoryStyle which doesn't always match)
    let weaponArchetypeIcon: string | undefined;
    if (isWeapon && (def.inventory?.tierType || 0) !== 6) {
        const intrinsicSocket = dimSockets?.find(s =>
            s.plug?.plugCategoryIdentifier === "intrinsics"
        );
        if (intrinsicSocket?.plug?.icon) {
            weaponArchetypeIcon = intrinsicSocket.plug.icon;
        }
    }

    return {
        itemInstanceId: item.itemInstanceId,
        itemHash: item.itemHash,
        quantity: item.quantity,
        bucketHash: item.bucketHash,
        intrinsicBucketHash: def.inventory?.bucketTypeHash || item.bucketHash,
        location,
        characterId,
        transferStatus: item.transferStatus,
        state: item.state,
        name: def.displayProperties.name,
        icon: def.displayProperties.icon || "",
        tierType: def.inventory?.tierType || 0,
        itemType: def.itemType,
        itemSubType: def.itemSubType,
        classType: def.classType,
        damageType: instanceData?.damageType || def.defaultDamageType,
        damageTypeIcon: damageDef?.displayProperties?.icon || damageDef?.transparentIconPath,
        ammoType: def.equippingBlock?.ammoType,
        iconWatermark: def.iconWatermark || def.quality?.displayVersionWatermarkIcons?.[0] || def.iconWatermarkShelved,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconWatermarkFeatured: (def as any).iconWatermarkFeatured || def.quality?.displayVersionWatermarkIcons?.[1],
        primaryStat: instanceData?.primaryStat?.value,
        isEquipped: isEquipped || instanceData?.isEquipped || false,
        isLocked: (item.state & 1) === 1,
        isMasterwork: (item.state & 4) === 4,
        isCrafted: (item.state & 8) === 8,
        isDeepsight: (item.state & 16) === 16,
        isOrnamented,
        maxStackSize: def.inventory?.maxStackSize || 1,
        stats: legacyStats,
        sockets: legacySockets,

        // ─── NEW DIM-level fields ───
        tier: instanceData?.gearTier ?? 0,
        iconOverlay:
            def.quality?.displayVersionWatermarkIcons?.[0] ||
            def.iconWatermark ||
            def.iconWatermarkShelved ||
            undefined,
        weaponArchetypeIcon,
        description: def.displayProperties.description || undefined,
        flavorText: def.flavorText || undefined,
        typeName: def.itemTypeDisplayName || undefined,
        screenshot: def.screenshot || undefined,
        secondaryIcon: def.secondaryIcon || undefined,
        loreDescription,
        loreSubtitle,
        collectibleHash: def.collectibleHash,
        breakerInfo,
        weaponStats: isWeapon ? (dimStats || undefined) : undefined,
        armorStats: isArmor ? (dimStats || undefined) : undefined,
        socketCategories: socketCategories || undefined,
        masterworkInfo: masterworkInfo || undefined,
        craftedInfo: craftedInfo || undefined,
        deepsightInfo: deepsightInfo || undefined,
        primaryStatIcon,
        itemCategoryHashes: def.itemCategoryHashes,
        traitHashes: def.traitHashes,
    };
}
