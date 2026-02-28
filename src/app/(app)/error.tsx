"use client";

import { useEffect } from "react";
import { ShieldAlert, RefreshCw, Terminal } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("[App Error]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-8 animate-fade-in">
            {/* Icon Badge */}
            <div className="relative">
                <div className="absolute inset-0 bg-wd-danger/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-wd-danger/15 border border-wd-danger/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <ShieldAlert size={40} className="text-wd-danger" />
                </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                    <Terminal size={12} className="text-wd-danger" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-wd-danger uppercase">System Fault Detected</span>
                </div>
                <h2 className="text-4xl font-black text-text-primary uppercase tracking-tighter">COMMS_INTERRUPTED</h2>
                <p className="text-sm text-text-tertiary max-w-sm mx-auto font-medium leading-relaxed">
                    Critical failure in the neural link. All synchronization processes have been suspended.
                </p>
            </div>

            {/* Diagnostic */}
            {process.env.NODE_ENV === "development" && (
                <div className="w-full max-w-2xl wd-card p-6 text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Diagnostic Link Feed</span>
                        <span className="text-[10px] font-mono text-wd-danger uppercase font-bold">DIGEST: {error.digest || "NULL"}</span>
                    </div>
                    <div className="text-xs font-mono text-wd-danger/80 break-all leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        Error: {error.message}
                        {error.stack && (
                            <pre className="mt-4 opacity-40 whitespace-pre-wrap text-[10px]">{error.stack}</pre>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 rounded-xl bg-wd-primary-600 text-white font-bold text-sm hover:bg-wd-primary-700 transition-colors shadow-lg shadow-wd-primary-600/25 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    <RefreshCw size={14} /> Retry Handshake
                </button>
                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="px-8 py-3 rounded-xl border border-border-subtle text-text-secondary font-semibold text-sm hover:bg-white/5 hover:text-text-primary transition-colors uppercase tracking-wider"
                >
                    Abort to Command
                </button>
            </div>
        </div>
    );
}
