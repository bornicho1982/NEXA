"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/components";
import { ShieldAlert, RefreshCw, Terminal } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("[App Error]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-8 animate-enter">
            <div className="relative">
                <div className="absolute inset-0 bg-vanguard-red/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative p-6 bg-vanguard-red/10 border border-vanguard-red/40 angled-corners text-vanguard-red">
                    <ShieldAlert size={48} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Terminal size={12} className="text-vanguard-red" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-vanguard-red uppercase italic">System Fault Detected</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Comms_Interrupted</h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                    Critical failure in the neural link. All synchronization processes have been suspended.
                </p>
            </div>

            {/* Diagnostic Output */}
            {process.env.NODE_ENV === "development" && (
                <div className="w-full max-w-2xl bg-black/40 border border-white/5 p-6 angled-corners text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Diagnostic_Log_Feed</span>
                        <span className="text-[8px] font-mono text-vanguard-red uppercase font-bold">DIGEST: {error.digest || "NULL"}</span>
                    </div>
                    <div className="text-[10px] font-mono text-vanguard-red/80 break-all leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {error.message}
                        {error.stack && (
                            <pre className="mt-4 opacity-40 whitespace-pre-wrap">{error.stack}</pre>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={() => reset()}
                    className="h-12 px-10"
                >
                    <RefreshCw size={18} className="mr-2" />
                    RETRY_HANDSHAKE
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => window.location.href = "/dashboard"}
                    className="h-12 px-10 text-[10px]"
                >
                    ABORT_TO_COMMAND
                </Button>
            </div>
        </div>
    );
}
