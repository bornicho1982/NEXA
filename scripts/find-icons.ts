
const fs = require('fs');
const path = require('path');

const manifestDir = path.join(process.cwd(), 'data', 'manifest');

function searchTable(tableName, query) {
    const p = path.join(manifestDir, `${tableName}.json`);
    if (!fs.existsSync(p)) return;

    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const results = Object.values(data).filter((d: any) =>
        d.displayProperties?.name?.toLowerCase().includes(query.toLowerCase())
    );

    results.forEach((r: any) => {
        console.log(`[${tableName}] Found '${r.displayProperties.name}': ${r.displayProperties.icon}`);
    });
}

// Search for Ammo Icons
console.log("--- SEARCHING FOR AMMO ICONS ---");
searchTable('DestinyInventoryItemDefinition', 'Primary Ammo');
searchTable('DestinyInventoryItemDefinition', 'Special Ammo');
searchTable('DestinyInventoryItemDefinition', 'Heavy Ammo');
searchTable('DestinyItemCategoryDefinition', 'Ammo');

// Search for Deepsight / Resonant
console.log("\n--- SEARCHING FOR DEEPSIGHT / RESONANT ---");
searchTable('DestinyInventoryItemDefinition', 'Deepsight');
// searchTable('DestinyObjectiveDefinition', 'Attunement'); // Maybe?

// Check Damage Types again
console.log("\n--- DAMAGE TYPES ---");
const damages = JSON.parse(fs.readFileSync(path.join(manifestDir, 'DestinyDamageTypeDefinition.json'), 'utf-8'));
Object.values(damages).forEach((dt: any) => {
    console.log(`Damage: ${dt.displayProperties.name} -> ${dt.displayProperties.icon} | Transparent: ${dt.transparentIconPath}`);
});
