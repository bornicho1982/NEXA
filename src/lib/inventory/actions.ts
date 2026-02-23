"use server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { bungieRequest } from "@/lib/bungie/client";
import { prisma } from "@/lib/db";

interface TransferItemParams {
    itemReferenceHash: number;
    itemId: string;
    stackSize: number;
    transferToVault: boolean;
    characterId: string;
}

export async function transferItemAction(params: TransferItemParams) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        // Call Bungie API
        await bungieRequest<number>("/Destiny2/Actions/Items/TransferItem/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                itemReferenceHash: params.itemReferenceHash,
                stackSize: params.stackSize,
                transferToVault: params.transferToVault,
                itemId: params.itemId,
                characterId: params.characterId,
                membershipType: user.membershipType,
            }),
        });

        return { success: true };
    } catch (error) {
        console.error("Transfer failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function crossCharacterTransferAction(params: {
    itemReferenceHash: number;
    itemId: string;
    stackSize: number;
    sourceCharacterId: string;
    destinationCharacterId: string;
}) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        // Step 1: Character A -> Vault
        await bungieRequest<number>("/Destiny2/Actions/Items/TransferItem/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                itemReferenceHash: params.itemReferenceHash,
                stackSize: params.stackSize,
                transferToVault: true,
                itemId: params.itemId,
                characterId: params.sourceCharacterId,
                membershipType: user.membershipType,
            }),
        });

        // Step 2: Vault -> Character B
        await bungieRequest<number>("/Destiny2/Actions/Items/TransferItem/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                itemReferenceHash: params.itemReferenceHash,
                stackSize: params.stackSize,
                transferToVault: false,
                itemId: params.itemId,
                characterId: params.destinationCharacterId,
                membershipType: user.membershipType,
            }),
        });

        return { success: true };
    } catch (error) {
        console.error("Cross-character transfer failed:", error);
        // Note: A failure in step 2 leaves the item in the vault. This is standard behavior.
        return { success: false, error: String(error) };
    }
}

export async function equipItemAction(params: {
    itemId: string;
    characterId: string;
}) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new Error("Unauthorized");

        await bungieRequest<number>("/Destiny2/Actions/Items/EquipItem/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                itemId: params.itemId,
                characterId: params.characterId,
                membershipType: user.membershipType,
            }),
        });

        return { success: true };
    } catch (error) {
        console.error("Equip failed:", error);
        return { success: false, error: String(error) };
    }
}

// ─── NEW ACTIONS ───

export async function pullFromPostmasterAction(params: {
    itemReferenceHash: number;
    itemId: string;
    stackSize: number;
    characterId: string;
}) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new Error("Unauthorized");

        await bungieRequest<number>("/Destiny2/Actions/Items/PullFromPostmaster/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                itemReferenceHash: params.itemReferenceHash,
                stackSize: params.stackSize,
                itemId: params.itemId,
                characterId: params.characterId,
                membershipType: user.membershipType,
            }),
        });

        return { success: true };
    } catch (error) {
        console.error("Pull from postmaster failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function setItemLockStateAction(params: {
    itemId: string;
    characterId: string;
    state: boolean;
}) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new Error("Unauthorized");

        await bungieRequest<number>("/Destiny2/Actions/Items/SetLockState/", {
            method: "POST",
            accessToken: user.accessToken,
            body: JSON.stringify({
                state: params.state,
                itemId: params.itemId,
                characterId: params.characterId,
                membershipType: user.membershipType,
            }),
        });

        return { success: true };
    } catch (error) {
        console.error("Set lock state failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function updateItemAnnotationAction(params: {
    itemHash: number;
    instanceId?: string | null;
    tag?: string | null;
    notes?: string | null;
}) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new Error("Unauthorized");

        if (!params.instanceId) {
             return { success: false, error: "Only instanced items can be tagged for now." };
        }

        await prisma.itemAnnotation.upsert({
            where: {
                userId_instanceId: {
                    userId: user.id,
                    instanceId: params.instanceId,
                }
            },
            create: {
                userId: user.id,
                itemHash: params.itemHash,
                instanceId: params.instanceId,
                tag: params.tag,
                notes: params.notes,
            },
            update: {
                tag: params.tag,
                notes: params.notes,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Update annotation failed:", error);
        return { success: false, error: String(error) };
    }
}
