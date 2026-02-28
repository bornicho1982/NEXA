"use client";

import { BuildArchitect } from "@/components/builds/BuildArchitect";

export default function BuildsPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            <main className="flex-1 overflow-hidden">
                <BuildArchitect />
            </main>
        </div>
    );
}

