"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Unlock, Sparkles, FlaskConical, BookOpen, Star, Trash2, Archive, Check } from "lucide-react";
import Image from "next/image";
import type { InventoryItem } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/lib/store/inventory";
import type { DimSocket } from "@/types/dim-types";

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
    const { setLockState, setAnnotation } = useInventoryStore();
    const [activeTab, setActiveTab] = useState<"perks" | "stats" | "lore">("perks");
    const [note, setNote] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Initialize state from item
    useEffect(() => {
        if (item) {
             // Reset state when item changes, but only if item is new
             // We can assume item prop update means new item or updated item
             // If updated item (e.g. locked status change), we might want to keep tab/note state?
             // But if we switch items, we want reset.
             // We'll rely on `key` prop in parent to reset state for new items.
             // Here we just handle overflow.
            document.body.style.overflow = "hidden";
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

    const handleLockToggle = () => {
        setLockState(item, !item.isLocked);
    };

    const handleTag = (tag: string) => {
        const newTag = item.tag === tag ? null : tag;
        setAnnotation(item, newTag, note);
    };

    const handleNoteBlur = () => {
        if (note !== (item.notes || "")) {
            setAnnotation(item, item.tag || null, note);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={cn(
                    "w-[440px] max-h-[90vh] flex flex-col bg-[#0f141e] border rounded-xl relative animate-in zoom-in-95 duration-200 overflow-hidden",
                    tier.border,
                    tier.glow,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header with Screenshot ── */}
                <div className="h-40 relative shrink-0">
                    {/* Background */}
                    {item.screenshot ? (
                        <Image src={`${BUNGIE_ROOT}${item.screenshot}`} alt="" fill className="object-cover" unoptimized />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f141e] via-[#0f141e]/40 to-transparent" />

                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors z-30">
                        <X size={16} />
                    </button>

                    {/* Lock Button */}
                    <button
                        onClick={handleLockToggle}
                        className={cn(
                            "absolute top-3 left-3 p-2 rounded-full transition-colors z-30",
                            item.isLocked ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-black/50 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                    >
                        {item.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    {/* Item info */}
                    <div className="absolute bottom-3 left-4 right-4 z-20 flex gap-4 items-end">
                        <div className={cn("w-16 h-16 border-2 rounded-lg shadow-lg overflow-hidden shrink-0 bg-black", tier.border)}>
                            <Image src={`${BUNGIE_ROOT}${item.icon}`} alt={item.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </div>
                        <div className="mb-0.5 flex-1 min-w-0">
                            <h2 className={cn("text-xl font-bold leading-tight mb-0.5 truncate", tier.text)}>{item.name}</h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                                    {item.typeName || (isWeapon ? "Weapon" : isArmor ? "Armor" : "Item")}
                                </span>
                                {item.primaryStat && (
                                    <span className="text-xs font-mono text-gold-primary ml-auto">⚡ {item.primaryStat}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tags & Notes Bar ── */}
                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                    <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
                        <button onClick={() => handleTag("favorite")} className={cn("p-1.5 rounded hover:bg-white/5 transition-colors", item.tag === "favorite" ? "text-red-400" : "text-white/20")}>
                            <Star size={14} fill={item.tag === "favorite" ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => handleTag("keep")} className={cn("p-1.5 rounded hover:bg-white/5 transition-colors", item.tag === "keep" ? "text-green-400" : "text-white/20")}>
                            <Check size={14} />
                        </button>
                        <button onClick={() => handleTag("junk")} className={cn("p-1.5 rounded hover:bg-white/5 transition-colors", item.tag === "junk" ? "text-orange-400" : "text-white/20")}>
                            <Trash2 size={14} />
                        </button>
                        <button onClick={() => handleTag("archive")} className={cn("p-1.5 rounded hover:bg-white/5 transition-colors", item.tag === "archive" ? "text-blue-400" : "text-white/20")}>
                            <Archive size={14} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Add note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleNoteBlur}
                        className="flex-1 bg-transparent text-xs text-white placeholder-white/20 focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-colors"
                    />
                </div>

                {/* ── Tabs Header ── */}
                <div className="flex border-b border-white/10 px-4">
                    <TabButton active={activeTab === "perks"} onClick={() => setActiveTab("perks")} label="Perks" />
                    <TabButton active={activeTab === "stats"} onClick={() => setActiveTab("stats")} label="Stats" />
                    <TabButton active={activeTab === "lore"} onClick={() => setActiveTab("lore")} label="Lore" />
                </div>

                {/* ── Scrollable Content ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">

                    {/* PERKS TAB */}
                    {activeTab === "perks" && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             {/* 🔌 Mods */}
                            {modCategories && modCategories.length > 0 && (
                                <Section title="Mods">
                                    <div className="flex gap-2 flex-wrap">
                                        {modCategories.flatMap(cat => cat.sockets).map((socket) => (
                                            <SocketIcon key={socket.socketIndex} socket={socket} />
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* 💠 Perk Columns */}
                            {perkCategories && perkCategories.length > 0 && (
                                <Section title="Perks & Traits">
                                    {perkCategories.map((cat) => (
                                        <div key={cat.categoryHash} className="mb-3 last:mb-0">
                                            <h4 className="text-[9px] uppercase text-text-tertiary/60 font-bold mb-2 tracking-widest">{cat.categoryName}</h4>
                                            <div className="flex gap-3">
                                                {cat.sockets.map((socket) => (
                                                    <div key={socket.socketIndex} className="flex flex-col items-center gap-1">
                                                        <SocketIcon socket={socket} large />
                                                        {/* Alt perks */}
                                                        {socket.plugOptions.length > 1 && (
                                                            <div className="flex gap-0.5 flex-wrap justify-center max-w-[48px]">
                                                                {socket.plugOptions.filter(p => p.plugHash !== socket.plug.plugHash).slice(0, 3).map((alt) => (
                                                                    <div key={alt.plugHash} className="w-5 h-5 rounded border border-white/10 bg-[#1a1f2e] flex items-center justify-center overflow-hidden opacity-50">
                                                                        {alt.icon && <Image src={`${BUNGIE_ROOT}${alt.icon}`} alt={alt.name} width={18} height={18} className="object-contain" unoptimized />}
                                                                    </div>
                                                                ))}
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
                                <Section title="Perks (Legacy)">
                                    <div className="grid grid-cols-5 gap-2">
                                        {legacyPerks.map((perk, i) => (
                                            <div key={i} className="group relative aspect-square bg-[#1a1f2e] border border-white/10 rounded-lg flex items-center justify-center p-1.5 hover:border-white/30 transition-colors cursor-help">
                                                {perk.icon && <Image src={`${BUNGIE_ROOT}${perk.icon}`} alt={perk.name || "Perk"} width={36} height={36} className="object-contain opacity-90 group-hover:opacity-100" unoptimized />}
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Description */}
                            {item.description && <p className="text-xs text-text-secondary leading-relaxed border-t border-white/5 pt-3">{item.description}</p>}
                        </div>
                    )}

                    {/* STATS TAB */}
                    {activeTab === "stats" && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {dimStats && dimStats.length > 0 ? (
                                <div className="space-y-1.5">
                                    {dimStats.filter(s => s.statHash !== -1).map((stat) => (
                                        <div key={stat.statHash} className="flex items-center gap-3 text-xs">
                                            <span className="text-text-secondary w-28 text-right text-[11px] truncate">{stat.name}</span>
                                            {stat.bar ? (
                                                <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden relative">
                                                    <div className="absolute inset-y-0 left-0 bg-white/40 rounded-sm" style={{ width: `${Math.min(100, (stat.base / stat.displayMaximum) * 100)}%` }} />
                                                    <div className={cn("absolute inset-y-0 left-0 rounded-sm", stat.value > stat.base ? "bg-gradient-to-r from-white/60 to-cyan-400/70" : "bg-white/60")} style={{ width: `${Math.min(100, (stat.value / stat.displayMaximum) * 100)}%` }} />
                                                </div>
                                            ) : <div className="flex-1" />}
                                            <span className={cn("w-8 text-right font-mono text-xs", stat.value > stat.base ? "text-cyan-300" : "text-white/80")}>{stat.value}</span>
                                        </div>
                                    ))}
                                    {isArmor && dimStats.find(s => s.statHash === -1) && (
                                        <div className="flex items-center gap-3 text-xs pt-1.5 border-t border-white/5 mt-1.5">
                                            <span className="text-text-secondary w-28 text-right text-[11px] font-semibold">Total</span>
                                            <div className="flex-1" />
                                            <span className="w-8 text-right font-mono text-xs text-gold-primary font-bold">{dimStats.find(s => s.statHash === -1)?.value}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-xs text-text-tertiary py-10">No stats available</div>
                            )}
                        </div>
                    )}

                    {/* LORE TAB */}
                    {activeTab === "lore" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {item.loreDescription ? (
                                <div>
                                    {item.loreSubtitle && <h4 className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 font-semibold">{item.loreSubtitle}</h4>}
                                    <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line font-serif italic opacity-80">{item.loreDescription}</p>
                                </div>
                            ) : (
                                <div className="text-center text-xs text-text-tertiary py-10">No lore available</div>
                            )}
                            {item.flavorText && (
                                <p className="text-xs text-text-tertiary italic leading-relaxed border-t border-white/10 pt-4">&quot;{item.flavorText}&quot;</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Helpers ───

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
                active ? "text-gold-primary border-gold-primary" : "text-text-tertiary border-transparent hover:text-white"
            )}
        >
            {label}
        </button>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-[10px] uppercase text-text-tertiary font-bold mb-2.5 tracking-widest border-b border-white/5 pb-1">{title}</h3>
            {children}
        </div>
    );
}

function SocketIcon({ socket, large }: { socket: DimSocket, large?: boolean }) {
    return (
        <div className={cn(
            "rounded-lg border flex items-center justify-center overflow-hidden bg-[#1a1f2e] relative group cursor-help transition-colors",
            large ? "w-11 h-11" : "w-10 h-10",
            socket.isIntrinsic ? "border-yellow-500/40 bg-yellow-500/5" : "border-white/15 hover:border-white/30",
        )}>
            {socket.plug.icon && <Image src={`${BUNGIE_ROOT}${socket.plug.icon}`} alt={socket.plug.name} width={38} height={38} className="object-contain opacity-90 group-hover:opacity-100" unoptimized />}
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/95 border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 max-w-[200px] text-center shadow-xl">
                <div className="font-semibold">{socket.plug.name}</div>
                {socket.plug.description && <div className="text-[9px] text-text-tertiary mt-0.5 whitespace-normal leading-tight">{socket.plug.description}</div>}
            </div>
        </div>
    );
}
