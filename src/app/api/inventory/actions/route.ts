import { NextRequest, NextResponse } from "next/server";
import { transferItem, equipItem } from "@/lib/inventory/service";

/**
 * POST /api/inventory/actions — Perform item actions (transfer, equip)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case "transfer": {
                const { itemReferenceHash, itemId, stackSize, transferToVault, characterId } = body;
                await transferItem({
                    itemReferenceHash,
                    itemId,
                    stackSize: stackSize || 1,
                    transferToVault,
                    characterId,
                });
                return NextResponse.json({ success: true, action: "transfer" });
            }

            case "equip": {
                const { itemId, characterId } = body;
                await equipItem({ itemId, characterId });
                return NextResponse.json({ success: true, action: "equip" });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[API Inventory Actions] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";

        if (message === "Not authenticated") {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
