/**
 * Variable Ability Cooldown System (2025/2026 Sandbox)
 * 
 * In the modern sandbox, abilities have base cooldowns (e.g., 2:32, 1:45)
 * and stats (Discipline/Strength/Class) apply a scalar multiplier to reduce this time.
 * 
 * T3 (Tier 3, 30 stat) is generally considered the baseline (1.0x).
 * Higher tiers apply a multiplier < 1.0 (reducing time).
 * Lower tiers apply a multiplier > 1.0 (increasing time).
 */

// Mapping of Tier (0-10) to Cooldown Multiplier
// Source: Community research & Clarity data approximations
export const TIER_SCALARS: number[] = [
    1.25, // T0
    1.15, // T1
    1.05, // T2
    1.00, // T3 - Base
    0.90, // T4
    0.80, // T5
    0.72, // T6
    0.65, // T7 (Diminishing returns start kicking in harder after T7 usually)
    0.60, // T8
    0.55, // T9
    0.50  // T10
];

/**
 * Calculates the actual cooldown time in seconds.
 * @param baseCooldownSeconds The base cooldown of the specific ability (from Manifest/Clarity).
 * @param statTier The tier of the relevant stat (0-10).
 */
export function calculateCooldown(baseCooldownSeconds: number, statTier: number): number {
    const tier = Math.max(0, Math.min(10, statTier));
    const scalar = TIER_SCALARS[tier];
    return baseCooldownSeconds * scalar;
}

/**
 * Super Cooldowns work differently (often just tiers in older system, but moving to scalars too).
 * For now, we use a simplified scalar model for Supers as well.
 */
export function calculateSuperCooldown(baseCooldownSeconds: number, intellectTier: number): number {
    // In 2025+, Intellect has diminishing returns for passive regen.
    // Active generation is king. But passive still exists.
    // Curve is steeper at low tiers, flattens at high tiers.
    const superScalars = [
        1.0, 0.95, 0.9, 0.85, 0.8, 0.76, 0.72, 0.68, 0.64, 0.60, 0.58
    ];
    const tier = Math.max(0, Math.min(10, intellectTier));
    return baseCooldownSeconds * superScalars[tier];
}
