import { NextResponse } from "next/server";
import { getFullProfile } from "@/lib/inventory/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/inventory — Fetch the user's full Destiny 2 profile (characters, items, currencies)
 */
export async function GET() {
    try {
        const profile = await getFullProfile();
        return NextResponse.json(profile);
    } catch (error) {
        console.error("[API Inventory] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";

        if (message === "Not authenticated") {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
