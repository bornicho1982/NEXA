import { ClarityDatabase, ClarityPerkData } from "./types";

// MOCK DATABASE - In a real app, this would fetch from the Clarity API/Repo
const MOCK_DB: ClarityDatabase = {
    // Example: Beyond the Veil Perk
    123456789: {
        hash: 123456789,
        name: "Beyond the Veil",
        itemHash: 82664644,
        itemName: "Omnioculus",
        descriptions: {
            en: [
                {
                    linesContent: [
                        { text: "Grants a second smoke bomb charge. Damage resist x4 while invisible.", classNames: ['pve'] }
                    ]
                }
            ]
        }
    }
};

export async function getClarityData(perkHash: number): Promise<ClarityPerkData | null> {
    return MOCK_DB[perkHash] || null;
}

export const getCommunityDescription = (itemHash: number, perkHash: number): string | null => {
    const perk = MOCK_DB[perkHash];
    if (!perk || !perk.descriptions.en?.[0]?.linesContent?.[0]?.text) return null;
    return perk.descriptions.en[0].linesContent[0].text;
};
