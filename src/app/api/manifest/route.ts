import { NextResponse } from "next/server";
import {
    ensureManifestLoaded,
    getManifestStatus,
    checkForUpdate,
    downloadManifest,
} from "@/lib/manifest/service";

/**
 * GET /api/manifest — Returns current manifest status and checks for updates.
 */
export async function GET() {
    try {
        await ensureManifestLoaded();
        const status = getManifestStatus();
        const updateInfo = await checkForUpdate();

        return NextResponse.json({
            ...status,
            latestVersion: updateInfo.latestVersion,
            needsUpdate: updateInfo.needsUpdate,
        });
    } catch (error) {
        console.error("[API Manifest] GET error:", error);
        return NextResponse.json(
            { error: "Failed to check manifest status" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/manifest — Force re-download the manifest.
 */
export async function POST() {
    try {
        console.log("[API Manifest] Force re-download triggered");
        await downloadManifest();
        const status = getManifestStatus();

        return NextResponse.json({
            success: true,
            ...status,
        });
    } catch (error) {
        console.error("[API Manifest] POST error:", error);
        return NextResponse.json(
            { error: "Failed to download manifest" },
            { status: 500 }
        );
    }
}
