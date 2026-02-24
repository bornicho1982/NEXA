"use client";

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useBuildStore } from "@/lib/store/build-crafter";
import { getHealthBenefits } from "@/lib/mechanics/stats";
import { SubclassConfigurator } from "./SubclassConfigurator";
import { DroppableSlot } from "./DroppableSlot";
import { ItemPicker } from "./ItemPicker";
import { ArtificeSelector } from "./ArtificeSelector";
import { ItemCard, ItemCardProps } from "@/components/inventory/ItemCard";
import { createPortal } from "react-dom";
import {
    Sword,
    Crosshair,
    Shield,
    Zap,
    Box
} from "lucide-react";

// Local Cooldown Component
import { calculateCooldown, calculateSuperCooldown } from "@/lib/mechanics/cooldowns";

function CooldownDisplay({ label, tier, baseCooldown, isSuper }: { label: string, tier: number, baseCooldown: number, isSuper?: boolean }) {
    const seconds = isSuper
        ? calculateSuperCooldown(baseCooldown, tier)
        : calculateCooldown(baseCooldown, tier);

    // Format mm:ss
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');

    return (
        <div className="bg-bg-tertiary p-2 rounded border border-border-subtle flex flex-col items-center">
            <span className="text-[10px] text-text-tertiary uppercase">{label}</span>
            <span className="font-mono text-sm font-bold text-text-primary">{m}:{s}</span>
        </div>
    );
}

// Bucket Hashes
const BUCKETS = {
    // Weapons
    KINETIC: 1498876634,
    ENERGY: 2465295065,
    POWER: 953998645,
    // Armor
    HELMET: 3448274439,
    ARMS: 3551918588,
    CHEST: 14239492,
    LEGS: 20886954,
    CLASS: 1585787867
};

export function BuildArchitect() {
    const { weapons, armor, equipItem, unequipItem, stats } = useBuildStore();
    const [activeDragItem, setActiveDragItem] = useState<ItemCardProps['item'] | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor)
    );

    const handleDragStart = (event: any) => {
        setActiveDragItem(event.active.data.current as ItemCardProps['item']);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (over && active.data.current) {
            const item = active.data.current as any;
            const targetBucket = Number(over.id);

            // Simple validation: check if item bucket matches target bucket
            if (item.bucketHash === targetBucket) {
                equipItem(targetBucket, item);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full overflow-hidden">
                {/* Column 1: Subclass & Stats & Cooldowns */}
                <div className="w-80 border-r border-border-subtle bg-bg-secondary hidden lg:flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bg-tertiary">
                        <SubclassConfigurator />

                        <div className="mt-8 pt-6 border-t border-border-medium">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Stats</h3>
                            <div className="space-y-4">
                                {Object.entries(stats).map(([key, value]) => {
                                    const isResilience = key === "Resilience";
                                    const label = isResilience ? "Health" : key;
                                    const tier = Math.floor(value / 10);

                                    // 2026 Sandbox Benefits
                                    let benefits = null;
                                    if (isResilience) {
                                        const { healingOnOrb, flinchResist } = getHealthBenefits(tier);
                                        benefits = (
                                            <div className="text-[10px] text-text-tertiary mt-0.5 flex gap-2">
                                                <span>❤️ {healingOnOrb}HP/Orb</span>
                                                <span>🛡️ {flinchResist}% Flinch</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={key} className="group">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className={cn("transition-colors", isResilience ? "text-gold-primary font-bold" : "text-text-secondary group-hover:text-text-primary")}>
                                                    {label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("font-mono font-bold", value >= 100 ? "text-gold-primary" : "text-text-primary")}>
                                                        {value}
                                                    </span>
                                                </div>
                                            </div>
                                            {benefits}
                                            {/* Tier Bar */}
                                            <div className="h-1 w-full bg-bg-tertiary mt-1 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", isResilience ? "bg-gold-primary" : "bg-text-secondary")}
                                                    style={{ width: `${Math.min(value, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cooldowns 2.0 (Calculated) */}
                        <div className="mt-6 pt-6 border-t border-border-medium">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Ability Cooldowns</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <CooldownDisplay
                                    label="Grenade"
                                    tier={Math.floor(stats.Discipline / 10)}
                                    baseCooldown={121} // Flux Grenade (approx 2:01)
                                />
                                <CooldownDisplay
                                    label="Melee"
                                    tier={Math.floor(stats.Strength / 10)}
                                    baseCooldown={100} // Combination Blow (approx 1:40)
                                />
                                <CooldownDisplay
                                    label="Super"
                                    tier={Math.floor(stats.Intellect / 10)}
                                    baseCooldown={500} // Silkstrike (approx 8:20)
                                    isSuper
                                />
                                <CooldownDisplay
                                    label="Class"
                                    tier={Math.floor(stats.Mobility / 10)}
                                    baseCooldown={38} // Gambler's Dodge
                                />
                            </div>
                        </div>

                        {/* Artifice Armor Config */}
                        <div className="mt-6 pt-6 border-t border-border-medium">
                            <h3 className="text-sm font-bold text-gold-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                                Artifice Tuning
                            </h3>
                            <div className="space-y-2">
                                {[BUCKETS.HELMET, BUCKETS.ARMS, BUCKETS.CHEST, BUCKETS.LEGS, BUCKETS.CLASS].map((bucket) => (
                                    <ArtificeSelector key={bucket} bucketHash={bucket} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Equipment Slots (Main Stage) */}
                <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-bg-primary">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Weapons */}
                        <section>
                            <h3 className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4">Weapons</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <DroppableSlot
                                    id={String(BUCKETS.KINETIC)}
                                    label="Kinetic"
                                    acceptCategory={String(BUCKETS.KINETIC)}
                                    item={weapons[BUCKETS.KINETIC]}
                                    placeholderIcon={<Crosshair size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.KINETIC)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.ENERGY)}
                                    label="Energy"
                                    acceptCategory={String(BUCKETS.ENERGY)}
                                    item={weapons[BUCKETS.ENERGY]}
                                    placeholderIcon={<Zap size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.ENERGY)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.POWER)}
                                    label="Power"
                                    acceptCategory={String(BUCKETS.POWER)}
                                    item={weapons[BUCKETS.POWER]}
                                    placeholderIcon={<Sword size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.POWER)}
                                />
                            </div>
                        </section>

                        {/* Armor */}
                        <section>
                            <h3 className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4">Armor</h3>
                            <div className="grid grid-cols-5 gap-4">
                                <DroppableSlot
                                    id={String(BUCKETS.HELMET)}
                                    label="Helmet"
                                    acceptCategory={String(BUCKETS.HELMET)}
                                    item={armor[BUCKETS.HELMET]}
                                    placeholderIcon={<Box size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.HELMET)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.ARMS)}
                                    label="Arms"
                                    acceptCategory={String(BUCKETS.ARMS)}
                                    item={armor[BUCKETS.ARMS]}
                                    placeholderIcon={<Box size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.ARMS)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.CHEST)}
                                    label="Chest"
                                    acceptCategory={String(BUCKETS.CHEST)}
                                    item={armor[BUCKETS.CHEST]}
                                    placeholderIcon={<Shield size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.CHEST)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.LEGS)}
                                    label="Legs"
                                    acceptCategory={String(BUCKETS.LEGS)}
                                    item={armor[BUCKETS.LEGS]}
                                    placeholderIcon={<Box size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.LEGS)}
                                />
                                <DroppableSlot
                                    id={String(BUCKETS.CLASS)}
                                    label="Class"
                                    acceptCategory={String(BUCKETS.CLASS)}
                                    item={armor[BUCKETS.CLASS]}
                                    placeholderIcon={<Box size={24} />}
                                    onRemove={() => unequipItem(BUCKETS.CLASS)}
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/* Column 3: Item Picker */}
                <div className="w-80 border-l border-border-subtle bg-bg-secondary hidden lg:block overflow-hidden">
                    <ItemPicker className="h-full" />
                </div>
            </div>

            {/* Drag Overlay */}
            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="w-20 h-20 opacity-80 cursor-grabbing">
                            <ItemCard item={activeDragItem} className="ring-2 ring-gold-primary shadow-2xl scale-105" />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
