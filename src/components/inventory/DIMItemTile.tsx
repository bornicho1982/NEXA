"use client";

import { InventoryItem, ItemConstants } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";
import { useItemConstants } from "./ItemConstantsContext";
import { useGodRollStore } from "@/lib/store/god-rolls";
import { ThumbsUp, Star, Check, Trash2, Archive } from "lucide-react";

// ─── Bungie CDN prefix ───
const B = "https://www.bungie.net";

// DIM exact rarity background colors (from ItemIcon.m.scss)
const RARITY_BG: Record<number, string> = {
    6: "#ceae33", // Exotic
    5: "#522f65", // Legendary
    4: "#5076a3", // Rare
    3: "#366f42", // Uncommon
    2: "#c3bcb4", // Common
};

interface DIMItemTileProps {
    item: InventoryItem;
    className?: string;
    onClick?: () => void;
    compact?: boolean;
    /** Overlay paths loaded from DestinyInventoryItemConstantsDefinition */
    itemConstants?: ItemConstants;
}

export function DIMItemTile({ item, className, onClick, compact, itemConstants: propConstants }: DIMItemTileProps) {
    const ctxConstants = useItemConstants();
    const itemConstants = propConstants ?? ctxConstants;

    const isMasterwork = item.isMasterwork;
    const isExotic = item.tierType === 6;
    const isCrafted = item.isCrafted;
    const isDeepsight = item.isDeepsight;
    const isLocked = item.isLocked;
    const isWeapon = item.itemType === 3;

    // ─── God Roll Check ───
    const equippedPlugs = item.sockets?.filter(s => s.isEnabled).map(s => s.plugHash!) || [];
    const isGodRoll = useGodRollStore(s => s.isGodRoll(item.itemHash, equippedPlugs));

    // ─── Item Icon Size ───
    // Standard size for Character column (w-[68px])
    // Compact size for Vault grid (w-[48px]) to fit ~15 items across
    const iconSize = compact ? 48 : 68;
    const borderWidth = compact ? 1 : 2;
    const badgeHeight = compact ? 12 : 18;

    // ─── 1. Icon Background Layers (front to back, like DIM) ───
    const backgrounds: string[] = [];

    // Icon foreground
    if (item.icon) {
        backgrounds.push(`url(${B}${item.icon})`);
    }

    // Ornament layer (from itemConstants)
    if (item.isOrnamented && itemConstants) {
        const ornamentPath = isExotic
            ? itemConstants.universalOrnamentExoticBackgroundOverlayPath
            : itemConstants.universalOrnamentLegendaryBackgroundOverlayPath;
        if (ornamentPath) {
            backgrounds.push(`url(${B}${ornamentPath})`);
        }
    }

    // Crafted background (from itemConstants)
    if (isCrafted && itemConstants?.craftedBackgroundPath) {
        backgrounds.push(`url(${B}${itemConstants.craftedBackgroundPath})`);
    }

    // ─── 2. Overlays ───

    // Masterwork Glow (from itemConstants)
    const masterworkOverlay = isMasterwork && itemConstants
        ? (isExotic ? itemConstants.masterworkExoticOverlayPath : itemConstants.masterworkOverlayPath)
        : null;

    // Tier pips: use item.tier (gearTier 1-5 from API), NOT tierType (rarity)
    // DIM: item.tier > 0 && !item.isEngram && itemConstants.gearTierOverlayImagePaths[tier-1]
    const gearTier = item.tier ?? 0;
    const tierPipOverlay = gearTier > 0 && itemConstants?.gearTierOverlayImagePaths?.length
        ? itemConstants.gearTierOverlayImagePaths[Math.min(gearTier - 1, 4)]
        : null;

    // Watermark drop shadow (shifted layer) — from itemConstants
    const watermarkShadow = item.iconOverlay && itemConstants?.watermarkDropShadowPath
        ? itemConstants.watermarkDropShadowPath
        : null;

    // Season watermark icon (DIM: iconDef.secondaryBackground → small icon top-left)
    // In our data: item.iconWatermark is the small watermark icon
    const seasonIcon = item.iconWatermark;

    // Crafted overlay (from itemConstants)
    const craftedOverlay = isCrafted && itemConstants
        ? itemConstants.craftedOverlayPath
        : null;

    // ─── 3. Badge Logic ───
    const power = item.primaryStat;
    const isStackable = (item.maxStackSize ?? 1) > 1;
    const showBadge = !!(power || (isStackable && item.quantity > 1) || item.tag || (isGodRoll && isWeapon));
    const badgeContent = isStackable && item.quantity > 1
        ? item.quantity.toString()
        : power?.toString() ?? "";

    // ─── Border color (DIM: rarity border, masterwork=gold, deepsight=red) ───
    const borderColor = isDeepsight
        ? "#d25336"
        : isMasterwork
            ? "#eade8b"
            : RARITY_BG[item.tierType] || "#444";

    // ─── Badge Bar (DIM polaroid style) ───
    // DIM default theme: --theme-item-polaroid: #ddd (light gray)
    // Masterwork: --theme-item-polaroid-masterwork: #eade8b (gold)
    // Deepsight: normal bg but red border
    const badgeBg = isMasterwork
        ? "#eade8b"
        : "#ddd";
    const badgeTextColor = isMasterwork
        ? "#333"
        : "#222";

    // ─── Combined shiftedLayer backgrounds (tier pips + watermark shadow) ───
    // DIM: seasonAndPips array, rendered in .shiftedLayer with top/left = -borderWidth
    const shiftedLayerBgs: string[] = [];
    if (tierPipOverlay) shiftedLayerBgs.push(`url(${B}${tierPipOverlay})`);
    if (watermarkShadow) shiftedLayerBgs.push(`url(${B}${watermarkShadow})`);

    return (
        <div
            className={cn("relative select-none cursor-pointer", className)}
            style={{
                width: iconSize,
                height: showBadge ? iconSize + badgeHeight - borderWidth : iconSize,
                contain: "layout paint style size",
            }}
            onClick={onClick}
        >
            {/* ═══════════ ITEM ICON (Top Square) ═══════════ */}
            <div
                style={{
                    width: iconSize,
                    height: iconSize,
                    border: `${borderWidth}px solid ${borderColor}`,
                    boxSizing: "border-box",
                    backgroundColor: RARITY_BG[item.tierType] || "#333",
                    backgroundImage: backgrounds.join(", "),
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Masterwork Glow (DIM: .adjustOpacity — opacity: 1/1.4 ≈ 0.714) */}
                {masterworkOverlay && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `url(${B}${masterworkOverlay})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            opacity: 0.714,
                        }}
                    />
                )}

                {/* Crafted Overlay (DIM: .craftedLayer — top: borderWidth, left: -borderWidth) */}
                {craftedOverlay && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: borderWidth,
                            left: -borderWidth,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${B}${craftedOverlay})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                        }}
                    />
                )}

                {/* Shifted Layer: Tier Pips + Watermark Shadow
                    DIM: .shiftedLayer — top: -borderWidth, left: -borderWidth
                    Contains season banner drop shadow + gear tier overlay */}
                {shiftedLayerBgs.length > 0 && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: -borderWidth,
                            left: -borderWidth,
                            width: iconSize,
                            height: iconSize,
                            backgroundImage: shiftedLayerBgs.join(", "),
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                        }}
                    />
                )}

                {/* Season Watermark Icon (DIM: .seasonIcon — small, top-left)
                    DIM uses dim-item-px(0.5) offset, dim-item-px(11) size
                    That's ~1% offset, ~22% of inner area */}
                {/* Featured Watermark (Teal Flag/Ribbon)
                    This sits BEHIND the season icon and usually covers a significant part of the tile (top-left).
                    DIM renders it as an absolute overlay. */}
                {item.iconWatermarkFeatured && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${B}${item.iconWatermarkFeatured})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            zIndex: 1, // Above background, below season icon
                        }}
                    />
                )}

                {/* Season Watermark Icon (DIM: .seasonIcon — small, top-left)
                    DIM uses dim-item-px(0.5) offset, dim-item-px(11) size
                    That's ~1% offset, ~22% of inner area */}
                {seasonIcon && !item.iconWatermarkFeatured && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: "4%",
                            left: "4%",
                            width: "22%",
                            height: "22%",
                            backgroundImage: `url(${B}${seasonIcon})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            mixBlendMode: "screen", // Removes any pure black background from Bungie API watermarks
                            filter: "drop-shadow(0 0 1px rgba(0,0,0,0.7))",
                            zIndex: 2, // Ensure on top of background
                        }}
                    />
                )}

                {/* Weapon Archetype Frame (DIM: .weaponFrame — top-right, non-exotic weapons)
                    DIM: background-color: #222, background-size: 130%, rounded corners
                    Size: ~dim-item-px(11) = 11/50 of inner ≈ 14px at 68px icon */}
                {item.weaponArchetypeIcon && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: borderWidth * 2,
                            right: borderWidth * 2,
                            width: compact ? 10 : 14,
                            height: compact ? 10 : 14,
                            backgroundColor: "#222",
                            backgroundImage: `url(${B}${item.weaponArchetypeIcon})`,
                            backgroundSize: "130%",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            borderRadius: compact ? 1 : 2,
                            filter: "drop-shadow(0 0 0.75px rgba(0,0,0,1))",
                        }}
                    />
                )}

                {/* Armor Primary Stat Icon (Top-Right) */}
                {item.primaryStatIcon && !item.weaponArchetypeIcon && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: borderWidth * 2,
                            right: borderWidth * 2,
                            width: compact ? 10 : 14,
                            height: compact ? 10 : 14,
                            backgroundColor: "#222", // Added background to match weapons
                            backgroundImage: `url(${B}${item.primaryStatIcon})`,
                            backgroundSize: "130%", // Increased size to match weapons
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            borderRadius: compact ? 1 : 2, // Added rounding
                            filter: "drop-shadow(0 0 0.75px rgba(0,0,0,1))",
                        }}
                    />
                )}

                {/* Deepsight inner border (DIM: ::after with 2px inner border) */}
                {isDeepsight && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ border: "2px solid #d25336" }}
                    />
                )}

                {/* Lock Icon (DIM: positioned in .icons tray, bottom-right area) */}
                {isLocked && (
                    <div
                        className="absolute pointer-events-none flex items-center justify-center"
                        style={{
                            bottom: borderWidth + 2,
                            right: borderWidth + 2,
                            width: compact ? 10 : 13,
                            height: compact ? 10 : 13,
                            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="#29f36a" width="100%" height="100%">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ═══════════ BADGE INFO BAR (Below Icon — DIM Polaroid Style) ═══════════ */}
            {showBadge && (
                <div
                    style={{
                        width: iconSize,
                        height: badgeHeight,
                        marginTop: -borderWidth, // Overlap with icon border (DIM)
                        backgroundColor: badgeBg,
                        color: badgeTextColor,
                        fontSize: compact ? 9 : 11,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: 3,
                        paddingLeft: 2,
                        boxSizing: "border-box",
                        lineHeight: `${badgeHeight}px`,
                        overflow: "hidden",
                        whiteSpace: "nowrap" as const,
                        gap: 2,
                        // Deepsight badge: DIM adds red bottom+side borders
                        ...(isDeepsight ? {
                            borderBottom: "1px solid #d25336",
                            borderLeft: "1px solid #d25336",
                            borderRight: "1px solid #d25336",
                        } : {}),
                    }}
                >
                    {/* Element Icon — ONLY for weapons where damageType !== Kinetic (1)
                        DIM BadgeInfo: item.element && !(item.bucket.inWeapons && item.element.enumValue === DamageType.Kinetic) */}
                    {isWeapon && item.damageTypeIcon && item.damageType !== 1 && (
                        <div
                            style={{
                                width: compact ? 10 : 12,
                                height: compact ? 10 : 12,
                                backgroundImage: `url(${B}${item.damageTypeIcon})`,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                flexShrink: 0,
                            }}
                        />
                    )}

                    {/* God Roll & Tags inserted here */}
                    <div className="flex items-center gap-[2px] ml-1">
                        {isGodRoll && isWeapon && (
                            <ThumbsUp className={cn("w-[10px] h-[10px] text-yellow-600 fill-yellow-600", isMasterwork ? "text-yellow-800 fill-yellow-800" : "")} />
                        )}
                        {item.tag === "favorite" && <Star className="w-[10px] h-[10px] text-red-500 fill-red-500 stroke-[2]" />}
                        {item.tag === "keep" && <Check className="w-[10px] h-[10px] stroke-[3] text-green-600" />}
                        {item.tag === "junk" && <Trash2 className="w-[10px] h-[10px] stroke-[2.5] text-orange-600" />}
                        {item.tag === "archive" && <Archive className="w-[10px] h-[10px] stroke-[2.5] text-blue-600" />}
                    </div>



                    {/* Power / Stack Count (right-aligned) */}
                    <span style={{ marginLeft: "auto" }}>{badgeContent}</span>
                </div>
            )}
        </div>
    );
}
