"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

/* ── Route labels mapping ── */
const ROUTE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    inventory: "Inventory",
    builds: "Build Lab",
    loadouts: "Loadouts",
    ai: "AI Advisor",
    analytics: "Analytics",
    clan: "Clan",
    marketplace: "Marketplace",
    profile: "Profile",
    settings: "Settings",
};

export function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
        return null; // Don't show on dashboard home
    }

    return (
        <div className="flex items-center justify-between gap-4 mb-6">
            {/* Page title */}
            <h2 className="text-lg font-bold text-text-primary">
                {ROUTE_LABELS[segments[segments.length - 1]] || segments[segments.length - 1]}
            </h2>

            {/* Breadcrumb trail */}
            <nav className="flex items-center gap-1.5 text-sm">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-text-tertiary hover:text-wd-primary-400 transition-colors"
                >
                    <Home size={14} />
                    <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {segments.map((segment, i) => {
                    if (segment === "dashboard") return null;
                    const href = "/" + segments.slice(0, i + 1).join("/");
                    const isLast = i === segments.length - 1;
                    const label = ROUTE_LABELS[segment] || segment;

                    return (
                        <span key={segment} className="flex items-center gap-1.5">
                            <ChevronRight size={12} className="text-text-tertiary" />
                            {isLast ? (
                                <span className="text-wd-primary-400 font-semibold">{label}</span>
                            ) : (
                                <Link href={href} className="text-text-tertiary hover:text-wd-primary-400 transition-colors">
                                    {label}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </nav>
        </div>
    );
}
