import { NextResponse } from "next/server";
import { ensureManifestLoaded, getDefinition, getAllDefinitions } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition } from "@/types";

export async function GET(request: Request) {
    await ensureManifestLoaded();

    const { searchParams } = new URL(request.url);
    const classType = searchParams.get("classType"); // 0=Titan, 1=Hunter, 2=Warlock

    if (classType === null) {
        return NextResponse.json({ error: "Missing classType" }, { status: 400 });
    }

    const targetClass = parseInt(classType, 10);
    const allItems = getAllDefinitions("DestinyInventoryItemDefinition");

    if (!allItems) {
        return NextResponse.json({ error: "Manifest not loaded" }, { status: 500 });
    }

    // 1. Find all Subclasses for this class
    const subclasses: any[] = [];

    for (const item of Object.values(allItems)) {
        if (
            item.itemType === 16 && // Subclass
            item.classType === targetClass &&
            // Filter out older/test versions if necessary, but usually checking itemType 16 is enough
            // Maybe check for specific socket categories (Abilities/Aspects/Fragments)
            item.sockets
        ) {
            // Build a richer object with resolved options
            subclasses.push(await processSubclass(item));
        }
    }

    return NextResponse.json({ subclasses });
}

async function processSubclass(item: DestinyInventoryItemDefinition) {
    // We want to group sockets into: Super, Abilities, Aspects, Fragments
    // Socket Categories help here.

    // Standard D2 Subclass Socket Categories:
    // Super: often has specific category or index
    // Abilities: Class, Movement, Melee, Grenade
    // Aspects
    // Fragments

    const sockets: any[] = [];

    if (item.sockets?.socketEntries) {
        for (let i = 0; i < item.sockets.socketEntries.length; i++) {
            const socketEntry = item.sockets.socketEntries[i];
            const socketTypeHash = socketEntry.socketTypeHash;

            // Resolve options
            let options: any[] = [];

            // 1. Initial Item
            if (socketEntry.singleInitialItemHash) {
                const initItem = getDefinition("DestinyInventoryItemDefinition", socketEntry.singleInitialItemHash);
                if (initItem) {
                    options.push({
                        hash: initItem.hash,
                        name: initItem.displayProperties.name,
                        icon: initItem.displayProperties.icon,
                        description: initItem.displayProperties.description,
                        tierType: initItem.inventory?.tierType
                    });
                }
            }

            // 2. Reusable Plug Set
            if (socketEntry.reusablePlugSetHash) {
                const plugSet = getDefinition("DestinyPlugSetDefinition", socketEntry.reusablePlugSetHash);
                if (plugSet) {
                    for (const plugEntry of plugSet.reusablePlugItems) {
                        if (!plugEntry.currentlyCanItRoll) continue;
                        const plugItem = getDefinition("DestinyInventoryItemDefinition", plugEntry.plugItemHash);
                        if (plugItem) {
                            options.push({
                                hash: plugItem.hash,
                                name: plugItem.displayProperties.name,
                                icon: plugItem.displayProperties.icon,
                                description: plugItem.displayProperties.description,
                                statBonuses: plugItem.investmentStats // Needed for Fragments
                            });
                        }
                    }
                }
            }

            // 3. Randomized Plug Set (usually not for subclasses, but good to handle)
            if (socketEntry.randomizedPlugSetHash) {
                const plugSet = getDefinition("DestinyPlugSetDefinition", socketEntry.randomizedPlugSetHash);
                if (plugSet) {
                    for (const plugEntry of plugSet.reusablePlugItems) {
                        // Similar logic
                        if (!plugEntry.currentlyCanItRoll) continue;
                        const plugItem = getDefinition("DestinyInventoryItemDefinition", plugEntry.plugItemHash);
                        if (plugItem) {
                            options.push({
                                hash: plugItem.hash,
                                name: plugItem.displayProperties.name,
                                icon: plugItem.displayProperties.icon,
                                description: plugItem.displayProperties.description
                            });
                        }
                    }
                }
            }

            // Filter out empty options or duplicates
            options = options.filter((v, i, a) => a.findIndex(t => (t.hash === v.hash)) === i);

            if (options.length > 0) {
                sockets.push({
                    index: i,
                    socketTypeHash,
                    options
                });
            }
        }
    }

    return {
        hash: item.hash,
        name: item.displayProperties.name,
        icon: item.displayProperties.icon,
        damageType: item.defaultDamageType, // 2=Arc, 3=Solar etc
        sockets
    };
}
