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
            color: "text-wd-warning",
            bg: "bg-wd-warning/10",
            border: "border-wd-warning/20",
            desc: "AUTO-FIX STATS",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/raid_nemesis.jpg"
        },
        {
            label: "God Roll Finder",
            href: "/inventory",
            icon: Crosshair,
            color: "text-wd-primary-400",
            bg: "bg-wd-primary-600/10",
            border: "border-wd-primary-600/20",
            desc: "SCAN VAULT",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/crucible_burnout.jpg"
        },
        {
            label: "Postmaster",
            href: "/inventory?filter=postmaster",
            icon: Box,
            color: "text-wd-success",
            bg: "bg-wd-success/10",
            border: "border-wd-success/20",
            desc: "3 ITEMS WAITING",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/social_tower_702.jpg"
        },
        {
            label: "Raid Loadout",
            href: "/loadouts",
            icon: Sword,
            color: "text-wd-lilac",
            bg: "bg-wd-lilac/10",
            border: "border-wd-lilac/20",
            desc: "EQUIP FOR DSC",
            bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/raid_deep_stone_crypt.jpg"
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    href={action.href}
                    className="relative flex items-center gap-4 p-4 rounded-2xl wd-card hover:border-border-medium transition-all group overflow-hidden"
                    style={{ backgroundImage: `url(${action.bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                >
                    {/* Dark overlay — more visible on hover */}
                    <div className="absolute inset-0 bg-bg-secondary/[0.95] group-hover:bg-bg-secondary/[0.85] transition-all duration-500" />

                    <div className={cn(
                        "relative z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all border group-hover:scale-110",
                        action.bg,
                        action.color,
                        action.border
                    )}>
                        <action.icon size={20} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-text-primary group-hover:text-wd-primary-400 transition-colors uppercase tracking-wide">
                            {action.label}
                        </h3>
                        <p className="text-[10px] text-text-secondary font-medium tracking-wider font-mono">
                            {action.desc}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
