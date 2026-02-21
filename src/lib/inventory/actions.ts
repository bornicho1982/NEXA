"use server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { bungieRequest } from "@/lib/bungie/client";

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
