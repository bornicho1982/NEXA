"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell"; // New Component

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-bg-primary text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold-primary border-t-transparent shadow-[0_0_20px_rgba(234,179,8,0.3)]" />
                    <p className="animate-pulse text-gold-primary font-mono-stat tracking-widest text-xs">ESTABLISHING UPLINK...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AppShell>
            {children}
        </AppShell>
    );
}
