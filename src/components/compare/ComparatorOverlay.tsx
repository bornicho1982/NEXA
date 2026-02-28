"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu } from "@headlessui/react";
import { useInventoryStore } from "@/lib/store/inventory";
import { X, Plus, PlusCircle, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { WeaponStats } from "../inventory/WeaponStats";
import { useGodRollStore } from "@/lib/store/god-rolls";

const BUNGIE_ROOT = "https://www.bungie.net";

function FilterMenu({ label, value, options, onChange, optionLabels, zIndex = 10 }: {
    label: string;
    value: string | number;
    options: (string | number)[];
    onChange: (val: string | number) => void;
    optionLabels?: Record<string | number, string>;
    zIndex?: number;
}) {
    const displayValue = value === "ALL" ? label : (optionLabels ? optionLabels[value as string | number] : value);

    return (
        <Menu as="div" className="relative w-full" style={{ zIndex }}>
            <Menu.Button className="w-full flex items-center justify-between px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-xs text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors text-left focus:outline-none focus:border-wd-primary-600/50">
                <span className="truncate pr-2">{displayValue as string}</span>
                <ChevronDown size={14} className="opacity-50 shrink-0" />
            </Menu.Button>
            <Menu.Items className="absolute left-0 right-0 mt-1 origin-top rounded-lg bg-bg-secondary border border-border-subtle shadow-elevated focus:outline-none overflow-hidden max-h-60 overflow-y-auto z-[3020]">
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => onChange("ALL")}
                            className={cn("w-full text-left px-3 py-2 text-xs transition-colors flex items-center", active ? "bg-wd-primary-600/10 text-text-primary" : "text-text-secondary")}
                        >
                            <span className="flex-1">{label}</span>
                            {value === "ALL" && <Check size={14} className="text-wd-primary-400" />}
                        </button>
                    )}
                </Menu.Item>
                {options.map((opt) => (
                    <Menu.Item key={opt}>
                        {({ active }) => (
                            <button
                                onClick={() => onChange(opt)}
                                className={cn("w-full text-left px-3 py-2 text-xs transition-colors flex items-center", active ? "bg-wd-primary-600/10 text-text-primary" : "text-text-secondary")}
                            >
                                <span className="flex-1">{optionLabels ? optionLabels[opt as string | number] : opt as string}</span>
                                {value === opt && <Check size={14} className="text-wd-primary-400" />}
                            </button>
                        )}
                    </Menu.Item>
                ))}
            </Menu.Items>
        </Menu>
    );
}

export function ComparatorOverlay() {
    const { profile, isComparing, compareBaseItem, compareTargetItems, closeCompare, addToCompare, removeFromCompare } = useInventoryStore();
    const godRollsStore = useGodRollStore();
    const [mounted, setMounted] = useState(false);

    // Filters State
    const [filterSlot, setFilterSlot] = useState<number | "ALL">("ALL");
    const [filterType, setFilterType] = useState<string | "ALL">("ALL");
    const [filterElement, setFilterElement] = useState<number | "ALL">("ALL");

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(t);
    }, []);

    // Manage overflow for the page when compare is open
    useEffect(() => {
        if (isComparing) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isComparing]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isComparing) closeCompare();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [closeCompare, isComparing]);

    if (!isComparing || !compareBaseItem || !profile || !mounted) return null;

    // Find all matching candidates in the entire profile
    // Allow comparing against ANY weapon (i.itemType === 3)
    const candidates = profile.items.filter(i =>
        i.itemType === 3
    );

    // Extract unique available values for dynamic filter dropdowns
    // Use intrinsicBucketHash instead of bucketHash so vaulted items resolve correctly to Kinetic/Energy/Power
    const allSlots = Array.from(new Set(candidates.map(c => c.intrinsicBucketHash))).filter(Boolean) as number[];
    const allTypes = Array.from(new Set(candidates.map(c => c.typeName))).filter(Boolean) as string[];
    const allElements = Array.from(new Set(candidates.map(c => c.damageType))).filter(Boolean) as number[];
    allTypes.sort();

    const ELEMENT_NAMES: Record<number, string> = {
        1: "Kinetic",
        2: "Arc",
        3: "Solar",
        4: "Void",
        6: "Stasis",
        7: "Strand"
    };

    const SLOT_NAMES: Record<number, string> = {
        1498876634: "Kinetic",
        2465295065: "Energy",
        953998645: "Power"
    };

    // Filter out the ones already in the compare list
    let filteredCandidates = candidates.filter(c =>
        c.itemInstanceId !== compareBaseItem.itemInstanceId &&
        !compareTargetItems.some(t => t.itemInstanceId === c.itemInstanceId)
    );

    // Apply Active Filters
    if (filterSlot !== "ALL") filteredCandidates = filteredCandidates.filter(c => c.intrinsicBucketHash === filterSlot);
    if (filterType !== "ALL") filteredCandidates = filteredCandidates.filter(c => c.typeName === filterType);
    if (filterElement !== "ALL") filteredCandidates = filteredCandidates.filter(c => c.damageType === filterElement);

    const availableCandidates = filteredCandidates.sort((a, b) => {
        // Group by archetype first, then sort by power within the group
        const typeCompare = (a.typeName || "").localeCompare(b.typeName || "");
        if (typeCompare !== 0) return typeCompare;
        return (b.primaryStat || 0) - (a.primaryStat || 0);
    });

    const allCompareItems = [compareBaseItem, ...compareTargetItems];

    return createPortal(
        <div className="fixed inset-0 z-[3000] bg-bg-primary/95 backdrop-blur-xl flex animate-in fade-in duration-300">
            {/* Left Rail: Candidate List — WowDash Card Style */}
            <div className="w-80 h-full border-r border-border-subtle bg-bg-secondary flex flex-col shrink-0 overflow-hidden shadow-elevated">
                <div className="px-5 py-4 border-b border-border-subtle flex flex-col gap-3 shrink-0 relative z-20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">Add to Compare</h2>
                            <p className="text-xs text-text-tertiary mt-1">Available Weapons: <span className="text-wd-primary-400 font-bold">{availableCandidates.length}</span></p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2 mt-1">
                        <FilterMenu
                            label="All Slots"
                            value={filterSlot}
                            options={allSlots}
                            onChange={(v) => setFilterSlot(v as number | "ALL")}
                            optionLabels={SLOT_NAMES}
                            zIndex={30}
                        />
                        <FilterMenu
                            label="All Types"
                            value={filterType}
                            options={allTypes}
                            onChange={(v) => setFilterType(v as string | "ALL")}
                            zIndex={20}
                        />
                        <FilterMenu
                            label="All Elements"
                            value={filterElement}
                            options={allElements}
                            onChange={(v) => setFilterElement(v as number | "ALL")}
                            optionLabels={ELEMENT_NAMES}
                            zIndex={10}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full p-3 space-y-1.5 custom-scrollbar">
                    {availableCandidates.map(candidate => (
                        <div
                            key={candidate.itemInstanceId}
                            onClick={() => addToCompare(candidate)}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg bg-bg-primary/40 border border-border-subtle cursor-pointer hover:bg-wd-primary-600/10 hover:border-wd-primary-600/30 transition-all group",
                                compareTargetItems.length >= 3 && "opacity-50 pointer-events-none"
                            )}
                        >
                            <div className="w-10 h-10 border border-border-medium rounded-lg bg-bg-primary shrink-0 relative overflow-hidden">
                                {candidate.icon && <Image src={`${BUNGIE_ROOT}${candidate.icon}`} alt="" width={40} height={40} unoptimized />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-text-primary truncate">{candidate.name}</p>
                                <p className="text-[10px] text-text-tertiary truncate">{candidate.typeName} • <span className="text-wd-warning">{candidate.primaryStat}</span></p>
                            </div>
                            <PlusCircle size={16} className="text-text-tertiary group-hover:text-wd-primary-400 transition-colors shrink-0" />
                        </div>
                    ))}
                    {availableCandidates.length === 0 && (
                        <div className="text-center text-xs text-text-tertiary py-10">No other weapons found in inventory.</div>
                    )}
                </div>
            </div>

            {/* Main Stage: Comparison Columns */}
            <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                {/* Header — WowDash Card Header */}
                <div className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-secondary shrink-0">
                    <h1 className="text-lg font-bold tracking-widest uppercase text-text-primary flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-wd-primary-500 animate-pulse" />
                        Weapon Comparator
                        <span className="wd-badge wd-badge-primary ml-2">
                            {allCompareItems.length}/4
                        </span>
                    </h1>
                    <button onClick={closeCompare} className="wd-btn wd-btn-danger group flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Close</span>
                        <X size={16} />
                    </button>
                </div>

                {/* Stage Canvas */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6">
                    {allCompareItems.map((item, index) => {
                        const isBase = index === 0;

                        // Extract perks
                        const perkCategories = item.socketCategories?.filter(cat =>
                            cat.sockets.some(s => s.isPerk || s.isIntrinsic)
                        ) || [];

                        return (
                            <div key={item.itemInstanceId} className="w-[340px] shrink-0 h-full flex flex-col wd-card overflow-hidden animate-in slide-in-from-right-4 duration-300">

                                {/* Column Header (Item Banner) */}
                                <div className="relative h-28 border-b border-border-subtle shrink-0">
                                    {item.screenshot ? (
                                        <Image src={`${BUNGIE_ROOT}${item.screenshot}`} alt="" fill className="object-cover opacity-60" unoptimized />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-bg-primary to-bg-tertiary" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent" />

                                    {!isBase && (
                                        <button
                                            onClick={() => removeFromCompare(item)}
                                            className="absolute top-2 right-2 p-1.5 bg-bg-primary/60 hover:bg-wd-danger/50 text-text-tertiary hover:text-white rounded-full transition-colors z-20 backdrop-blur-md"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}

                                    <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3 z-10">
                                        <div className="w-14 h-14 border-2 border-border-medium rounded-lg shadow-elevated bg-bg-primary overflow-hidden shrink-0">
                                            {item.icon && <Image src={`${BUNGIE_ROOT}${item.icon}`} alt="" width={56} height={56} unoptimized />}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-1">
                                            <h3 className="font-bold text-white truncate text-sm shadow-black drop-shadow-md">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-wd-warning font-mono text-xs font-bold drop-shadow-md">{item.primaryStat}</span>
                                                {isBase && <span className="wd-badge wd-badge-primary text-[9px]">Baseline</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable content body */}
                                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">

                                    {/* Stats Block */}
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-3 border-b border-border-subtle pb-1">Stats vs Baseline</h4>
                                        <WeaponStats
                                            dimStats={item.weaponStats || []}
                                            item={item}
                                        />
                                    </div>

                                    {/* Perks Block */}
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-3 border-b border-border-subtle pb-1">Roll Overview</h4>

                                        <div className="flex flex-col gap-4">
                                            {perkCategories.map((cat, i) => (
                                                <div key={i} className="flex gap-2">
                                                    {cat.sockets.map(socket => {
                                                        const isGodRoll = godRollsStore.rolls[item.itemHash.toString()]?.includes(socket.plug.plugHash);
                                                        return (
                                                            <div key={socket.socketIndex} className={cn(
                                                                "relative w-10 h-10 rounded-full border bg-bg-primary/40 overflow-hidden flex items-center justify-center shrink-0",
                                                                isGodRoll ? "border-wd-warning shadow-[0_0_10px_rgba(255,159,41,0.2)]" : "border-border-subtle"
                                                            )}>
                                                                {socket.plug.icon && <Image src={`${BUNGIE_ROOT}${socket.plug.icon}`} alt="" width={38} height={38} className="object-contain" unoptimized />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                    {/* Empty Slot Placeholder */}
                    {allCompareItems.length < 4 && (
                        <div className="w-[340px] shrink-0 h-full flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl bg-glass-surface text-text-tertiary">
                            <Plus size={32} className="mb-2 opacity-50" />
                            <span className="text-xs uppercase tracking-widest font-bold">Add Weapon</span>
                            <span className="text-[10px] mt-1 text-center px-8 opacity-70">Select a weapon from the left panel to compare side-by-side.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
