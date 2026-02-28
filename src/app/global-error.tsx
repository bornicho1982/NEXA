"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body style={{ margin: 0, background: "#0a0e1a", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ textAlign: "center", maxWidth: 420, padding: "2rem" }}>
                    {/* Icon */}
                    <div style={{ width: 64, height: 64, margin: "0 auto 1.5rem", borderRadius: 16, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(239,68,68,0.15)" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" /><path d="M12 17h.01" />
                        </svg>
                    </div>

                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                        System Malfunction
                    </h2>
                    <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#ef4444", fontWeight: 700, marginBottom: "1rem" }}>
                        CRITICAL_FAULT_DETECTED
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        A critical error prevented NEXA from rendering. All processes suspended.
                    </p>

                    {/* Diagnostic */}
                    <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748b" }}>Diagnostic</span>
                            <span style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "#ef4444", fontWeight: 700 }}>DIGEST: {error.digest || "NULL"}</span>
                        </div>
                        <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94a3b8", wordBreak: "break-all", lineHeight: 1.5, margin: 0 }}>
                            {error.message || "Unknown critical error"}
                        </p>
                    </div>

                    <button
                        onClick={() => reset()}
                        style={{ padding: "0.75rem 2rem", borderRadius: 12, background: "#487fff", color: "white", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", boxShadow: "0 4px 16px rgba(72,127,255,0.25)" }}
                    >
                        ↻ Reinitialize
                    </button>
                </div>
            </body>
        </html>
    );
}
