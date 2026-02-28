const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');
const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let helmet, arms, chest, legs, classItem;

for (const hash in data) {
    const item = data[hash];

    if (item.inventory && item.inventory.tierType === 2 && item.itemType === 2) {
        if (!helmet && item.inventory.bucketTypeHash === 3448274439) helmet = item.displayProperties.icon;
        if (!arms && item.inventory.bucketTypeHash === 3551918588) arms = item.displayProperties.icon;
        if (!chest && item.inventory.bucketTypeHash === 14239492) chest = item.displayProperties.icon;
        if (!legs && item.inventory.bucketTypeHash === 20886954) legs = item.displayProperties.icon;
        if (!classItem && item.inventory.bucketTypeHash === 1585787867) classItem = item.displayProperties.icon;
    }
}

console.log("HELMET:", helmet);
console.log("ARMS:", arms);
console.log("CHEST:", chest);
console.log("LEGS:", legs);
console.log("CLASS:", classItem);
