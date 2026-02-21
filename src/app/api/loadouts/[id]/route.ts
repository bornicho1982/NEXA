import { NextResponse, NextRequest } from "next/server";
import { updateLoadout, deleteLoadout } from "@/lib/loadouts/service";
import { getErrorMessage } from "@/lib/utils";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await updateLoadout(id, body);
        return NextResponse.json(updated);
    } catch (e: unknown) {
        const msg = getErrorMessage(e);
        if (msg === "Not authenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (msg === "Loadout not found") return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteLoadout(id);
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = getErrorMessage(e);
        if (msg === "Not authenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (msg === "Loadout not found") return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
