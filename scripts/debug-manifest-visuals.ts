
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), 'data', 'manifest', 'DestinyInventoryItemDefinition.json');

try {
    if (!fs.existsSync(manifestPath)) {
        console.error("Manifest file not found at:", manifestPath);
        process.exit(1);
    }

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const items = JSON.parse(raw);

    // Find a Legendary Weapon (ItemType = 3, TierType = 5)
    const weaponHash = Object.keys(items).find(hash => {
        const item = items[hash];
        return item.itemType === 3 && item.inventory?.tierType === 5;
    });

    if (weaponHash) {
        const item = items[weaponHash];
        console.log("--- DEBUG WEAPON ---");
        console.log("Name:", item.displayProperties.name);
        console.log("Hash:", item.hash);
        console.log("EquippingBlock AmmoType:", item.equippingBlock?.ammoType);
        console.log("IconWatermark:", item.iconWatermark);
        console.log("Quality Watermarks:", item.quality?.displayVersionWatermarkIcons);
        console.log("DefaultDamageType:", item.defaultDamageType);
        console.log("DefaultDamageTypeHash:", item.defaultDamageTypeHash);
    } else {
        console.log("No legendary weapon found (unexpected).");
    }

    // Check Damage Type Def
    const damagePath = path.join(process.cwd(), 'data', 'manifest', 'DestinyDamageTypeDefinition.json');
    if (fs.existsSync(damagePath)) {
        const damageRaw = fs.readFileSync(damagePath, 'utf-8');
        const damageTypes = JSON.parse(damageRaw);
        console.log("\n--- DEBUG DAMAGE TYPES ---");
        Object.values(damageTypes).forEach((dt: any) => {
            console.log(`Hash: ${dt.hash}, Name: ${dt.displayProperties.name}, Icon: ${dt.displayProperties.icon}, Transparent: ${dt.transparentIconPath}`);
        });
    }

} catch (e) {
    console.error("Error reading manifest:", e);
}
