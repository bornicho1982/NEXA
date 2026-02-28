"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { InventoryItem } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";

interface ItemTooltipProps {
    item: InventoryItem;
    anchorEl: HTMLElement | null;
    visible: boolean;
}

// ─── Tier Colors ───
const TIER_COLORS: Record<number, { text: string; border: string; bg: string }> = {
    6: { text: "text-[#ceae33]", border: "border-[#ceae33]/40", bg: "from-[#ceae33]/10" },  // Exotic
    5: { text: "text-[#522f65]", border: "border-[#522f65]/40", bg: "from-[#522f65]/10" },  // Legendary  
    4: { text: "text-[#5076a3]", border: "border-[#5076a3]/40", bg: "from-[#5076a3]/10" },  // Rare
    3: { text: "text-[#366f42]", border: "border-[#366f42]/40", bg: "from-[#366f42]/10" },  // Uncommon
    2: { text: "text-[#c3bcb4]", border: "border-[#c3bcb4]/40", bg: "from-[#c3bcb4]/10" },  // Common
};

export function ItemTooltip({ item, anchorEl, visible }: ItemTooltipProps) {
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

    // ─── Minimal View ALWAYS returned ───
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
                        <span className="text-xs font-mono text-wd-primary-400 ml-auto">
                            ⚡ {item.primaryStat}
                        </span>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
