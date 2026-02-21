"use client";


import { AdvancedSearch } from "@/components/search/AdvancedSearch";

interface HeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode; // For extra actions
}

export function Header({ title, subtitle, children }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
                <div>
                    <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-text-secondary font-medium">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-4">
                    {/* Global Search */}
                    <div className="hidden md:block w-72">
                        <AdvancedSearch />
                    </div>

                    {/* Page Actions */}
                    {children && <div className="flex items-center gap-2">{children}</div>}
                </div>
            </div>
        </header>
    );
}
