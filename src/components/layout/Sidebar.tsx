"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Backpack,
    Shield,
    Sparkles,
    LogOut,
    User,
    Layers,
    BarChart2,
    Store,
    Users as UsersIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/inventory", icon: Backpack, label: "Inventory" },
        { href: "/builds", icon: Shield, label: "Build Lab" },
        { href: "/loadouts", icon: Layers, label: "Loadouts" },
        { href: "/ai", icon: Sparkles, label: "AI Advisor", isSpecial: true },
        { href: "/analytics", icon: BarChart2, label: "Analytics" },
        { href: "/clan", icon: UsersIcon, label: "Clan" },
        { href: "/marketplace", icon: Store, label: "Marketplace" },
    ];

    return (
        <div className="flex flex-col h-full nexa-sidebar text-text-primary">
            {/* Header / Brand */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gold-primary/90 text-white flex items-center justify-center font-black text-lg mr-3 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    N
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none tracking-tight text-white">NEXA</h1>
                    <span className="text-[10px] text-text-tertiary font-medium tracking-wider uppercase">Protocol v2</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-white/10 text-white shadow-inner"
                                    : "text-text-secondary hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-primary shadow-[0_0_10px_#f97316]" />
                            )}

                            <Icon
                                size={18}
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "text-gold-primary drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "text-text-tertiary group-hover:text-white",
                                    item.isSpecial && !isActive && "text-purple-500/70 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="relative shrink-0">
                        {user?.profilePicturePath ? (
                            <Image
                                src={`https://www.bungie.net${user.profilePicturePath}`}
                                alt="User" width={36} height={36}
                                className="rounded-full ring-2 ring-white shadow-sm"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center border border-border-subtle">
                                <User size={16} className="text-text-tertiary" />
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-gold-primary transition-colors">{user?.displayName || "Guardian"}</p>
                        <button onClick={logout} className="text-[10px] text-text-tertiary hover:text-red-500 uppercase tracking-wide flex items-center gap-1 mt-0.5 font-medium transition-colors">
                            <LogOut size={10} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
