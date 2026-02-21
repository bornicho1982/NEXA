"use client";

import { useAuth } from "@/hooks/useAuth";
import {
    RefreshCw,
    Plus,
    Activity,
    Zap,
    Database,
    ShieldAlert,
    TrendingUp,
    LucideIcon
} from "lucide-react";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SuggestedAction } from "@/components/dashboard/SuggestedAction";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

export default function DashboardPage() {
    const { user } = useAuth();
    const vaultUsed = 589;
    const vaultTotal = 600;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* 1. Welcome Header (Cinematic) */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        WELCOME BACK, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-primary to-gold-secondary drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">{user?.displayName || "GUARDIAN"}</span>
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm font-medium tracking-wide">
                        SYSTEM ONLINE // OPTIMIZATION PROTOCOLS ACTIVE
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all shadow-lg backdrop-blur-md text-sm font-bold uppercase tracking-wider">
                        <RefreshCw size={14} />
                        Sync Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-primary to-gold-secondary text-black hover:brightness-110 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] text-sm font-black uppercase tracking-wider">
                        <Plus size={16} strokeWidth={3} />
                        New Loadout
                    </button>
                </div>

                {/* Background Glow */}
                <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-gold-primary/5 blur-[100px] pointer-events-none" />
            </header>

            {/* 2. Key Metrics Grid (Glass Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Vault Space"
                    value={`${vaultUsed} / ${vaultTotal}`}
                    subtext={vaultUsed > 590 ? "CRITICAL CAPACITY" : "OPTIMAL"}
                    icon={Database}
                    trend={vaultUsed > 590 ? "warning" : "neutral"}
                />
                <MetricCard
                    label="Power Level"
                    value="2010"
                    subtext="+12 ARTIFACT BONUS"
                    icon={Zap}
                    trend="success"
                />
                <MetricCard
                    label="Active Build"
                    value="Solar Warlock"
                    subtext="WELL OF RADIANCE"
                    icon={TrendingUp}
                    trend="neutral"
                />
                <MetricCard
                    label="Weekly Challenges"
                    value="4 / 9"
                    subtext="RESET IN 2D 14H"
                    icon={Activity}
                    trend="neutral"
                />
            </div>

            {/* 3. Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Access */}
                    <section>
                        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gold-primary rounded-full shadow-[0_0_8px_#f97316]" />
                            Quick Access
                        </h2>
                        <QuickActions />
                    </section>

                    {/* Suggestions */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert size={14} className="text-gold-primary" />
                                Recommended Actions
                            </h2>
                        </div>
                        <SuggestedAction />
                    </section>

                    {/* Analytics Preview */}
                    <section className="nexa-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[60px] rounded-full group-hover:bg-teal-500/20 transition-all duration-500" />
                        <div className="mb-6 relative z-10">
                            <h2 className="text-lg font-bold text-white tracking-wide">ENGAGEMENT ANALYTICS</h2>
                            <p className="text-xs text-teal-400 font-mono">LIVE FEED // RECHARTS_MOCK_V2</p>
                        </div>
                        <AnalyticsDashboard />
                    </section>
                </div>

                {/* Right Column */}
                <aside className="space-y-8">
                    <RecentActivity />

                    {/* Weekly Rotator */}
                    <div className="nexa-card p-5 relative overflow-hidden border-l-2 border-l-teal-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent pointer-events-none" />
                        <h3 className="text-sm font-bold text-teal-400 mb-4 flex items-center gap-2 uppercase tracking-wider relative z-10">
                            <Activity size={16} /> Weekly Featured
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-text-secondary">RAID</span>
                                <span className="font-bold text-white drop-shadow-md">Deep Stone Crypt</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-text-secondary">DUNGEON</span>
                                <span className="font-bold text-white drop-shadow-md">Shattered Throne</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">MISSION</span>
                                <span className="font-bold text-white drop-shadow-md">Presage</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: string;
    subtext: string;
    icon: LucideIcon;
    trend: "success" | "warning" | "neutral";
}

function MetricCard({ label, value, subtext, icon: Icon, trend }: MetricCardProps) {
    return (
        <div className="nexa-card p-4 group hover:border-white/20 hover:bg-white/5 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className={cn(
                    "p-2 rounded-lg bg-white/5 border border-white/5 text-text-secondary group-hover:text-white transition-colors",
                    trend === "warning" && "text-red-400 bg-red-500/10 border-red-500/20",
                    trend === "success" && "text-green-400 bg-green-500/10 border-green-500/20"
                )}>
                    <Icon size={18} />
                </div>
                {trend === "warning" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />}
                {trend === "success" && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />}
            </div>
            <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{label}</p>
                <div className={cn(
                    "text-2xl font-black text-white mt-1 tracking-tight group-hover:scale-105 transition-transform origin-left",
                    trend === "warning" && "text-red-100",
                )}>
                    {value}
                </div>
                <p className="text-[10px] text-text-secondary font-medium mt-1 font-mono">{subtext}</p>
            </div>
        </div>
    );
}

// Utility to merge classes (if not imported usually)
import { cn } from "@/lib/utils";
