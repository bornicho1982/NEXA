
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const itemValues = Object.values(items);

    console.log("--- SEARCHING FOR WATERMARK / OVERLAY PATTERNS ---");

    // The user saw: "v900_watermark_000_000.v2.png"
    // Let's find items that have icons or watermarks matching "v900" or "watermark"

    const watermarkItems = itemValues.filter((i: any) => {
        const icon = i.displayProperties?.icon || "";
        const watermark = i.iconWatermark || "";
        const secondary = i.secondaryIcon || "";

        return icon.includes("watermark") || watermark.includes("watermark") || secondary.includes("watermark") ||
            icon.includes("v900") || watermark.includes("v900");
    }).slice(0, 10);

    watermarkItems.forEach((item: any) => {
        console.log(`Item: ${item.displayProperties.name} (${item.hash})`);
        console.log(`  Icon: ${item.displayProperties.icon}`);
        console.log(`  Watermark: ${item.iconWatermark}`);
        console.log(`  Secondary: ${item.secondaryIcon}`);
        console.log(`  Quality: ${JSON.stringify(item.quality)}`);
    });

} catch (e) {
    console.error(e);
}
