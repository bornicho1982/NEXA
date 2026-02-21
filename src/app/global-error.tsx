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
            <body className="bg-black text-white flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4 font-sans">
                    <h2 className="text-3xl font-bold text-red-500">System Malfunction</h2>
                    <p className="text-gray-400">Critical error detected. Guardian down.</p>
                    <div className="text-xs text-gray-600 font-mono">
                        Error Digest: {error.digest || "Unknown"}
                    </div>
                    <button
                        className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white font-medium transition-colors"
                        onClick={() => reset()}
                    >
                        Reinitialize
                    </button>
                </div>
            </body>
        </html>
    );
}
