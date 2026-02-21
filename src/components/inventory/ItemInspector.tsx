"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Unlock, Sparkles, FlaskConical, BookOpen } from "lucide-react";
import Image from "next/image";
import type { InventoryItem } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";

interface ItemInspectorProps {
    item: InventoryItem | null;
    onClose: () => void;
}

const BUNGIE_ROOT = "https://www.bungie.net";

// Tier styling
const TIER_STYLES: Record<number, { text: string; border: string; glow: string }> = {
    6: { text: "text-[#ceae33]", border: "border-[#ceae33]/50", glow: "shadow-[0_0_20px_rgba(206,174,51,0.15)]" },
    5: { text: "text-[#522f65]", border: "border-[#522f65]/50", glow: "shadow-[0_0_20px_rgba(82,47,101,0.15)]" },
    4: { text: "text-[#5076a3]", border: "border-[#5076a3]/50", glow: "" },
    3: { text: "text-[#366f42]", border: "border-[#366f42]/50", glow: "" },
    2: { text: "text-[#c3bcb4]", border: "border-[#c3bcb4]/50", glow: "" },
};

export function ItemInspector({ item, onClose }: ItemInspectorProps) {
    const [mounted, setMounted] = useState(false);
    const [showLore, setShowLore] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (item) {
            document.body.style.overflow = "hidden";
            setShowLore(false);
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [item]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    if (!mounted || !item) return null;

    const tier = TIER_STYLES[item.tierType] || TIER_STYLES[2];
    const dimStats = item.weaponStats || item.armorStats;
    const isWeapon = item.itemType === 3;
    const isArmor = item.itemType === 2;

    // DIM-level socket categories
    const perkCategories = item.socketCategories?.filter(cat =>
        cat.sockets.some(s => s.isPerk || s.isIntrinsic)
    );
    const modCategories = item.socketCategories?.filter(cat =>
        cat.sockets.some(s => s.isMod) && !cat.sockets.some(s => s.isPerk)
    );

    // Legacy perks fallback
    const legacyPerks = !perkCategories?.length
        ? item.sockets?.filter(s => s.isVisible && s.icon && s.name && !s.itemTypeDisplayName?.includes("Cosmetic"))
        : undefined;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={cn(
                    "w-[440px] max-h-[90vh] overflow-y-auto bg-[#0f141e] border rounded-xl relative animate-in zoom-in-95 duration-200",
                    tier.border,
                    tier.glow,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header with Screenshot ── */}
                <div className="h-40 relative overflow-hidden">
                    {/* Background: Screenshot or icon blur */}
                    {item.screenshot ? (
                        <Image
                            src={`${BUNGIE_ROOT}${item.screenshot}`}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : item.secondaryIcon ? (
                        <Image
                            src={`${BUNGIE_ROOT}${item.secondaryIcon}`}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : item.icon && (
                        <Image
                            src={`${BUNGIE_ROOT}${item.icon}`}
                            alt=""
                            fill
                            className="object-cover opacity-20 blur-sm scale-150"
                            unoptimized
                        />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f141e] via-[#0f141e]/40 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors z-30"
                    >
                        <X size={16} />
                    </button>

                    {/* Item info */}
                    <div className="absolute bottom-3 left-4 right-4 z-20 flex gap-4 items-end">
                        <div className={cn(
                            "w-16 h-16 border-2 rounded-lg shadow-lg overflow-hidden shrink-0",
                            tier.border,
                        )}>
                            <Image
                                src={`${BUNGIE_ROOT}${item.icon}`}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="mb-0.5 flex-1 min-w-0">
                            <h2 className={cn("text-xl font-bold leading-tight mb-0.5 truncate", tier.text)}>
                                {item.name}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                                    {item.typeName || (isWeapon ? "Weapon" : isArmor ? "Armor" : "Item")}
                                </span>
                                {item.damageTypeIcon && (
                                    <div className="w-3.5 h-3.5 relative">
                                        <Image
                                            src={`${BUNGIE_ROOT}${item.damageTypeIcon}`}
                                            alt="Element"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                {item.primaryStat && (
                                    <span className="text-xs font-mono text-gold-primary ml-auto">
                                        ⚡ {item.primaryStat}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Status Badges ── */}
                <div className="px-4 pt-3 flex items-center gap-1.5 flex-wrap">
                    {item.isLocked && (
                        <Badge icon={<Lock size={10} />} label="Locked" color="text-amber-300" bg="bg-amber-500/10" />
                    )}
                    {!item.isLocked && item.itemInstanceId && (
                        <Badge icon={<Unlock size={10} />} label="Unlocked" color="text-white/40" bg="bg-white/5" />
                    )}
                    {item.isMasterwork && (
                        <Badge
                            icon={<Sparkles size={10} />}
                            label={item.masterworkInfo?.statName ? `MW: +${item.masterworkInfo.statValue} ${item.masterworkInfo.statName}` : "Masterworked"}
                            color="text-[#ceae33]"
                            bg="bg-[#ceae33]/10"
                        />
                    )}
                    {item.isCrafted && (
                        <Badge icon={<FlaskConical size={10} />} label="Crafted" color="text-cyan-300" bg="bg-cyan-500/10" />
                    )}
                    {item.isDeepsight && (
                        <Badge icon={<span className="text-[8px]">◆</span>} label="Deepsight" color="text-red-400" bg="bg-red-500/10" />
                    )}
                    {item.breakerInfo && (
                        <Badge icon={<span className="text-[8px]">⬡</span>} label={item.breakerInfo.name} color="text-orange-300" bg="bg-orange-500/10" />
                    )}
                </div>

                {/* ── Description ── */}
                {item.description && (
                    <div className="px-4 pt-2">
                        <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                    </div>
                )}

                {/* ── Content Body ── */}
                <div className="p-4 space-y-5">

                    {/* ⚡ Stats */}
                    {dimStats && dimStats.length > 0 && (
                        <Section title="Stats">
                            <div className="space-y-1.5">
                                {dimStats.filter(s => s.statHash !== -1).map((stat) => (
                                    <div key={stat.statHash} className="flex items-center gap-3 text-xs">
                                        <span className="text-text-secondary w-28 text-right text-[11px] truncate">{stat.name}</span>
                                        {stat.bar ? (
                                            <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden relative">
                                                {/* Base value bar */}
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-white/40 rounded-sm"
                                                    style={{ width: `${Math.min(100, (stat.base / stat.displayMaximum) * 100)}%` }}
                                                />
                                                {/* Total value bar (with mod/MW bonus) */}
                                                <div
                                                    className={cn(
                                                        "absolute inset-y-0 left-0 rounded-sm",
                                                        stat.value > stat.base
                                                            ? "bg-gradient-to-r from-white/60 to-cyan-400/70"
                                                            : "bg-white/60"
                                                    )}
                                                    style={{ width: `${Math.min(100, (stat.value / stat.displayMaximum) * 100)}%` }}
                                                />
                                            </div>
                                        ) : <div className="flex-1" />}
                                        <span className={cn(
                                            "w-8 text-right font-mono text-xs",
                                            stat.value > stat.base ? "text-cyan-300" : "text-white/80"
                                        )}>
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                                {/* Total for armor */}
                                {isArmor && dimStats.find(s => s.statHash === -1) && (
                                    <div className="flex items-center gap-3 text-xs pt-1.5 border-t border-white/5 mt-1.5">
                                        <span className="text-text-secondary w-28 text-right text-[11px] font-semibold">Total</span>
                                        <div className="flex-1" />
                                        <span className="w-8 text-right font-mono text-xs text-gold-primary font-bold">
                                            {dimStats.find(s => s.statHash === -1)?.value}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Legacy stats fallback */}
                    {!dimStats && item.stats && (
                        <Section title="Stats">
                            <div className="space-y-1.5">
                                {Object.entries(item.stats).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-3 text-xs">
                                        <span className="text-text-secondary w-28 capitalize text-right text-[11px]">{key}</span>
                                        <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden">
                                            <div className="h-full bg-white/60 rounded-sm" style={{ width: `${Math.min(100, value)}%` }} />
                                        </div>
                                        <span className="text-white/80 w-8 text-right font-mono text-xs">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* 💠 Perk Columns (DIM-style) */}
                    {perkCategories && perkCategories.length > 0 && (
                        <Section title="Perks & Traits">
                            {perkCategories.map((cat) => (
                                <div key={cat.categoryHash} className="mb-3 last:mb-0">
                                    <h4 className="text-[9px] uppercase text-text-tertiary/60 font-bold mb-2 tracking-widest">
                                        {cat.categoryName}
                                    </h4>
                                    <div className="flex gap-3">
                                        {cat.sockets.map((socket) => (
                                            <div key={socket.socketIndex} className="flex flex-col items-center gap-1">
                                                {/* Current plug */}
                                                <div className={cn(
                                                    "w-11 h-11 rounded-lg border flex items-center justify-center overflow-hidden bg-[#1a1f2e] relative group cursor-help",
                                                    socket.isIntrinsic ? "border-yellow-500/40 bg-yellow-500/5" : "border-white/15 hover:border-white/30",
                                                )}>
                                                    {socket.plug.icon && (
                                                        <Image
                                                            src={`${BUNGIE_ROOT}${socket.plug.icon}`}
                                                            alt={socket.plug.name}
                                                            width={38}
                                                            height={38}
                                                            className="object-contain opacity-90 group-hover:opacity-100"
                                                            unoptimized
                                                        />
                                                    )}
                                                    {/* Perk name tooltip */}
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/95 border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 max-w-[150px] text-center">
                                                        <div className="font-semibold">{socket.plug.name}</div>
                                                        {socket.plug.description && (
                                                            <div className="text-[9px] text-text-tertiary mt-0.5 whitespace-normal">
                                                                {socket.plug.description.slice(0, 80)}{socket.plug.description.length > 80 ? "…" : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Alternative plugs (perk column) */}
                                                {socket.plugOptions.length > 1 && (
                                                    <div className="flex gap-0.5 flex-wrap justify-center max-w-[48px]">
                                                        {socket.plugOptions.filter(p => p.plugHash !== socket.plug.plugHash).slice(0, 3).map((alt) => (
                                                            <div key={alt.plugHash} className="w-5 h-5 rounded border border-white/10 bg-[#1a1f2e] flex items-center justify-center overflow-hidden opacity-50 group">
                                                                {alt.icon && (
                                                                    <Image
                                                                        src={`${BUNGIE_ROOT}${alt.icon}`}
                                                                        alt={alt.name}
                                                                        width={18}
                                                                        height={18}
                                                                        className="object-contain"
                                                                        unoptimized
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                        {socket.plugOptions.length > 4 && (
                                                            <div className="w-5 h-5 rounded border border-white/10 bg-[#1a1f2e] flex items-center justify-center text-[8px] text-white/30 font-bold">
                                                                +{socket.plugOptions.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Legacy perks fallback */}
                    {legacyPerks && legacyPerks.length > 0 && (
                        <Section title="Perks">
                            <div className="grid grid-cols-5 gap-2">
                                {legacyPerks.map((perk, i) => (
                                    <div key={i} className="group relative aspect-square bg-[#1a1f2e] border border-white/10 rounded-lg flex items-center justify-center p-1.5 hover:border-white/30 transition-colors cursor-help">
                                        {perk.icon && (
                                            <Image
                                                src={`${BUNGIE_ROOT}${perk.icon}`}
                                                alt={perk.name || "Perk"}
                                                width={36}
                                                height={36}
                                                className="object-contain opacity-90 group-hover:opacity-100"
                                                unoptimized
                                            />
                                        )}
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/95 border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            {perk.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* 🔌 Mods */}
                    {modCategories && modCategories.length > 0 && (
                        <Section title="Mods">
                            <div className="flex gap-2 flex-wrap">
                                {modCategories.flatMap(cat => cat.sockets).map((socket) => (
                                    <div key={socket.socketIndex} className="group relative w-10 h-10 rounded-lg border border-white/10 bg-[#1a1f2e] flex items-center justify-center overflow-hidden cursor-help hover:border-white/25">
                                        {socket.plug.icon && (
                                            <Image
                                                src={`${BUNGIE_ROOT}${socket.plug.icon}`}
                                                alt={socket.plug.name}
                                                width={34}
                                                height={34}
                                                className="object-contain opacity-80 group-hover:opacity-100"
                                                unoptimized
                                            />
                                        )}
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/95 border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            {socket.plug.name}
                                            {socket.plug.energyCost != null && (
                                                <span className="text-amber-300 ml-1">[{socket.plug.energyCost}]</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* 📜 Flavor Text */}
                    {item.flavorText && (
                        <div className="pt-1">
                            <p className="text-xs text-text-tertiary italic leading-relaxed border-l-2 border-white/10 pl-3">
                                &quot;{item.flavorText}&quot;
                            </p>
                        </div>
                    )}

                    {/* 📖 Lore Toggle */}
                    {item.loreDescription && (
                        <div>
                            <button
                                onClick={() => setShowLore(!showLore)}
                                className="flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-white/60 transition-colors"
                            >
                                <BookOpen size={12} />
                                {showLore ? "Hide Lore" : "Show Lore"}
                            </button>
                            {showLore && (
                                <div className="mt-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                    {item.loreSubtitle && (
                                        <h4 className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 font-semibold">{item.loreSubtitle}</h4>
                                    )}
                                    <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                                        {item.loreDescription}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="pt-3 border-t border-white/10 flex gap-2">
                        <button className="flex-1 py-2.5 bg-gold-primary/20 border border-gold-primary/40 text-gold-primary hover:bg-gold-primary/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                            Transfer
                        </button>
                        <button className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                            Equip
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Helper Components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-[10px] uppercase text-text-tertiary font-bold mb-2.5 tracking-widest border-b border-white/5 pb-1">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Badge({ icon, label, color, bg }: { icon: React.ReactNode; label: string; color: string; bg: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold", color, bg)}>
            {icon}
            {label}
        </span>
    );
}
