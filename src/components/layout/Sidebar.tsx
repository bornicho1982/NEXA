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
    Users as UsersIcon,
    ChevronLeft,
    ChevronRight,
    Settings,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
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
            {/* Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-6 flex items-center justify-center w-6 h-6 bg-bg-secondary border border-border-subtle rounded-full text-text-tertiary hover:text-white hover:border-wd-primary-600 hover:bg-wd-primary-600/20 transition-all z-50 shadow-md"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Header / Brand — WowDash Style */}
            <div className={cn(
                "h-[4.5rem] flex items-center border-b border-border-subtle shrink-0 transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-5"
            )}>
                <div className={cn(
                    "w-9 h-9 rounded-lg bg-wd-primary-600 text-white flex-shrink-0 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(72,127,255,0.4)]",
                    !isCollapsed && "mr-3"
                )}>
                    N
                </div>
                <div className={cn(
                    "flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
                )}>
                    <h1 className="font-bold text-lg leading-none tracking-tight text-text-primary mb-0.5">NEXA</h1>
                    <span className="text-[10px] text-text-tertiary font-medium tracking-wider uppercase leading-none">Protocol v2</span>
                </div>
            </div>

            {/* Caption: Menu */}
            <div className={cn(
                "px-5 pt-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-text-tertiary transition-all duration-300",
                isCollapsed && "opacity-0 h-0 pt-0 pb-0 overflow-hidden"
            )}>
                Menu
            </div>

            {/* Navigation — WowDash Sidebar Style */}
            <div className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                isCollapsed ? "justify-center" : "",
                                isActive
                                    ? "bg-wd-primary-600/15 text-wd-primary-400"
                                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            )}
                        >
                            {/* Active left border indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-wd-primary-600 shadow-[0_0_10px_rgba(72,127,255,0.5)]" />
                            )}

                            <Icon
                                size={20}
                                className={cn(
                                    "flex-shrink-0 transition-all duration-200",
                                    isActive
                                        ? "text-wd-primary-500"
                                        : "text-text-tertiary group-hover:text-text-primary",
                                    item.isSpecial && !isActive && "text-wd-lilac/70 group-hover:text-wd-lilac"
                                )}
                            />
                            <span className={cn(
                                "overflow-hidden whitespace-nowrap transition-all duration-300",
                                isCollapsed ? "w-0 opacity-0 ml-0" : "w-full opacity-100 ml-3"
                            )}>
                                {item.label}
                            </span>

                            {/* Special badge for AI */}
                            {item.isSpecial && !isCollapsed && (
                                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-wd-lilac/15 text-wd-lilac border border-wd-lilac/20">
                                    AI
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* ── Account Section ── */}
                <div className={cn(
                    "pt-4 mt-2 text-[11px] font-bold uppercase tracking-widest text-text-tertiary transition-all duration-300 px-3",
                    isCollapsed && "opacity-0 h-0 pt-0 mt-0 overflow-hidden"
                )}>
                    Account
                </div>
                {isCollapsed && <div className="border-t border-border-subtle mx-2 my-2" />}

                {[
                    { href: "/profile", icon: UserCircle, label: "Profile" },
                    { href: "/settings", icon: Settings, label: "Settings" },
                ].map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                isCollapsed ? "justify-center" : "",
                                isActive
                                    ? "bg-wd-primary-600/15 text-wd-primary-400"
                                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-wd-primary-600 shadow-[0_0_10px_rgba(72,127,255,0.5)]" />
                            )}
                            <Icon size={20} className={cn("flex-shrink-0 transition-all", isActive ? "text-wd-primary-500" : "text-text-tertiary group-hover:text-text-primary")} />
                            <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0 ml-0" : "w-full opacity-100 ml-3")}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Footer — WowDash Style */}
            <div className={cn("p-4 border-t border-border-subtle shrink-0 transition-all duration-300", isCollapsed ? "px-2" : "")}>
                <div
                    className={cn("flex items-center rounded-lg hover:bg-white/5 transition-colors cursor-pointer group", isCollapsed ? "justify-center p-1" : "gap-3 p-2")}
                    title={isCollapsed ? "Sign Out" : undefined}
                    onClick={isCollapsed ? logout : undefined}
                >
                    <div className="relative shrink-0">
                        {user?.profilePicturePath ? (
                            <Image
                                src={`https://www.bungie.net${user.profilePicturePath}`}
                                alt="User" width={36} height={36}
                                className="rounded-full ring-2 ring-wd-primary-600/30 shadow-sm"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center border border-border-subtle">
                                <User size={16} className="text-text-tertiary" />
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-wd-success rounded-full border-2 border-bg-secondary" />
                    </div>

                    <div className={cn("flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100")}>
                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-wd-primary-400 transition-colors">{user?.displayName || "Guardian"}</p>
                        <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-[10px] text-text-tertiary hover:text-wd-danger uppercase tracking-wide flex items-center gap-1 mt-0.5 font-medium transition-colors w-fit">
                            <LogOut size={10} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
