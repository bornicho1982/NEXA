"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                    {/* Background glow */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-wd-danger/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-wd-lilac/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 wd-card rounded-2xl p-10 max-w-md w-full text-center space-y-6 border-wd-danger/20">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-wd-danger/15 border border-wd-danger/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <AlertTriangle size={28} className="text-wd-danger" />
                        </div>

                        {/* Title */}
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-wider mb-2">
                                System Fault Detected
                            </h2>
                            <p className="text-xs text-text-tertiary uppercase tracking-widest">
                                COMMS_INTERRUPTED
                            </p>
                        </div>

                        {/* Error message */}
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Critical failure in the neural link. All synchronization processes have been suspended.
                        </p>

                        {/* Diagnostic */}
                        <div className="bg-bg-primary rounded-xl border border-border-subtle p-4 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Diagnostic Link Feed</span>
                                <span className="text-[10px] text-wd-danger font-mono">ABORT::ERR</span>
                            </div>
                            <p className="text-xs text-text-tertiary font-mono break-words leading-relaxed">
                                {this.state.error?.message || "An unexpected error occurred in the rendering pipeline."}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: undefined });
                                    window.location.reload();
                                }}
                                className="px-6 py-3 rounded-xl bg-wd-primary-600 text-white font-bold text-sm hover:bg-wd-primary-700 transition-colors shadow-lg shadow-wd-primary-600/25 flex items-center gap-2 uppercase tracking-wider"
                            >
                                <RefreshCw size={14} /> Retry Handshake
                            </button>
                            <button
                                onClick={() => window.location.href = "/dashboard"}
                                className="px-6 py-3 rounded-xl border border-border-subtle text-text-secondary font-semibold text-sm hover:bg-white/5 hover:text-text-primary transition-colors uppercase tracking-wider"
                            >
                                Abort to Command
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
