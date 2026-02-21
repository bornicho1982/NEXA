
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const itemValues = Object.values(items);

    // Target Icon from user snippet:
    // /common/destiny2_content/icons/30920v950_weapons_activities_expansion_hand_cannon1.v2.png
    const targetIconPart = "30920v950_weapons_activities_expansion_hand_cannon1.v2.png";

    console.log(`Searching for item with icon containing: ${targetIconPart}`);

    const foundItem = itemValues.find((i: any) => i.displayProperties?.icon?.includes(targetIconPart));

    if (foundItem) {
        console.log(`\nFOUND ITEM: ${foundItem.displayProperties.name} (${foundItem.hash})`);
        console.log(JSON.stringify(foundItem, null, 2));
    } else {
        console.log("Item not found by icon. Searching for 'watermark' pattern in general...");
        // Fallback: search for the watermark
        // /common/destiny2_content/icons/v950_watermark_000_000.v2.png
        const watermarkPart = "v950_watermark_000_000.v2.png";
        const noteItem = itemValues.find((i: any) => i.iconWatermark?.includes(watermarkPart));
        if (noteItem) {
            console.log(`\nFOUND ITEM via Watermark: ${noteItem.displayProperties.name} (${noteItem.hash})`);
            console.log(`Watermark: ${noteItem.iconWatermark}`);
            console.log(`Versions: ${JSON.stringify(noteItem.quality)}`);
        }
    }

} catch (e) {
    console.error(e);
}
