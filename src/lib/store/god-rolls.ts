import { create } from "zustand";

interface GodRollState {
    rolls: Record<string, number[]>;
    isLoaded: boolean;
    error: string | null;
    load: () => Promise<void>;
    isGodRoll: (itemHash: number, equippedPlugs: number[]) => boolean;
}

export const useGodRollStore = create<GodRollState>((set, get) => ({
    rolls: {},
    isLoaded: false,
    error: null,

    load: async () => {
        if (get().isLoaded) return;
        try {
            const res = await fetch("/data/god-rolls.json");
            if (!res.ok) throw new Error("Failed to load god rolls database");
            const data: Record<string, number[]> = await res.json();
            set({ rolls: data, isLoaded: true, error: null });
        } catch (e: unknown) {
            console.error("God Role Store Error:", e);
            set({ error: e instanceof Error ? e.message : String(e) });
        }
    },

    /**
     * A weapon is considered a "God Roll" if all of its currently equipped TRAITS
     * match the recommended S-Tier perks defined in the community wishlist.
     */
    isGodRoll: (itemHash: number, equippedPlugs: number[]) => {
        const { rolls, isLoaded } = get();
        if (!isLoaded) return false;

        const goodPerks = rolls[itemHash.toString()];
        if (!goodPerks) return false;

        // Count how many of the equipped plugs are in the 'goodPerks' list
        // Typically a weapon has 4 main perk columns. If a weapon has at least 
        // 2 or 3 matching perks from the wishlist, we'll badge it as a God Roll.
        let matchCount = 0;
        for (const plug of equippedPlugs) {
            if (goodPerks.includes(plug)) {
                matchCount++;
            }
        }

        // Using a heuristic: If 2 or more of the equipped plugs match the wishlist, it's a God Roll.
        // The wishlist often specifies sight/barrel, mag, trait1, trait2.
        // We require at least 2 matching traits/perks.
        return matchCount >= 2;
    }
}));
