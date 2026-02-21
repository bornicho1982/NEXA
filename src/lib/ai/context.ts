import { InventoryItem } from "@/lib/inventory/service";

export function summarizeInventoryContext(items: InventoryItem[]): string {
    // Filter for weapons (Type 3) and Armor (Type 2)
    const relevantItems = items.filter(i => i.itemType === 3 || i.itemType === 2);

    const exotics = relevantItems.filter(i => i.tierType === 6);
    // Prioritize Masterworked Legendaries (Tier 5)
    // We prioritize weapons for context as they define builds more than legendary armor (usually safe to assume stats)
    const topLegendaries = relevantItems
        .filter(i => i.tierType === 5 && i.isMasterwork)
        .sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0))
        .slice(0, 15);

    const exoticList = exotics.map(i => `${i.name} (${i.itemType === 2 ? 'Armor' : 'Weapon'})`).join(", ");
    const legendaryList = topLegendaries.map(i => `${i.name} (${i.itemType === 2 ? 'Armor' : 'Weapon'})`).join(", ");

    let context = `USER INVENTORY HIGHLIGHTS:\n`;
    if (exotics.length > 0) context += `- EXOTICS: ${exoticList}\n`;
    if (topLegendaries.length > 0) context += `- TOP LEGENDARIES: ${legendaryList}\n`;

    if (exotics.length === 0 && topLegendaries.length === 0) return "";

    return context;
}
