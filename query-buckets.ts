import { config } from "dotenv";
config({ path: ".env.local" });
import { ensureManifestLoaded, getManifestTable } from "./src/lib/manifest/service";

async function run() {
    await ensureManifestLoaded();
    const buckets = getManifestTable("DestinyInventoryBucketDefinition");

    if (!buckets) {
        console.error("No buckets found in manifest.");
        return;
    }

    const targetHashes = [3448274439, 3551918588, 14239492, 20886954, 1585787867];

    for (const h of targetHashes) {
        const bucket = buckets[h] as any;
        console.log(`Bucket ${h}: ${bucket?.displayProperties?.name} -> ${bucket?.displayProperties?.icon}`);
    }
}

run().catch(console.error);
