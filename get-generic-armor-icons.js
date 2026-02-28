const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'data', 'manifest', 'DestinyInventoryItemDefinition.json');
if (!fs.existsSync(manifestPath)) {
    console.error("Manifest not found:", manifestPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let helmet, arms, chest, legs, classItem;

for (const hash in data) {
    const item = data[hash];
    const name = item.displayProperties?.name;
    const icon = item.displayProperties?.icon;

    // We want specifically the generic dummy items that just represent the slot.
    // They are usually called "Helmet", "Gauntlets", "Chest Armor", "Leg Armor", "Titan Mark" etc.
    if (icon && item.itemType === 2) {
        if (!helmet && name === "Helmet" && item.inventory?.bucketTypeHash === 3448274439) helmet = icon;
        if (!arms && name === "Gauntlets" && item.inventory?.bucketTypeHash === 3551918588) arms = icon;
        if (!chest && name === "Chest Armor" && item.inventory?.bucketTypeHash === 14239492) chest = icon;
        if (!legs && name === "Leg Armor" && item.inventory?.bucketTypeHash === 20886954) legs = icon;
        if (!classItem && (name === "Titan Mark" || name === "Hunter Cloak" || name === "Warlock Bond" || name === "Class Armor") && item.inventory?.bucketTypeHash === 1585787867) classItem = icon;
    }
}

console.log("Helmet:", helmet);
console.log("Arms:", arms);
console.log("Chest:", chest);
console.log("Legs:", legs);
console.log("Class:", classItem);
