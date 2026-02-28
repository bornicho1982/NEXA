"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/components";
import { ArrowRight, Shield } from "lucide-react";

export function LoginButton() {
    const { login, isLoading } = useAuth();

    return (
        <Button
            onClick={login}
            disabled={isLoading}
            size="lg"
            className="group relative h-14 px-8 text-base bg-wd-primary-600 text-bg-primary font-bold hover:bg-wd-primary-600/90 shadow-[0_0_20px_rgba(247,181,56,0.3)] hover:shadow-[0_0_30px_rgba(247,181,56,0.5)] transition-all duration-300"
        >
            <Shield className="mr-3 h-5 w-5 opacity-80" />
            <span>Initialize Uplink</span>
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />

            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-md ring-1 ring-white/20 pointer-events-none" />
        </Button>
    );
}
