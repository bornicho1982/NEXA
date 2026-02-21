import { NextResponse, NextRequest } from "next/server";
import {
    getLoadouts,
    createLoadout,
    applyLoadout,
    analyzeLoadoutStats,
    cloneLoadout,
    createFromEquipped
} from "@/lib/loadouts/service";
import { getErrorMessage } from "@/lib/utils";

export async function GET() {
    try {
        const loadouts = await getLoadouts();
        return NextResponse.json(loadouts);
    } catch (e: unknown) {
        const msg = getErrorMessage(e);
        if (msg === "Not authenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, loadoutId, characterId, name, description, classType, items } = body;

        switch (action) {
            case "apply":
                if (!loadoutId || !characterId) throw new Error("Missing parameters");
                const applyResult = await applyLoadout(loadoutId, characterId);
                return NextResponse.json(applyResult);

            case "analyze":
                if (!loadoutId) throw new Error("Missing loadoutId");
                const stats = await analyzeLoadoutStats(loadoutId);
                return NextResponse.json({ stats });

            case "clone":
                if (!loadoutId) throw new Error("Missing loadoutId");
                const cloned = await cloneLoadout(loadoutId);
                return NextResponse.json(cloned);

            case "from-equipped":
                if (!characterId || !name) throw new Error("Missing parameters");
                const fromEquipped = await createFromEquipped(characterId, name);
                return NextResponse.json(fromEquipped);

            default:
                // Normal creation
                const newLoadout = await createLoadout({
                    name,
                    description,
                    classType,
                    items: items || []
                });
                return NextResponse.json(newLoadout, { status: 201 });
        }
    } catch (e: unknown) {
        const msg = getErrorMessage(e);
        if (msg === "Not authenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
