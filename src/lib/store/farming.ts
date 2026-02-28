import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FarmingState {
    isEnabled: boolean;
    intervalSeconds: number;
    toggleFarming: () => void;
    setInterval: (seconds: number) => void;
}

export const useFarmingStore = create<FarmingState>()(
    persist(
        (set) => ({
            isEnabled: false,
            intervalSeconds: 10, // Default 10s checks
            toggleFarming: () => set((state) => ({ isEnabled: !state.isEnabled })),
            setInterval: (seconds) => set({ intervalSeconds: seconds }),
        }),
        {
            name: "nexa-farming-storage",
        }
    )
);
