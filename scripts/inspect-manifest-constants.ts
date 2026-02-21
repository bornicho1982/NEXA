
import fs from "fs/promises";
import path from "path";

async function main() {
    console.log("Reading DestinyInventoryItemConstantsDefinition.json...");

    // We expect the file to be at data/manifest/DestinyInventoryItemConstantsDefinition.json
    // because service.ts saves it there.
    const filePath = path.join(process.cwd(), "data", "manifest", "DestinyInventoryItemConstantsDefinition.json");

    try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        console.log("File loaded. Keys:", Object.keys(data));

        // DIM says: `itemConstants = db.DestinyInventoryItemConstantsDefinition[1]`
        // So let's check key "1".
        if (data["1"]) {
            console.log("Found definition at key '1':");
            console.log(JSON.stringify(data["1"], null, 2));
        } else {
            console.log("Key '1' not found. Dumping first entry:");
            const firstKey = Object.keys(data)[0];
            if (firstKey) {
                console.log(JSON.stringify(data[firstKey], null, 2));
            }
        }

    } catch (e) {
        console.error("Error reading manifest file:", e);
        console.log("Make sure you have run the app at least once after updating 'service.ts' to download this table.");
    }
}

main().catch(e => console.error(e));
