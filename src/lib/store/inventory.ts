import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProfileData, InventoryItem } from '@/lib/inventory/service';
import { transferItemAction, crossCharacterTransferAction, equipItemAction, pullFromPostmasterAction, setItemLockStateAction, updateItemAnnotationAction } from '@/lib/inventory/actions';
import { toast } from 'sonner';
import { BUCKETS } from '@/lib/destiny/buckets';

export type QueueOperationType = "TRANSFER" | "EQUIP" | "PULL_FROM_POSTMASTER" | "LOCK" | "TAG";

export interface QueueOperation {
    id: string;
    type: QueueOperationType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any;
    description: string;
}

interface InventoryState {
    profile: ProfileData | null;
    isLoading: boolean;
    error: string | null;
    selectedCharId: string;
    searchQuery: string;

    // Transfer Queue
    transferQueue: QueueOperation[];
    isProcessingQueue: boolean;

    // Actions
    setProfile: (profile: ProfileData | null) => void;
    setLoading: (loading: boolean) => void;
    setSelectedCharId: (id: string) => void;
    setSearchQuery: (query: string) => void;
    loadProfile: (silent?: boolean, force?: boolean) => Promise<void>;

    // Queue Actions
    addToQueue: (op: QueueOperation) => void;
    processQueue: () => Promise<void>;

    // High Level Actions
    moveItem: (item: InventoryItem, targetLocation: "character" | "vault", targetCharacterId?: string) => Promise<void>;
    equipItem: (item: InventoryItem) => Promise<void>;
    pullFromPostmaster: (item: InventoryItem) => Promise<void>;
    setLockState: (item: InventoryItem, state: boolean) => Promise<void>;
    setAnnotation: (item: InventoryItem, tag: string | null, notes: string | null) => Promise<void>;
    bulkSetAnnotation: (items: InventoryItem[], tag: string | null) => Promise<void>;

    // Compare State
    isComparing: boolean;
    compareBaseItem: InventoryItem | null;
    compareTargetItems: InventoryItem[];

    // Compare Actions
    startCompare: (item: InventoryItem) => void;
    addToCompare: (item: InventoryItem) => void;
    removeFromCompare: (item: InventoryItem) => void;
    closeCompare: () => void;

    // Mass Actions
    stripArmor: (characterId: string) => void;
    stripWeapons: (characterId: string) => void;
    collectPostmaster: (characterId: string) => void;
}

// Helper to find victim
const findVictim = (items: InventoryItem[], bucketHash: number, characterId: string): InventoryItem | null => {
    const candidates = items.filter(i =>
        i.location === "character" &&
        i.characterId === characterId &&
        i.bucketHash === bucketHash &&
        !i.isEquipped &&
        !i.isLocked
    );

    // Sort by power (primaryStat) ascending -> lowest power first
    return candidates.sort((a, b) => (a.primaryStat || 0) - (b.primaryStat || 0))[0] || null;
};

export const useInventoryStore = create<InventoryState>()(
    devtools(
        (set, get) => ({
            profile: null,
            isLoading: true,
            error: null,
            selectedCharId: "",
            searchQuery: "",

            transferQueue: [],
            isProcessingQueue: false,

            // Compare State
            isComparing: false,
            compareBaseItem: null,
            compareTargetItems: [],

            setProfile: (profile) => set({ profile }),
            setLoading: (isLoading) => set({ isLoading }),
            setSelectedCharId: (selectedCharId) => set({ selectedCharId }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            // Compare Actions
            startCompare: (item) => set({
                isComparing: true,
                compareBaseItem: item,
                compareTargetItems: []
            }),
            addToCompare: (item) => set((state) => {
                // Prevent duplicates and max 3 targets (4 total columns)
                if (state.compareTargetItems.length >= 3) return state;
                if (state.compareTargetItems.some(i => i.itemInstanceId === item.itemInstanceId)) return state;
                if (state.compareBaseItem?.itemInstanceId === item.itemInstanceId) return state;
                return { compareTargetItems: [...state.compareTargetItems, item] };
            }),
            removeFromCompare: (item) => set((state) => ({
                compareTargetItems: state.compareTargetItems.filter(i => i.itemInstanceId !== item.itemInstanceId)
            })),
            closeCompare: () => set({
                isComparing: false,
                compareBaseItem: null,
                compareTargetItems: []
            }),

            loadProfile: async (silent = false, force = false) => {
                const state = get();
                // Prevent optimistic UI rebound by skipping background fetches while transferring
                if (!force && (state.transferQueue.length > 0 || state.isProcessingQueue)) {
                    console.log("[InventoryStore] Skipping profile refresh to prevent UI rebound during transfers.");
                    return;
                }

                if (!silent) set({ isLoading: true });
                try {
                    const res = await fetch(`/api/inventory?t=${Date.now()}`, {
                        cache: "no-store",
                        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.error || "Failed to load profile from bungie");
                    }
                    set({ profile: data, isLoading: false, error: null });

                    // Set default char if not set
                    if (!get().selectedCharId && data.characters?.length > 0) {
                        set({ selectedCharId: data.characters[0].characterId });
                    }
                } catch (e) {
                    console.error("Failed to load profile:", e);
                    set({ error: e instanceof Error ? e.message : "Failed to load profile", isLoading: false });
                }
            },

            addToQueue: (op) => {
                set((state) => ({ transferQueue: [...state.transferQueue, op] }));
                get().processQueue();
            },

            processQueue: async () => {
                if (get().isProcessingQueue) return;

                set({ isProcessingQueue: true });

                while (get().transferQueue.length > 0) {
                    const op = get().transferQueue[0];

                    try {
                        console.log(`Processing: ${op.description}`);
                        let result;

                        switch (op.type) {
                            case "TRANSFER":
                                if (op.params.crossCharacter) {
                                    result = await crossCharacterTransferAction(op.params);
                                } else {
                                    result = await transferItemAction(op.params);
                                }
                                break;
                            case "EQUIP":
                                result = await equipItemAction(op.params);
                                break;
                            case "PULL_FROM_POSTMASTER":
                                result = await pullFromPostmasterAction(op.params);
                                break;
                            case "LOCK":
                                result = await setItemLockStateAction(op.params);
                                break;
                            case "TAG":
                                result = await updateItemAnnotationAction(op.params);
                                break;
                        }

                        if (result?.success) {
                            toast.success(op.description);
                        } else {
                            toast.error(`Failed: ${op.description}`, { description: result?.error });
                        }

                    } catch (e) {
                        console.error("Queue Error", e);
                        toast.error(`Error processing ${op.description}`);
                    }

                    // Throttle 150ms
                    await new Promise(resolve => setTimeout(resolve, 150));

                    // Remove processed item
                    set((state) => ({ transferQueue: state.transferQueue.slice(1) }));
                }

                set({ isProcessingQueue: false });

                // Wait for Bungie's API cache to catch up, then force a silent reload
                setTimeout(() => {
                    // Only refresh if another transfer hasn't started in the meantime
                    if (get().transferQueue.length === 0) {
                        get().loadProfile(true, true);
                    }
                }, 2000);
            },

            moveItem: async (item, targetLocation, targetCharacterId) => {
                const profile = get().profile;
                if (!profile) return;

                if (item.location === "postmaster") {
                    get().pullFromPostmaster(item);

                    if (targetLocation === "vault") {
                        const op: QueueOperation = {
                            id: crypto.randomUUID(),
                            type: "TRANSFER",
                            params: {
                                itemReferenceHash: item.itemHash,
                                itemId: item.itemInstanceId || "0",
                                stackSize: item.quantity,
                                transferToVault: true,
                                characterId: item.characterId!,
                                sourceCharacterId: item.characterId,
                                destinationCharacterId: undefined,
                                crossCharacter: false
                            },
                            description: `Sending ${item.name} to Vault`
                        };
                        get().addToQueue(op);
                    }
                    return;
                }

                let crossCharacter = false;
                let transferToVault = false;
                let characterId = item.characterId || targetCharacterId || "";

                if (targetLocation === "vault") {
                    transferToVault = true;
                    characterId = item.characterId!; // Source char
                } else {
                    // Target is character
                    if (item.location === "vault") {
                        // Vault -> Char
                        transferToVault = false;
                        characterId = targetCharacterId!;
                    } else if (item.characterId !== targetCharacterId) {
                        // Char A -> Char B
                        crossCharacter = true;
                    } else {
                        // Same char, maybe bucket move? (Not supported by API usually unless equipping)
                        return;
                    }

                    // --- Space Management ---
                    if (targetLocation === "character" && characterId) {
                        const targetBucket = item.intrinsicBucketHash || item.bucketHash;
                        const charItems = profile.items.filter(i =>
                            i.location === "character" &&
                            i.characterId === characterId &&
                            i.bucketHash === targetBucket &&
                            !i.isEquipped
                        );

                        if (charItems.length >= 9) {
                            const victim = findVictim(profile.items, targetBucket, characterId);
                            if (victim) {
                                const victimOp: QueueOperation = {
                                    id: crypto.randomUUID(),
                                    type: "TRANSFER",
                                    params: {
                                        itemReferenceHash: victim.itemHash,
                                        itemId: victim.itemInstanceId || "0",
                                        stackSize: victim.quantity,
                                        transferToVault: true,
                                        characterId: victim.characterId!,
                                        sourceCharacterId: victim.characterId,
                                        destinationCharacterId: undefined,
                                        crossCharacter: false
                                    },
                                    description: `Moving ${victim.name} to Vault to make space`
                                };
                                get().addToQueue(victimOp);

                                // Optimistic Update for victim
                                set((state) => {
                                    if (!state.profile) return state;
                                    const newItems = state.profile.items.map(i => {
                                        if (i.itemInstanceId === victim.itemInstanceId) {
                                            return { ...i, location: "vault" as const, characterId: undefined };
                                        }
                                        return i;
                                    });
                                    return { ...state, profile: { ...state.profile, items: newItems } };
                                });
                            } else {
                                toast.error("Destination bucket is full and no items can be moved.");
                                return;
                            }
                        }
                    }
                }

                const op: QueueOperation = {
                    id: crypto.randomUUID(),
                    type: "TRANSFER",
                    params: {
                        itemReferenceHash: item.itemHash,
                        itemId: item.itemInstanceId || "0",
                        stackSize: item.quantity,
                        transferToVault,
                        characterId: crossCharacter ? undefined : characterId,
                        sourceCharacterId: item.characterId,
                        destinationCharacterId: targetCharacterId,
                        crossCharacter
                    },
                    description: `Transferring ${item.name}`
                };

                get().addToQueue(op);

                // Optimistic Update
                set((state) => {
                    if (!state.profile) return state;
                    const newItems = state.profile.items.map(i => {
                        if (i.itemInstanceId === item.itemInstanceId) {
                            return {
                                ...i,
                                location: targetLocation as "character" | "vault" | "postmaster",
                                characterId: targetLocation === "vault" ? undefined : targetCharacterId
                            };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });
            },

            equipItem: async (item) => {
                if (!item.characterId || !item.itemInstanceId) return;
                const op: QueueOperation = {
                    id: crypto.randomUUID(),
                    type: "EQUIP",
                    params: {
                        itemId: item.itemInstanceId,
                        characterId: item.characterId
                    },
                    description: `Equipping ${item.name}`
                };
                get().addToQueue(op);

                // Optimistic
                set((state) => {
                    if (!state.profile) return state;
                    const newItems = state.profile.items.map(i => {
                        if (i.characterId === item.characterId && i.bucketHash === item.bucketHash) {
                            return { ...i, isEquipped: i.itemInstanceId === item.itemInstanceId };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });
            },

            pullFromPostmaster: async (item) => {
                if (!item.characterId) return;
                const profile = get().profile;
                if (!profile) return;

                // Space Check
                const targetBucket = item.intrinsicBucketHash || item.bucketHash;
                const characterId = item.characterId;
                const charItems = profile.items.filter(i =>
                    i.location === "character" &&
                    i.characterId === characterId &&
                    i.bucketHash === targetBucket &&
                    !i.isEquipped
                );

                if (charItems.length >= 9) {
                    const victim = findVictim(profile.items, targetBucket, characterId);
                    if (victim) {
                        const victimOp: QueueOperation = {
                            id: crypto.randomUUID(),
                            type: "TRANSFER",
                            params: {
                                itemReferenceHash: victim.itemHash,
                                itemId: victim.itemInstanceId || "0",
                                stackSize: victim.quantity,
                                transferToVault: true,
                                characterId: victim.characterId!,
                            },
                            description: `Moving ${victim.name} to Vault to make space`
                        };
                        get().addToQueue(victimOp);

                        // Optimistic Update for victim
                        set((state) => {
                            if (!state.profile) return state;
                            const newItems = state.profile.items.map(i => {
                                if (i.itemInstanceId === victim.itemInstanceId) {
                                    return { ...i, location: "vault" as const, characterId: undefined };
                                }
                                return i;
                            });
                            return { ...state, profile: { ...state.profile, items: newItems } };
                        });
                    } else {
                        toast.error("Inventory full and no items can be moved.");
                        return;
                    }
                }

                const op: QueueOperation = {
                    id: crypto.randomUUID(),
                    type: "PULL_FROM_POSTMASTER",
                    params: {
                        itemReferenceHash: item.itemHash,
                        itemId: item.itemInstanceId || "0",
                        stackSize: item.quantity,
                        characterId: item.characterId
                    },
                    description: `Pulling ${item.name} from Postmaster`
                };
                get().addToQueue(op);

                // Optimistic
                set((state) => {
                    if (!state.profile) return state;
                    const newItems = state.profile.items.map(i => {
                        if (i.itemInstanceId === item.itemInstanceId) {
                            return { ...i, location: "character" as const };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });
            },

            setLockState: async (item, locked) => {
                if (!item.characterId || !item.itemInstanceId) return;

                const op: QueueOperation = {
                    id: crypto.randomUUID(),
                    type: "LOCK",
                    params: {
                        itemId: item.itemInstanceId,
                        characterId: item.characterId,
                        state: locked
                    },
                    description: `${locked ? "Locking" : "Unlocking"} ${item.name}`
                };
                get().addToQueue(op);

                // Optimistic
                set((state) => {
                    if (!state.profile) return state;
                    const newItems = state.profile.items.map(i => {
                        if (i.itemInstanceId === item.itemInstanceId) {
                            return { ...i, isLocked: locked };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });
            },

            stripArmor: (characterId) => {
                const state = get();
                if (!state.profile) return;

                const armorBuckets: number[] = [BUCKETS.HELMET, BUCKETS.GAUNTLETS, BUCKETS.CHEST, BUCKETS.LEG, BUCKETS.CLASS_ITEM];

                const targets = state.profile.items.filter(i =>
                    i.characterId === characterId &&
                    i.location === "character" &&
                    armorBuckets.includes(i.bucketHash) &&
                    !i.isEquipped
                );

                if (targets.length === 0) {
                    toast.info("Nada que mover", { description: "No hay armaduras sueltas o desbloqueadas." });
                    return;
                }

                toast.success(`Guardando Armaduras`, { description: `Moviendo ${targets.length} piezas al depósito.` });
                targets.forEach(item => state.moveItem(item, "vault", characterId));
            },

            stripWeapons: (characterId) => {
                const state = get();
                if (!state.profile) return;

                const weaponBuckets: number[] = [BUCKETS.KINETIC, BUCKETS.ENERGY, BUCKETS.POWER];

                const targets = state.profile.items.filter(i =>
                    i.characterId === characterId &&
                    i.location === "character" &&
                    weaponBuckets.includes(i.bucketHash) &&
                    !i.isEquipped
                );

                if (targets.length === 0) {
                    toast.info("Nada que mover", { description: "No hay armas sueltas o desbloqueadas." });
                    return;
                }

                toast.success(`Guardando Armas`, { description: `Moviendo ${targets.length} armas al depósito.` });
                targets.forEach(item => state.moveItem(item, "vault", characterId));
            },

            collectPostmaster: (characterId) => {
                const state = get();
                if (!state.profile) return;

                const postmasterItems = state.profile.items.filter(i =>
                    i.characterId === characterId &&
                    i.location === "postmaster" &&
                    i.bucketHash === 215593132 &&
                    !(i.transferStatus & 2)
                );

                if (postmasterItems.length === 0) {
                    toast.info("Administración vacía", { description: "La Administración de este personaje no tiene objetos válidos." });
                    return;
                }

                toast.success(`Recogiendo Administración`, { description: `Enviando ${postmasterItems.length} objetos al Depósito.` });
                postmasterItems.forEach(item => {
                    state.moveItem(item, "vault", characterId);
                });
            },

            setAnnotation: async (item, tag, notes) => {
                const state = get();
                set((state) => {
                    if (!state.profile) return state;
                    const newItems = state.profile.items.map(i => {
                        if (i.itemInstanceId === item.itemInstanceId) {
                            return { ...i, tag, notes };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });

                // --- Tag Auto-Sync (Bungie API Lock) ---
                if (tag === "favorite" || tag === "keep") {
                    if (!item.isLocked) state.setLockState(item, true);
                } else if (tag === "junk" || tag === "archive") {
                    if (item.isLocked) state.setLockState(item, false);
                }

                try {
                    await updateItemAnnotationAction({
                        itemHash: item.itemHash,
                        instanceId: item.itemInstanceId,
                        tag,
                        notes
                    });
                    toast.success("Updated notes/tags");
                } catch (e) {
                    console.error("Failed to update notes/tags", e);
                    toast.error("Failed to update notes/tags");
                }
            },

            bulkSetAnnotation: async (items, tag) => {
                const state = get();

                // Optimistic UI update for all items immediately
                set((state) => {
                    if (!state.profile) return state;
                    const targetIds = new Set(items.map(i => i.itemInstanceId));
                    const newItems = state.profile.items.map(i => {
                        if (i.itemInstanceId && targetIds.has(i.itemInstanceId)) {
                            return { ...i, tag };
                        }
                        return i;
                    });
                    return { ...state, profile: { ...state.profile, items: newItems } };
                });

                toast.info(`Processing ${items.length} tags...`);

                // Queue up the auto-sync lock states if applicable
                const shouldLock = tag === "favorite" || tag === "keep";
                const shouldUnlock = tag === "junk" || tag === "archive";

                if (shouldLock || shouldUnlock) {
                    items.forEach(item => {
                        if (shouldLock && !item.isLocked) {
                            state.setLockState(item, true);
                        } else if (shouldUnlock && item.isLocked) {
                            state.setLockState(item, false);
                        }
                    });
                }

                // Process database updates one by one (this could be optimized with a bulk mutation later,
                // but doing it synchronously keeps it reliable for now).
                let successCount = 0;
                for (const item of items) {
                    try {
                        await updateItemAnnotationAction({
                            itemHash: item.itemHash,
                            instanceId: item.itemInstanceId,
                            tag,
                            notes: item.notes
                        });
                        successCount++;
                    } catch (e) {
                        console.error(`Failed to tag ${item.name}`, e);
                    }
                }

                if (successCount === items.length) {
                    toast.success(`Successfully tagged ${items.length} items`);
                } else {
                    toast.warning(`Tagged ${successCount}/${items.length} items`);
                }
            }

        })
    )
);
