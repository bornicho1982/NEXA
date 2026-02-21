export const BUCKETS = {
    // 🔫 Weapons
    KINETIC: 1498876634,
    ENERGY: 2465295065,
    POWER: 953998645,

    // 🛡️ Armor
    HELMET: 3448274439,
    GAUNTLETS: 3551918588,
    CHEST: 14239492,
    LEG: 20886954,
    CLASS_ITEM: 1585787867,

    // 👻 General / Accessories
    SUBCLASS: 3284755031,
    GHOST: 4023194814,
    ARTIFACT: 1506418338,
    VEHICLE: 2025709351,
    SHIPS: 284967655,
    EMBLEMS: 1409726986,

    // 📦 Inventory
    CONSUMABLES: 1469714392,
    MODIFICATIONS: 3313201758,
    SHADERS: 2973005342,
    ENGRAMS: 375726501,
} as const;

export type BucketType = keyof typeof BUCKETS;

export const BUCKET_ORDER = [
    // Weapons
    BUCKETS.KINETIC,
    BUCKETS.ENERGY,
    BUCKETS.POWER,
    // Armor
    BUCKETS.HELMET,
    BUCKETS.GAUNTLETS,
    BUCKETS.CHEST,
    BUCKETS.LEG,
    BUCKETS.CLASS_ITEM,
    // General
    BUCKETS.SUBCLASS,
    BUCKETS.GHOST,
    BUCKETS.ARTIFACT
];

export const BUCKET_LABELS: Record<number, string> = {
    [BUCKETS.KINETIC]: "Kinetic Weapons",
    [BUCKETS.ENERGY]: "Energy Weapons",
    [BUCKETS.POWER]: "Power Weapons",
    [BUCKETS.HELMET]: "Helmet",
    [BUCKETS.GAUNTLETS]: "Gauntlets",
    [BUCKETS.CHEST]: "Chest Armor",
    [BUCKETS.LEG]: "Leg Armor",
    [BUCKETS.CLASS_ITEM]: "Class Item",
    [BUCKETS.SUBCLASS]: "Subclass",
    [BUCKETS.GHOST]: "Ghost",
    [BUCKETS.ARTIFACT]: "Seasonal Artifact",
};
