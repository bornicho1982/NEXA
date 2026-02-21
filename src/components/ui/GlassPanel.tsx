import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassPanelProps {
    children: ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
    hoverEffect?: boolean;
}

export function GlassPanel({
    children,
    className,
    intensity = "medium",
    hoverEffect = false
}: GlassPanelProps) {
    const blurMap = {
        low: "backdrop-blur-sm bg-black/40",
        medium: "backdrop-blur-md bg-black/60",
        high: "backdrop-blur-xl bg-black/80",
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border border-white/10 shadow-xl",
                blurMap[intensity],
                hoverEffect && "transition-all duration-300 hover:border-white/20 hover:bg-black/50 hover:shadow-2xl hover:scale-[1.01]",
                className
            )}
        >
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
                style={{ backgroundImage: `url("/noise.png")` }} // Assumes noise asset exists or will serve fallback
            />

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Shine Effect on Top Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        </div>
    );
}
