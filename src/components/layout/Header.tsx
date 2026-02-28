"use client";

import { Search, Bell, Menu, Maximize2, Minimize2, LogOut, User as UserIcon, Settings, Shield, Zap, Package, Swords, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";

interface HeaderProps {
    onToggleMobileMenu?: () => void;
}

/* ── Mock notifications (Destiny 2 themed) ── */
const NOTIFICATIONS = [
    {
        id: 1,
        icon: <Zap size={18} />,
        iconBg: "bg-wd-warning/15 text-wd-warning",
        title: "Weekly Reset",
        desc: "New Nightfall, Crucible rewards, and raid challenges available.",
        time: "2h ago",
        unread: true,
    },
    {
        id: 2,
        icon: <Package size={18} />,
        iconBg: "bg-wd-danger/15 text-wd-danger",
        title: "Postmaster Almost Full",
        desc: "You have 19/21 items in the Postmaster. Collect them soon!",
        time: "4h ago",
        unread: true,
    },
    {
        id: 3,
        icon: <Swords size={18} />,
        iconBg: "bg-wd-primary-600/15 text-wd-primary-400",
        title: "Xûr Has Arrived",
        desc: "The Agent of the Nine is at Nessus, Watcher's Grave.",
        time: "6h ago",
        unread: false,
    },
    {
        id: 4,
        icon: <Shield size={18} />,
        iconBg: "bg-wd-success/15 text-wd-success",
        title: "Build Optimized",
        desc: "Your Solar Warlock build has reached Tier 10 Recovery.",
        time: "1d ago",
        unread: false,
    },
];

export function Header({ onToggleMobileMenu }: HeaderProps) {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("nexa-theme") !== "light";
        }
        return true;
    });

    // Sync theme to DOM (external system)
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        document.documentElement.setAttribute("data-theme", newDark ? "dark" : "light");
        localStorage.setItem("nexa-theme", newDark ? "dark" : "light");
    }, [isDarkMode]);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

    return (
        <header className="h-[4.5rem] border-b border-border-subtle bg-bg-secondary flex items-center justify-between px-6 shrink-0 z-30">
            {/* Left side: Mobile menu + Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile menu toggle */}
                <button
                    onClick={onToggleMobileMenu}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Search Bar — WowDash Style */}
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-wd-primary-600/50 focus:ring-1 focus:ring-wd-primary-600/25 transition-all"
                    />
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2">
                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                {/* Theme Toggle — WowDash Pattern */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors"
                    title={isDarkMode ? "Light Mode" : "Dark Mode"}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* ── Notifications Dropdown ── */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors relative"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-wd-danger rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-bg-secondary border border-border-subtle rounded-xl shadow-elevated overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="px-4 py-3 bg-wd-primary-600/10 flex items-center justify-between">
                                <h6 className="text-sm font-bold text-text-primary">Notifications</h6>
                                <span className="text-xs font-bold text-wd-primary-400 bg-wd-primary-600/20 rounded-full w-6 h-6 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            </div>

                            {/* Notification Items */}
                            <div className="max-h-80 overflow-y-auto">
                                {NOTIFICATIONS.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`px-4 py-3 flex items-start gap-3 hover:bg-bg-tertiary/50 transition-colors cursor-pointer border-b border-border-subtle last:border-0 ${notif.unread ? "bg-wd-primary-600/5" : ""}`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                                            {notif.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h6 className="text-sm font-semibold text-text-primary truncate">{notif.title}</h6>
                                                {notif.unread && <span className="w-2 h-2 bg-wd-primary-600 rounded-full shrink-0" />}
                                            </div>
                                            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notif.desc}</p>
                                            <span className="text-[10px] text-text-tertiary mt-1 block">{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 text-center border-t border-border-subtle">
                                <button className="text-xs font-semibold text-wd-primary-400 hover:text-wd-primary-300 transition-colors">
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border-subtle mx-1" />

                {/* ── User Profile Dropdown ── */}
                <div className="relative" ref={profileRef}>
                    <div
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="flex items-center gap-3 pl-2 cursor-pointer group"
                    >
                        <div className="relative">
                            {user?.profilePicturePath ? (
                                <Image
                                    src={`https://www.bungie.net${user.profilePicturePath}`}
                                    alt="User" width={36} height={36}
                                    className="rounded-full ring-2 ring-wd-primary-600/20"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center border border-border-subtle">
                                    <span className="text-sm font-bold text-text-tertiary">G</span>
                                </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-wd-success rounded-full border-2 border-bg-secondary" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-sm font-semibold text-text-primary group-hover:text-wd-primary-400 transition-colors leading-tight">
                                {user?.displayName || "Guardian"}
                            </span>
                            <span className="text-[11px] text-text-tertiary leading-tight">Online</span>
                        </div>
                    </div>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-bg-secondary border border-border-subtle rounded-xl shadow-elevated overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border-subtle">
                                <p className="text-sm font-semibold text-text-primary">{user?.displayName || "Guardian"}</p>
                                <p className="text-[11px] text-text-tertiary">{user?.destinyMembershipId ? `ID: ${user.destinyMembershipId}` : "Destiny 2 Player"}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary transition-colors">
                                    <UserIcon size={16} /> Profile
                                </button>
                                <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary transition-colors">
                                    <Settings size={16} /> Settings
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-border-subtle py-1">
                                <button
                                    onClick={() => logout?.()}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-wd-danger hover:bg-wd-danger/10 transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
