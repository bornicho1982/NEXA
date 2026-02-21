"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

interface AppHeaderProps {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
}

export function AppHeader({ title, description, actions }: AppHeaderProps) {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md px-6 transition-all lg:ml-64">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col gap-1">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-text-secondary">
                        <Home size={12} className="text-text-tertiary" />
                        {paths.map((path, idx) => (
                            <div key={path} className="flex items-center gap-2">
                                <ChevronRight size={12} className="text-text-tertiary" />
                                <span className={cn(
                                    "capitalize",
                                    idx === paths.length - 1 ? "font-medium text-text-primary" : "text-text-secondary"
                                )}>
                                    {path}
                                </span>
                            </div>
                        ))}
                    </nav>

                    {/* Title & Description */}
                    {title && (
                        <div className="flex items-end gap-3">
                            <h1 className="text-lg font-bold text-text-primary tracking-tight leading-none">
                                {title}
                            </h1>
                        </div>
                    )}
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-4">
                    {actions}

                    <div className="hidden md:flex items-center gap-2 pl-4 border-l border-border-subtle">
                        <div className="h-2 w-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                        <span className="text-xs font-medium text-text-secondary">System Normal</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
