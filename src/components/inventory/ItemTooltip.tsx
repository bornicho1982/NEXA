"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { InventoryItem } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";

interface ItemTooltipProps {
    item: InventoryItem;
    anchorEl: HTMLElement | null;
    visible: boolean;
}

const BUNGIE_ROOT = "https://www.bungie.net";

// ─── Tier Colors ───
const TIER_COLORS: Record<number, { text: string; border: string; bg: string }> = {
    6: { text: "text-[#ceae33]", border: "border-[#ceae33]/40", bg: "from-[#ceae33]/10" },  // Exotic
    5: { text: "text-[#522f65]", border: "border-[#522f65]/40", bg: "from-[#522f65]/10" },  // Legendary  
    4: { text: "text-[#5076a3]", border: "border-[#5076a3]/40", bg: "from-[#5076a3]/10" },  // Rare
    3: { text: "text-[#366f42]", border: "border-[#366f42]/40", bg: "from-[#366f42]/10" },  // Uncommon
    2: { text: "text-[#c3bcb4]", border: "border-[#c3bcb4]/40", bg: "from-[#c3bcb4]/10" },  // Common
};

export function ItemTooltip({ item, anchorEl, visible, minimal = false }: ItemTooltipProps & { minimal?: boolean }) {
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (visible && anchorEl && tooltipRef.current) {
            const tooltip = tooltipRef.current;
            const rect = anchorEl.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            const OFFSET_X = 15;
            const OFFSET_Y = 0;
            const SAFE_MARGIN = 15;
            const SCROLLBAR_WIDTH = 20;

            let left = rect.right + OFFSET_X;
            let top = rect.top + OFFSET_Y;

            if (left + tooltipRect.width + SAFE_MARGIN > window.innerWidth - SCROLLBAR_WIDTH) {
                left = rect.left - tooltipRect.width - OFFSET_X;
            }
            if (left < SAFE_MARGIN) {
                left = SAFE_MARGIN;
            }
            if (top + tooltipRect.height + SAFE_MARGIN > window.innerHeight) {
                top = window.innerHeight - tooltipRect.height - SAFE_MARGIN;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            requestAnimationFrame(() => {
                if (tooltipRef.current) tooltipRef.current.style.opacity = "1";
            });
        } else if (tooltipRef.current) {
            tooltipRef.current.style.opacity = "0";
        }
    }, [visible, anchorEl]);

    if (!visible || !anchorEl) return null;

    const tier = TIER_COLORS[item.tierType] || TIER_COLORS[2];

    // ─── Minimal View (fast hover) ───
    if (minimal) {
        return createPortal(
            <div
                ref={tooltipRef}
                className="fixed z-[1000] bg-[#0f141e]/95 backdrop-blur-sm border border-white/15 rounded-lg shadow-xl overflow-hidden pointer-events-none px-3 py-2.5 min-w-[200px] max-w-[280px] transition-opacity duration-150 will-change-transform"
                style={{ top: 0, left: 0, opacity: 0 }}
            >
                <div className="flex flex-col gap-1">
                    <h2 className={cn("text-sm font-bold leading-tight", tier.text)}>
                        {item.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-tertiary uppercase font-medium tracking-wider">
                            {item.typeName || (item.itemType === 3 ? "Weapon" : item.itemType === 2 ? "Armor" : "Item")}
                        </span>
                        {item.primaryStat && (
                            <span className="text-xs font-mono text-gold-primary ml-auto">
                                ⚡ {item.primaryStat}
                            </span>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // ─── Determine which stats to display ───
    const dimStats = item.weaponStats || item.armorStats;
    const isWeapon = item.itemType === 3;
    const isArmor = item.itemType === 2;

    // ─── Perk columns from socket categories ───
    const perkCategories = item.socketCategories?.filter(cat =>
        cat.sockets.some(s => s.isPerk || s.isIntrinsic)
    );

    // ─── Legacy perks fallback ───
    const legacyPerks = !perkCategories?.length
        ? item.sockets?.filter(s => s.isVisible && s.icon && s.name && !s.itemTypeDisplayName?.includes("Cosmetic"))
        : undefined;

    // ─── Full Detailed View ───
    return createPortal(
        <div
            ref={tooltipRef}
            className="fixed z-[1000] w-[340px] bg-[#0f141e]/95 backdrop-blur-md border border-white/15 rounded-lg shadow-2xl overflow-hidden pointer-events-none transition-opacity duration-150 will-change-transform"
            style={{ top: 0, left: 0, opacity: 0 }}
        >
            {/* ── Header Banner ── */}
            <div className={cn(
                "relative p-3 pb-2.5 flex flex-col justify-end bg-gradient-to-br to-transparent",
                tier.bg,
            )}>
                {/* Screenshot Background */}
                {item.screenshot && (
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src={`${BUNGIE_ROOT}${item.screenshot}`}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}

                {/* Season Watermark */}
                {item.iconWatermark && (
                    <div className="absolute top-2 right-2 w-7 h-7 opacity-40 relative">
                        <Image
                            src={`${BUNGIE_ROOT}${item.iconWatermark}`}
                            alt="Season"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                )}

                {/* Name + Power */}
                <div className="relative flex items-baseline justify-between gap-2">
                    <h2 className={cn("text-base font-bold leading-tight", tier.text)}>
                        {item.name}
                    </h2>
                    {item.primaryStat && (
                        <span className="text-sm font-mono text-gold-primary shrink-0">
                            ⚡ {item.primaryStat}
                        </span>
                    )}
                </div>
                {/* Type + Damage */}
                <div className="relative flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                        {item.typeName || (isWeapon ? "Weapon" : isArmor ? "Armor" : "Item")}
                    </span>
                    {item.damageTypeIcon && (
                        <div className="w-3 h-3 relative">
                            <Image
                                src={`${BUNGIE_ROOT}${item.damageTypeIcon}`}
                                alt="Element"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                    {/* Masterwork badge */}
                    {item.isMasterwork && (
                        <span className="text-[9px] bg-[#ceae33]/20 text-[#ceae33] px-1.5 py-0.5 rounded font-bold ml-auto">
                            MW{item.masterworkInfo?.tier ? ` ${item.masterworkInfo.tier}` : ""}
                        </span>
                    )}
                    {item.isCrafted && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                            CRAFTED
                        </span>
                    )}
                </div>
            </div>

            {/* ── Content Body ── */}
            <div className="p-3 space-y-3">

                {/* ⚡ DIM-level Stats Block */}
                {dimStats && dimStats.length > 0 && (
                    <div className="space-y-1">
                        {dimStats.filter(s => s.statHash !== -1).map((stat) => (
                            <div key={stat.statHash} className="flex items-center gap-2 text-xs">
                                <span className="text-text-secondary w-24 text-right truncate text-[11px]">
                                    {stat.name}
                                </span>
                                {stat.bar ? (
                                    <div className="flex-1 h-2.5 bg-white/5 rounded-sm overflow-hidden relative">
                                        <div
                                            className={cn(
                                                "h-full rounded-sm transition-all",
                                                stat.value > stat.base
                                                    ? "bg-gradient-to-r from-white/70 to-cyan-400/80"
                                                    : "bg-white/60"
                                            )}
                                            style={{ width: `${Math.min(100, (stat.value / stat.displayMaximum) * 100)}%` }}
                                        />
                                    </div>
                                ) : null}
                                <span className={cn(
                                    "w-8 text-right font-mono text-[11px]",
                                    stat.value > stat.base ? "text-cyan-300" : "text-white/80"
                                )}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                        {/* Total stat for armor */}
                        {isArmor && dimStats.find(s => s.statHash === -1) && (
                            <div className="flex items-center gap-2 text-xs pt-1 border-t border-white/5 mt-1">
                                <span className="text-text-secondary w-24 text-right text-[11px] font-semibold">Total</span>
                                <div className="flex-1" />
                                <span className="w-8 text-right font-mono text-[11px] text-gold-primary font-bold">
                                    {dimStats.find(s => s.statHash === -1)?.value}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Legacy stats fallback */}
                {!dimStats && item.stats && (
                    <div className="space-y-1">
                        {Object.entries(item.stats).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-xs">
                                <span className="text-text-secondary w-24 capitalize text-right text-[11px]">{key}</span>
                                <div className="flex-1 h-2.5 bg-white/5 rounded-sm overflow-hidden">
                                    <div className="h-full bg-white/60 rounded-sm" style={{ width: `${Math.min(100, value)}%` }} />
                                </div>
                                <span className="text-white/80 w-8 text-right font-mono text-[11px]">{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 💠 DIM-level Perks (Socket Categories) */}
                {perkCategories && perkCategories.length > 0 && (
                    <div>
                        <div className="border-t border-white/10 mb-2.5" />
                        {perkCategories.map((cat) => (
                            <div key={cat.categoryHash} className="mb-2 last:mb-0">
                                <h3 className="text-[9px] uppercase text-text-tertiary font-bold mb-1.5 tracking-widest">
                                    {cat.categoryName}
                                </h3>
                                <div className="flex gap-1.5 flex-wrap">
                                    {cat.sockets.map((socket) => (
                                        <div
                                            key={socket.socketIndex}
                                            className="relative"
                                        >
                                            {/* Current plug */}
                                            <div className={cn(
                                                "w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden bg-[#1a1f2e]",
                                                socket.isIntrinsic ? "border-yellow-500/40" : "border-white/15",
                                            )}>
                                                {socket.plug.icon && (
                                                    <Image
                                                        src={`${BUNGIE_ROOT}${socket.plug.icon}`}
                                                        alt={socket.plug.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-contain opacity-90"
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                            {/* Perk column indicator (alternatives count) */}
                                            {socket.plugOptions.length > 1 && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white/10 text-[7px] text-white/60 rounded-full flex items-center justify-center font-bold">
                                                    {socket.plugOptions.length}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Legacy perks fallback */}
                {legacyPerks && legacyPerks.length > 0 && (
                    <div>
                        <div className="border-t border-white/10 mb-2" />
                        <h3 className="text-[9px] uppercase text-text-tertiary font-bold mb-1.5 tracking-widest">Perks & Traits</h3>
                        <div className="flex gap-1.5 flex-wrap">
                            {legacyPerks.map((perk, i) => (
                                <div key={i} className="w-9 h-9 rounded-full bg-[#1a1f2e] border border-white/10 flex items-center justify-center overflow-hidden">
                                    {perk.icon && (
                                        <Image
                                            src={`${BUNGIE_ROOT}${perk.icon}`}
                                            alt={perk.name || "Perk"}
                                            width={32}
                                            height={32}
                                            className="object-contain opacity-90"
                                            unoptimized
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 📜 Flavor Text */}
                {item.flavorText && (
                    <div className="pt-1">
                        <div className="border-t border-white/5 mb-2" />
                        <p className="text-[11px] text-text-tertiary italic leading-relaxed">
                            &quot;{item.flavorText}&quot;
                        </p>
                    </div>
                )}

                {/* Masterwork stat info */}
                {item.masterworkInfo?.statName && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#ceae33]/80">
                        <span className="w-2 h-2 rounded-full bg-[#ceae33]/40" />
                        MW: +{item.masterworkInfo.statValue} {item.masterworkInfo.statName}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
