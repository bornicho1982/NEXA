import { NextResponse } from "next/server";
import { checkOllamaHealth } from "@/lib/ai/client";

/**
 * GET /api/ai/status — Check Ollama connection health
 */
export async function GET() {
    try {
        const status = await checkOllamaHealth();
        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json(
            { online: false, error: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
