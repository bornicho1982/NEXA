"use client";

import { createContext, useContext } from "react";
import type { ItemConstants } from "@/lib/inventory/service";

/**
 * Context for DIM item overlay constants loaded from the manifest.
 * This avoids prop-drilling through every component in the tree.
 */
const ItemConstantsContext = createContext<ItemConstants | undefined>(undefined);

export const ItemConstantsProvider = ItemConstantsContext.Provider;

export function useItemConstants(): ItemConstants | undefined {
    return useContext(ItemConstantsContext);
}
