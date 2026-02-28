"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    className?: string;
    delay?: number;
    gradient?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
}

const GRADIENT_MAP = {
    blue: "from-wd-primary-600/12 via-wd-primary-600/5 to-transparent",
    green: "from-wd-success/12 via-wd-success/5 to-transparent",
    purple: "from-wd-lilac/12 via-wd-lilac/5 to-transparent",
    orange: "from-wd-warning/12 via-wd-warning/5 to-transparent",
    red: "from-wd-danger/12 via-wd-danger/5 to-transparent",
    cyan: "from-wd-info/12 via-wd-info/5 to-transparent",
};

const ICON_COLOR_MAP = {
    blue: "bg-wd-primary-600 shadow-[0_0_15px_rgba(72,127,255,0.3)]",
    green: "bg-wd-success shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    purple: "bg-wd-lilac shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    orange: "bg-wd-warning shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    red: "bg-wd-danger shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    cyan: "bg-wd-info shadow-[0_0_15px_rgba(6,182,212,0.3)]",
};

export function StatCard({ title, value, trend, icon, className, delay = 0, gradient = "blue" }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "p-5 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-border-medium transition-all duration-300 relative overflow-hidden group",
                className
            )}
        >
            {/* WowDash Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_MAP[gradient]} pointer-events-none`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-1">{title}</h3>
                        <div className="text-2xl font-black text-text-primary tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</div>
                    </div>
                    {icon && (
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", ICON_COLOR_MAP[gradient])}>
                            {icon}
                        </div>
                    )}
                </div>

                {trend && (
                    <div className="flex items-center gap-2 text-xs font-medium mt-1">
                        <span
                            className={cn(
                                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold",
                                trend.isPositive ? "bg-wd-success/15 text-wd-success" : "bg-wd-danger/15 text-wd-danger"
                            )}
                        >
                            {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {trend.value}%
                        </span>
                        <span className="text-text-tertiary font-mono text-[10px]">{trend.label}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
