import { NextResponse } from "next/server";
import { getProfileStats } from "@/lib/profile/stats-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/profile/stats — Fetch detailed Destiny 2 profile stats
 * Returns: characters, triumph score, season rank, titles, play times
 */
export async function GET() {
    try {
        const stats = await getProfileStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("[API Profile Stats] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";

        if (message === "Not authenticated") {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
