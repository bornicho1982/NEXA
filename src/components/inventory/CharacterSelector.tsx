"use client";

import { cn } from "@/lib/utils";
import type { InventoryCharacter } from "@/lib/inventory/service";
import Image from "next/image";
import { DroppableZone } from "./dnd/DroppableZone";
import { Menu } from "@headlessui/react";
import { MoreVertical, ShieldMinus, Sword, PackageOpen } from "lucide-react";
import { useInventoryStore } from "@/lib/store/inventory";

interface CharacterSelectorProps {
    characters: InventoryCharacter[];
    selectedId: string; // 'vault' or characterId
    onSelect: (id: string) => void;
}

export function CharacterSelector({ characters, selectedId, onSelect }: CharacterSelectorProps) {
    const BUNGIE_ROOT = "https://www.bungie.net";
    const { stripArmor, stripWeapons, collectPostmaster } = useInventoryStore();

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
                        className="rounded-lg relative group/char flex-shrink-0"
                    >
                        <button
                            onClick={() => onSelect(char.characterId)}
                            className={cn(
                                "relative h-12 w-48 min-w-[180px] rounded-lg overflow-hidden border transition-all w-full",
                                isSelected
                                    ? "border-wd-primary-600 ring-1 ring-wd-primary-600/50 shadow-lg shadow-wd-primary-600/10"
                                    : "border-border-subtle hover:border-border-medium opacity-70 hover:opacity-100"
                            )}
                        >
                            {/* Background Emblem */}
                            {char.emblemBackgroundPath && (
                                <Image
                                    src={`${BUNGIE_ROOT}${char.emblemBackgroundPath}`}
                                    alt="Emblem"
                                    fill
                                    className="object-cover opacity-80 transition-opacity"
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
                                <div className="text-xl font-bold text-wd-warning drop-shadow-md font-mono-stat mr-2">
                                    {char.light}
                                </div>
                            </div>

                            {/* Active Indicator Bar */}
                            {isSelected && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wd-primary-600 shadow-[0_0_8px_rgba(72,127,255,0.5)]" />
                            )}
                        </button>

                        {/* Dropdown Menu for Mass Actions */}
                        <Menu>
                            <Menu.Button
                                className="absolute top-1.5 right-1.5 z-20 p-1 rounded bg-black/60 hover:bg-black text-white/50 hover:text-white transition-colors opacity-0 group-hover/char:opacity-100 outline-none backdrop-blur-sm"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <MoreVertical size={16} />
                            </Menu.Button>
                            <Menu.Items
                                transition
                                anchor="bottom end"
                                className="w-48 origin-top-right rounded-lg bg-bg-secondary/95 backdrop-blur-md border border-border-subtle shadow-xl shadow-black/50 focus:outline-none overflow-hidden divide-y divide-border-subtle z-50 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                            >
                                <div className="py-1">
                                    <Menu.Item>
                                        <button
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); collectPostmaster(char.characterId); }}
                                            className="group flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors data-[focus]:bg-wd-primary-600/15 data-[focus]:text-wd-primary-400 text-text-secondary hover:text-text-primary"
                                        >
                                            <PackageOpen size={14} className="mr-3 shrink-0" />
                                            Recoger Postmaster
                                        </button>
                                    </Menu.Item>
                                </div>
                                <div className="py-1">
                                    <Menu.Item>
                                        <button
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); stripArmor(char.characterId); }}
                                            className="group flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors data-[focus]:bg-white/5 text-text-secondary hover:text-text-primary"
                                        >
                                            <ShieldMinus size={14} className="mr-3 shrink-0" />
                                            Quitar Armaduras
                                        </button>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <button
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); stripWeapons(char.characterId); }}
                                            className="group flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors data-[focus]:bg-white/5 text-text-secondary hover:text-text-primary"
                                        >
                                            <Sword size={14} className="mr-3 shrink-0" />
                                            Limpiar Armas
                                        </button>
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Menu>

                    </DroppableZone>
                );
            })}
        </div>
    );
}
