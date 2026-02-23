"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { CharacterSelector } from "@/components/inventory/CharacterSelector";
import Image from "next/image";
import type { InventoryItem } from "@/lib/inventory/service";
import { RefreshCw } from "lucide-react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ItemInspector } from "@/components/inventory/ItemInspector";
import { ItemConstantsProvider } from "@/components/inventory/ItemConstantsContext";
import { useInventoryStore } from "@/lib/store/inventory";
import { CharacterColumn } from "@/components/inventory/CharacterColumn";
import { SearchBar } from "@/components/inventory/SearchBar";
import { VaultGrid } from "@/components/inventory/VaultGrid";
import { BUCKET_ORDER } from "@/lib/destiny/buckets";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
    const { profile, isLoading, loadProfile, selectedCharId, setSelectedCharId, moveItem, equipItem, searchQuery, setSearchQuery } = useInventoryStore();
    const [activeDragItem, setActiveDragItem] = useState<InventoryItem | null>(null);
    const [inspectItem, setInspectItem] = useState<InventoryItem | null>(null);

    // Initial Load & Polling
    useEffect(() => {
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
    }, [loadProfile]);

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
    const organizedData = useMemo(() => {
        if (!profile) return null;

        const charItems: Record<string, Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>> = {};
        profile.characters.forEach(c => {
            charItems[c.characterId] = {};
            BUCKET_ORDER.forEach(b => {
                charItems[c.characterId][b] = { inventory: [] };
            });
        });

        profile.items.forEach(item => {
             if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const hasCommands = query.includes("is:") || query.includes("tag:");

                if (!hasCommands) {
                    if (!item.name.toLowerCase().includes(query)) return;
                } else {
                    // Basic command filtering
                    if (query.includes("is:weapon") && item.itemType !== 3) return;
                    if (query.includes("is:armor") && item.itemType !== 2) return;
                    if (query.includes("is:exotic") && item.tierType !== 6) return;
                    if (query.includes("is:legendary") && item.tierType !== 5) return;
                    if (query.includes("is:kinetic") && item.damageType !== 1) return;
                    if (query.includes("is:deepsight") && !item.isDeepsight) return;
                    if (query.includes("is:crafted") && !item.isCrafted) return;
                    if (query.includes("is:locked") && !item.isLocked) return;
                    if (query.includes("tag:favorite") && item.tag !== "favorite") return;
                    if (query.includes("tag:junk") && item.tag !== "junk") return;
                }
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

        // Sort
        Object.values(charItems).forEach((buckets) => {
            Object.values(buckets).forEach((slot) => {
                slot.inventory.sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
            });
        });

        return charItems;
    }, [profile, searchQuery]);

    const vaultItems = useMemo(() => {
         if (!profile) return [];
         return profile.items.filter(i => {
             if (i.location !== "vault") return false;
             if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!query.includes("is:") && !query.includes("tag:") && !i.name.toLowerCase().includes(query)) return false;
             }
             return true;
         }).sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
    }, [profile, searchQuery]);


    if (isLoading && !profile) return <div className="flex items-center justify-center min-h-screen text-white/50 text-sm tracking-widest uppercase animate-pulse">Loading Data...</div>;
    if (!profile) return <div className="flex items-center justify-center min-h-screen text-red-400 text-sm tracking-widest uppercase">Failed to load profile.</div>;

    const selectedCharacter = profile.characters.find(c => c.characterId === selectedCharId);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <ItemConstantsProvider value={profile.itemConstants}>
                <div className="flex flex-col h-full bg-bg-primary animate-fade-in min-h-screen pb-20">
                    <Header title="Loadout Manager" subtitle="Professional Inventory Management" />

                    {/* Controls Bar */}
                    <div className="sticky top-0 z-30 bg-[#030712]/95 backdrop-blur-xl border-b border-white/10 px-6 py-3">
                         <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                             {/* Character Selector (Always Visible Now) */}
                             <div className="w-full md:w-auto overflow-x-auto">
                                <CharacterSelector characters={profile.characters} selectedId={selectedCharId} onSelect={setSelectedCharId} />
                             </div>

                             {/* Search & Refresh */}
                             <div className="flex items-center gap-3 w-full md:w-auto">
                                 <SearchBar value={searchQuery} onChange={setSearchQuery} />
                                 <button onClick={() => loadProfile()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                                     <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                                 </button>
                             </div>
                         </div>
                    </div>

                    <main className="flex-1 px-4 py-4 max-w-[1920px] mx-auto w-full h-[calc(100vh-140px)] overflow-hidden">
                        {/* Unified View: Single Character + Vault */}
                        <div className="flex gap-4 h-full overflow-hidden">
                            {/* Selected Character */}
                             {selectedCharacter && organizedData && (
                                <CharacterColumn
                                    character={selectedCharacter}
                                    items={organizedData[selectedCharId]}
                                    onInspect={setInspectItem}
                                />
                             )}

                             {/* Vault */}
                             <div className="flex-1 flex flex-col border border-white/10 rounded-xl bg-[#050914]/50 overflow-hidden relative">
                                 <div className="p-3 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                    <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Vault</h2>
                                    <span className="text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        {vaultItems.length}
                                    </span>
                                 </div>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                     <VaultGrid items={vaultItems} onItemClick={setInspectItem} />
                                 </div>
                             </div>
                        </div>
                    </main>

                    {/* Use key to force remount on item change to reset internal state */}
                    <ItemInspector item={inspectItem} onClose={() => setInspectItem(null)} key={inspectItem?.itemInstanceId || inspectItem?.itemHash} />

                    <DragOverlay>
                        {activeDragItem ? (
                            <div className="w-12 h-12 rounded-sm bg-[#1e293b] border border-gold-primary overflow-hidden shadow-2xl relative z-[100]">
                                <Image src={`https://www.bungie.net${activeDragItem.icon}`} alt="Dragging" fill className="object-cover" unoptimized />
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </ItemConstantsProvider>
        </DndContext>
    );
}
