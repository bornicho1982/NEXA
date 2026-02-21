// ─── Destiny Manifest Types ───

/** Display properties shared by most definitions */
export interface DestinyDisplayProperties {
    name: string;
    description: string;
    icon?: string;
    hasIcon: boolean;
}

/** DestinyInventoryItemDefinition — weapons, armor, mods, consumables */
export interface DestinyInventoryItemDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    itemType: number;
    itemSubType: number;
    classType: number; // 0=Titan, 1=Hunter, 2=Warlock, 3=Unknown/Any
    itemTypeDisplayName?: string;
    flavorText?: string;
    loreHash?: number;
    redacted?: boolean;
    inventory?: {
        tierType: number; // 6=Exotic, 5=Legendary, 4=Rare, 3=Uncommon, 2=Common
        tierTypeName?: string;
        bucketTypeHash: number;
        maxStackSize: number;
    };
    stats?: {
        statGroupHash?: number;
        disablePrimaryStatDisplay?: boolean;
        stats?: Record<string, { statHash: number; value: number }>;
    };
    investmentStats?: Array<{
        statTypeHash: number;
        value: number;
        isConditionallyActive: boolean;
    }>;
    sockets?: {
        socketCategories?: Array<{
            socketCategoryHash: number;
            socketIndexes: number[];
        }>;
        socketEntries?: Array<{
            socketTypeHash: number;
            singleInitialItemHash: number;
            reusablePlugSetHash?: number;
            randomizedPlugSetHash?: number;
            plugSources?: number;
        }>;
    };
    equippingBlock?: {
        equipmentSlotTypeHash: number;
        uniqueLabel?: string;
        ammoType: number; // 1=Primary, 2=Special, 3=Heavy
    };
    defaultDamageType?: number;
    defaultDamageTypeHash?: number;
    screenshot?: string;
    iconWatermark?: string;
    iconWatermarkShelved?: string;
    secondaryIcon?: string;
    quality?: {
        versions: Array<{ powerCapHash: number }>;
        displayVersionWatermarkIcons?: string[];
        currentVersion?: number;
    };
    collectibleHash?: number;
    breakerType?: number;
    breakerTypeHash?: number;
    traitHashes?: number[];
    itemCategoryHashes?: number[];
    perks?: Array<{
        perkHash: number;
        iconPath?: string;
        isActive: boolean;
        perkVisibility: number;
    }>;
    tooltipNotifications?: Array<{
        displayString: string;
        displayStyle: string;
    }>;
    objectives?: {
        objectiveHashes?: number[];
        questlineItemHash?: number;
    };
    setData?: {
        questLineName?: string;
        setIsFeatured?: boolean;
    };
    talentGrid?: {
        hudDamageType?: number;
    };
    plug?: {
        plugCategoryIdentifier: string;
        plugCategoryHash: number;
        isDummyPlug?: boolean;
        energyCost?: {
            energyCost: number;
            energyTypeHash: number;
            energyType: number;
        };
    };
}

/** DestinyStatDefinition */
export interface DestinyStatDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    statCategory: number;
    aggregationType: number;
}

/** DestinyClassDefinition */
export interface DestinyClassDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    classType: number;
}

/** DestinyDamageTypeDefinition */
export interface DestinyDamageTypeDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    enumValue: number;
    transparentIconPath?: string;
}

/** DestinySocketCategoryDefinition */
export interface DestinySocketCategoryDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    categoryStyle: number;
}

/** DestinyStatGroupDefinition */
export interface DestinyStatGroupDefinition {
    hash: number;
    maximumValue: number;
    scaledStats: Array<{
        statHash: number;
        maximumValue: number;
        displayAsNumeric: boolean;
        displayInterpolation: Array<{ value: number; weight: number }>;
    }>;
}

/** DestinyEnergyTypeDefinition */
export interface DestinyEnergyTypeDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    enumValue: number;
    capacityStatHash: number;
    costStatHash: number;
    transparentIconPath?: string;
}

/** DestinyPlugSetDefinition */
export interface DestinyPlugSetDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    reusablePlugItems: Array<{
        plugItemHash: number;
        currentlyCanItRoll: boolean;
        craftingRequirements?: {
            unlockRequirements: Array<{ failureDescription: string }>;
        };
    }>;
}

/** DestinySocketTypeDefinition */
export interface DestinySocketTypeDefinition {
    hash: number;
    description: string;
    socketCategoryHash: number;
    plugWhitelist: Array<{
        categoryHash: number;
        categoryIdentifier: string;
        reinitializationPossiblePlugHashes?: number[];
    }>;
}

/** DestinySandboxPerkDefinition */
export interface DestinySandboxPerkDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    isDisplayable: boolean;
    damageType: number;
    damageTypeHash: number;
}

/** DestinyCollectibleDefinition */
export interface DestinyCollectibleDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    sourceHash?: number;
    sourceString?: string;
    itemHash: number;
}

/** DestinyObjectiveDefinition */
export interface DestinyObjectiveDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    completionValue: number;
    progressDescription?: string;
    allowOvercompletion: boolean;
    showValueOnComplete: boolean;
}

/** DestinyLoreDefinition */
export interface DestinyLoreDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    subtitle?: string;
}

/** DestinyInventoryBucketDefinition */
export interface DestinyInventoryBucketDefinition {
    hash: number;
    displayProperties: DestinyDisplayProperties;
    category: number;
    itemCount: number;
    hasTransferDestination: boolean;
    fifo: boolean;
}

/** All manifest table names we use */
export type ManifestTableName =
    | "DestinyInventoryItemDefinition"
    | "DestinyStatDefinition"
    | "DestinyClassDefinition"
    | "DestinyDamageTypeDefinition"
    | "DestinySocketCategoryDefinition"
    | "DestinyStatGroupDefinition"
    | "DestinyEnergyTypeDefinition"
    | "DestinyLoadoutNameDefinition"
    | "DestinyLoadoutIconDefinition"
    | "DestinyLoadoutColorDefinition"
    | "DestinyPlugSetDefinition"
    | "DestinySocketTypeDefinition"
    | "DestinySandboxPerkDefinition"
    | "DestinyInventoryItemConstantsDefinition"
    | "DestinyCollectibleDefinition"
    | "DestinyObjectiveDefinition"
    | "DestinyLoreDefinition"
    | "DestinyInventoryBucketDefinition";

/** Map table name → definition type */
export interface ManifestTableMap {
    DestinyInventoryItemDefinition: DestinyInventoryItemDefinition;
    DestinyStatDefinition: DestinyStatDefinition;
    DestinyClassDefinition: DestinyClassDefinition;
    DestinyDamageTypeDefinition: DestinyDamageTypeDefinition;
    DestinySocketCategoryDefinition: DestinySocketCategoryDefinition;
    DestinyStatGroupDefinition: DestinyStatGroupDefinition;
    DestinyEnergyTypeDefinition: DestinyEnergyTypeDefinition;
    DestinyLoadoutNameDefinition: Record<string, unknown>;
    DestinyLoadoutIconDefinition: Record<string, unknown>;
    DestinyLoadoutColorDefinition: Record<string, unknown>;
    DestinyPlugSetDefinition: DestinyPlugSetDefinition;
    DestinySocketTypeDefinition: DestinySocketTypeDefinition;
    DestinySandboxPerkDefinition: DestinySandboxPerkDefinition;
    DestinyInventoryItemConstantsDefinition: Record<string, any>;
    DestinyCollectibleDefinition: DestinyCollectibleDefinition;
    DestinyObjectiveDefinition: DestinyObjectiveDefinition;
    DestinyLoreDefinition: DestinyLoreDefinition;
    DestinyInventoryBucketDefinition: DestinyInventoryBucketDefinition;
}

/** Manifest version info stored in info.json */
export interface ManifestInfo {
    version: string;
    downloadedAt: string;
    language: string;
    tables: string[];
}
