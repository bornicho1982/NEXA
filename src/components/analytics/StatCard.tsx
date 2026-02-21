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
}

export function StatCard({ title, value, trend, icon, className, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "p-6 rounded-lg bg-bg-secondary border border-border-subtle hover:border-border-medium transition-colors relative overflow-hidden group",
                className
            )}
        >
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-primary/10 transition-colors" />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">{title}</h3>
                    <div className="text-3xl font-bold text-text-primary font-mono">{value}</div>
                </div>
                {icon && (
                    <div className="p-2 rounded-md bg-bg-tertiary text-gold-primary/80">
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="relative z-10 mt-4 flex items-center gap-2 text-xs font-medium">
                    <span
                        className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded",
                            trend.isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        )}
                    >
                        {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend.value}%
                    </span>
                    <span className="text-text-tertiary">{trend.label}</span>
                </div>
            )}
        </motion.div>
    );
}
