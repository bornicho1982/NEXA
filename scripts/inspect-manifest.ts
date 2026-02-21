
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');
const damageParamsPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyDamageTypeDefinition.json');
const breakerPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyBreakerTypeDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Find a specific item (e.g., a legendary hand cannon) to inspect
    const itemHash = Object.keys(items).find(hash => {
        const i = items[hash];
        return i.itemType === 3 && i.itemSubType === 6 && i.inventory?.tierType === 5; // Legendary Hand Cannon
    });

    if (itemHash) {
        const item = items[itemHash];
        console.log(`\n--- INSPECTING ITEM: ${item.displayProperties.name} (${item.hash}) ---`);
        console.log("Icon:", item.displayProperties.icon);
        console.log("Screenshot:", item.screenshot);
        console.log("Item Type Display Style:", item.uiItemDisplayStyle);
        console.log("Equipping Block:", JSON.stringify(item.equippingBlock, null, 2));
        console.log("Quality:", JSON.stringify(item.quality, null, 2));
        console.log("Inventory:", JSON.stringify(item.inventory, null, 2));
        console.log("Stats:", JSON.stringify(item.stats, null, 2));
        console.log("Sockets:", JSON.stringify(item.sockets, null, 2)); // Check for deepsight sockets
        console.log("Perks:", JSON.stringify(item.perks, null, 2));
        console.log("Breaker Type Hash:", item.breakerTypeHash);

        // Check for specific substring in icon paths (e.g., 'ammo')
        // Actually, let's look for ammo icons in the whole manifest
    }

    if (fs.existsSync(damageParamsPath)) {
        const damageTypes = JSON.parse(fs.readFileSync(damageParamsPath, 'utf-8'));
        console.log("\n--- DAMAGE TYPES ---");
        Object.values(damageTypes).forEach((dt: any) => {
            console.log(`${dt.displayProperties.name}: ${dt.displayProperties.icon} (Transparent: ${dt.transparentIconPath})`);
        });
    }

    if (fs.existsSync(breakerPath)) {
        const breakers = JSON.parse(fs.readFileSync(breakerPath, 'utf-8'));
        console.log("\n--- BREAKER TYPES (CHAMPIONS) ---");
        Object.values(breakers).forEach((bt: any) => {
            console.log(`${bt.displayProperties.name}: ${bt.displayProperties.icon}`);
        });
    }

} catch (e) {
    console.error(e);
}
