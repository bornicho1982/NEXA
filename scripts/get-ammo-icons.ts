
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Find Ammo Finder mods
    const ammoFinders = Object.values(items).filter((i: any) =>
        i.displayProperties?.name?.includes('Ammo Finder') &&
        i.itemType === 19 // Mod
    );

    console.log("--- AMMO FINDER ICONS ---");
    ammoFinders.forEach((mod: any) => {
        console.log(`${mod.displayProperties.name}: ${mod.displayProperties.icon}`);
    });

    // Also look for "Deepsight" related items
    const deepsight = Object.values(items).filter((i: any) =>
        i.displayProperties?.name?.includes('Deepsight') &&
        i.displayProperties.icon
    );

    console.log("\n--- DEEPSIGHT ICONS ---");
    deepsight.slice(0, 5).forEach((d: any) => {
        console.log(`${d.displayProperties.name}: ${d.displayProperties.icon}`);
    });

} catch (e) {
    console.error(e);
}
