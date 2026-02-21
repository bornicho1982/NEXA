
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const itemValues = Object.values(items);

    console.log("--- ANALYZING DEEPSIGHT / CRAFTING INDICATORS ---");

    // Look for items with specific socket entries that might indicate Deepsight
    // In current Destiny 2, Deepsight is often a plug in a socket, or an Objective.
    // Let's find items that mention "Deepsight" in their sockets or PERKS.

    const deepsightItems = itemValues.filter((i: any) =>
        i.displayProperties?.name?.includes('Deepsight') ||
        (i.sockets?.socketEntries?.some((s: any) => s.singleInitialItemHash === 0)) // Just a random check, likely deeper
    ).slice(0, 5);

    // Filter for items that look like weapons and check their sockets for "Resonance"
    const resonantWeapons = itemValues.filter((i: any) =>
        i.itemType === 3 &&
        JSON.stringify(i).includes("Resonance")
    ).slice(0, 3);

    resonantWeapons.forEach((item: any) => {
        console.log(`Weapon: ${item.displayProperties.name} (${item.hash})`);
        // Check sockets
        if (item.sockets) {
            console.log("  Sockets:");
            item.sockets.socketEntries.forEach((s: any, idx: number) => {
                // We'd need to look up plug hashes to know what they are, but for now just dump interesting ones
                if (s.singleInitialItemHash) console.log(`    Slot ${idx}: ${s.singleInitialItemHash}`);
            });
        }
    });

} catch (e) {
    console.error(e);
}
