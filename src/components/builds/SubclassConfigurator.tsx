"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useBuildStore } from "@/lib/store/build-crafter";
import { cn } from "@/lib/utils";
import { PlugSelector } from "./PlugSelector";

interface SubclassOption {
    hash: number;
    name: string;
    icon: string;
    damageType: number;
    sockets: Array<{
        index: number;
        socketTypeHash: number;
        options: Array<{
            hash: number;
            name: string;
            icon?: string;
            description: string;
            statBonuses?: Record<string, { value: number }>;
        }>;
    }>;
}

export function SubclassConfigurator() {
    const { subclass, setSubclass, subclassPlugs, setSubclassPlug } = useBuildStore();
    const [availableSubclasses, setAvailableSubclasses] = useState<SubclassOption[]>([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedSocket, setSelectedSocket] = useState<{ index: number; title: string; options: any[] } | null>(null);

    // Fetch subclasses (hardcoded to Warlock for now, ideally strictly typed or dynamic)
    // Class types: 0=Titan, 1=Hunter, 2=Warlock
    const characterClass = 2; // Defaulting to Warlock for demo

    useEffect(() => {
        async function fetchSubclasses() {
            setLoading(true);
            try {
                const res = await fetch(`/api/manifest/subclasses?classType=${characterClass}`);
                const data = await res.json();
                if (data.subclasses) {
                    setAvailableSubclasses(data.subclasses);
                    // Default to first if none selected
                    if (!subclass && data.subclasses.length > 0) {
                        setSubclass(data.subclasses[0]);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch subclasses", e);
            } finally {
                setLoading(false);
            }
        }
        fetchSubclasses();
    }, [characterClass, subclass, setSubclass]);

    if (loading) return <div className="p-4 text-text-secondary animate-pulse">Loading subclasses...</div>;

    if (!subclass) return (
        <div className="p-4 grid grid-cols-3 gap-4">
            {availableSubclasses.map((sc) => (
                <button
                    key={sc.hash}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setSubclass(sc as any)} // Cast because store expects Item type which is loose
                    className="p-4 bg-bg-secondary rounded hover:bg-bg-tertiary flex flex-col items-center gap-2 transition-colors"
                >
                    <Image src={`https://www.bungie.net${sc.icon}`} width={48} height={48} alt={sc.name} className="bg-black/50 rounded-full" unoptimized />
                    <span className="font-bold">{sc.name}</span>
                </button>
            ))}
        </div>
    );

    // Cast subclass to our enriched type
    // FIX: use itemHash instead of hash because subclass is Item type from store
    const fullSubclass = availableSubclasses.find(s => s.hash === subclass.itemHash) || (subclass as unknown as SubclassOption);

    // Helper to find plug options for a socket
    const getSocketOptions = (index: number) => {
        return fullSubclass.sockets?.find(s => s.index === index)?.options || [];
    };

    const getEquippedPlug = (index: number) => {
        const plugHash = subclassPlugs[index];
        if (!plugHash) {
            return null;
        }
        const options = getSocketOptions(index);
        return options.find(o => o.hash === plugHash);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Header: Subclass Switcher */}
            <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
                <div className="relative w-16 h-16">
                    <Image src={`https://www.bungie.net${fullSubclass.icon}`} fill className="object-contain" alt={fullSubclass.name} unoptimized />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-primary">{fullSubclass.name}</h2>
                    <div className="flex gap-2 mt-1">
                        {availableSubclasses.map(sc => (
                            <button
                                key={sc.hash}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setSubclass(sc as any)}
                                className={cn(
                                    "w-6 h-6 rounded-full overflow-hidden border border-transparent hover:border-text-primary transition-all",
                                    sc.hash === fullSubclass.hash ? "border-wd-primary-600 scale-110" : "opacity-50 hover:opacity-100"
                                )}
                            >
                                <Image src={`https://www.bungie.net${sc.icon}`} width={24} height={24} alt={sc.name} unoptimized />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sockets Grid */}
            <div className="grid grid-cols-1 gap-6">
                {fullSubclass.sockets?.map((socket) => {
                    const equipped = getEquippedPlug(socket.index);
                    const isFragment = socket.options.length > 10; // Simple heuristic for now

                    if (socket.options.length === 0) return null;

                    return (
                        <div key={socket.index} className="flex flex-col gap-2">
                            <span className="text-xs font-mono uppercase text-text-tertiary">Socket {socket.index}</span>
                            <button
                                onClick={() => setSelectedSocket({
                                    index: socket.index,
                                    title: isFragment ? "Select Fragment" : "Select Ability",
                                    options: socket.options
                                })}
                                className="flex items-center gap-3 p-2 bg-bg-tertiary/50 border border-border-subtle rounded hover:bg-bg-tertiary transition-colors text-left"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center shrink-0">
                                    {equipped?.icon ? (
                                        <Image src={`https://www.bungie.net${equipped.icon}`} width={40} height={40} alt={equipped.name} unoptimized />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-white/10" />
                                    )}
                                </div>
                                {/* Info */}
                                <div>
                                    <div className={cn("font-medium text-sm", equipped ? "text-text-primary" : "text-text-disabled")}>
                                        {equipped?.name || "Empty Slot"}
                                    </div>
                                    {equipped?.description && (
                                        <div className="text-xs text-text-secondary line-clamp-1">{equipped.description}</div>
                                    )}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Selector Modal */}
            <PlugSelector
                isOpen={!!selectedSocket}
                onClose={() => setSelectedSocket(null)}
                title={selectedSocket?.title || ""}
                options={selectedSocket?.options || []}
                onSelect={(hash) => {
                    if (selectedSocket) {
                        // FIX: Pass stat bonuses to store
                        const option = selectedSocket.options.find(o => o.hash === hash);
                        setSubclassPlug(selectedSocket.index, hash, option?.statBonuses);
                    }
                }}
            />
        </div>
    );
}
