import { NextRequest, NextResponse } from "next/server";
import {
    ensureManifestLoaded,
    getDefinition,
    searchItems,
} from "@/lib/manifest/service";
import type { ManifestTableName } from "@/types";

const VALID_TABLES: ManifestTableName[] = [
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
];

/**
 * GET /api/manifest/definition?table=...&hash=...
 * GET /api/manifest/definition?search=...&limit=...
 */
export async function GET(request: NextRequest) {
    try {
        await ensureManifestLoaded();

        const { searchParams } = request.nextUrl;

        // Search mode
        const searchQuery = searchParams.get("search");
        if (searchQuery) {
            const limit = parseInt(searchParams.get("limit") || "25", 10);
            const results = searchItems(searchQuery, limit);
            return NextResponse.json({ results });
        }

        // Definition lookup mode
        const table = searchParams.get("table") as ManifestTableName | null;
        const hash = searchParams.get("hash");

        if (!table || !hash) {
            return NextResponse.json(
                { error: "Missing required query params: table, hash" },
                { status: 400 }
            );
        }

        if (!VALID_TABLES.includes(table)) {
            return NextResponse.json(
                { error: `Invalid table: ${table}`, validTables: VALID_TABLES },
                { status: 400 }
            );
        }

        const definition = getDefinition(table, hash);

        if (!definition) {
            return NextResponse.json(
                { error: `Definition not found: ${table}/${hash}` },
                { status: 404 }
            );
        }

        return NextResponse.json({ definition });
    } catch (error) {
        console.error("[API Definition] Error:", error);
        return NextResponse.json(
            { error: "Failed to get definition" },
            { status: 500 }
        );
    }
}
