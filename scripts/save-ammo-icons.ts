
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');
const outputPath = path.join(process.cwd(), 'scripts', 'ammo_icons.txt');

try {
    const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const itemValues = Object.values(items);

    let output = "--- AMMO ICONS ---\n";

    // Primary
    const primaryFinder = itemValues.find((i: any) => i.displayProperties?.name === 'Primary Ammo Finder');
    if (primaryFinder) output += `Primary: ${primaryFinder.displayProperties.icon}\n`;

    // Special
    const specialFinder = itemValues.find((i: any) => i.displayProperties?.name === 'Special Ammo Finder');
    if (specialFinder) output += `Special: ${specialFinder.displayProperties.icon}\n`;

    // Heavy
    const heavyFinder = itemValues.find((i: any) => i.displayProperties?.name === 'Heavy Ammo Finder');
    if (heavyFinder) output += `Heavy: ${heavyFinder.displayProperties.icon}\n`;

    // Deepsight / Crafting
    output += "\n--- CRAFTING ICONS ---\n";
    const resonant = itemValues.find((i: any) => i.displayProperties?.name === 'Harmonic Resonance'); // Trait?
    if (resonant) output += `Harmonic: ${resonant.displayProperties.icon}\n`;

    const ascendant = itemValues.find((i: any) => i.displayProperties?.name === 'Ascendant Alloy');
    if (ascendant) output += `Alloy: ${ascendant.displayProperties.icon}\n`;

    // Deepsight pattern item?
    const pattern = itemValues.find((i: any) => i.displayProperties?.name === 'Deepsight Harmonizer');
    if (pattern) output += `Harmonizer: ${pattern.displayProperties.icon}\n`;

    fs.writeFileSync(outputPath, output);
    console.log("Icons saved to ammo_icons.txt");

} catch (e) {
    console.error(e);
}
