"use client";

import { BuildArchitect } from "@/components/builds/BuildArchitect";
import { Header } from "@/components/layout/Header";

export default function BuildsPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            <Header
                title="Build Architect"
                subtitle="Theorycraft and assemble your perfect loadout."
            />

            <main className="flex-1 overflow-hidden">
                <BuildArchitect />
            </main>
        </div>
    );
}
