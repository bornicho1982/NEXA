import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const VOLTRON_URL = "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'god-rolls.json');

async function fetchVoltron(): Promise<string> {
    const res = await fetch(VOLTRON_URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    return await res.text();
}

async function main() {
    console.log("Fetching voltron wishlist...");
    const data = await fetchVoltron();
    console.log(`Downloaded ${data.length} bytes.`);

    const rolls: Record<string, { goodPerks: Set<number>, pve: Set<string>, pvp: Set<string> }> = {};

    const lines = data.split('\n');
    let currentNotes = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('//')) {
            currentNotes += trimmed.substring(2).trim() + " ";
            continue;
        }

        if (trimmed.startsWith('dimwishlist:')) {
            // e.g. dimwishlist:item=1234&perks=111,222,333
            const parts = trimmed.substring(12).split('&');
            let itemHash = "";
            let perks: number[] = [];
            let isPvE = false;
            let isPvP = false;

            for (const p of parts) {
                if (p.startsWith('item=')) {
                    itemHash = p.substring(5);
                    // Could be negative? Sometimes it's a wildcard like item=-1000
                } else if (p.startsWith('perks=')) {
                    perks = p.substring(6).split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n));
                }
            }

            const noteLower = currentNotes.toLowerCase();
            if (noteLower.includes('pve')) isPvE = true;
            if (noteLower.includes('pvp')) isPvP = true;
            if (!isPvE && !isPvP) {
                isPvE = true; // default
                isPvP = true;
            }

            if (itemHash && itemHash !== '*' && !itemHash.startsWith('-')) {
                if (!rolls[itemHash]) {
                    rolls[itemHash] = { goodPerks: new Set(), pve: new Set(), pvp: new Set() };
                }

                const perkKey = perks.sort().join(',');

                if (isPvE) rolls[itemHash].pve.add(perkKey);
                if (isPvP) rolls[itemHash].pvp.add(perkKey);
                for (const perk of perks) {
                    rolls[itemHash].goodPerks.add(perk);
                }
            }

            currentNotes = ""; // reset notes for next item
        }
    }

    // Convert sets to arrays for JSON
    const output: Record<string, number[]> = {};
    for (const [hash, info] of Object.entries(rolls)) {
        output[hash] = Array.from(info.goodPerks);
    }

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log(`Saved ${Object.keys(output).length} item rolls to ${OUTPUT_PATH}`);
}

main().catch(console.error);
