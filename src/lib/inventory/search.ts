import { InventoryItem } from "./service";

/**
 * Evaluates an item against a complex multi-token search query.
 * Example query: "is:weapon is:godroll stat:handling:>50"
 */
export function evaluateSearchQuery(
    item: InventoryItem,
    query: string,
    isGodRollFunc: (itemHash: number, equippedPlugs: number[]) => boolean
): boolean {
    if (!query) return true;

    // Split by spaces to get individual tokens (e.g., ["is:weapon", "tag:junk", "sunshot"])
    const tokens = query.toLowerCase().trim().split(/\s+/);

    // If an item fails ANY token, it's filtered out (AND logic)
    for (const token of tokens) {
        if (!evaluateToken(item, token, isGodRollFunc)) {
            return false;
        }
    }

    return true;
}

function evaluateToken(
    item: InventoryItem,
    token: string,
    isGodRollFunc: (itemHash: number, equippedPlugs: number[]) => boolean
): boolean {
    // is:... commands
    if (token.startsWith("is:")) {
        const cmd = token.substring(3);
        switch (cmd) {
            case "weapon": return item.itemType === 3;
            case "armor": return item.itemType === 2;
            case "exotic": return item.tierType === 6;
            case "legendary": return item.tierType === 5;
            case "kinetic": return item.damageType === 1; // 1 is Kinetic usually
            case "energy": return item.damageType === 2 || item.damageType === 3 || item.damageType === 4 || item.damageType === 6 || item.damageType === 7;
            case "power": case "heavy": return item.ammoType === 3;
            case "primary": return item.ammoType === 1;
            case "special": return item.ammoType === 2;
            case "deepsight": return item.isDeepsight === true;
            case "crafted": return item.isCrafted === true;
            case "locked": return item.isLocked === true;
            case "masterwork": return item.isMasterwork === true;
            case "godroll":
                if (item.itemType !== 3) return false;
                const equippedPlugs = item.sockets?.filter(s => s.isEnabled).map(s => s.plugHash!) || [];
                return isGodRollFunc(item.itemHash, equippedPlugs);
            default: return false;
        }
    }

    // tag:... commands
    if (token.startsWith("tag:")) {
        const tag = token.substring(4);
        if (tag === "none") return !item.tag;
        return item.tag === tag;
    }

    // stat:... commands (e.g. stat:resilience:>20 or stat:recovery:<10)
    if (token.startsWith("stat:")) {
        // format: stat:statName:operator:value  => "stat:resilience:>20"
        // Wait, regular DIM is `stat:resilience:>20`. Let's support matchers: >, <, >=, <=, =, :
        const match = token.match(/^stat:([a-z]+):([><=:]+)([0-9]+)$/);
        if (match) {
            const statName = match[1];
            const operator = match[2];
            const targetValue = parseInt(match[3], 10);

            // Find the stat on the item
            // For weapons it's weaponStats, for armor it's armorStats
            const allStats = [...(item.weaponStats || []), ...(item.armorStats || [])];
            const stat = allStats.find(s => s.name.toLowerCase().replace(/\s+/g, "") === statName);

            if (!stat) return false;

            const val = stat.value;
            switch (operator) {
                case ">": return val > targetValue;
                case "<": return val < targetValue;
                case ">=": return val >= targetValue;
                case "<=": return val <= targetValue;
                case "=": case ":": return val === targetValue;
                default: return false;
            }
        }
        return true; // Malformed stat query, ignore
    }

    // If no prefix, just text search on Name or Type
    return (
        item.name.toLowerCase().includes(token) ||
        (item.typeName && item.typeName.toLowerCase().includes(token)) ||
        false
    );
}
