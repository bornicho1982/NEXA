"use client";

import React from "react";

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
                <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
                    <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-4">
                        <div className="text-5xl">💥</div>
                        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                        <p className="text-gray-400 text-sm">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined });
                                window.location.reload();
                            }}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                                text-white text-sm font-medium transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
