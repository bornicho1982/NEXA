"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
    User, Shield, Clock, Trophy, Star, Zap,
    Package, Swords, Save,
    Crown, Award, Flame, Target, RefreshCw,
    Crosshair, Activity, Users, Share2, Check,
    Download, ChevronDown, Gem, Layers, Layout,
    BarChart2, PieChart, TrendingUp
} from "lucide-react";
import type { ProfileStats } from "@/lib/profile/stats-service";
import type { ProfileExtended, RecentActivity } from "@/lib/profile/extended-service";
import {
    DonutChart,
    WeaponBarChart,
    ArmorRadarChart,
    WinRateGauge
} from "@/components/profile/chart-components";
import { Guardian3D } from "@/components/profile/Guardian3D";
import { Box } from "lucide-react";

/* ── Constants ── */
const CLASS_GRADIENTS: Record<string, string> = {
    Titan: "from-red-600/30 to-orange-600/20",
    Hunter: "from-cyan-600/30 to-blue-600/20",
    Warlock: "from-amber-500/30 to-yellow-600/20",
};

const CLASS_ACCENTS: Record<string, { border: string; text: string; bg: string; glow: string; primary: string }> = {
    Titan: { border: "border-red-500/30", text: "text-red-400", bg: "bg-red-500/10", glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]", primary: "rgb(239, 68, 68)" },
    Hunter: { border: "border-cyan-500/30", text: "text-cyan-400", bg: "bg-cyan-500/10", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]", primary: "rgb(6, 182, 212)" },
    Warlock: { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]", primary: "rgb(245, 158, 11)" },
};

const CLASS_ICONS: Record<string, typeof Shield> = {
    Titan: Shield,
    Hunter: Target,
    Warlock: Flame,
};

const GUARDIAN_RANK_NAMES: Record<number, string> = {
    1: "New Light", 2: "Explorer", 3: "Adventurer", 4: "Veteran",
    5: "Elite", 6: "Ascendant", 7: "Champion", 8: "Adept",
    9: "Fabled", 10: "Mythic", 11: "Paragon",
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"overview" | "stats" | "activities" | "pve">("overview");
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [extended, setExtended] = useState<ProfileExtended | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedEmblemIdx, setSelectedEmblemIdx] = useState(0);
    const [showEmblemPicker, setShowEmblemPicker] = useState(false);
    const [show3D, setShow3D] = useState(false);

    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);
                const [statsRes, extRes] = await Promise.allSettled([
                    fetch("/api/profile/stats").then(r => r.ok ? r.json() : null),
                    fetch("/api/profile/extended").then(r => r.ok ? r.json() : null),
                ]);
                if (statsRes.status === "fulfilled") setStats(statsRes.value);
                if (extRes.status === "fulfilled") setExtended(extRes.value);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const selectedChar = stats?.characters?.[selectedEmblemIdx] || stats?.characters?.[0];
    const primaryClass = selectedChar?.className || "Hunter";
    const theme = CLASS_ACCENTS[primaryClass] || CLASS_ACCENTS.Hunter;

    const handleShare = useCallback(() => {
        const lines = [
            `🛡️ ${user?.displayName || "Guardian"} — ${primaryClass}`,
            `⚡ ${stats?.maxLight || "—"} Power | 🏆 ${stats?.triumphScore?.toLocaleString() || "—"} Triumph`,
            `🎖️ Guardian Rank ${stats?.guardianRank || "—"}`,
            `⚔️ PvP K/D: ${extended?.pvpStats.kd || "—"} | K/D/A: ${extended?.pvpStats.kda || "—"}`,
            `📊 ${stats?.titles?.length || 0} Titles | ${formatHours(stats?.totalMinutesPlayed || 0)}h Played`,
            `\n— NEXA Destiny 2 Companion`,
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [user, stats, extended, primaryClass]);

    return (
        <div className="animate-fade-in p-2 lg:p-6 max-w-[1600px] mx-auto space-y-6">

            {/* ── Dashboard Header ── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 ${theme.border} shadow-elevated`}>
                            {user?.profilePicturePath ? (
                                <Image src={`https://www.bungie.net${user.profilePicturePath}`} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-bg-tertiary flex items-center justify-center"><User size={30} className="text-text-tertiary" /></div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-wd-primary-600 border-2 border-bg-primary flex items-center justify-center text-[10px] font-black text-white">
                            {stats?.guardianRank || "1"}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight leading-none">{user?.displayName || "Guardian"}</h1>
                            <span className="text-[10px] font-bold text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block">Member Since 2024</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-secondary text-[10px] sm:text-xs font-semibold">
                            <span className="flex items-center gap-1.5"><Layout size={12} className={theme.text} /> {primaryClass}</span>
                            <span className="flex items-center gap-1.5"><Zap size={12} className="text-wd-warning" /> {stats?.maxLight || "—"} Power</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-wd-primary-400" /> {formatHours(stats?.totalMinutesPlayed || 0)}h Playtime</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleShare} className="btn-secondary py-2 px-4 text-[11px] h-auto flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                        {copied ? <Check size={14} className="text-wd-success" /> : <Share2 size={14} />} {copied ? "Copied" : "Share Profile"}
                    </button>
                    <button className="btn-primary py-2 px-4 shadow-lg shadow-wd-primary-600/20 text-[11px] h-auto flex items-center gap-2">
                        <Download size={14} /> Export Card
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ── LEFT COLUMN: CHARACTER & BASE STATS ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Guardian Card (The iconic look) */}
                    <div className={`bg-bg-secondary border ${theme.border} rounded-3xl overflow-hidden ${theme.glow} transition-all duration-500`}>
                        <div className="relative h-[540px] w-full overflow-hidden">
                            {show3D && selectedChar && stats?.renderData?.[selectedChar.characterId] ? (
                                <Guardian3D
                                    renderData={stats.renderData[selectedChar.characterId]}
                                    className="w-full h-full"
                                />
                            ) : (
                                <>
                                    {/* Animated Background Parallax Effect */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                                        style={{ backgroundImage: `url(https://www.bungie.net${selectedChar?.emblemBackgroundPath || "/img/destiny_content/pgcr/social_tower_702.jpg"})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-black/30" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary/40 to-transparent" />
                                </>
                            )}

                            {/* Top Controls: 3D Toggle + Picker */}
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                                {/* 3D Toggle Button */}
                                <button
                                    onClick={() => setShow3D(!show3D)}
                                    disabled={!stats?.renderData?.[selectedChar?.characterId || ""]}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed ${show3D
                                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                                        : "bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20"
                                        }`}
                                >
                                    <Box size={14} className={show3D ? "animate-pulse" : ""} />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">
                                        {show3D ? "Hologram ON" : "3D Preview"}
                                    </span>
                                </button>

                                {/* Emblem Selection Switcher */}
                                {stats?.characters && stats.characters.length > 1 && (
                                    <div className="relative group">
                                        <button
                                            onClick={() => setShowEmblemPicker(!showEmblemPicker)}
                                            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-xl hover:border-white/20"
                                        >
                                            <ChevronDown size={18} className={showEmblemPicker ? "rotate-180" : ""} />
                                        </button>
                                        {showEmblemPicker && (
                                            <div className="absolute top-12 right-0 w-48 bg-bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                {stats.characters.map((c, i) => (
                                                    <button
                                                        key={c.characterId}
                                                        onClick={() => { setSelectedEmblemIdx(i); setShowEmblemPicker(false); }}
                                                        className={`w-full flex items-center justify-between p-3 gap-3 hover:bg-white/5 transition-colors ${i === selectedEmblemIdx ? "bg-wd-primary-600/20 text-wd-primary-400" : "text-text-secondary"}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-cover" style={{ backgroundImage: `url(https://www.bungie.net${c.emblemPath})` }} />
                                                            <span className="text-[10px] font-bold">{c.className}</span>
                                                        </div>
                                                        <span className="text-xs font-black font-mono">{c.light}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Armor Stats Overlay (Radar Chart) */}
                            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center w-full px-6 z-10 transition-all duration-500 ${show3D ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100"}`}>
                                <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 w-full shadow-2xl">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Armor Stats</h3>
                                        {selectedChar?.light && (
                                            <span className="text-lg font-black text-wd-warning font-mono drop-shadow-lg">{selectedChar.light}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-center -my-4">
                                        {selectedChar?.stats && (
                                            <ArmorRadarChart
                                                stats={{
                                                    mobility: selectedChar.stats.mobility || 0,
                                                    resilience: selectedChar.stats.resilience || 0,
                                                    recovery: selectedChar.stats.recovery || 0,
                                                    discipline: selectedChar.stats.discipline || 0,
                                                    intellect: selectedChar.stats.intellect || 0,
                                                    strength: selectedChar.stats.strength || 0
                                                }}
                                                size={220}
                                                color={`${theme.primary.replace("rgb", "rgba").replace(")", ", 0.4)")}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Titles / Marks (Kept on the left) */}
                            {stats?.equippedTitle && (
                                <div className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-wd-warning/10 backdrop-blur-md border border-wd-warning/30 text-wd-warning shadow-2xl transition-all duration-500 ${show3D ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100"}`}>
                                    <Crown size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{stats.equippedTitle}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progressions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-bg-secondary border border-white/5 rounded-2xl hover:border-wd-lilac/30 transition-colors group">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy size={14} className="text-wd-lilac" />
                                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Triumph Score</span>
                            </div>
                            <p className="text-2xl font-black text-text-primary tracking-tight">{(stats?.triumphScore || 0).toLocaleString()}</p>
                            <p className="text-[9px] text-text-tertiary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Active: {stats?.activeTriumphScore?.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-white/5 rounded-2xl hover:border-wd-warning/30 transition-colors group">
                            <div className="flex items-center gap-2 mb-3">
                                <Star size={14} className="text-wd-warning" />
                                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Season Rank</span>
                            </div>
                            <p className="text-2xl font-black text-text-primary tracking-tight">{stats?.seasonRank || "—"}</p>
                            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-wd-warning rounded-full" style={{ width: `${Math.min(100, (stats?.seasonRank || 0) % 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Exotic Collection */}
                    {stats && (
                        <div className="bg-bg-secondary border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2 mb-2"><Gem size={14} className="text-wd-warning" /> Collections</h3>
                            <div className="space-y-4">
                                <CollectionRow label="Exotic Weapons" icon={Swords} color="rgb(72, 127, 255)" collected={stats.exoticWeaponsCollected} total={stats.exoticWeaponsTotal} />
                                <CollectionRow label="Exotic Armor" icon={Shield} color="rgb(186, 104, 255)" collected={stats.exoticArmorCollected} total={stats.exoticArmorTotal} />
                            </div>
                        </div>
                    )}

                    {/* Clan Card */}
                    {extended?.clan && (
                        <div className="bg-bg-secondary border border-white/5 rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/[0.02] transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-wd-primary-600/10 border border-wd-primary-600/20 flex items-center justify-center shrink-0">
                                <Users size={20} className="text-wd-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-text-primary truncate">{extended.clan.name}</h4>
                                <p className="text-[10px] text-text-tertiary italic truncate">{extended.clan.motto || "No motto set"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-text-primary italic">[{extended.clan.clanCallsign}]</p>
                                <p className="text-[8px] text-text-tertiary uppercase tracking-widest">Lvl {extended.clan.level}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: ANALYTICS DASHBOARD ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
                        {[
                            { id: "overview", label: "Overview", icon: BarChart2 },
                            { id: "stats", label: "Crucible", icon: Crosshair },
                            { id: "pve", label: "Vanguard", icon: Shield },
                            { id: "activities", label: "Timeline", icon: Activity },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === t.id
                                    ? "bg-wd-primary-600 text-white shadow-lg shadow-wd-primary-600/20"
                                    : "text-text-tertiary hover:text-text-primary hover:bg-white/5"
                                    }`}
                            >
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {loading ? (
                            <div className="h-[600px] flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="animate-spin text-wd-primary-400" size={32} />
                                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Syncing with Vanguard...</span>
                            </div>
                        ) : (
                            <>
                                {activeTab === "overview" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-bg-secondary border border-white/5 rounded-3xl p-6 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Combat Overview</h3>
                                                <TrendingUp size={16} className="text-wd-success" />
                                            </div>
                                            <div className="flex justify-center py-4">
                                                {extended && (
                                                    <DonutChart
                                                        kills={extended.pvpStats.kills + extended.pveStats.kills}
                                                        deaths={extended.pvpStats.deaths + extended.pveStats.deaths}
                                                        assists={extended.pvpStats.assists + extended.pveStats.assists}
                                                        size={220}
                                                        strokeWidth={16}
                                                    />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <MiniStat label="Kills" value={((extended?.pvpStats.kills || 0) + (extended?.pveStats.kills || 0)).toLocaleString()} color="text-wd-primary-400" />
                                                <MiniStat label="Deaths" value={((extended?.pvpStats.deaths || 0) + (extended?.pveStats.deaths || 0)).toLocaleString()} color="text-wd-danger" />
                                                <MiniStat label="Assists" value={((extended?.pvpStats.assists || 0) + (extended?.pveStats.assists || 0)).toLocaleString()} color="text-wd-success" />
                                            </div>
                                        </div>

                                        <div className="bg-bg-secondary border border-white/5 rounded-3xl p-6 space-y-6">
                                            <div className="flex items-center justify-between font-black uppercase tracking-widest text-xs text-text-primary">
                                                <h3>Weapon Arsenal</h3>
                                                <Swords size={16} className="text-wd-primary-400" />
                                            </div>
                                            {extended?.topWeapons && (
                                                <WeaponBarChart data={extended.topWeapons.slice(0, 6).map(w => ({ name: w.weaponName, kills: w.kills, precisionPercent: w.precisionPercent }))} />
                                            )}
                                        </div>

                                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <StatCard label="Win Percentage" value={`${extended?.pvpStats?.winRate || 0}%`} icon={Star} color="text-wd-warning" />
                                            <StatCard label="Combat Rating" value={extended?.pvpStats?.kdRatio?.toFixed(2) || "0.00"} icon={Activity} color="text-wd-lilac" />
                                            <StatCard label="Precision %" value={`${(extended?.pvpStats?.kills || 0) > 0 ? Math.round(((extended?.pvpStats?.precisionKills || 0) / (extended?.pvpStats?.kills || 1)) * 100) : 0}%`} icon={Target} color="text-wd-success" />
                                            <StatCard label="Total Matches" value={extended?.pvpStats?.activitiesEntered?.toLocaleString() || "0"} icon={Trophy} color="text-wd-primary-400" />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "stats" && extended && (
                                    <div className="bg-bg-secondary border border-white/5 rounded-3xl p-8 space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-wd-danger/10 border border-wd-danger/20 flex items-center justify-center text-wd-danger shadow-lg shadow-wd-danger/10">
                                                    <Crosshair size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Crucible Performance</h3>
                                                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Lifetime Aggregate Player Stats</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-center">
                                                    <p className="text-3xl font-black text-text-primary italic leading-none">{extended.pvpStats.kd}</p>
                                                    <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Kill/Death</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-3xl font-black text-wd-primary-400 italic leading-none">{extended.pvpStats.kda}</p>
                                                    <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest mt-1">K/D/A</p>
                                                </div>
                                                <WinRateGauge rate={extended.pvpStats.winRate} size={80} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                            <div className="md:col-span-4 flex justify-center py-4">
                                                <DonutChart
                                                    kills={extended.pvpStats.kills}
                                                    deaths={extended.pvpStats.deaths}
                                                    assists={extended.pvpStats.assists}
                                                    size={240}
                                                    strokeWidth={20}
                                                />
                                            </div>
                                            <div className="md:col-span-8 space-y-6">
                                                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Weapon Efficiency Ranking</h4>
                                                <WeaponBarChart data={extended.topWeapons.slice(0, 8).map(w => ({ ...w, name: w.weaponName }))} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 pt-6 border-t border-white/5">
                                            <DetailStat label="Wins" value={extended.pvpStats.activitiesWon.toLocaleString()} color="text-wd-primary-400" />
                                            <DetailStat label="Streak" value={extended.pvpStats.longestKillStreak.toString()} color="text-wd-warning" />
                                            <DetailStat label="Precision" value={extended.pvpStats.precisionKills.toLocaleString()} color="text-wd-success" />
                                            <DetailStat label="Avg Life" value={`${extended.pvpStats.avgLifespan}s`} color="text-wd-lilac" />
                                            <DetailStat label="Hours" value={`${extended.pvpStats.hoursPlayed}h`} color="text-text-primary" />
                                            <DetailStat label="Best Type" value={extended.pvpStats.bestWeaponType} color="text-wd-primary-400" />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "pve" && extended && (
                                    <div className="bg-bg-secondary border border-white/5 rounded-3xl p-8 space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-wd-success/10 border border-wd-success/20 flex items-center justify-center text-wd-success shadow-lg shadow-wd-success/10">
                                                    <Shield size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Vanguard Records</h3>
                                                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">PvE & Cooperative Combat History</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-center">
                                                    <p className="text-3xl font-black text-text-primary italic leading-none">{extended.pveStats.kd}</p>
                                                    <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest mt-1">K/D Ratio</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-3xl font-black text-wd-lilac italic leading-none">{extended.raidReport.reduce((s, r) => s + r.completions, 0)}</p>
                                                    <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Raid Clears</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Raid Report Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2"><Layers size={14} className="text-wd-lilac" /> Raid Report Card</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {extended.raidReport.map((raid) => (
                                                    <div key={raid.name} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-wd-lilac/10 flex items-center justify-center text-wd-lilac group-hover:scale-110 transition-transform">
                                                                <Layers size={16} />
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-black text-wd-lilac font-mono leading-none">{raid.completions}</p>
                                                                <p className="text-[7px] font-bold text-text-tertiary uppercase mt-1">Clears</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] font-black text-text-primary uppercase truncate mb-2">{raid.name}</p>
                                                        <div className="flex justify-between text-[9px] font-bold font-mono">
                                                            <span className="text-text-tertiary">Kills: {raid.kills.toLocaleString()}</span>
                                                            <span className="text-wd-success">K/D: {raid.kd}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "activities" && extended && (
                                    <div className="bg-bg-secondary border border-white/5 rounded-3xl p-6 space-y-4">
                                        <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 mb-6"><Activity size={16} className="text-wd-lilac" /> Recent Activity Timeline</h3>
                                        <div className="space-y-3">
                                            {extended.recentActivities.map((act, i) => (
                                                <ActivityItem key={i} activity={act} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════ SUB-COMPONENTS ══════════════════ */

function formatHours(minutes: number) {
    return Math.floor(minutes / 60).toLocaleString();
}

function CollectionRow({ label, icon: Icon, color, collected, total }: { label: string; icon: any; color: string; collected: number; total: number }) {
    const pct = total > 0 ? (collected / total) * 100 : 0;
    return (
        <div className="group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={12} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
                    <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary">{label}</span>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary">{collected} / {total}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="text-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <p className={`text-sm font-black italic ${color} leading-none`}>{value}</p>
            <p className="text-[7px] font-bold text-text-tertiary uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
    return (
        <div className="bg-bg-secondary border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={color} />
            </div>
            <div>
                <p className="text-lg font-black text-text-primary leading-tight font-mono">{value}</p>
                <p className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function DetailStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="text-center space-y-1">
            <p className={`text-base font-black italic ${color} tracking-tight truncate`}>{value}</p>
            <p className="text-[7px] font-bold text-text-tertiary uppercase tracking-widest">{label}</p>
        </div>
    );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
    const isWin = activity.standing === 0 && activity.isCompleted;
    const isPvP = activity.mode.includes("PvP") || ["Control", "Clash", "Rumble", "Survival", "Trials"].includes(activity.mode);

    return (
        <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPvP ? "bg-wd-danger/10 text-wd-danger" : "bg-wd-success/10 text-wd-success"}`}>
                {isPvP ? <Crosshair size={18} /> : <Shield size={18} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-black text-text-primary uppercase truncate">{activity.activityName}</h4>
                    {activity.isCompleted && (
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${isWin ? "bg-wd-success/20 text-wd-success" : "bg-wd-danger/20 text-wd-danger"}`}>
                            {isWin ? "Victory" : "Defeat"}
                        </span>
                    )}
                </div>
                <p className="text-[9px] text-text-tertiary">
                    {new Date(activity.dateStarted).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} • {Math.floor(activity.duration / 60)}m duration
                </p>
            </div>
            <div className="flex items-center gap-4 text-center shrink-0">
                <div className="w-12">
                    <p className="text-xs font-black text-text-primary">{activity.kd}</p>
                    <p className="text-[7px] font-bold text-text-tertiary uppercase">K/D</p>
                </div>
                <div className="w-20 hidden sm:block">
                    <p className="text-[10px] font-mono font-bold text-text-secondary">{activity.kills}/{activity.deaths}/{activity.assists}</p>
                    <p className="text-[7px] font-bold text-text-tertiary uppercase">K/D/A</p>
                </div>
            </div>
        </div>
    );
}
