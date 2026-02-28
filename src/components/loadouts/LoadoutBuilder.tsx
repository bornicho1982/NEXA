"use client";

import { useState } from "react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, Share2, Save, Shield, Sword } from "lucide-react";

// Types (simplified for now)
interface LoadoutItem {
    id: string; // instanceId
    hash: number;
    name: string;
    icon: string;
    type: string; // "Helmet", "Gauntlets", etc.
    bucketHash: number;
}

interface LoadoutBuilderProps {
    inventory: LoadoutItem[];
}

// BUNGIE CONSTANTS
const BUCKETS = {
    KINETIC: 1498876634,
    ENERGY: 2465295065,
    POWER: 953998645,
    HELMET: 3448274439,
    GAUNTLETS: 3551918588,
    CHEST: 14239492,
    LEGS: 20886954,
    CLASS: 1585787867,
};

const BUNGIE_ROOT = "https://www.bungie.net";

export function LoadoutBuilder({ inventory }: LoadoutBuilderProps) {
    const [loadout, setLoadout] = useState<Record<number, LoadoutItem | null>>({
        [BUCKETS.KINETIC]: null,
        [BUCKETS.ENERGY]: null,
        [BUCKETS.POWER]: null,
        [BUCKETS.HELMET]: null,
        [BUCKETS.GAUNTLETS]: null,
        [BUCKETS.CHEST]: null,
        [BUCKETS.LEGS]: null,
        [BUCKETS.CLASS]: null,
    });
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active) {
            const item = inventory.find(i => i.id === active.id);
            const bucketHash = Number(over.id);

            if (item && item.bucketHash === bucketHash) {
                setLoadout(prev => ({ ...prev, [bucketHash]: item }));
            }
        }
    };

    const activeItem = activeId ? inventory.find(i => i.id === activeId) : null;

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
                {/* Left: Inventory Source */}
                <div className="lg:col-span-1 wd-card flex flex-col h-full overflow-hidden">
                    <div className="wd-card-header">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <BackpackIcon className="text-wd-primary-400" /> Arsenal
                        </h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2 overflow-y-auto p-4 pb-20 custom-scrollbar">
                        {inventory.map(item => (
                            <DraggableItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                {/* Right: Loadout Drop Zones */}
                <div className="lg:col-span-2 wd-card flex flex-col h-full overflow-hidden">
                    <div className="wd-card-header">
                        <div>
                            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">New Loadout</h2>
                            <p className="text-xs text-text-tertiary mt-0.5">Drag items to equip them.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-wd-primary-600 text-white font-bold text-sm rounded-xl hover:bg-wd-primary-700 transition-colors shadow-lg shadow-wd-primary-600/25">
                                <Save size={14} /> Save
                            </button>
                            <button className="p-2.5 bg-bg-tertiary text-text-secondary rounded-xl hover:bg-white/5 hover:text-text-primary transition-colors border border-border-subtle">
                                <Share2 size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">

                        <div className="flex flex-col md:flex-row gap-8 items-start justify-center flex-1">
                            {/* Armor Left */}
                            <div className="flex flex-col gap-4">
                                <DroppableSlot bucket={BUCKETS.HELMET} label="Helmet" item={loadout[BUCKETS.HELMET]} />
                                <DroppableSlot bucket={BUCKETS.GAUNTLETS} label="Gauntlets" item={loadout[BUCKETS.GAUNTLETS]} />
                                <DroppableSlot bucket={BUCKETS.CHEST} label="Chest" item={loadout[BUCKETS.CHEST]} />
                                <DroppableSlot bucket={BUCKETS.LEGS} label="Legs" item={loadout[BUCKETS.LEGS]} />
                                <DroppableSlot bucket={BUCKETS.CLASS} label="Class Item" item={loadout[BUCKETS.CLASS]} />
                            </div>

                            {/* Guardian Visual Center */}
                            <div className="hidden md:flex items-center justify-center w-64 h-[500px] relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-wd-primary-600/5 via-transparent to-wd-lilac/5 rounded-2xl" />
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-bg-tertiary border border-border-subtle mx-auto mb-4 flex items-center justify-center">
                                        <Shield size={32} className="text-text-tertiary" />
                                    </div>
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Guardian</p>
                                </div>
                            </div>

                            {/* Weapons Right */}
                            <div className="flex flex-col gap-4">
                                <DroppableSlot bucket={BUCKETS.KINETIC} label="Kinetic" item={loadout[BUCKETS.KINETIC]} />
                                <DroppableSlot bucket={BUCKETS.ENERGY} label="Energy" item={loadout[BUCKETS.ENERGY]} />
                                <DroppableSlot bucket={BUCKETS.POWER} label="Power" item={loadout[BUCKETS.POWER]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeItem ? (
                    <div className="w-16 h-16 rounded border-2 border-wd-primary-600 overflow-hidden shadow-2xl relative z-50 pointer-events-none">
                        <Image
                            src={activeItem.icon.startsWith("http") ? activeItem.icon : `${BUNGIE_ROOT}${activeItem.icon}`}
                            alt={activeItem.name} fill className="object-cover" unoptimized
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}


function DraggableItem({ item }: { item: LoadoutItem }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: item,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "aspect-square bg-bg-tertiary rounded-sm border border-transparent cursor-grab active:cursor-grabbing relative group overflow-hidden shadow-sm transition-all",
                isDragging ? "opacity-30" : "hover:border-wd-primary-600 hover:shadow-wd-primary-600/20"
            )}
        >
            <Image
                src={item.icon.startsWith("http") ? item.icon : `${BUNGIE_ROOT}${item.icon}`}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
            />
            {/* Hover Name Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 pt-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-[10px] text-white font-bold truncate leading-none">{item.name}</p>
                <p className="text-[9px] text-text-tertiary truncate leading-none mt-0.5">{item.type}</p>
            </div>
        </div>
    );
}

function DroppableSlot({ bucket, label, item }: { bucket: number, label: string, item: LoadoutItem | null }) {
    const { setNodeRef, isOver } = useDroppable({
        id: bucket.toString(),
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center relative transition-all duration-300",
                // Empty State
                !item && "border border-border-medium bg-bg-tertiary/30 shadow-inner",
                // Hover State
                isOver && !item && "border-wd-primary-600/50 bg-wd-primary-600/5 shadow-[0_0_15px_rgba(245,207,71,0.1)] scale-105",
                // Filled State (border handled by inner item usually, but here we wrapper)
                item && "border-transparent bg-transparent"
            )}
        >
            {item ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group shadow-lg ring-1 ring-white/10 hover:ring-wd-primary-600/50 transition-all">
                    <Image
                        src={item.icon.startsWith("http") ? item.icon : `${BUNGIE_ROOT}${item.icon}`}
                        alt={item.name} fill className="object-cover" unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Remove Action */}
                    <button
                        onClick={() => {/* Remove logic would go here via prop callback */ }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-status-error/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-100"
                    >
                        <X size={12} />
                    </button>

                    <div className="absolute bottom-0 inset-x-0 bg-bg-primary/90 backdrop-blur-sm py-1 px-1.5 border-t border-white/5">
                        <p className="text-[10px] text-white font-bold truncate leading-none text-center">{item.name}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                    <div className="mb-1 p-2 rounded-full bg-white/5 border border-white/5">
                        {label === "Kinetic" || label === "Energy" || label === "Power"
                            ? <Sword size={18} className="text-text-secondary" />
                            : <Shield size={18} className="text-text-secondary" />
                        }
                    </div>
                    <span className="text-[9px] uppercase text-text-secondary font-bold tracking-widest">{label}</span>
                </div>
            )}
        </div>
    );
}

function BackpackIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /><path d="M8 10h8" /><path d="M9 18h6" />
        </svg>
    )
}
