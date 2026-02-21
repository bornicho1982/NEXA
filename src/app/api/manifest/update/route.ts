import { NextResponse } from "next/server";
import { checkForUpdate, downloadManifest } from "@/lib/manifest/service";
import { getErrorMessage } from "@/lib/utils";

export async function POST() {
    try {
        console.log("[Manifest] Update requested via API");
        const status = await checkForUpdate();

        if (status.needsUpdate) {
            console.log(`[Manifest] Update available: ${status.currentVersion} -> ${status.latestVersion}`);
            await downloadManifest();
            return NextResponse.json({
                success: true,
                updated: true,
                oldVersion: status.currentVersion,
                newVersion: status.latestVersion
            });
        }

        return NextResponse.json({
            success: true,
            updated: false,
            version: status.currentVersion
        });
    } catch (error: unknown) {
        console.error("[Manifest] Update failed:", error);
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
