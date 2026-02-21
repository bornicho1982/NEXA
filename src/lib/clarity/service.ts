import { ClarityDatabase, ClarityItem } from "./types";

// MOCK DATABASE - In a real app, this would fetch from the Clarity API/Repo
const MOCK_DB: ClarityDatabase = {
    items: {
        // Example: Omnioculus
        82664644: {
            hash: 82664644,
            name: "Omnioculus",
            perks: {
                // Beyond the Veil
                123456789: {
                    description: "Grants a second smoke bomb charge. Damage resist x4 while invisible.",
                    formula: "4x Resist = 50% DR in PvE, 10% in PvP"
                }
            }
        }
    },
    scalars: {
        // 2026 Scalar Table (Mocked based on research)
        "grenade_t30": [1.0, 0.9, 0.8], // Diminishing returns example
    }
};

export const getClarityInfo = (itemHash: number): ClarityItem | null => {
    return MOCK_DB.items[itemHash] || null;
};

export const getCommunityDescription = (itemHash: number, perkHash: number): string | null => {
    const item = MOCK_DB.items[itemHash];
    if (!item?.perks[perkHash]) return null;
    return item.perks[perkHash].description;
};
