import fs from "fs/promises";
import path from "path";
import type { ManifestTableName, ManifestTableMap, ManifestInfo } from "@/types";
import { bungieRequest } from "@/lib/bungie/client";

// ─── Configuration ───

const MANIFEST_DIR = path.join(process.cwd(), "data", "manifest");
const INFO_FILE = path.join(MANIFEST_DIR, "info.json");
const LANGUAGE = "es";

/** Tables we download and cache */
const TABLES_TO_DOWNLOAD: ManifestTableName[] = [
    "DestinyInventoryItemDefinition",
    "DestinyStatDefinition",
    "DestinyClassDefinition",
    "DestinyDamageTypeDefinition",
    "DestinySocketCategoryDefinition",
    "DestinyStatGroupDefinition",
    "DestinyEnergyTypeDefinition",
    "DestinyLoadoutNameDefinition",
    "DestinyLoadoutIconDefinition",
    "DestinyLoadoutColorDefinition",
    "DestinyPlugSetDefinition",
    "DestinySocketTypeDefinition",
    "DestinySandboxPerkDefinition",
    "DestinyInventoryItemConstantsDefinition",
    "DestinyCollectibleDefinition",
    "DestinyObjectiveDefinition",
    "DestinyLoreDefinition",
    "DestinyInventoryBucketDefinition",
];

// ─── In-Memory Cache ───

interface ManifestCache {
    version: string | null;
    tables: Map<string, Record<string, unknown>>;
    loading: boolean;
    lastCheck: number;
}

// ─── In-Memory Cache ───

interface ManifestCache {
    version: string | null;
    tables: Map<string, Record<string, unknown>>;
    loading: boolean;
    lastCheck: number;
}

const globalForManifest = globalThis as unknown as {
    manifestCache: ManifestCache | undefined;
};

const cache: ManifestCache = globalForManifest.manifestCache ?? {
    version: null,
    tables: new Map(),
    loading: false,
    lastCheck: 0,
};

if (process.env.NODE_ENV !== "production") globalForManifest.manifestCache = cache;

// ─── Bungie Manifest API Types ───

interface BungieManifestResponse {
    version: string;
    jsonWorldComponentContentPaths: Record<string, Record<string, string>>;
}

// ─── Public API ───

/**
 * Ensure the manifest is loaded into memory.
 * Downloads from Bungie if no local cache exists.
 */
export async function ensureManifestLoaded(): Promise<void> {
    if (cache.tables.size > 0 && cache.version) {
        return; // Already loaded
    }

    if (cache.loading) {
        // Wait for ongoing load to finish
        while (cache.loading) {
            await new Promise((r) => setTimeout(r, 200));
        }
        return;
    }

    cache.loading = true;

    try {
        // Try loading from disk first
        const loaded = await loadFromDisk();
        if (loaded) {
            console.log(`[Manifest] Loaded from disk (version: ${cache.version})`);
            return;
        }

        // No disk cache — download fresh
        console.log("[Manifest] No cache found, downloading...");
        await downloadManifest();
    } finally {
        cache.loading = false;
    }
}

/**
 * Check if a newer manifest version is available.
 * Returns true if an update was downloaded.
 */
export async function checkForUpdate(): Promise<{
    needsUpdate: boolean;
    currentVersion: string | null;
    latestVersion: string;
}> {
    const manifest = await bungieRequest<BungieManifestResponse>(
        "/Destiny2/Manifest/"
    );

    const needsUpdate = manifest.version !== cache.version;

    return {
        needsUpdate,
        currentVersion: cache.version,
        latestVersion: manifest.version,
    };
}

/**
 * Force download the manifest from Bungie and update the cache.
 */
export async function downloadManifest(): Promise<void> {
    console.log("[Manifest] Fetching manifest metadata from Bungie...");

    const manifest = await bungieRequest<BungieManifestResponse>(
        "/Destiny2/Manifest/"
    );

    const paths = manifest.jsonWorldComponentContentPaths[LANGUAGE];
    if (!paths) {
        throw new Error(`[Manifest] No paths found for language: ${LANGUAGE}`);
    }

    // Ensure directory exists
    await fs.mkdir(MANIFEST_DIR, { recursive: true });

    // Download each table
    for (const tableName of TABLES_TO_DOWNLOAD) {
        const tablePath = paths[tableName];
        if (!tablePath) {
            console.warn(`[Manifest] No path for table: ${tableName}, skipping...`);
            continue;
        }

        console.log(`[Manifest] Downloading ${tableName}...`);

        const url = `https://www.bungie.net${tablePath}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(
                `[Manifest] Failed to download ${tableName}: ${res.status}`
            );
        }

        const data = await res.json();

        // Save to disk
        const filePath = path.join(MANIFEST_DIR, `${tableName}.json`);
        await fs.writeFile(filePath, JSON.stringify(data));

        // Load into memory
        cache.tables.set(tableName, data as Record<string, unknown>);

        console.log(
            `[Manifest] ${tableName}: ${Object.keys(data as Record<string, unknown>).length} definitions`
        );
    }

    // Save version info
    cache.version = manifest.version;
    cache.lastCheck = Date.now();

    const info: ManifestInfo = {
        version: manifest.version,
        downloadedAt: new Date().toISOString(),
        language: LANGUAGE,
        tables: TABLES_TO_DOWNLOAD as string[],
    };

    await fs.writeFile(INFO_FILE, JSON.stringify(info, null, 2));
    console.log(`[Manifest] Download complete (version: ${manifest.version})`);
}

/**
 * Get a single definition by table and hash.
 */
export function getDefinition<T extends ManifestTableName>(
    table: T,
    hash: string | number
): ManifestTableMap[T] | null {
    const tableData = cache.tables.get(table);
    if (!tableData) return null;

    const entry = tableData[String(hash)];
    return (entry as ManifestTableMap[T]) ?? null;
}

/**
 * Get all definitions for a table.
 */
export function getAllDefinitions<T extends ManifestTableName>(
    table: T
): Record<string, ManifestTableMap[T]> | null {
    const tableData = cache.tables.get(table);
    if (!tableData) return null;
    return tableData as Record<string, ManifestTableMap[T]>;
}

/**
 * Get current manifest status.
 */
export function getManifestStatus(): {
    loaded: boolean;
    version: string | null;
    tableCount: number;
    tables: string[];
} {
    return {
        loaded: cache.tables.size > 0,
        version: cache.version,
        tableCount: cache.tables.size,
        tables: Array.from(cache.tables.keys()),
    };
}

/**
 * Search items by name (case-insensitive substring match).
 */
export function searchItems(
    query: string,
    limit = 25
): Array<{ hash: string; name: string; icon?: string; itemType: number }> {
    const items = cache.tables.get("DestinyInventoryItemDefinition");
    if (!items) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ hash: string; name: string; icon?: string; itemType: number }> = [];

    for (const [hash, entry] of Object.entries(items)) {
        const item = entry as { displayProperties?: { name?: string; icon?: string }; itemType?: number };
        const name = item.displayProperties?.name;
        if (name && name.toLowerCase().includes(lowerQuery)) {
            results.push({
                hash,
                name,
                icon: item.displayProperties?.icon,
                itemType: item.itemType ?? 0,
            });
            if (results.length >= limit) break;
        }
    }

    return results;
}

// ─── Internal Helpers ───

async function loadFromDisk(): Promise<boolean> {
    try {
        const infoRaw = await fs.readFile(INFO_FILE, "utf-8");
        const info: ManifestInfo = JSON.parse(infoRaw);

        // Use TABLES_TO_DOWNLOAD (code truth) instead of info.tables (stale file)
        // This ensures newly added tables get loaded even if info.json is outdated
        const tablesToLoad = TABLES_TO_DOWNLOAD;

        await Promise.all(tablesToLoad.map(async (tableName) => {
            const filePath = path.join(MANIFEST_DIR, `${tableName}.json`);
            try {
                const raw = await fs.readFile(filePath, "utf-8");
                const data = JSON.parse(raw);
                cache.tables.set(tableName, data);
            } catch {
                // Table file doesn't exist on disk — skip silently
                // It will be downloaded on next full manifest refresh
                console.warn(`[Manifest] Table ${tableName} not found on disk, skipping...`);
            }
        }));

        cache.version = info.version;
        cache.lastCheck = Date.now();
        return true;
    } catch {
        return false;
    }
}
