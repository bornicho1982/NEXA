import { create } from 'zustand';
import type { ItemProps } from "@/components/inventory/ItemCard";
import { getMasterworkBonus, getArtificeBonus } from "@/lib/mechanics/masterwork";
import { STAT_KEYS, StatKey } from "@/lib/mechanics/stats";

type Item = ItemProps['item'];

export interface BuildState {
    subclass: Item | null;
    subclassPlugs: Record<number, number | null>; // SocketIndex -> PlugHash
    subclassPlugStats: Record<number, Record<string, number>>; // SocketIndex -> Stats

    // Equipment
    weapons: { [key: number]: Item | null };
    armor: { [key: number]: Item | null };

    // Artifice Configuration
    // Key: Armor Bucket Hash (e.g. Helmet), Value: Stat Hash (e.g. Mobility) or null
    artificeMods: Record<number, number | null>;

    // Derived Stats (Calculated)
    stats: Record<string, number>;

    // Actions
    setSubclass: (item: Item) => void;
    setSubclassPlug: (socketIndex: number, plugHash: number | null, stats?: Record<string, { value: number }>) => void;
    equipItem: (bucketHash: number, item: Item) => void;
    unequipItem: (bucketHash: number) => void;
    setArtificeMod: (bucketHash: number, statHash: number | null) => void;
    resetBuild: () => void;
}

export const useBuildStore = create<BuildState>((set, get) => ({
    subclass: null,
    subclassPlugs: {},
    subclassPlugStats: {},
    weapons: { 1498876634: null, 2465295065: null, 953998645: null },
    armor: { 3448274439: null, 3551918588: null, 14239492: null, 20886954: null, 1585787867: null },
    artificeMods: {},

    stats: {
        Mobility: 0,
        Resilience: 0, // Mapped to Health in UI
        Recovery: 0,
        Discipline: 0,
        Intellect: 0,
        Strength: 0
    },

    setSubclass: (item) => set({ subclass: item, subclassPlugs: {}, subclassPlugStats: {}, stats: recalculateAll(get(), { subclass: item, subclassPlugs: {}, subclassPlugStats: {} }) }),

    setSubclassPlug: (socketIndex, plugHash, plugStats) => set((state) => {
        const newPlugs = { ...state.subclassPlugs, [socketIndex]: plugHash };
        let newPlugStats = { ...state.subclassPlugStats };

        if (plugHash && plugStats) {
            const normalized: Record<string, number> = {};
            Object.entries(plugStats).forEach(([statHash, data]) => {
                normalized[statHash] = data.value;
            });
            newPlugStats[socketIndex] = normalized;
        } else {
            delete newPlugStats[socketIndex];
        }

        return {
            subclassPlugs: newPlugs,
            subclassPlugStats: newPlugStats,
            stats: recalculateAll(state, { subclassPlugs: newPlugs, subclassPlugStats: newPlugStats })
        };
    }),

    equipItem: (bucketHash, item) => set((state) => {
        const newArmor = { ...state.armor };
        if (newArmor.hasOwnProperty(bucketHash)) {
            newArmor[bucketHash] = item;
            return { armor: newArmor, stats: recalculateAll(state, { armor: newArmor }) };
        }

        // Weapon equip doesn't affect stats usually, allowing anyway
        const newWeapons = { ...state.weapons };
        if (newWeapons.hasOwnProperty(bucketHash)) {
            newWeapons[bucketHash] = item;
            return { weapons: newWeapons };
        }
        return {};
    }),

    unequipItem: (bucketHash) => set((state) => {
        const newArmor = { ...state.armor };
        if (newArmor.hasOwnProperty(bucketHash)) {
            newArmor[bucketHash] = null;
            return { armor: newArmor, stats: recalculateAll(state, { armor: newArmor }) };
        }

        const newWeapons = { ...state.weapons };
        if (newWeapons.hasOwnProperty(bucketHash)) {
            newWeapons[bucketHash] = null;
            return { weapons: newWeapons };
        }
        return {};
    }),

    setArtificeMod: (bucketHash, statHash) => set((state) => {
        // Only allow if the armor piece in that bucket is actually Artifice
        // In a real app we'd check item.isArtifice, but here we assume UI handles visibility
        const newArtifice = { ...state.artificeMods, [bucketHash]: statHash };
        return {
            artificeMods: newArtifice,
            stats: recalculateAll(state, { artificeMods: newArtifice })
        };
    }),

    resetBuild: () => set({
        subclass: null,
        subclassPlugs: {},
        subclassPlugStats: {},
        weapons: { 1498876634: null, 2465295065: null, 953998645: null },
        armor: { 3448274439: null, 3551918588: null, 14239492: null, 20886954: null, 1585787867: null },
        artificeMods: {},
        stats: { Mobility: 0, Resilience: 0, Recovery: 0, Discipline: 0, Intellect: 0, Strength: 0 }
    })
}));

// --- Centralized Calculation Logic ---

const STAT_HASH_MAP: Record<number, string> = {
    2996146975: "Mobility",
    392767087: "Resilience",
    1943323491: "Recovery",
    1735777505: "Discipline",
    144602215: "Intellect",
    4244567218: "Strength"
};

function recalculateAll(currentState: BuildState, overrides: Partial<BuildState> = {}): Record<string, number> {
    const state = { ...currentState, ...overrides };

    const stats: Record<string, number> = {
        Mobility: 0,
        Resilience: 0,
        Recovery: 0,
        Discipline: 0,
        Intellect: 0,
        Strength: 0
    };

    // 1. Armor Base Stats + Masterworks
    Object.values(state.armor).forEach((item) => {
        if (!item) return;

        // Base Stats
        if (item.stats) {
            Object.entries(item.stats).forEach(([statName, value]) => {
                // Ensure casing matches our keys
                const key = statName.charAt(0).toUpperCase() + statName.slice(1);
                if (stats.hasOwnProperty(key)) {
                    stats[key] += (value as number);
                }
            });
        }

        // Masterwork Bonus (+2 all)
        const mwBonus = getMasterworkBonus(item);
        Object.entries(mwBonus).forEach(([key, val]) => {
            if (stats.hasOwnProperty(key)) stats[key] += val;
        });
    });

    // 2. Artifice Bonuses
    Object.values(state.artificeMods).forEach((statHash) => {
        const artBonus = getArtificeBonus(statHash);
        Object.entries(artBonus).forEach(([key, val]) => {
            if (stats.hasOwnProperty(key)) stats[key] += val;
        });
    });

    // 3. Subclass Fragments/Aspects
    Object.values(state.subclassPlugStats).forEach((socketStats) => {
        Object.entries(socketStats).forEach(([statHash, value]) => {
            const statName = STAT_HASH_MAP[Number(statHash)];
            if (statName && stats.hasOwnProperty(statName)) {
                stats[statName] += value;
            }
        });
    });

    return stats;
}
