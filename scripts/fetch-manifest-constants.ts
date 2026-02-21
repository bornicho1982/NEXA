
import fs from "fs/promises";
import path from "path";
import https from "https";

// Simple .env parser to avoid deps
async function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), ".env.local");
        const envContent = await fs.readFile(envPath, "utf-8");
        const env: Record<string, string> = {};
        for (const line of envContent.split("\n")) {
            const [key, ...val] = line.split("=");
            if (key && val) env[key.trim()] = val.join("=").trim();
        }
        return env;
    } catch {
        return {};
    }
}

async function fetchJson(url: string, apiKey: string) {
    return new Promise<any>((resolve, reject) => {
        const req = https.get(url, { headers: { "X-API-Key": apiKey } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(JSON.parse(data)));
        });
        req.on("error", reject);
    });
}

async function main() {
    const env = await loadEnv();
    const apiKey = env["BUNGIE_API_KEY"];
    if (!apiKey) throw new Error("BUNGIE_API_KEY not found in .env.local");

    console.log("Fetching manifest metadata...");
    const manifest = await fetchJson("https://www.bungie.net/Platform/Destiny2/Manifest/", apiKey);

    const paths = manifest.Response.jsonWorldComponentContentPaths.en;
    const tablePath = paths["DestinyInventoryItemConstantsDefinition"];

    if (!tablePath) throw new Error("Table path not found in manifest");

    console.log("Downloading DestinyInventoryItemConstantsDefinition...");
    const tableUrl = `https://www.bungie.net${tablePath}`;
    const tableData = await fetchJson(tableUrl, apiKey);

    const outFile = path.join(process.cwd(), "data", "manifest", "DestinyInventoryItemConstantsDefinition.json");
    await fs.writeFile(outFile, JSON.stringify(tableData, null, 2));

    console.log("Saved to", outFile);

    // Inspect content immediately
    console.log("Inspecting content...");
    if (tableData["1"]) {
        console.log(JSON.stringify(tableData["1"], null, 2));
    } else {
        const firstKey = Object.keys(tableData)[0];
        if (firstKey) console.log(JSON.stringify(tableData[firstKey], null, 2));
    }
}

main().catch(console.error);
