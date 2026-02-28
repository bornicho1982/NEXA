"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Unlock, Star, Trash2, Archive, Check, ThumbsUp, Scale } from "lucide-react";
import Image from "next/image";
import type { InventoryItem } from "@/lib/inventory/service";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/lib/store/inventory";
import { useGodRollStore } from "@/lib/store/god-rolls";
import type { DimSocket } from "@/types/dim-types";
import { ClarityDescription } from "./ClarityDescription";
import { ArmorStats } from "./ArmorStats";
import { WeaponStats } from "./WeaponStats";

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
    const { setLockState, setAnnotation, startCompare } = useInventoryStore();
    const [activeTab, setActiveTab] = useState<"perks" | "stats" | "lore">("perks");
    const [note, setNote] = useState(item?.notes || "");
    const godRolls = useGodRollStore((s) => item ? s.rolls[item.itemHash.toString()] : undefined);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(t);
    }, []);

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
                    "w-[440px] max-h-[90vh] flex flex-col bg-bg-secondary border rounded-xl relative animate-in zoom-in-95 duration-200 overflow-hidden shadow-elevated",
                    tier.border,
                    tier.glow,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header with Screenshot ── */}
                <div className="h-40 relative shrink-0">
                    {/* Background */}
                    {item.screenshot ? (
                        <Image src={`${BUNGIE_ROOT}${item.screenshot}`} alt="" fill sizes="(max-width: 768px) 100vw, 440px" className="object-cover" unoptimized />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />

                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-bg-primary/50 hover:bg-white/10 text-white rounded-full transition-colors z-30">
                        <X size={16} />
                    </button>

                    {/* Lock Button */}
                    <button
                        onClick={handleLockToggle}
                        className={cn(
                            "absolute top-3 left-3 p-2 rounded-full transition-colors z-30",
                            item.isLocked ? "bg-wd-warning/20 text-wd-warning hover:bg-wd-warning/30" : "bg-bg-primary/50 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                    >
                        {item.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    {/* Compare Button */}
                    {isWeapon && (
                        <button
                            onClick={() => {
                                startCompare(item);
                                onClose(); // Close the inspector to see the overlay
                            }}
                            className="absolute top-3 left-14 p-2 bg-bg-primary/50 text-wd-primary-400/70 hover:text-wd-primary-400 hover:bg-wd-primary-600/20 rounded-full transition-colors z-30"
                            title="Compare this weapon"
                        >
                            <Scale size={16} />
                        </button>
                    )}

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
                                    <span className="text-xs font-mono text-wd-warning ml-auto">⚡ {item.primaryStat}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tags & Notes Bar ── */}
                <div className="px-4 py-2 border-b border-border-subtle bg-bg-primary/20 flex items-center gap-2">
                    <div className="flex bg-bg-primary rounded-lg p-0.5 border border-border-subtle">
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
                <div className="flex border-b border-border-subtle px-4">
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
                                        {modCategories.flatMap(cat => cat.sockets).map((socket) => {
                                            const isGodRollPerk = godRolls?.includes(socket.plug.plugHash) ?? false;
                                            return <SocketIcon key={socket.socketIndex} socket={socket} isGodRollPerk={isGodRollPerk} />;
                                        })}
                                    </div>
                                </Section>
                            )}

                            {/* 💠 Perk Columns */}
                            {perkCategories && perkCategories.length > 0 && (
                                <Section title="Perks & Traits">
                                    {perkCategories.map((cat) => (
                                        <div key={cat.categoryHash} className="mb-4 last:mb-0">
                                            <h4 className="text-[10px] uppercase text-text-tertiary font-bold mb-2 tracking-widest">{cat.categoryName}</h4>

                                            {/* Icons Row */}
                                            <div className="flex gap-3 mb-2">
                                                {cat.sockets.map((socket) => {
                                                    const isGodRollPerk = godRolls?.includes(socket.plug.plugHash) ?? false;
                                                    return (
                                                        <div key={socket.socketIndex} className="flex flex-col items-center gap-1">
                                                            <SocketIcon socket={socket} large isGodRollPerk={isGodRollPerk} />
                                                            {/* Alt perks */}
                                                            {socket.plugOptions.length > 1 && (
                                                                <div className="flex gap-0.5 flex-wrap justify-center max-w-[48px]">
                                                                    {socket.plugOptions.filter(p => p.plugHash !== socket.plug.plugHash).slice(0, 3).map((alt) => {
                                                                        const isAltGodRoll = godRolls?.includes(alt.plugHash) ?? false;
                                                                        return (
                                                                            <div key={alt.plugHash} className={cn(
                                                                                "w-5 h-5 rounded border bg-bg-tertiary flex items-center justify-center overflow-hidden opacity-50 relative",
                                                                                isAltGodRoll ? "border-wd-warning/70" : "border-border-subtle"
                                                                            )}>
                                                                                {alt.icon && <Image src={`${BUNGIE_ROOT}${alt.icon}`} alt={alt.name} width={18} height={18} className="object-contain" unoptimized />}
                                                                                {isAltGodRoll && <ThumbsUp className="w-2 h-2 text-wd-warning fill-wd-warning absolute top-px right-px" />}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Clarity Descriptions List */}
                                            <div className="mt-3 flex flex-col gap-1.5">
                                                {cat.sockets.filter(s => s.plug.description || s.plug.clarityInfo).map((socket) => (
                                                    <div key={`desc-${socket.socketIndex}`} className="bg-bg-primary/40 p-2 rounded-md border border-border-subtle">
                                                        <div className="text-[11px] font-bold text-white/90 leading-tight mb-1">{socket.plug.name}</div>
                                                        {socket.plug.clarityInfo ? (
                                                            <ClarityDescription lines={socket.plug.clarityInfo} />
                                                        ) : (
                                                            <div className="text-[11px] text-text-tertiary leading-relaxed">{socket.plug.description}</div>
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
                                            <div key={i} className="group relative aspect-square bg-bg-tertiary border border-border-subtle rounded-lg flex items-center justify-center p-1.5 hover:border-border-medium transition-colors cursor-help">
                                                {perk.icon && <Image src={`${BUNGIE_ROOT}${perk.icon}`} alt={perk.name || "Perk"} width={36} height={36} className="object-contain opacity-90 group-hover:opacity-100" unoptimized />}
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Description */}
                            {item.description && <p className="text-xs text-text-secondary leading-relaxed border-t border-border-subtle pt-3">{item.description}</p>}
                        </div>
                    )}

                    {/* STATS TAB */}
                    {activeTab === "stats" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
                            {isArmor ? (
                                <ArmorStats dimStats={dimStats || []} item={item} />
                            ) : isWeapon ? (
                                <WeaponStats dimStats={dimStats || []} item={item} />
                            ) : (
                                <div className="text-center text-xs text-text-tertiary py-10">No stats available</div>
                            )}

                            {/* Masterwork stat info */}
                            {item.masterworkInfo?.statName && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle text-xs text-wd-warning font-medium tracking-wide">
                                    <span className="w-2.5 h-2.5 rounded-full bg-wd-warning/40 animate-pulse" />
                                    <span>Masterwork: <span className="text-white">+{item.masterworkInfo.statValue} {item.masterworkInfo.statName}</span></span>
                                </div>
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
                                <p className="text-xs text-text-tertiary italic leading-relaxed border-t border-border-subtle pt-4">&quot;{item.flavorText}&quot;</p>
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
                active ? "text-wd-primary-400 border-wd-primary-400" : "text-text-tertiary border-transparent hover:text-text-primary"
            )}
        >
            {label}
        </button>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-[10px] uppercase text-text-tertiary font-bold mb-2.5 tracking-widest border-b border-border-subtle pb-1">{title}</h3>
            {children}
        </div>
    );
}

function SocketIcon({ socket, large, isGodRollPerk }: { socket: DimSocket, large?: boolean, isGodRollPerk?: boolean }) {
    return (
        <div className={cn(
            "rounded-lg border flex items-center justify-center overflow-hidden bg-bg-tertiary relative group cursor-pointer transition-colors",
            large ? "w-11 h-11" : "w-10 h-10",
            socket.isIntrinsic ? "border-wd-warning/40 bg-wd-warning/5" : (isGodRollPerk ? "border-wd-warning/80 shadow-[0_0_10px_rgba(255,159,41,0.2)]" : "border-border-subtle hover:border-border-medium"),
        )}>
            {isGodRollPerk && <ThumbsUp className="w-2.5 h-2.5 text-wd-warning fill-wd-warning absolute top-0.5 right-0.5 z-10 drop-shadow-md bg-bg-primary/40 rounded-full p-[1px]" />}
            {socket.plug.icon && <Image src={`${BUNGIE_ROOT}${socket.plug.icon}`} alt={socket.plug.name} width={38} height={38} className={cn("object-contain opacity-90 group-hover:opacity-100", isGodRollPerk ? "opacity-100 scale-105" : "")} unoptimized />}
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-bg-primary/95 border border-border-subtle rounded px-2 py-1 text-[10px] text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 max-w-[200px] text-center shadow-elevated">
                <div className="font-semibold">{socket.plug.name}</div>
                {socket.plug.description && <div className="text-[9px] text-text-tertiary mt-0.5 whitespace-normal leading-tight">{socket.plug.description}</div>}
            </div>
        </div>
    );
}
