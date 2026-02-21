"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface DirectorNodeProps {
    title: string;
    subtitle?: string;
    href: string;
    icon?: React.ReactNode;
    variant?: "traveler" | "darkness" | "vex" | "standard";
    size?: "large" | "medium" | "small";
    className?: string;
}

export function DirectorNode({
    title,
    subtitle,
    href,
    icon,
    variant = "standard",
    size = "medium",
    className
}: DirectorNodeProps) {
    const ref = useRef<HTMLAnchorElement>(null);
    const { play } = useSoundEffect();

    // 3D Tilt Logic (borrowed & simplified from ItemCard)
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;
        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Variant Styles
    const variantStyles = {
        traveler: "bg-white/10 border-white/20 hover:border-white/40 shadow-[0_0_50px_rgba(255,255,255,0.1)]",
        darkness: "bg-orange-950/20 border-orange-500/20 hover:border-orange-500/40 shadow-[0_0_50px_rgba(234,88,12,0.1)]",
        vex: "bg-teal-900/20 border-teal-500/20 hover:border-teal-500/40 shadow-[0_0_50px_rgba(20,184,166,0.1)]",
        standard: "bg-bg-secondary border-border-subtle hover:border-border-medium"
    };

    // Size Styles
    const sizeStyles = {
        large: "w-64 h-64 md:w-80 md:h-80 text-2xl",
        medium: "w-48 h-48 md:w-56 md:h-56 text-xl",
        small: "w-32 h-32 md:w-40 md:h-40 text-lg"
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, z: 50 }}
            className={cn("relative perspective-1000 group", className)}
        >
            <Link
                ref={ref}
                href={href}
                onClick={() => play("click")}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "flex flex-col items-center justify-center text-center p-6 rounded-full aspect-square backdrop-blur-md transition-colors duration-300 border relative overflow-hidden",
                    variantStyles[variant],
                    sizeStyles[size]
                )}
            >
                {/* Variant-specific Background Effects */}
                {variant === "traveler" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-200/5 to-transparent pointer-events-none" />
                )}
                {variant === "darkness" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                )}
                {variant === "vex" && ( // Grid effect
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
                )}

                {/* Content Layer (Floating) */}
                <div style={{ transform: "translateZ(30px)" }} className="relative z-10 flex flex-col items-center gap-3">
                    {icon && <div className={cn("text-current opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300",
                        variant === "traveler" ? "text-cyan-200" :
                            variant === "darkness" ? "text-orange-400" :
                                variant === "vex" ? "text-teal-300" : "text-white"
                    )}>{icon}</div>}

                    <h3 className={cn("font-bold tracking-tight text-white drop-shadow-lg")}>{title}</h3>

                    {subtitle && (
                        <p className={cn("text-xs uppercase tracking-widest font-bold opacity-60",
                            variant === "traveler" ? "text-cyan-100" :
                                variant === "darkness" ? "text-orange-200" : "text-text-secondary"
                        )}>{subtitle}</p>
                    )}
                </div>

                {/* Glow Ring */}
                <div className={cn("absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10",
                    variant === "traveler" ? "bg-cyan-400/20" :
                        variant === "darkness" ? "bg-orange-500/20" :
                            variant === "vex" ? "bg-teal-500/20" : "bg-white/10"
                )} />

            </Link>
        </motion.div>
    );
}
