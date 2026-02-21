import { NextResponse } from "next/server";
import { getManifestStatus } from "@/lib/manifest/service";

export async function GET() {
    return NextResponse.json(getManifestStatus());
}
