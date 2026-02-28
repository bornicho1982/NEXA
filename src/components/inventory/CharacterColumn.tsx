"use client";

import { BUCKETS } from "@/lib/destiny/buckets";
import { BucketSection } from "./BucketSection";
import { PostmasterPanel } from "./PostmasterPanel";
import { DroppableZone } from "./dnd/DroppableZone";
import { InventoryCharacter, InventoryItem } from "@/lib/inventory/service";
import Image from "next/image";

interface CharacterColumnProps {
    character: InventoryCharacter;
    items: Record<number, { equipped?: InventoryItem; inventory: InventoryItem[] }>;
    onInspect: (item: InventoryItem) => void;
    compact?: boolean;
}

const BUNGIE_ROOT = "https://www.bungie.net";

export function CharacterColumn({ character, items, onInspect, compact = false }: CharacterColumnProps) {
    return (
        <DroppableZone
            id={`char-panel-${character.characterId}`}
            data={{ type: "character", characterId: character.characterId }}
            className="w-[410px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-20 relative rounded-xl transition-colors wd-card"
            activeClassName="ring-1 ring-wd-primary-600/50"
        >
            {/* Header — Character Emblem Banner */}
            <div className="relative h-16 w-full overflow-hidden rounded-t-xl shrink-0">
                {character.emblemBackgroundPath ? (
                    <Image
                        src={`${BUNGIE_ROOT}${character.emblemBackgroundPath}`}
                        alt="Emblem"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-bg-tertiary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute left-3 top-2 text-white drop-shadow-md">
                    <div className="text-sm font-bold uppercase tracking-wide">{character.className}</div>
                    <div className="text-xs font-light tracking-wider text-wd-warning">✧ {character.light}</div>
                </div>
            </div>

            <div className="px-2 pb-4 space-y-3">
                <PostmasterPanel characterId={character.characterId} />

                {/* Weapons — WowDash Card Section */}
                <div className="space-y-2 bg-bg-primary/40 p-2.5 rounded-lg border border-border-subtle">
                    <h3 className="text-[10px] font-bold text-wd-primary-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-wd-primary-600" />
                        Weapons
                    </h3>
                    <BucketSection label="Kinetic" bucket={BUCKETS.KINETIC} data={items?.[BUCKETS.KINETIC]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Energy" bucket={BUCKETS.ENERGY} data={items?.[BUCKETS.ENERGY]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Power" bucket={BUCKETS.POWER} data={items?.[BUCKETS.POWER]} onItemClick={onInspect} compact={compact} />
                </div>

                {/* Armor — WowDash Card Section */}
                <div className="space-y-2 bg-bg-primary/40 p-2.5 rounded-lg border border-border-subtle">
                    <h3 className="text-[10px] font-bold text-wd-success uppercase tracking-widest px-1 flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-wd-success" />
                        Armor
                    </h3>
                    <BucketSection label="Helmet" bucket={BUCKETS.HELMET} data={items?.[BUCKETS.HELMET]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Gauntlets" bucket={BUCKETS.GAUNTLETS} data={items?.[BUCKETS.GAUNTLETS]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Chest" bucket={BUCKETS.CHEST} data={items?.[BUCKETS.CHEST]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Legs" bucket={BUCKETS.LEG} data={items?.[BUCKETS.LEG]} onItemClick={onInspect} compact={compact} />
                    <BucketSection label="Class" bucket={BUCKETS.CLASS_ITEM} data={items?.[BUCKETS.CLASS_ITEM]} onItemClick={onInspect} compact={compact} />
                </div>

                {/* Equipment — WowDash Card Section */}
                <div className="bg-bg-primary/40 p-2.5 rounded-lg border border-border-subtle">
                    <h3 className="text-[10px] font-bold text-wd-lilac uppercase tracking-widest px-1 mb-2 flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-wd-lilac" />
                        Equipment
                    </h3>
                    <div className="grid grid-cols-3 gap-1">
                        <BucketSection label="Subclass" bucket={BUCKETS.SUBCLASS} data={items?.[BUCKETS.SUBCLASS]} simple compact onItemClick={onInspect} />
                        <BucketSection label="Ghost" bucket={BUCKETS.GHOST} data={items?.[BUCKETS.GHOST]} simple compact onItemClick={onInspect} />
                        <BucketSection label="Artifact" bucket={BUCKETS.ARTIFACT} data={items?.[BUCKETS.ARTIFACT]} simple compact onItemClick={onInspect} />
                    </div>
                </div>
            </div>
        </DroppableZone>
    );
}
