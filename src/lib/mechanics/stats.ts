// 2026 Sandbox: Resilience is remapped to "Health"
export const STAT_KEYS = {
    Mobility: "Mobility",
    Health: "Resilience", // Internal ID is still Resilience/392767087 for API compat
    Recovery: "Recovery",
    Discipline: "Discipline",
    Intellect: "Intellect",
    Strength: "Strength"
} as const;

export type StatKey = keyof typeof STAT_KEYS;

/**
 * Returns the tier benefits for the new "Health" stat (formerly Resilience).
 * 2026 Sandbox: Grants Flinch Resistance and Orb Pickup Healing.
 */
export function getHealthBenefits(tier: number) {
    // Clamped T0-T10
    const t = Math.max(0, Math.min(10, tier));

    // Linear-ish scaling for Healing (Mocked based on 2026 intent)
    // T10 = 70HP on Orb pickup
    const healing = Math.floor(t * 7);

    // Flinch Resist (10% max)
    const flinchResist = t; // 1% per tier

    return {
        healingOnOrb: healing,
        flinchResist: flinchResist
    };
}

/**
 * Returns cooldown scalar based on Tier (0-10).
 * Standard curve: T3 (base) = 1.0x. Higher tiers reduce time.
 */
export function getCooldownScalar(tier: number) {
    const t = Math.max(0, Math.min(10, tier));

    // Mock standard cooldown curve (approximate)
    // T0: 1.5x, T3: 1.0x, T10: 0.5x
    const scalars = [1.5, 1.3, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.55, 0.52, 0.50];
    return scalars[t] || 1.0;
}
