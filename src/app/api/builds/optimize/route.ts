import { NextResponse, NextRequest } from "next/server";
import { findOptimalBuilds, BuildObjectives } from "@/lib/builds/engine";
import { getFullProfile } from "@/lib/inventory/service";
import { getDefinition } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { classType, statPriority, lockedExoticHash } = body; // statPriority: [mob, res, rec, dis, int, str]

        if (classType === undefined || !statPriority) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!Array.isArray(statPriority) || statPriority.length !== 6 || statPriority.some(p => typeof p !== 'number')) {
            return NextResponse.json({ error: "statPriority must be an array of 6 numbers" }, { status: 400 });
        }

        // Fetch user inventory
        const profile = await getFullProfile();

        let inventoryItems = profile.items.filter(i =>
            (i.classType === classType || i.classType === 3) &&
            (i.itemType === 2) // Armor
        );

        // Handle Locked Exotic logic
        if (lockedExoticHash) {
            const exoticDef = getDefinition("DestinyInventoryItemDefinition", lockedExoticHash) as DestinyInventoryItemDefinition | null;

            if (exoticDef && exoticDef.inventory?.bucketTypeHash) {
                const exoticBucket = exoticDef.inventory.bucketTypeHash;

                inventoryItems = inventoryItems.filter(item => {
                    // For the exotic's slot, only allow instances of that exotic
                    if (item.bucketHash === exoticBucket) {
                        return item.itemHash === Number(lockedExoticHash);
                    }
                    // For other slots, disallow Exotics (Destiny 2 limit: 1 exotic armor)
                    // item.tierType: 6 = Exotic
                    return item.tierType !== 6;
                });
            }
        }

        const objectives: BuildObjectives = {
            classType,
            statPriority: statPriority as [number, number, number, number, number, number],
            maxExotics: 1,
            assumeMasterwork: true // MVP simplification
        };

        // Run optimization
        const results = await findOptimalBuilds(objectives, inventoryItems, 20); // Limit to 20 results

        return NextResponse.json(results);

    } catch (e: unknown) {
        console.error("[Build Optimizer] Error:", e);
        const message = getErrorMessage(e);
        if (message === "Not authenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
