"use client";

import { cn } from "@/lib/utils";
import type { InventoryCharacter } from "@/lib/inventory/service";
import Image from "next/image";
import { DroppableZone } from "./dnd/DroppableZone";

interface CharacterSelectorProps {
    characters: InventoryCharacter[];
    selectedId: string; // 'vault' or characterId
    onSelect: (id: string) => void;
}

export function CharacterSelector({ characters, selectedId, onSelect }: CharacterSelectorProps) {
    const BUNGIE_ROOT = "https://www.bungie.net";

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">


            {/* 🦸 Character Tabs */}
            {characters.map((char) => {
                const isSelected = selectedId === char.characterId;

                return (
                    <DroppableZone
                        key={char.characterId}
                        id={char.characterId}
                        data={{ type: "character", characterId: char.characterId }}
                        className="rounded-lg"
                    >
                        <button
                            onClick={() => onSelect(char.characterId)}
                            className={cn(
                                "relative h-12 w-48 min-w-[180px] rounded-lg overflow-hidden border transition-all group w-full",
                                isSelected
                                    ? "border-gold-primary ring-1 ring-gold-primary/50 shadow-lg shadow-gold-primary/10"
                                    : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                            )}
                        >
                            {/* Background Emblem */}
                            {char.emblemBackgroundPath && (
                                <Image
                                    src={`${BUNGIE_ROOT}${char.emblemBackgroundPath}`}
                                    alt="Emblem"
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            )}

                            {/* Overlay Gradient for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />

                            {/* Character Info */}
                            <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
                                <div className="text-left">
                                    <div className={cn(
                                        "text-sm font-bold uppercase",
                                        isSelected ? "text-white" : "text-white/90"
                                    )}>
                                        {char.className}
                                    </div>
                                    <div className="text-[10px] text-text-secondary font-mono">
                                        {char.raceType === 0 ? "Human" : char.raceType === 1 ? "Awoken" : "Exo"} • {char.genderType === 0 ? "Male" : "Female"}
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-gold-primary drop-shadow-md font-mono-stat">
                                    {char.light}
                                </div>
                            </div>

                            {/* Active Indicator Bar */}
                            {isSelected && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-primary shadow-[0_0_8px_#f97316]" />
                            )}
                        </button>
                    </DroppableZone>
                );
            })}
        </div>
    );
}
