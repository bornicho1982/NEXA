
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const itemValues = Object.values(items);

    // The user's snippet had "inventory-item-tier3.png"
    // Tier 3 usually maps to "Rare" or "Legendary" depending on indexing (Common=0/1?).
    // Let's find items with tierType = 3, 4, 5, 6 and see their properties.

    console.log("--- ANALYZING ITEM TIERS ---");

    const tiersToCheck = [2, 3, 4, 5, 6];

    tiersToCheck.forEach(tier => {
        const sampleItem = itemValues.find((i: any) => i.inventory?.tierType === tier && i.itemType === 3); // Weapon
        if (sampleItem) {
            console.log(`\nTier ${tier}: ${sampleItem.displayProperties.name}`);
            console.log(`  TierTypeName: ${sampleItem.inventory.tierTypeName}`);
            console.log(`  Icon: ${sampleItem.displayProperties.icon}`);
            console.log(`  TierImage: ${JSON.stringify(sampleItem.inventory)}`);
            // Check finding the "featured" or "watermark" in quality
            if (sampleItem.quality) console.log(`  Quality: ${JSON.stringify(sampleItem.quality)}`);
        }
    });

} catch (e) {
    console.error(e);
}
