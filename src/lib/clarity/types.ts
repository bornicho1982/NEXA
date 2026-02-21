export interface ClarityDescription {
    // The raw community description (often with rich text or formulas)
    description: string;
    // Specific formulas for calculation (e.g., "10% + (5% * Stack)")
    formula?: string;
    // Known bugs or interactions
    caveats?: string[];
}

export interface ClarityItem {
    hash: number;
    name: string;
    // Community insight per perk/trait
    perks: Record<number, ClarityDescription>;
    // Stats hidden from API but known to community (e.g., Aim Assist on partials)
    hiddenStats?: Record<string, number>;
}

export interface ClarityDatabase {
    items: Record<number, ClarityItem>;
    // Global formulas (e.g., Cooldown scalars)
    scalars: Record<string, number[]>;
}
