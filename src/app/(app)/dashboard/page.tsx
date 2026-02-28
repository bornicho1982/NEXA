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
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { user } = useAuth();
    const vaultUsed = 589;
    const vaultTotal = 600;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* 1. Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-text-primary tracking-tight">
                        WELCOME BACK, <span className="text-transparent bg-clip-text bg-gradient-to-r from-wd-primary-400 to-wd-primary-600">{user?.displayName || "GUARDIAN"}</span>
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm font-medium tracking-wide">
                        SYSTEM ONLINE // OPTIMIZATION PROTOCOLS ACTIVE
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button className="wd-btn flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                        <RefreshCw size={14} />
                        Sync Data
                    </button>
                    <button className="wd-btn wd-btn-primary flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                        <Plus size={16} strokeWidth={3} />
                        New Loadout
                    </button>
                </div>

                {/* Background Glow */}
                <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-wd-primary-600/5 blur-[100px] pointer-events-none" />
            </header>

            {/* 2. Key Metrics Grid (WowDash Stat Widgets) */}
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
                            <span className="w-2 h-2 bg-wd-primary-600 rounded-full shadow-[0_0_8px_rgba(72,127,255,0.5)]" />
                            Quick Access
                        </h2>
                        <QuickActions />
                    </section>

                    {/* Suggestions */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert size={14} className="text-wd-warning" />
                                Recommended Actions
                            </h2>
                        </div>
                        <SuggestedAction />
                    </section>

                    {/* Analytics Preview */}
                    <section className="wd-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-wd-info/10 blur-[60px] rounded-full group-hover:bg-wd-info/20 transition-all duration-500" />
                        <div className="mb-6 relative z-10">
                            <h2 className="text-lg font-bold text-text-primary tracking-wide">ENGAGEMENT ANALYTICS</h2>
                            <p className="text-xs text-wd-info font-mono">LIVE FEED // RECHARTS_MOCK_V2</p>
                        </div>
                        <AnalyticsDashboard />
                    </section>
                </div>

                {/* Right Column */}
                <aside className="space-y-8">
                    <RecentActivity />

                    {/* Weekly Rotator — with Bungie PGCR images */}
                    <div className="wd-card p-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-wd-info/5 to-transparent pointer-events-none" />
                        <h3 className="text-xs font-bold text-wd-info mb-4 flex items-center gap-2 uppercase tracking-[0.15em] relative z-10">
                            <div className="w-7 h-7 rounded-lg bg-wd-info/15 flex items-center justify-center">
                                <Activity size={14} />
                            </div>
                            Weekly Featured
                        </h3>
                        <div className="space-y-2.5 relative z-10">
                            {[
                                { label: "RAID", name: "Deep Stone Crypt", color: "text-wd-lilac bg-wd-lilac/10", bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/raid_deep_stone_crypt.jpg" },
                                { label: "DUNGEON", name: "Shattered Throne", color: "text-wd-warning bg-wd-warning/10", bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/dungeon_shattered_throne.jpg" },
                                { label: "MISSION", name: "Presage", color: "text-wd-success bg-wd-success/10", bgUrl: "https://www.bungie.net/img/destiny_content/pgcr/glykon.jpg" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="relative rounded-xl overflow-hidden group cursor-pointer border border-border-subtle hover:border-border-medium transition-all"
                                    style={{ backgroundImage: `url(${item.bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                                >
                                    <div className="absolute inset-0 bg-bg-secondary/[0.90] group-hover:bg-bg-secondary/[0.80] transition-all duration-500" />
                                    <div className="relative z-10 flex justify-between items-center px-4 py-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${item.color}`}>{item.label}</span>
                                        <span className="font-bold text-sm text-text-primary">{item.name}</span>
                                    </div>
                                </div>
                            ))}
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
    const gradients = {
        warning: "from-wd-danger/10 via-wd-danger/5 to-transparent",
        success: "from-wd-success/10 via-wd-success/5 to-transparent",
        neutral: "from-wd-primary-600/10 via-wd-primary-600/5 to-transparent",
    };
    const iconColors = {
        warning: "bg-wd-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        success: "bg-wd-success text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        neutral: "bg-wd-primary-600 text-white shadow-[0_0_15px_rgba(72,127,255,0.3)]",
    };

    return (
        <div className="wd-card p-5 group hover:border-border-medium transition-all duration-300 relative overflow-hidden">
            {/* WowDash gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[trend]} pointer-events-none`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-1">{label}</p>
                        <div className={cn(
                            "text-2xl font-black text-text-primary tracking-tight group-hover:scale-105 transition-transform origin-left",
                            trend === "warning" && "text-wd-danger",
                        )}>{value}</div>
                    </div>
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconColors[trend])}>
                        <Icon size={22} />
                    </div>
                </div>
                <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-2">
                    {trend === "success" && (
                        <span className="inline-flex items-center gap-0.5 text-wd-success font-bold">
                            <TrendingUp size={12} /> ↑
                        </span>
                    )}
                    {trend === "warning" && (
                        <span className="inline-flex items-center gap-0.5 text-wd-danger font-bold">
                            <ShieldAlert size={12} /> !
                        </span>
                    )}
                    <span className="font-mono text-[10px]">{subtext}</span>
                </p>
            </div>
        </div>
    );
}
