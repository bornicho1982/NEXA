"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { CharacterSelector } from "@/components/inventory/CharacterSelector";
import Image from "next/image";
import { ItemCard } from "@/components/inventory/ItemCard";
import { BUCKETS, BUCKET_ORDER } from "@/lib/destiny/buckets";
import type { InventoryItem, ProfileData } from "@/lib/inventory/service";
import { RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DroppableZone } from "@/components/inventory/dnd/DroppableZone";

import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { transferItemAction, equipItemAction, crossCharacterTransferAction } from "@/lib/inventory/actions";
import { VaultGrid } from "@/components/inventory/VaultGrid";
import { ItemInspector } from "@/components/inventory/ItemInspector";
import { ItemConstantsProvider } from "@/components/inventory/ItemConstantsContext";
import { useToast } from "@/components/ui/toast";

export default function InventoryPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCharId, setSelectedCharId] = useState<string>("");
    const [search, setSearch] = useState("");
    const [activeDragItem, setActiveDragItem] = useState<InventoryItem | null>(null);
    const [inspectItem, setInspectItem] = useState<InventoryItem | null>(null);

    const { showToast } = useToast();

    // Eventual Consistency Cooldown (8s) & Optimistic Overrides
    const lastTransferTime = useRef<number>(0);
    const optimisticTransfers = useRef<Map<string, { location: "vault" | "character", characterId?: string, timestamp: number }>>(new Map());

    // DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // Load Data & Polling
    const loadProfile = useCallback(async (silent = false) => {
        // Prevent silent updates from overwriting optimistic UI if a transfer just happened within 8 seconds
        if (silent && Date.now() - lastTransferTime.current < 8000) {
            console.log("Skipping silent poll: Eventual consistency cooldown active.");
            return;
        }

        if (!silent) setLoading(true);
        try {
            const res = await fetch(`/api/inventory?t=${Date.now()}`, {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
            });
            const data = await res.json();

            // Check again right before setting state in case a transfer happened during the fetch
            if (silent && Date.now() - lastTransferTime.current < 8000) {
                console.log("Discarding fetched API data: Eventual consistency cooldown active.");
                return;
            }

            // Apply Optimistic Overrides for Eventual Consistency
            if (data.characters?.length > 0) {
                const now = Date.now();
                data.items = data.items.map((apiItem: InventoryItem) => {
                    const localKey = apiItem.itemInstanceId || apiItem.itemHash.toString();
                    const opt = optimisticTransfers.current.get(localKey);

                    if (opt) {
                        if (now - opt.timestamp > 30000) {
                            // Expire optimistic state after 30 seconds
                            optimisticTransfers.current.delete(localKey);
                        } else {
                            // Override Bungie's stale data with our optimistic transfer reality
                            return {
                                ...apiItem,
                                location: opt.location,
                                characterId: opt.characterId
                            };
                        }
                    }
                    return apiItem;
                });

                setProfile(data);
                // Default to first character only on initial load
                if (!silent) {
                    setSelectedCharId(data.characters[0].characterId);
                }
            }
        } catch (e) {
            console.error("Failed to load profile:", e);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load
        loadProfile();

        // 1. Auto-polling every 30 seconds
        const intervalId = setInterval(() => {
            loadProfile(true);
        }, 30000);

        // 2. Focus-based refresh (like DIM)
        const onFocus = () => loadProfile(true);
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadProfile(true);
            }
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [loadProfile]);

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
                if (item.isEquipped) {
                    showToast("Item is already equipped", "info");
                    return;
                }

                // Optimistic UI for equipping
                const previousProfile = profile ? structuredClone(profile) : null;
                setProfile(prev => {
                    if (!prev) return prev;
                    const newItems = prev.items.map(i => {
                        // Unequip current item in that bucket for that character
                        if (i.characterId === item.characterId && i.bucketHash === targetBucket && i.isEquipped) {
                            return { ...i, isEquipped: false };
                        }
                        // Equip the target item
                        if (i.itemInstanceId === item.itemInstanceId) {
                            return { ...i, isEquipped: true };
                        }
                        return i;
                    });
                    return { ...prev, items: newItems };
                });

                showToast(`Equipping ${item.name}...`, "info");
                const res = await equipItemAction({
                    itemId: item.itemInstanceId!,
                    characterId: item.characterId!,
                });

                if (res.success) {
                    showToast(`${item.name} equipped successfully!`, "success");
                    loadProfile(true); // Sync silently
                } else {
                    showToast("Failed to equip item", "error");
                    if (previousProfile) setProfile(previousProfile); // Revert
                }
            } else {
                showToast("Item does not fit in this slot.", "error");
            }
            return;
        }

        // --- Transfer Logic ---
        let destinationId = "";
        let isVaultDestination = false;

        if (targetType === "vault") {
            isVaultDestination = true;
        } else if (targetType === "character") {
            destinationId = over.data.current?.characterId || selectedCharId || (over.id as string);
        } else {
            return; // Dropped on something else
        }

        // Skip if dropping on same location
        if (isVaultDestination && item.location === "vault") return;
        if (!isVaultDestination && item.location === "character" && item.characterId === destinationId) return;

        // Block transferring equipped items (DIM handles this via de-equip first, we just block for safety)
        if (item.isEquipped) {
            showToast(`Cannot transfer equipped item. Unequip ${item.name} first.`, "error");
            return;
        }

        // Optimistic UI Update
        const previousProfile = profile ? structuredClone(profile) : null;
        setProfile(prev => {
            if (!prev) return prev;
            const newItems = prev.items.map(i => {
                const isMatch = i.itemInstanceId
                    ? i.itemInstanceId === item.itemInstanceId
                    : i.itemHash === item.itemHash; // Fallback for non-instanced items

                if (isMatch) {
                    const localKey = i.itemInstanceId || i.itemHash.toString();
                    optimisticTransfers.current.set(localKey, {
                        location: isVaultDestination ? "vault" : "character",
                        characterId: isVaultDestination ? undefined : destinationId,
                        timestamp: Date.now()
                    });

                    return {
                        ...i,
                        location: (isVaultDestination ? "vault" : "character") as "vault" | "character",
                        characterId: isVaultDestination ? undefined : destinationId
                    };
                }
                return i;
            });
            return { ...prev, items: newItems };
        });

        try {
            let result;
            if (isVaultDestination) {
                // Char -> Vault
                result = await transferItemAction({
                    itemReferenceHash: item.itemHash,
                    itemId: item.itemInstanceId || "0",
                    stackSize: item.quantity || 1,
                    transferToVault: true,
                    characterId: item.characterId!,
                });
            } else if (item.location === "vault") {
                // Vault -> Char
                result = await transferItemAction({
                    itemReferenceHash: item.itemHash,
                    itemId: item.itemInstanceId || "0",
                    stackSize: item.quantity || 1,
                    transferToVault: false,
                    characterId: destinationId,
                });
            } else {
                // Char A -> Char B
                result = await crossCharacterTransferAction({
                    itemReferenceHash: item.itemHash,
                    itemId: item.itemInstanceId || "0",
                    stackSize: item.quantity || 1,
                    sourceCharacterId: item.characterId!,
                    destinationCharacterId: destinationId,
                });
            }

            if (!result.success) {
                throw new Error(result.error);
            } else {
                showToast(`Transferred ${item.name} successfully!`, "success");
                lastTransferTime.current = Date.now(); // Start 8s cooldown
            }
        } catch (e) {
            const err = e as Error;
            console.error("Transfer failed, reverting optimistic UI:", err);
            showToast(`Transfer failed. ${err.message ? `Reason: ${err.message}` : ""}`, "error");

            // If the transfer failed, Bungie's true state is out of sync with our UI.
            // Erase the cooldown and force an immediate reality-check from the API to fix phantom items.
            lastTransferTime.current = 0;
            loadProfile(true);

            // Revert optimistic override if transfer completely failed
            const localKey = item.itemInstanceId || item.itemHash.toString();
            optimisticTransfers.current.delete(localKey);

            if (previousProfile) {
                setProfile(previousProfile);
            }
        }
    };

    // 🏗️ Organize Data: Group items by Character & Bucket
    const organizedData = useMemo(() => {
        if (!profile) return null;

        const charItems: Record<string, Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>> = {};

        // Initialize structure for each character
        profile.characters.forEach(c => {
            charItems[c.characterId] = {};
            BUCKET_ORDER.forEach(b => {
                charItems[c.characterId][b] = { inventory: [] };
            });
        });

        profile.items.forEach(item => {
            // Filter by search
            if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return;

            // Character Items
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

        // Sort inventory items by power desc
        Object.values(charItems).forEach((buckets) => {
            Object.values(buckets).forEach((slot) => {
                slot.inventory.sort((a, b) => (b.primaryStat || 0) - (a.primaryStat || 0));
            });
        });

        return charItems;
    }, [profile, search]);

    if (loading) return <div className="p-12 text-center text-white">Loading Guardian Data...</div>;
    if (!profile) return <div className="p-12 text-center text-red-500">Failed to load profile.</div>;

    const currentCharData = organizedData?.[selectedCharId];
    const selectedCharacter = profile.characters.find(c => c.characterId === selectedCharId);

    // Vault Filtering Logic
    const vaultItems = profile.items.filter(i => {
        if (i.location !== "vault") return false;

        // Search Filter
        if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;

        // Type Filter (Weapons & Armor only as per request)
        // itemType: 2 = Armor, 3 = Weapon
        if (i.itemType !== 2 && i.itemType !== 3) return false;

        // Class Filter (For Armor)
        // If Armor (2), must match Character Class OR be Generic (3)
        if (i.itemType === 2 && selectedCharacter) {
            // classType: 0=Titan, 1=Hunter, 2=Warlock, 3=Unknown/Any
            if (i.classType !== 3 && i.classType !== selectedCharacter.classType) return false;
        }

        return true;
    }).sort((a, b) => {
        // Sort by Type then Power
        if (a.itemType !== b.itemType) return b.itemType - a.itemType; // Weapons (3) first? No, 3 > 2. So Weapons on top.
        return (b.primaryStat || 0) - (a.primaryStat || 0);
    });



    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <ItemConstantsProvider value={profile.itemConstants}>
                <div className="flex flex-col h-full bg-bg-primary animate-fade-in min-h-screen pb-20">
                    <Header
                        title="Loadout Manager"
                        subtitle="Professional Inventory Management"
                    />

                    {/* 1. Character Selector Bar */}
                    <div className="sticky top-0 z-30 bg-[#030712]/95 backdrop-blur-xl border-b border-white/10 px-6 py-3">
                        <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <CharacterSelector
                                    characters={profile.characters}
                                    selectedId={selectedCharId}
                                    onSelect={setSelectedCharId}
                                />

                                {/* Search & Refresh */}
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-gold-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-10 w-48 bg-white/5 border border-white/10 rounded-lg pl-9 text-sm text-white focus:border-gold-primary/50 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Content Area - Split View */}
                    <main className="flex-1 px-4 py-4 max-w-[1920px] mx-auto w-full flex gap-4 overflow-hidden h-[calc(100vh-140px)]">

                        {/* LEFT: Character Panel */}
                        <DroppableZone
                            id={`char-panel-${selectedCharId}`}
                            data={{ type: "character", characterId: selectedCharId }}
                            className="w-[420px] shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-20 relative rounded-xl transition-colors"
                            activeClassName="bg-white/5 ring-1 ring-gold-primary/50"
                        >
                            {/* Weapons */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1 mb-2">Weapons</h3>
                                <div className="space-y-2">
                                    <BucketSection label="Kinetic" bucket={BUCKETS.KINETIC} data={currentCharData?.[BUCKETS.KINETIC]} onItemClick={setInspectItem} />
                                    <BucketSection label="Energy" bucket={BUCKETS.ENERGY} data={currentCharData?.[BUCKETS.ENERGY]} onItemClick={setInspectItem} />
                                    <BucketSection label="Power" bucket={BUCKETS.POWER} data={currentCharData?.[BUCKETS.POWER]} onItemClick={setInspectItem} />
                                </div>
                            </div>

                            {/* Armor */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1 mb-2">Armor</h3>
                                <div className="space-y-2">
                                    <BucketSection label="Helmet" bucket={BUCKETS.HELMET} data={currentCharData?.[BUCKETS.HELMET]} onItemClick={setInspectItem} />
                                    <BucketSection label="Gauntlets" bucket={BUCKETS.GAUNTLETS} data={currentCharData?.[BUCKETS.GAUNTLETS]} onItemClick={setInspectItem} />
                                    <BucketSection label="Chest" bucket={BUCKETS.CHEST} data={currentCharData?.[BUCKETS.CHEST]} onItemClick={setInspectItem} />
                                    <BucketSection label="Legs" bucket={BUCKETS.LEG} data={currentCharData?.[BUCKETS.LEG]} onItemClick={setInspectItem} />
                                    <BucketSection label="Class Item" bucket={BUCKETS.CLASS_ITEM} data={currentCharData?.[BUCKETS.CLASS_ITEM]} onItemClick={setInspectItem} />
                                </div>
                            </div>

                            {/* Subclass & Other */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1 mb-2">Equipment</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <BucketSection label="Subclass" bucket={BUCKETS.SUBCLASS} data={currentCharData?.[BUCKETS.SUBCLASS]} simple compact onItemClick={setInspectItem} />
                                    <BucketSection label="Ghost" bucket={BUCKETS.GHOST} data={currentCharData?.[BUCKETS.GHOST]} simple compact onItemClick={setInspectItem} />
                                    <BucketSection label="Artifact" bucket={BUCKETS.ARTIFACT} data={currentCharData?.[BUCKETS.ARTIFACT]} simple compact onItemClick={setInspectItem} />
                                </div>
                            </div>
                        </DroppableZone>

                        {/* RIGHT: Vault Panel */}
                        <div className="flex-1 flex flex-col border border-white/10 rounded-lg bg-[#050914]/50 overflow-hidden relative">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent opacity-20" />

                            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <span>Vault</span>
                                    <span className="text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        {vaultItems.length} Items (Filtered)
                                    </span>
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <VaultGrid
                                    items={vaultItems}
                                    onItemClick={setInspectItem} // Updated to Inspect instead of Scroll
                                />
                            </div>
                        </div>

                    </main>

                    {/* 🔍 Inspector Modal */}
                    <ItemInspector item={inspectItem} onClose={() => setInspectItem(null)} />

                    <DragOverlay>
                        {activeDragItem ? (
                            <div className="w-12 h-12 rounded-sm bg-[#1e293b] border border-gold-primary overflow-hidden shadow-2xl relative z-[100]">
                                <Image
                                    src={`https://www.bungie.net${activeDragItem.icon}`}
                                    alt="Dragging"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </ItemConstantsProvider>
        </DndContext>
    );
}

// 📦 Inner Component for a Bucket Slot
// Updated to Uniform Sizes + Horizontal Layout (Row: Equipped | Inv | Inv | Inv ...)
function BucketSection({ label, bucket, data, simple = false, onItemClick }: { label: string, bucket: number, data?: { equipped?: InventoryItem, inventory: InventoryItem[] }, simple?: boolean, compact?: boolean, onItemClick?: (item: InventoryItem) => void }) {
    if (!data) return null;

    // We force compact=true logic visual wise to ensure uniform size, but we might pass it explicitly
    // "Bucket Section" structure:
    // [Label -----------------]
    // [ [Equipped] | [Inv1] [Inv2] [Inv3] ... ]

    return (
        <div id={`bucket-${bucket}`} className={cn("rounded group/bucket", simple ? "" : "mb-1")}>
            {/* Header */}
            {!simple && (
                <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider group-hover/bucket:text-text-secondary transition-colors">{label}</span>
                    {/* <span className="text-[9px] text-text-tertiary">{data.inventory.length}/9</span> */}
                </div>
            )}

            <div className={cn("flex items-start flex-wrap", simple ? "flex-col items-center gap-1" : "flex-row")} style={{ gap: simple ? undefined : "5px" }}>
                {/* 🟢 Equipped Item */}
                <div className="shrink-0 relative">
                    {!simple && <div className="absolute -left-1.5 inset-y-2 w-0.5 bg-gold-primary/50 rounded-full opacity-60" />}
                    <ItemCard
                        item={data.equipped}
                        category={label}
                        bucketHash={bucket}
                        compact={false}
                        isEquipped={true}
                        onClick={() => data.equipped && onItemClick?.(data.equipped)}
                    />
                </div>

                {/* 🔳 Inventory Grid (Larger Items - 4 cols) */}
                {!simple && (
                    <div className="flex flex-wrap" style={{ gap: "5px" }}>
                        {data.inventory.slice(0, 9).map((item) => (
                            <ItemCard
                                key={item.itemInstanceId || item.itemHash}
                                item={item}
                                compact={false}
                                onClick={() => onItemClick?.(item)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
