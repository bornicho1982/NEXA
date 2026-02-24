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
}

const BUNGIE_ROOT = "https://www.bungie.net";

export function CharacterColumn({ character, items, onInspect }: CharacterColumnProps) {
    return (
        <DroppableZone
            id={`char-panel-${character.characterId}`}
            data={{ type: "character", characterId: character.characterId }}
            className="w-[410px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-20 relative rounded-xl transition-colors bg-white/5 border border-white/5"
            activeClassName="bg-white/5 ring-1 ring-gold-primary/50"
        >
            {/* Header */}
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
                    <div className="w-full h-full bg-gray-800" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute left-3 top-2 text-white drop-shadow-md">
                    <div className="text-sm font-bold uppercase">{character.className}</div>
                    <div className="text-xs font-light tracking-wider text-yellow-300">✧ {character.light}</div>
                </div>
            </div>

            <div className="px-2 pb-4 space-y-4">
                <PostmasterPanel characterId={character.characterId} />

                {/* Weapons */}
                <div className="space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Weapons</h3>
                    <BucketSection label="Kinetic" bucket={BUCKETS.KINETIC} data={items?.[BUCKETS.KINETIC]} onItemClick={onInspect} />
                    <BucketSection label="Energy" bucket={BUCKETS.ENERGY} data={items?.[BUCKETS.ENERGY]} onItemClick={onInspect} />
                    <BucketSection label="Power" bucket={BUCKETS.POWER} data={items?.[BUCKETS.POWER]} onItemClick={onInspect} />
                </div>

                {/* Armor */}
                <div className="space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Armor</h3>
                    <BucketSection label="Helmet" bucket={BUCKETS.HELMET} data={items?.[BUCKETS.HELMET]} onItemClick={onInspect} />
                    <BucketSection label="Gauntlets" bucket={BUCKETS.GAUNTLETS} data={items?.[BUCKETS.GAUNTLETS]} onItemClick={onInspect} />
                    <BucketSection label="Chest" bucket={BUCKETS.CHEST} data={items?.[BUCKETS.CHEST]} onItemClick={onInspect} />
                    <BucketSection label="Legs" bucket={BUCKETS.LEG} data={items?.[BUCKETS.LEG]} onItemClick={onInspect} />
                    <BucketSection label="Class" bucket={BUCKETS.CLASS_ITEM} data={items?.[BUCKETS.CLASS_ITEM]} onItemClick={onInspect} />
                </div>

                {/* Equipment */}
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1 mb-2">Equipment</h3>
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
