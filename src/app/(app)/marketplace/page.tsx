"use client";

import { cn } from "@/lib/utils";
import { MapPin, Clock, Sparkles, Store, Tag, RefreshCw, ExternalLink } from "lucide-react";

interface VendorItem {
    name: string;
    type: string;
    cost: string;
    icon: string;
    rarity: "Exotic" | "Legendary" | "Rare";
}

const B = "https://www.bungie.net";

const XUR_INVENTORY: VendorItem[] = [
    { name: "Prometheus Lens", type: "Trace Rifle", cost: "29 LS", icon: `${B}/common/destiny2_content/icons/81fb0e4264461beaee846a0d4e84e28a.jpg`, rarity: "Exotic" },
    { name: "Celestial Nighthawk", type: "Hunter Helmet", cost: "23 LS", icon: `${B}/common/destiny2_content/icons/4a9e40fcd15adf6b9680bb3a2103a96a.jpg`, rarity: "Exotic" },
    { name: "Hallowfire Heart", type: "Titan Chest", cost: "23 LS", icon: `${B}/common/destiny2_content/icons/c75dc48e6c498c7ab7df5ead8fef615c.jpg`, rarity: "Exotic" },
    { name: "Hawkmoon", type: "Hand Cannon", cost: "125 LS", icon: `${B}/common/destiny2_content/icons/d5913aca4ee455ea710c2ddb0dd2f0a6.jpg`, rarity: "Exotic" },
];

const BANSHEE_INVENTORY: VendorItem[] = [
    { name: "Funnelweb", type: "SMG", cost: "30 LS", icon: `${B}/common/destiny2_content/icons/c45e82fa29bdc10796ce4eb1b3571b10.jpg`, rarity: "Legendary" },
    { name: "Taipan-4fr", type: "Linear Fusion", cost: "30 LS", icon: `${B}/common/destiny2_content/icons/bebc44f917f14c18c1cf4d4c18ab3108.jpg`, rarity: "Legendary" },
    { name: "Syncopation-53", type: "Pulse Rifle", cost: "30 LS", icon: `${B}/common/destiny2_content/icons/a7ecbb43af81e3f0db79371790c53bb4.jpg`, rarity: "Legendary" },
    { name: "Palmyra-B", type: "Rocket Launcher", cost: "30 LS", icon: `${B}/common/destiny2_content/icons/a36b376d96fc00db81f6e1c6b95fca63.jpg`, rarity: "Legendary" },
];

const ADA_INVENTORY: VendorItem[] = [
    { name: "Lucent Blade", type: "Arc CWL Mod", cost: "10 EC", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Elemental Charge", type: "CWL Mod", cost: "10 EC", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Font of Might", type: "Well Mod", cost: "10 EC", icon: "/icons/icon-192.png", rarity: "Legendary" },
    { name: "Protective Light", type: "CWL Mod", cost: "10 EC", icon: "/icons/icon-192.png", rarity: "Legendary" },
];

function VendorSection({
    title, location, inventory, timer, gradient, iconColor, borderColor, vendorBg
}: {
    title: string;
    location: string;
    inventory: VendorItem[];
    timer?: string;
    gradient: string;
    iconColor: string;
    borderColor: string;
    vendorBg?: string;
}) {
    return (
        <div className={cn("rounded-2xl bg-bg-secondary border overflow-hidden transition-all hover:shadow-lg", borderColor)}>
            {/* Vendor Header — CSS background */}
            <div
                className={cn("relative overflow-hidden", gradient)}
                style={vendorBg ? { backgroundImage: `url(${vendorBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
                {vendorBg && <div className="absolute inset-0 bg-black/60" />}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]" />
                <div className="relative z-10 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", iconColor)}>
                            <Store size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">{title}</h2>
                            <div className="flex items-center gap-4 text-sm mt-0.5">
                                <div className="flex items-center gap-1 text-white/70 font-medium">
                                    <MapPin size={13} /> {location}
                                </div>
                                {timer && (
                                    <div className="flex items-center gap-1 text-white/50 font-medium">
                                        <Clock size={13} /> {timer}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                            <ExternalLink size={12} /> Light.gg
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Grid — safe <img> with fallback */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {inventory.map((item, i) => (
                    <div key={i} className="group relative bg-bg-primary rounded-xl border border-border-subtle hover:border-wd-primary-600/40 transition-all p-3 flex gap-3 items-center hover:shadow-md cursor-pointer">
                        <div className={cn("w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2",
                            item.rarity === "Exotic" ? "border-wd-warning/50 bg-wd-warning/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]" : "border-wd-lilac/30 bg-wd-lilac/10"
                        )}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.icon}
                                width={48}
                                height={48}
                                alt={item.name}
                                className="object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/icons/icon-192.png"; }}
                            />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <h4 className="font-bold text-text-primary truncate text-sm flex items-center gap-1.5">
                                {item.name}
                                {item.rarity === "Exotic" && <Sparkles size={11} className="text-wd-warning shrink-0" />}
                            </h4>
                            <p className="text-xs text-text-tertiary truncate font-medium">{item.type}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                                <Tag size={10} className="text-text-tertiary" />
                                <span className="text-[10px] font-bold text-text-secondary">{item.cost}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketplacePage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <VendorSection
                title="Xûr, Agent of the Nine"
                location="Nessus, Watcher's Grave"
                inventory={XUR_INVENTORY}
                timer="Leaves in 2d 14h"
                gradient="bg-gradient-to-r from-amber-900/80 via-amber-800/60 to-yellow-900/40"
                iconColor="bg-wd-warning shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                borderColor="border-wd-warning/20"
                vendorBg={`${B}/img/destiny_content/pgcr/patrol_nessus.jpg`}
            />

            <VendorSection
                title="Banshee-44"
                location="Tower, Courtyard"
                inventory={BANSHEE_INVENTORY}
                timer="Resets in 14h"
                gradient="bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-indigo-900/40"
                iconColor="bg-wd-primary-600 shadow-[0_0_20px_rgba(72,127,255,0.4)]"
                borderColor="border-wd-primary-600/20"
                vendorBg={`${B}/img/destiny_content/pgcr/social_tower_702.jpg`}
            />

            <VendorSection
                title="Ada-1"
                location="Tower, Annex"
                inventory={ADA_INVENTORY}
                timer="Daily rotation"
                gradient="bg-gradient-to-r from-emerald-900/80 via-emerald-800/60 to-teal-900/40"
                iconColor="bg-wd-success shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                borderColor="border-wd-success/20"
            />
        </div>
    );
}
