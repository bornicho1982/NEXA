import { ensureManifestLoaded } from "../src/lib/manifest/service";

async function run() {
    console.log("Triggering manifest pull...");
    await ensureManifestLoaded();
    console.log("Done.");
}

run().catch(console.error);
