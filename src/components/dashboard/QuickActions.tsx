import {
    Zap,
    Crosshair,
    Box,
    Sword
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActions() {
    const actions = [
        {
            label: "Optimize Armor",
            href: "/builds",
            icon: Zap,
            color: "text-gold-primary",
            bg: "bg-gold-primary/10",
            border: "border-gold-primary/20",
            desc: "AUTO-FIX STATS"
        },
        {
            label: "God Roll Finder",
            href: "/inventory",
            icon: Crosshair,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            desc: "SCAN VAULT"
        },
        {
            label: "Postmaster",
            href: "/inventory?filter=postmaster",
            icon: Box,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            desc: "3 ITEMS WAITING"
        },
        {
            label: "Raid Loadout",
            href: "/loadouts",
            icon: Sword,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            desc: "EQUIP FOR DSC"
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    href={action.href}
                    className="flex items-center gap-4 p-4 rounded-xl nexa-card hover:border-white/20 hover:bg-white/5 transition-all group"
                >
                    <div className={cn(
                        "p-3 rounded-lg flex items-center justify-center transition-colors border",
                        action.bg,
                        action.color,
                        action.border
                    )}>
                        <action.icon size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-gold-primary transition-colors uppercase tracking-wide">
                            {action.label}
                        </h3>
                        <p className="text-[10px] text-text-secondary font-medium tracking-wider">
                            {action.desc}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
