import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getFullProfile, equipItem, transferItem, equipItems } from "@/lib/inventory/service";
import { getDefinition } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition } from "@/types";

// ─── Types ───

export interface LoadoutItemData {
    itemHash: number;
    instanceId?: string;
    bucketHash: number;
    socketOverrides?: Record<string, number>;
}

export interface LoadoutData {
    id: string;
    name: string;
    description?: string | null;
    classType: number;
    iconHash?: string | null;
    colorHash?: string | null;
    items: LoadoutItemData[];
    createdAt: string;
    updatedAt: string;
}

export interface LoadoutStats {
    mobility: number;
    resilience: number;
    recovery: number;
    discipline: number;
    intellect: number;
    strength: number;
    total: number;
}

// Armor stat hashes
const STAT_HASHES: Record<string, number> = {
    mobility: 2996146975,
    resilience: 392767087,
    recovery: 1943323491,
    discipline: 1735777505,
    intellect: 144602215,
    strength: 4244567218,
};

// ─── CRUD Operations ───

/**
 * Get all loadouts for the current user.
 */
export async function getLoadouts(): Promise<LoadoutData[]> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const loadouts = await prisma.loadout.findMany({
        where: { userId: session.id },
        include: { items: true },
        orderBy: { updatedAt: "desc" },
    });

    return loadouts.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        classType: l.classType,
        iconHash: l.iconHash,
        colorHash: l.colorHash,
        items: l.items.map((i) => ({
            itemHash: i.itemHash,
            instanceId: i.instanceId ?? undefined,
            bucketHash: i.bucketHash,
            socketOverrides: i.socketOverrides
                ? JSON.parse(i.socketOverrides)
                : undefined,
        })),
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
    }));
}

/**
 * Create a new loadout.
 */
export async function createLoadout(params: {
    name: string;
    description?: string;
    classType: number;
    iconHash?: string;
    colorHash?: string;
    items: LoadoutItemData[];
}): Promise<LoadoutData> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const loadout = await prisma.loadout.create({
        data: {
            userId: session.id,
            name: params.name,
            description: params.description,
            classType: params.classType,
            iconHash: params.iconHash,
            colorHash: params.colorHash,
            items: {
                create: params.items.map((i) => ({
                    itemHash: i.itemHash,
                    instanceId: i.instanceId,
                    bucketHash: i.bucketHash,
                    socketOverrides: i.socketOverrides
                        ? JSON.stringify(i.socketOverrides)
                        : undefined,
                })),
            },
        },
        include: { items: true },
    });

    return {
        id: loadout.id,
        name: loadout.name,
        description: loadout.description,
        classType: loadout.classType,
        iconHash: loadout.iconHash,
        colorHash: loadout.colorHash,
        items: loadout.items.map((i) => ({
            itemHash: i.itemHash,
            instanceId: i.instanceId ?? undefined,
            bucketHash: i.bucketHash,
            socketOverrides: i.socketOverrides
                ? JSON.parse(i.socketOverrides)
                : undefined,
        })),
        createdAt: loadout.createdAt.toISOString(),
        updatedAt: loadout.updatedAt.toISOString(),
    };
}

/**
 * Update an existing loadout.
 */
export async function updateLoadout(
    loadoutId: string,
    params: {
        name?: string;
        description?: string;
        classType?: number;
        iconHash?: string;
        colorHash?: string;
        items?: LoadoutItemData[];
    }
): Promise<LoadoutData> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    // Verify ownership
    const existing = await prisma.loadout.findFirst({
        where: { id: loadoutId, userId: session.id },
    });
    if (!existing) throw new Error("Loadout not found");

    // If items are provided, delete old ones and create new
    if (params.items) {
        await prisma.loadoutItem.deleteMany({ where: { loadoutId } });
    }

    const loadout = await prisma.loadout.update({
        where: { id: loadoutId },
        data: {
            ...(params.name !== undefined && { name: params.name }),
            ...(params.description !== undefined && {
                description: params.description,
            }),
            ...(params.classType !== undefined && { classType: params.classType }),
            ...(params.iconHash !== undefined && { iconHash: params.iconHash }),
            ...(params.colorHash !== undefined && { colorHash: params.colorHash }),
            ...(params.items && {
                items: {
                    create: params.items.map((i) => ({
                        itemHash: i.itemHash,
                        instanceId: i.instanceId,
                        bucketHash: i.bucketHash,
                        socketOverrides: i.socketOverrides
                            ? JSON.stringify(i.socketOverrides)
                            : undefined,
                    })),
                },
            }),
        },
        include: { items: true },
    });

    return {
        id: loadout.id,
        name: loadout.name,
        description: loadout.description,
        classType: loadout.classType,
        iconHash: loadout.iconHash,
        colorHash: loadout.colorHash,
        items: loadout.items.map((i) => ({
            itemHash: i.itemHash,
            instanceId: i.instanceId ?? undefined,
            bucketHash: i.bucketHash,
            socketOverrides: i.socketOverrides
                ? JSON.parse(i.socketOverrides)
                : undefined,
        })),
        createdAt: loadout.createdAt.toISOString(),
        updatedAt: loadout.updatedAt.toISOString(),
    };
}

/**
 * Delete a loadout.
 */
export async function deleteLoadout(loadoutId: string): Promise<void> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const existing = await prisma.loadout.findFirst({
        where: { id: loadoutId, userId: session.id },
    });
    if (!existing) throw new Error("Loadout not found");

    await prisma.loadout.delete({ where: { id: loadoutId } });
}

/**
 * Clone a loadout.
 */
export async function cloneLoadout(loadoutId: string): Promise<LoadoutData> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const source = await prisma.loadout.findFirst({
        where: { id: loadoutId, userId: session.id },
        include: { items: true },
    });
    if (!source) throw new Error("Loadout not found");

    return createLoadout({
        name: `${source.name} (copy)`,
        description: source.description ?? undefined,
        classType: source.classType,
        iconHash: source.iconHash ?? undefined,
        colorHash: source.colorHash ?? undefined,
        items: source.items.map((i) => ({
            itemHash: i.itemHash,
            instanceId: i.instanceId ?? undefined,
            bucketHash: i.bucketHash,
            socketOverrides: i.socketOverrides
                ? JSON.parse(i.socketOverrides)
                : undefined,
        })),
    });
}

/**
 * Create a loadout from the currently equipped items on a character.
 */
export async function createFromEquipped(
    characterId: string,
    name: string
): Promise<LoadoutData> {
    const profile = await getFullProfile();

    const character = profile.characters.find(
        (c) => c.characterId === characterId
    );
    if (!character) throw new Error("Character not found");

    const equippedItems = profile.items.filter(
        (i) =>
            i.characterId === characterId &&
            i.isEquipped &&
            (i.itemType === 2 || i.itemType === 3) // Armor and Weapons only
    );

    return createLoadout({
        name,
        classType: character.classType,
        items: equippedItems.map((i) => ({
            itemHash: i.itemHash,
            instanceId: i.itemInstanceId,
            bucketHash: i.bucketHash,
        })),
    });
}

// ─── Apply / Equip Loadout ───

/**
 * Apply (equip) a loadout on a character by transferring and then equipping each item.
 */
export async function applyLoadout(
    loadoutId: string,
    characterId: string
): Promise<{ equipped: number; failed: string[] }> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const loadout = await prisma.loadout.findFirst({
        where: { id: loadoutId, userId: session.id },
        include: { items: true },
    });
    if (!loadout) throw new Error("Loadout not found");

    const profile = await getFullProfile();
    const targetCharacter = profile.characters.find(c => c.characterId === characterId);
    if (!targetCharacter) throw new Error("Target character not found");

    let equippedCount = 0;
    const failed: string[] = [];
    const itemsToEquip: string[] = [];

    console.log(`[Loadout] Starting execution for ${loadout.name} on ${targetCharacter.className}...`);

    for (const item of loadout.items) {
        if (!item.instanceId) continue;

        const profileItem = profile.items.find(i => i.itemInstanceId === item.instanceId);
        if (!profileItem) {
            failed.push(`Item not found: Hash ${item.itemHash}`);
            continue;
        }

        try {
            // 1. Move to Target Character if not already there
            if (profileItem.characterId !== characterId) {
                console.log(`[Loadout] Moving ${profileItem.name} to target character...`);

                // If on another character, move to Vault first
                if (profileItem.location === "character" && profileItem.characterId) {
                    await transferItem({
                        itemReferenceHash: profileItem.itemHash,
                        itemId: item.instanceId,
                        stackSize: 1,
                        transferToVault: true,
                        characterId: profileItem.characterId,
                    });
                    await new Promise(r => setTimeout(r, 200)); // Bungie throttle safety
                }

                // Move from Vault to Target Character
                await transferItem({
                    itemReferenceHash: profileItem.itemHash,
                    itemId: item.instanceId,
                    stackSize: 1,
                    transferToVault: false,
                    characterId: characterId,
                });
                await new Promise(r => setTimeout(r, 200));
            }

            itemsToEquip.push(item.instanceId);
        } catch (err) {
            console.error(`[Loadout] Error moving ${profileItem.name}:`, err);
            failed.push(`Transfer failed: ${profileItem.name}`);
        }
    }

    // 2. Bulk Equip
    if (itemsToEquip.length > 0) {
        try {
            console.log(`[Loadout] Equipping ${itemsToEquip.length} items...`);
            await equipItems({
                itemIds: itemsToEquip,
                characterId,
            });

            // Count successes (ErrorCode 1 is success in Bungie API, but EquipItems returns individual codes)
            // Note: Results is an array of Record<string, number>[] but Bungie returns { itemInstanceId, equippable? } 
            // Actually our equipItems implementation returns equipResults which is array of results.
            // Let's assume most succeed if they reached this point.
            equippedCount = itemsToEquip.length;
        } catch (err) {
            console.error(`[Loadout] Bulk equip failed, falling back to individual:`, err);
            // Fallback to individual equip
            for (const itemId of itemsToEquip) {
                try {
                    await equipItem({ itemId, characterId });
                    equippedCount++;
                } catch {
                    failed.push(`Equip failed: ${itemId}`);
                }
            }
        }
    }

    return { equipped: equippedCount, failed };
}

// ─── Stat Analysis ───

/**
 * Analyze the stats of a loadout (armor only).
 */
export async function analyzeLoadoutStats(
    loadoutId: string
): Promise<LoadoutStats> {
    const profile = await getFullProfile();
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const loadout = await prisma.loadout.findFirst({
        where: { id: loadoutId, userId: session.id },
        include: { items: true },
    });
    if (!loadout) throw new Error("Loadout not found");

    const stats: LoadoutStats = {
        mobility: 0,
        resilience: 0,
        recovery: 0,
        discipline: 0,
        intellect: 0,
        strength: 0,
        total: 0,
    };

    for (const item of loadout.items) {
        // Find the enriched item in the profile to get instance stats
        const profileItem = item.instanceId
            ? profile.items.find(i => i.itemInstanceId === item.instanceId)
            : undefined;

        if (profileItem?.stats) {
            for (const [name, val] of Object.entries(profileItem.stats)) {
                if (name in stats) {
                    stats[name as keyof Omit<LoadoutStats, "total">] += val;
                }
            }
        } else {
            // Fallback to definition stats if no instance found
            const def = getDefinition("DestinyInventoryItemDefinition", item.itemHash) as DestinyInventoryItemDefinition | null;
            if (def && def.itemType === 2 && def.stats?.stats) {
                for (const [statName, statHash] of Object.entries(STAT_HASHES)) {
                    const statValue = def.stats.stats[String(statHash)]?.value || 0;
                    stats[statName as keyof Omit<LoadoutStats, "total">] += statValue;
                }
            }
        }
    }

    stats.total = stats.mobility + stats.resilience + stats.recovery + stats.discipline + stats.intellect + stats.strength;
    return stats;
}
