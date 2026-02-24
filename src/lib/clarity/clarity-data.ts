import { ClarityDatabase } from "./types";

const CLARITY_URL = "https://database-clarity.github.io/Live-Clarity-Database/descriptions/dim.json";

// In-memory cache for serverless environments (will persist during the lambda execution)
let clarityDB: ClarityDatabase | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

export async function fetchClarityData(): Promise<ClarityDatabase> {
    const now = Date.now();
    if (clarityDB && (now - lastFetchTime) < CACHE_TTL) {
        return clarityDB;
    }

    try {
        console.log("[Clarity] Fetching latest community descriptions...");
        const response = await fetch(CLARITY_URL, {
            next: { revalidate: 43200 } // 12 hours Next.js cache
        });

        if (!response.ok) {
            throw new Error(`Clarity DB fetch failed with status: ${response.status}`);
        }

        const data: ClarityDatabase = await response.json();
        clarityDB = data;
        lastFetchTime = now;
        console.log(`[Clarity] Data loaded! Keys: ${Object.keys(clarityDB).length}`);
        return clarityDB;
    } catch (error) {
        console.error("[Clarity] Error loading data:", error);
        // Fallback to empty if failed, return existing cache if available
        return clarityDB || {};
    }
}
