"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { CharacterSelector } from "@/components/inventory/CharacterSelector";
import Image from "next/image";
import type { InventoryItem } from "@/lib/inventory/service";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ItemInspector } from "@/components/inventory/ItemInspector";
import { ItemConstantsProvider } from "@/components/inventory/ItemConstantsContext";
import { useInventoryStore } from "@/lib/store/inventory";
import { useFarmingStore } from "@/lib/store/farming";
import { useGodRollStore } from "@/lib/store/god-rolls";
import { evaluateSearchQuery } from "@/lib/inventory/search";
import { CharacterColumn } from "@/components/inventory/CharacterColumn";
import { SearchBar } from "@/components/inventory/SearchBar";
import { VaultGrid } from "@/components/inventory/VaultGrid";
import { FarmingToggle } from "@/components/inventory/FarmingToggle";
import { DensityToggle } from "@/components/inventory/DensityToggle";
import { VaultFilterBar } from "@/components/inventory/VaultFilterBar";
import { BulkActionDropdown } from "@/components/inventory/BulkActionDropdown";
import { ComparatorOverlay } from "@/components/compare/ComparatorOverlay";
import { BUCKET_ORDER, BUCKETS } from "@/lib/destiny/buckets";
import { useLayoutStore } from "@/lib/store/layout";

export default function InventoryPage() {
    const { profile, isLoading, error, loadProfile, selectedCharId, setSelectedCharId, moveItem, equipItem, searchQuery, setSearchQuery } = useInventoryStore();
    const [activeDragItem, setActiveDragItem] = useState<InventoryItem | null>(null);
    const [inspectItem, setInspectItem] = useState<InventoryItem | null>(null);
    const { isCompactMode, vaultFilter } = useLayoutStore();

    // Initial Load & Polling
    const loadGodRolls = useGodRollStore((s) => s.load);
    useEffect(() => {
        loadGodRolls();
        loadProfile();
        const intervalId = setInterval(() => loadProfile(true), 30000);

        const onFocus = () => loadProfile(true);
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") loadProfile(true);
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [loadProfile, loadGodRolls]);

    // Farming Mode Effect
    const isFarmingEnabled = useFarmingStore((s) => s.isEnabled);
    const farmingInterval = useFarmingStore((s) => s.intervalSeconds);
    const { pullFromPostmaster } = useInventoryStore();
    const farmingBlacklist = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!isFarmingEnabled || !profile) return;

        const timer = setInterval(() => {
            // Find non-engram postmaster items
            // 215593132 is the postmaster bucket. itemType 8 is engrams.
            const postmasterItems = profile.items.filter(i =>
                i.characterId === selectedCharId &&
                i.location === "postmaster" &&
                i.bucketHash === 215593132 &&
                i.itemType !== 8 &&
                !(i.transferStatus & 2) && // Ignore items marked as NotTransferrable
                !farmingBlacklist.current.has(i.itemInstanceId || `${i.itemHash}-${i.characterId}`)
            );

            if (postmasterItems.length > 0) {
                const itemsToPull = postmasterItems.slice(0, 10);
                console.log(`[Farming Mode] Found ${postmasterItems.length} items. Siphoning ${itemsToPull.length} to Vault...`);

                itemsToPull.forEach(item => {
                    const uniqueId = item.itemInstanceId || `${item.itemHash}-${item.characterId}`;
                    farmingBlacklist.current.add(uniqueId);

                    console.log(`[Farming Mode] Auto-siphoning Postmaster Item: ${item.name} (${item.itemHash}) to Vault...`);
                    moveItem(item, "vault", item.characterId);
                });
            }
        }, farmingInterval * 1000);

        return () => clearInterval(timer);
    }, [isFarmingEnabled, profile, farmingInterval, pullFromPostmaster, moveItem, selectedCharId]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current?.item || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const item = active.data.current?.item as InventoryItem;
        let targetType = over.data.current?.type as string | undefined;

        if (!item || !targetType) return;

        console.log("Dropped", item.name, "onto", targetType, over.id);

        // Hijack: Treat dropping foreign items on equipment slots as a standard character transfer
        if (targetType === "equipment" && (item.location !== "character" || item.characterId !== selectedCharId)) {
            targetType = "character";
        }

        if (targetType === "equipment") {
            const targetBucket = over.data.current?.bucketHash;
            if (targetBucket && item.bucketHash === targetBucket) {
                equipItem(item);
            }
            return;
        }

        // Transfer Logic
        let targetLocation: "character" | "vault" = "character";
        let targetCharacterId = selectedCharId;

        if (targetType === "vault") {
            targetLocation = "vault";
        } else if (targetType === "character" || targetType === "postmaster") {
            // Drop on character panel or postmaster (which is part of char panel)
            targetLocation = "character";
            targetCharacterId = over.data.current?.characterId || selectedCharId;
        }

        moveItem(item, targetLocation, targetCharacterId);
    };

    // Organized Data for View (Single Character)
    const isGodRollFunc = useGodRollStore(s => s.isGodRoll);

    const organizedData = useMemo(() => {
        if (!profile) return null;

        const charItems: Record<string, Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>> = {};

        if (profile.characters && Array.isArray(profile.characters)) {
            profile.characters.forEach(c => {
                charItems[c.characterId] = {};
                BUCKET_ORDER.forEach(b => {
                    charItems[c.characterId][b] = { inventory: [] };
                });
            });
        }

        if (profile.items) {
            profile.items.forEach(item => {
                if (searchQuery) {
                    if (!evaluateSearchQuery(item, searchQuery, isGodRollFunc)) return;
                }

                if (item.location === "character" && item.characterId && charItems[item.characterId]) {
                    const bucket = item.intrinsicBucketHash || item.bucketHash;
                    if (!charItems[item.characterId][bucket]) {
                        charItems[item.characterId][bucket] = { inventory: [] };
                    }
                    if (item.isEquipped) {
                        charItems[item.characterId][bucket].equipped = item;
                    } else {
                        charItems[item.characterId][bucket].inventory.push(item);
                    }
                }
            });
        }

        // Sort items inside buckets only if there are items
        if (profile.items) {
            Object.values(charItems).forEach((buckets) => {
                Object.values(buckets).forEach((slot) => {
                    if (slot && slot.inventory) {
                        slot.inventory.sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
                    }
                });
            });
        }

        return charItems;
    }, [profile, searchQuery, isGodRollFunc]);

    const vaultItems = useMemo(() => {
        if (!profile || !profile.items) return [];
        return profile.items.filter(i => {
            if (i.location !== "vault") return false;

            const trueBucket = i.intrinsicBucketHash || i.bucketHash;

            // 1. Vault Cleanup: Hide anything that isn't in our core BUCKET_ORDER (ships, mats, transmat, etc)
            if (!(BUCKET_ORDER as readonly number[]).includes(trueBucket)) return false;

            // 2. Vault Quick Filter
            if (vaultFilter === "weapons") {
                if (trueBucket !== BUCKETS.KINETIC && trueBucket !== BUCKETS.ENERGY && trueBucket !== BUCKETS.POWER) return false;
            } else if (vaultFilter === "armor") {
                if (trueBucket !== BUCKETS.HELMET && trueBucket !== BUCKETS.GAUNTLETS && trueBucket !== BUCKETS.CHEST && trueBucket !== BUCKETS.LEG && trueBucket !== BUCKETS.CLASS_ITEM) return false;
            } else if (typeof vaultFilter === "number") {
                if (trueBucket !== vaultFilter) return false;
            }

            // 3. Text Search Match
            if (searchQuery) {
                if (!evaluateSearchQuery(i, searchQuery, isGodRollFunc)) return false;
            }
            return true;
        }).sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
    }, [profile, searchQuery, isGodRollFunc, vaultFilter]);


    if (isLoading && !profile) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-16 h-16 rounded-2xl bg-wd-primary-600/15 border border-wd-primary-600/30 flex items-center justify-center wd-glow-pulse">
                <RefreshCw size={28} className="text-wd-primary-400 animate-spin" />
            </div>
            <div className="space-y-2 text-center">
                <p className="text-sm font-bold text-text-primary uppercase tracking-widest">Syncing Inventory</p>
                <p className="text-xs text-text-tertiary">Establishing neural link with Bungie API...</p>
            </div>
            <div className="w-48 h-2 rounded-full overflow-hidden bg-bg-tertiary">
                <div className="h-full bg-gradient-to-r from-wd-primary-600 to-wd-lilac rounded-full" style={{ width: '60%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            </div>
        </div>
    );
    if (!profile || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-wd-danger/15 border border-wd-danger/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <ShieldAlert size={32} className="text-wd-danger" />
                </div>
                <h1 className="text-2xl font-black tracking-widest text-text-primary uppercase">Neural Link Severed</h1>
                <div className="wd-card p-5 max-w-lg border-wd-danger/20">
                    <p className="text-sm text-text-secondary font-mono break-words leading-relaxed">
                        {error || "Your secure session with Bungie.net has expired or was interrupted. Please re-authenticate to restore inventory access."}
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = "/api/auth/logout"}
                    className="px-8 py-3 bg-wd-danger/15 hover:bg-wd-danger/25 border border-wd-danger/30 text-wd-danger rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Reconnect to Bungie
                </button>
            </div>
        );
    }

    const selectedCharacter = profile.characters?.find(c => c.characterId === selectedCharId);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <ItemConstantsProvider value={profile.itemConstants}>
                <div className="flex flex-col h-full animate-fade-in min-h-screen pb-20">

                    {/* Controls Bar — WowDash Card Style */}
                    <div className="sticky top-0 z-30 bg-bg-secondary/95 backdrop-blur-xl border-b border-border-subtle px-6 py-3">
                        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Character Selector */}
                            <div className="w-full md:w-auto overflow-x-auto">
                                <CharacterSelector characters={profile.characters} selectedId={selectedCharId} onSelect={setSelectedCharId} />
                            </div>

                            {/* Search & Refresh & Farming */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                                {searchQuery && (
                                    <BulkActionDropdown
                                        items={[
                                            ...vaultItems,
                                            ...(organizedData?.[selectedCharId]
                                                ? Object.values(organizedData[selectedCharId]).flatMap(slot => [
                                                    ...(slot.equipped && evaluateSearchQuery(slot.equipped, searchQuery, isGodRollFunc) ? [slot.equipped] : []),
                                                    ...slot.inventory
                                                ])
                                                : [])
                                        ]}
                                    />
                                )}

                                <button onClick={() => loadProfile()} className="p-2 rounded-lg bg-bg-tertiary hover:bg-wd-primary-600/15 border border-border-subtle hover:border-wd-primary-600/30 text-text-secondary hover:text-text-primary transition-all" title="Reload Inventory">
                                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                                </button>
                                <DensityToggle />
                                <FarmingToggle />
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 px-4 py-4 max-w-[1920px] mx-auto w-full h-[calc(100vh-140px)] overflow-hidden">
                        {/* Unified View: Character + Vault */}
                        <div className="flex gap-4 h-full overflow-hidden">
                            {/* Selected Character */}
                            {selectedCharacter && organizedData && (
                                <CharacterColumn
                                    character={selectedCharacter}
                                    items={organizedData[selectedCharId]}
                                    onInspect={setInspectItem}
                                    compact={isCompactMode}
                                />
                            )}

                            {/* Vault — WowDash Card */}
                            <div className="flex-1 flex flex-col wd-card overflow-hidden relative">
                                <div className="wd-card-header">
                                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Vault</h2>
                                    <span className="wd-badge wd-badge-primary">
                                        {vaultItems.length}
                                    </span>
                                </div>
                                <VaultFilterBar />
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    <VaultGrid items={vaultItems} onItemClick={setInspectItem} compact={isCompactMode} />
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Use key to force remount on item change to reset internal state */}
                    <ItemInspector item={inspectItem} onClose={() => setInspectItem(null)} key={inspectItem?.itemInstanceId || inspectItem?.itemHash} />

                    <DragOverlay>
                        {activeDragItem ? (
                            <div className="w-12 h-12 rounded-sm bg-bg-tertiary border border-wd-primary-600 overflow-hidden shadow-2xl relative z-[100]">
                                <Image src={`https://www.bungie.net${activeDragItem.icon}`} alt="Dragging" fill className="object-cover" unoptimized />
                            </div >
                        ) : null}
                    </DragOverlay >
                </div >
                <ComparatorOverlay />
            </ItemConstantsProvider >
        </DndContext >
    );
}
