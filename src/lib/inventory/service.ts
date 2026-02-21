
import { ensureManifestLoaded, getDefinition } from "@/lib/manifest/service";
import { getAuthenticatedUser } from "@/lib/auth/user";
import { bungieRequest } from "@/lib/bungie/client";
import type { DimStat, DimSocketCategory, MasterworkInfo, CraftedInfo, DeepsightInfo, BreakerInfo } from "@/types/dim-types";
import { enrichItemFull } from "./item-enrichment";

// ─── Bungie Profile Component Flags ───
// These are bitmask values for the components we request from GetProfile
const COMPONENTS = {
    Profiles: 100,
    Characters: 200,
    CharacterInventories: 201,
    CharacterEquipment: 205,
    ProfileInventories: 102,     // Vault
    ProfileCurrencies: 103,
    ItemInstances: 300,
    ItemStats: 304,
    ItemSockets: 305,
    ItemPerks: 302,
    ItemReusablePlugs: 310, // Added for completeness, though 305 is usually enough for current perks
};

// ─── Public Types ───

export interface InventoryCharacter {
    characterId: string;
    classType: number;
    className: string;
    light: number;
    emblemPath?: string;
    emblemBackgroundPath?: string;
    raceType: number;
    genderType: number;
    dateLastPlayed: string;
}

export interface InventoryItem {
    itemInstanceId?: string;
    itemHash: number;
    quantity: number;
    bucketHash: number;
    intrinsicBucketHash: number;
    location: "character" | "vault" | "postmaster";
    characterId?: string;
    transferStatus: number;
    state: number;
    // Enriched from Manifest
    name: string;
    icon: string;
    tierType: number;       // 6=Exotic, 5=Legendary etc.
    itemType: number;       // weapon, armor, mod...
    itemSubType: number;
    classType: number;
    damageType?: number;
    damageTypeIcon?: string;
    ammoType?: number; // 1=Primary, 2=Special, 3=Heavy
    iconWatermark?: string;
    iconWatermarkFeatured?: string;
    // Instance data
    primaryStat?: number;
    primaryStatIcon?: string; // Highest stat icon for Armor
    isEquipped: boolean;
    isLocked: boolean; // State & 1
    isMasterwork: boolean;
    isCrafted: boolean; // State & 8
    isDeepsight: boolean; // State & 16
    isOrnamented?: boolean; // Derived from sockets
    maxStackSize: number;
    stats?: Record<string, number>;
    // Sockets (Perks) — legacy format
    sockets?: ItemSocket[];

    // ─── DIM-level enriched fields (all optional for backward compat) ───
    tier?: number;             // Gear tier (1-5, from API gearTier, Edge of Fate)
    iconOverlay?: string;      // Full-size season/watermark overlay path
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

export interface ItemSocket {
    socketIndex: number;
    plugHash: number;
    isEnabled: boolean;
    isVisible: boolean;
    name?: string;
    icon?: string;
    description?: string;
    itemTypeDisplayName?: string;
}

/** Overlay image paths from DestinyInventoryItemConstantsDefinition (manifest) */
export interface ItemConstants {
    gearTierOverlayImagePaths: string[];
    masterworkOverlayPath?: string;
    masterworkExoticOverlayPath?: string;
    craftedOverlayPath?: string;
    enhancedItemOverlayPath?: string;
    craftedBackgroundPath?: string;
    watermarkDropShadowPath?: string;
    universalOrnamentLegendaryBackgroundOverlayPath?: string;
    universalOrnamentExoticBackgroundOverlayPath?: string;
}

export interface ProfileData {
    characters: InventoryCharacter[];
    items: InventoryItem[];
    currencies: Array<{ itemHash: number; quantity: number; name: string; icon: string }>;
    itemConstants?: ItemConstants;
}

// ─── Service Functions ───

/**
 * Fetch and structure the full profile data for the current user.
 */
export async function getFullProfile(): Promise<ProfileData> {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    if (!user.destinyMembershipId || !user.membershipType) {
        throw new Error("No Destiny membership linked");
    }

    await ensureManifestLoaded();

    const componentList = Object.values(COMPONENTS).join(",");
    const profileUrl = `/Destiny2/${user.membershipType}/Profile/${user.destinyMembershipId}/?components=${componentList}`;

    const profile = await bungieRequest<BungieProfileResponse>(profileUrl, {
        accessToken: user.accessToken,
    });

    const result = parseProfile(profile);

    // Load item constants from manifest (overlay image paths)
    const constantsDef = getDefinition("DestinyInventoryItemConstantsDefinition", 1) as Record<string, unknown> | null;
    if (constantsDef) {
        result.itemConstants = {
            gearTierOverlayImagePaths: (constantsDef.gearTierOverlayImagePaths as string[]) || [],
            masterworkOverlayPath: constantsDef.masterworkOverlayPath as string | undefined,
            masterworkExoticOverlayPath: constantsDef.masterworkExoticOverlayPath as string | undefined,
            craftedOverlayPath: constantsDef.craftedOverlayPath as string | undefined,
            enhancedItemOverlayPath: constantsDef.enhancedItemOverlayPath as string | undefined,
            craftedBackgroundPath: constantsDef.craftedBackgroundPath as string | undefined,
            watermarkDropShadowPath: constantsDef.watermarkDropShadowPath as string | undefined,
            universalOrnamentLegendaryBackgroundOverlayPath: constantsDef.universalOrnamentLegendaryBackgroundOverlayPath as string | undefined,
            universalOrnamentExoticBackgroundOverlayPath: constantsDef.universalOrnamentExoticBackgroundOverlayPath as string | undefined,
        };
    }

    return result;
}

export async function transferItem(params: {
    itemReferenceHash: number;
    itemId: string;
    stackSize: number;
    transferToVault: boolean;
    characterId: string;
}): Promise<void> {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    await bungieRequest("/Destiny2/Actions/Items/TransferItem/", {
        method: "POST",
        accessToken: user.accessToken,
        body: JSON.stringify({
            itemReferenceHash: params.itemReferenceHash,
            itemId: params.itemId,
            stackSize: params.stackSize,
            transferToVault: params.transferToVault,
            membershipType: user.membershipType,
            characterId: params.characterId,
        }),
    });
}

export async function equipItem(params: {
    itemId: string;
    characterId: string;
}): Promise<void> {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    await bungieRequest("/Destiny2/Actions/Items/EquipItem/", {
        method: "POST",
        accessToken: user.accessToken,
        body: JSON.stringify({
            itemId: params.itemId,
            characterId: params.characterId,
            membershipType: user.membershipType,
        }),
    });
}

export async function equipItems(params: {
    itemIds: string[];
    characterId: string;
}): Promise<Record<string, number>[]> {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    const res = await bungieRequest<{ equipResults: Record<string, number>[] }>("/Destiny2/Actions/Items/EquipItems/", {
        method: "POST",
        accessToken: user.accessToken,
        body: JSON.stringify({
            itemIds: params.itemIds,
            characterId: params.characterId,
            membershipType: user.membershipType,
        }),
    });
    return res.equipResults;
}

// ─── Internal Parsing ───

interface BungieProfileResponse {
    profile?: {
        data?: {
            userInfo?: {
                membershipId: string;
                displayName: string;
            };
        };
    };
    characters?: {
        data?: Record<string, {
            characterId: string;
            classType: number;
            light: number;
            emblemPath?: string;
            emblemBackgroundPath?: string;
            raceType: number;
            genderType: number;
            dateLastPlayed: string;
        }>;
    };
    profileInventory?: {
        data?: {
            items?: BungieItemComponent[];
        };
    };
    characterInventories?: {
        data?: Record<string, {
            items?: BungieItemComponent[];
        }>;
    };
    characterEquipment?: {
        data?: Record<string, {
            items?: BungieItemComponent[];
        }>;
    };
    profileCurrencies?: {
        data?: {
            items?: BungieItemComponent[];
        };
    };
    itemComponents?: {
        instances?: {
            data?: Record<string, {
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
            }>;
        };
        stats?: {
            data?: Record<string, {
                stats: Record<string, { value: number }>;
            }>;
        };
        sockets?: {
            data?: Record<string, {
                sockets: BungieSocketComponent[];
            }>;
        };
        reusablePlugs?: {
            data?: Record<string, {
                plugs: Record<number, Array<{
                    plugItemHash: number;
                    canInsert: boolean;
                    enabled: boolean;
                }>>;
            }>;
        };
    };
}

interface BungieItemComponent {
    itemHash: number;
    itemInstanceId?: string;
    quantity: number;
    bucketHash: number;
    transferStatus: number;
    state: number;
}

interface BungieSocketComponent {
    plugHash?: number;
    isEnabled: boolean;
    isVisible: boolean;
}

const CLASS_NAMES: Record<number, string> = {
    0: "Titan",
    1: "Hunter",
    2: "Warlock",
    3: "Unknown",
};

function parseProfile(profile: BungieProfileResponse): ProfileData {
    // Parse characters
    const characters: InventoryCharacter[] = [];
    if (profile.characters?.data) {
        for (const char of Object.values(profile.characters.data)) {
            characters.push({
                characterId: char.characterId,
                classType: char.classType,
                className: CLASS_NAMES[char.classType] || "Unknown",
                light: char.light,
                emblemPath: char.emblemPath,
                emblemBackgroundPath: char.emblemBackgroundPath,
                raceType: char.raceType,
                genderType: char.genderType,
                dateLastPlayed: char.dateLastPlayed,
            });
        }
    }

    const instances = profile.itemComponents?.instances?.data || {};
    const statsMap = profile.itemComponents?.stats?.data || {};
    const socketsMap = profile.itemComponents?.sockets?.data || {};
    const reusablePlugsMap = profile.itemComponents?.reusablePlugs?.data || {};
    const items: InventoryItem[] = [];

    // Parse vault items (profileInventory)
    if (profile.profileInventory?.data?.items) {
        for (const item of profile.profileInventory.data.items) {
            const enriched = enrichItem(item, instances, statsMap, socketsMap, reusablePlugsMap, "vault");
            if (enriched) items.push(enriched);
        }
    }

    // Parse character inventories
    if (profile.characterInventories?.data) {
        for (const [charId, inv] of Object.entries(profile.characterInventories.data)) {
            if (inv.items) {
                for (const item of inv.items) {
                    const enriched = enrichItem(item, instances, statsMap, socketsMap, reusablePlugsMap, "character", charId);
                    if (enriched) items.push(enriched);
                }
            }
        }
    }

    // Parse character equipment
    if (profile.characterEquipment?.data) {
        for (const [charId, equip] of Object.entries(profile.characterEquipment.data)) {
            if (equip.items) {
                for (const item of equip.items) {
                    const enriched = enrichItem(item, instances, statsMap, socketsMap, reusablePlugsMap, "character", charId, true);
                    if (enriched) items.push(enriched);
                }
            }
        }
    }

    // Parse currencies
    const currencies: ProfileData["currencies"] = [];
    if (profile.profileCurrencies?.data?.items) {
        for (const curr of profile.profileCurrencies.data.items) {
            const def = getDefinition("DestinyInventoryItemDefinition", curr.itemHash);
            if (def) {
                currencies.push({
                    itemHash: curr.itemHash,
                    quantity: curr.quantity,
                    name: def.displayProperties.name,
                    icon: def.displayProperties.icon || "",
                });
            }
        }
    }

    return { characters, items, currencies };
}

function enrichItem(
    item: BungieItemComponent,
    instances: Record<string, { primaryStat?: { value: number }; damageType?: number; damageTypeHash?: number; isEquipped?: boolean; gearTier?: number; energy?: { energyTypeHash: number; energyType: number; energyCapacity: number; energyUsed: number; energyUnused: number } }>,
    statsMap: Record<string, { stats: Record<string, { value: number }> }>,
    socketsMap: Record<string, { sockets: BungieSocketComponent[] }>,
    reusablePlugsMap: Record<string, { plugs: Record<number, Array<{ plugItemHash: number; canInsert: boolean; enabled: boolean }>> }>,
    location: InventoryItem["location"],
    characterId?: string,
    isEquipped = false,
): InventoryItem | null {
    const instance = item.itemInstanceId ? instances[item.itemInstanceId] : undefined;
    const instanceStats = item.itemInstanceId ? statsMap[item.itemInstanceId]?.stats : undefined;
    const socketStates = item.itemInstanceId ? socketsMap[item.itemInstanceId]?.sockets : undefined;
    const reusablePlugs = item.itemInstanceId ? reusablePlugsMap[item.itemInstanceId]?.plugs : undefined;

    // Use the new DIM-level enrichment pipeline
    const enriched = enrichItemFull(
        item,
        instance,
        instanceStats,
        socketStates,
        reusablePlugs,
        location,
        characterId,
        isEquipped,
    );

    if (!enriched) return null;

    // Cast to InventoryItem — EnrichedItemData is a superset
    return enriched as InventoryItem;
}
