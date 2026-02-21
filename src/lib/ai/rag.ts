import { searchItems, getDefinition, ensureManifestLoaded } from "@/lib/manifest/service";
import type { DestinyInventoryItemDefinition } from "@/types";

export async function getManifestContext(query: string): Promise<string> {
    // Ensure data is available
    await ensureManifestLoaded();

    // If query is too short, skip
    if (query.length < 3) return "";

    const results = searchItems(query, 3);
    if (results.length === 0) return "";

    const contextParts: string[] = [];
    contextParts.push("Información relevante del Manifiesto de Destiny 2:");

    for (const res of results) {
        const item = getDefinition("DestinyInventoryItemDefinition", res.hash) as DestinyInventoryItemDefinition | null;
        if (!item) continue;

        let info = `\nNombre: ${item.displayProperties.name}`;
        info += `\nDescripción: ${item.displayProperties.description}`;

        if (item.inventory?.tierTypeName) {
            info += `\nTier: ${item.inventory.tierTypeName}`;
        }

        contextParts.push(info);
    }

    return contextParts.join("\n---\n");
}
