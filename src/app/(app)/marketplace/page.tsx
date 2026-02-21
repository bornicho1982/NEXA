"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { MapPin, Clock, ExternalLink, Sparkles } from "lucide-react";

interface VendorItem {
    name: string;
    type: string;
    cost: string;
    icon: string;
    rarity: "Exotic" | "Legendary" | "Rare";
}

const XUR_INVENTORY: VendorItem[] = [
    { name: "Prometheus Lens", type: "Trace Rifle", cost: "29 LS", icon: "/icons/icon-192.png", rarity: "Exotic" },
    { name: "Celestial Nighthawk", type: "Helmet", cost: "23 LS", icon: "/icons/icon-192.png", rarity: "Exotic" },
    { name: "Hallowfire Heart", type: "Chest Armor", cost: "23 LS", icon: "/icons/icon-192.png", rarity: "Exotic" },
    { name: "Hawkmoon", type: "Hand Cannon", cost: "125 LS", icon: "/icons/icon-192.png", rarity: "Exotic" },
];

const BANSHEE_INVENTORY: VendorItem[] = [
    { name: "Funnelweb", type: "SMG", cost: "30 LS", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Taipan-4fr", type: "Linear Fusion", cost: "30 LS", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Syncopation-53", type: "Pulse Rifle", cost: "30 LS", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Palmyra-B", type: "Rocket Launcher", cost: "30 LS", icon: "/icons/icon-192.png", rarity: "Legendary" },
];

function VendorSection({ title, location, inventory, timer, image }: { title: string; location: string; inventory: VendorItem[]; timer?: string; image?: string }) {
    return (
        <div className="bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            {/* Header */}
            <div className="relative h-32 bg-zinc-900 overflow-hidden">
                {image && <Image src={image} fill className="object-cover opacity-60" alt={title} unoptimized />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 flex flex-col items-start z-10">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        {title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm mt-1">
                        <div className="flex items-center gap-1 text-gold-primary font-bold">
                            <MapPin size={14} />
                            <span>{location}</span>
                        </div>
                        {timer && (
                            <div className="flex items-center gap-1 text-white/70 font-medium">
                                <Clock size={14} />
                                <span>{timer}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-bg-secondary">
                {inventory.map((item, i) => (
                    <div key={i} className="group relative bg-white rounded-lg border border-border-subtle hover:border-gold-primary transition-all p-3 flex gap-4 items-center shadow-sm hover:shadow-md">
                        <div className={cn("w-12 h-12 rounded bg-zinc-100 border shrink-0 flex items-center justify-center overflow-hidden",
                            item.rarity === "Exotic" ? "border-yellow-500 bg-yellow-50" : "border-purple-500 bg-purple-50"
                        )}>
                            <Image src={item.icon} width={48} height={48} alt={item.name} className="opacity-90 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-text-primary truncate text-sm flex items-center gap-1">
                                {item.name}
                                {item.rarity === "Exotic" && <Sparkles size={10} className="text-yellow-600" />}
                            </h4>
                            <p className="text-xs text-text-secondary truncate font-medium">{item.type}</p>
                            <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded text-text-tertiary mt-1 inline-block border border-border-subtle font-bold">
                                {item.cost}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketplacePage() {
    return (
        <div className="h-full overflow-y-auto bg-bg-primary p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-end pb-4 border-b border-border-subtle">
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">Marketplace</h1>
                        <p className="text-text-secondary font-medium mt-1">Track vendor inventories and daily rotations.</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-secondary transition-colors px-4 py-2 bg-orange-50 rounded-lg">
                        View Map <ExternalLink size={14} />
                    </button>
                </div>

                {/* Xur */}
                <VendorSection
                    title="Xûr, Agent of the Nine"
                    location="Nessus, Watcher's Grave"
                    inventory={XUR_INVENTORY}
                    timer="Leaves in 2d 14h"
                    image="https://www.bungie.net/img/destiny_content/milestones/icons/xur_icon.png"
                />

                {/* Banshee */}
                <VendorSection
                    title="Banshee-44"
                    location="Tower, Courtyard"
                    inventory={BANSHEE_INVENTORY}
                    timer="Resets in 14h"
                />
            </div>
        </div>
    );
}
