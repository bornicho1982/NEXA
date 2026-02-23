import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProfileData, InventoryItem } from '@/lib/inventory/service';
import { transferItemAction, crossCharacterTransferAction, equipItemAction, pullFromPostmasterAction, setItemLockStateAction, updateItemAnnotationAction } from '@/lib/inventory/actions';
import { toast } from 'sonner';

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
    loadProfile: (silent?: boolean) => Promise<void>;

    // Queue Actions
    addToQueue: (op: QueueOperation) => void;
    processQueue: () => Promise<void>;

    // High Level Actions
    moveItem: (item: InventoryItem, targetLocation: "character" | "vault", targetCharacterId?: string) => Promise<void>;
    equipItem: (item: InventoryItem) => Promise<void>;
    pullFromPostmaster: (item: InventoryItem) => Promise<void>;
    setLockState: (item: InventoryItem, state: boolean) => Promise<void>;
    setAnnotation: (item: InventoryItem, tag: string | null, notes: string | null) => Promise<void>;
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

            setProfile: (profile) => set({ profile }),
            setLoading: (isLoading) => set({ isLoading }),
            setSelectedCharId: (selectedCharId) => set({ selectedCharId }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            loadProfile: async (silent = false) => {
                if (!silent) set({ isLoading: true });
                try {
                    const res = await fetch(`/api/inventory?t=${Date.now()}`, {
                        cache: "no-store",
                        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
                    });
                    const data = await res.json();
                    set({ profile: data, isLoading: false, error: null });

                    // Set default char if not set
                    if (!get().selectedCharId && data.characters?.length > 0) {
                        set({ selectedCharId: data.characters[0].characterId });
                    }
                } catch (e) {
                    console.error("Failed to load profile:", e);
                    set({ error: "Failed to load profile", isLoading: false });
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

                    // Throttle 500ms
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Remove processed item
                    set((state) => ({ transferQueue: state.transferQueue.slice(1) }));
                }

                set({ isProcessingQueue: false });
            },

            moveItem: async (item, targetLocation, targetCharacterId) => {
                const profile = get().profile;
                if (!profile) return;

                if (item.location === "postmaster") {
                    get().pullFromPostmaster(item);
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
                         const targetBucket = item.bucketHash;
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
                                                return { ...i, location: "vault", characterId: undefined };
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
                                 location: targetLocation,
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
                if (!item.characterId || !item.itemInstanceId) return;
                const profile = get().profile;
                if (!profile) return;

                // Space Check
                const targetBucket = item.bucketHash;
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
                                        return { ...i, location: "vault", characterId: undefined };
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
                        itemId: item.itemInstanceId,
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
                             return { ...i, location: "character" };
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

            setAnnotation: async (item, tag, notes) => {
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
            }

        })
    )
);
