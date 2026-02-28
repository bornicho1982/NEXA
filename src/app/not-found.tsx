import Link from "next/link";
import { Home, Map } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 text-center">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wd-primary-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-wd-lilac/10 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-md">
                {/* 404 Number */}
                <h1 className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/80 via-white/40 to-white/10 bg-clip-text text-transparent select-none">
                    404
                </h1>

                {/* Lost Sector Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-wd-primary-600/15 border border-wd-primary-600/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(72,127,255,0.2)]">
                    <Map size={28} className="text-wd-primary-400" />
                </div>

                <h2 className="text-xl font-bold text-white mb-3">Lost Sector Found</h2>
                <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                    Looks like you&apos;ve wandered into an unexplored area.
                    This page doesn&apos;t exist in the NEXA database.
                    Return to orbit and try a different path, Guardian.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-wd-primary-600 text-white font-semibold text-sm hover:bg-wd-primary-700 transition-colors shadow-lg shadow-wd-primary-600/25 flex items-center justify-center gap-2"
                    >
                        <Home size={16} /> Return to Orbit
                    </Link>
                    <Link
                        href="/inventory"
                        className="w-full sm:w-auto px-8 py-3 rounded-xl border border-border-subtle text-text-secondary font-semibold text-sm hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Map size={16} /> View Inventory
                    </Link>
                </div>
            </div>

            {/* Footer hint */}
            <p className="absolute bottom-8 text-[10px] text-neutral-600 uppercase tracking-widest">
                NEXA Protocol v2
            </p>
        </div>
    );
}
