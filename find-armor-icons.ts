import { config } from "dotenv";
config({ path: ".env.local" });
import { ensureManifestLoaded, getManifestTable } from "./src/lib/manifest/service";

async function run() {
    await ensureManifestLoaded();
    const items = getManifestTable("DestinyInventoryItemDefinition");

    if (!items) return;

    const targets = ["Refugee Helm", "Refugee Gauntlets", "Refugee Plate", "Refugee Boots", "Refugee Mark"];

    for (const [hash, item] of Object.entries(items)) {
        const name = (item as any)?.displayProperties?.name;
        if (targets.includes(name)) {
            console.log(name, (item as any)?.displayProperties?.icon);
        }
    }
}

run().catch(console.error);
