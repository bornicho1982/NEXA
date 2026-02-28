import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
    isCompactMode: boolean;
    setCompactMode: (isCompact: boolean) => void;
    vaultFilter: "all" | "weapons" | "armor" | number;
    setVaultFilter: (filter: "all" | "weapons" | "armor" | number) => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            isCompactMode: false,
            setCompactMode: (isCompact) => set({ isCompactMode: isCompact }),
            vaultFilter: "all",
            setVaultFilter: (filter) => set({ vaultFilter: filter }),
        }),
        {
            name: 'nexa-layout-storage', // local storage key
        }
    )
);
