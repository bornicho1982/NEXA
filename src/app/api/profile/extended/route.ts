import { NextResponse } from "next/server";
import { getProfileExtended } from "@/lib/profile/extended-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/profile/extended — PvP/PvE stats, recent activities, clan info
 */
export async function GET() {
    try {
        const data = await getProfileExtended();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API Profile Extended] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";

        if (message === "Not authenticated") {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
