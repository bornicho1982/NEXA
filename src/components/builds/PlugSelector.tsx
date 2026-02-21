"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PlugOption {
    hash: number;
    name: string;
    icon?: string;
    description: string;
    statBonuses?: Record<string, { value: number }>;
}

interface PlugSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: PlugOption[];
    onSelect: (plugHash: number) => void;
    className?: string;
}

export function PlugSelector({ isOpen, onClose, title, options, onSelect, className }: PlugSelectorProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-bg-secondary border border-border-medium rounded-lg shadow-2xl z-50 flex flex-col max-h-[85vh]",
                            className
                        )}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
                            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {options.map((opt) => (
                                <button
                                    key={opt.hash}
                                    onClick={() => { onSelect(opt.hash); onClose(); }}
                                    className="flex items-start gap-3 p-3 rounded-md bg-bg-tertiary border border-transparent hover:border-gold-primary/50 hover:bg-bg-tertiary/80 transition-all text-left group"
                                >
                                    {opt.icon && (
                                        <div className="relative w-10 h-10 shrink-0 bg-black/50 rounded-sm overflow-hidden">
                                            <Image
                                                src={`https://www.bungie.net${opt.icon}`}
                                                alt={opt.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-text-primary group-hover:text-gold-primary transition-colors">{opt.name}</div>
                                        <div className="text-xs text-text-secondary line-clamp-2 mt-1">{opt.description}</div>
                                        {opt.statBonuses && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {Object.entries(opt.statBonuses).map(([statHash, data]) => (
                                                    <span key={statHash} className={cn("text-[10px] font-mono", data.value > 0 ? "text-green-400" : "text-red-400")}>
                                                        {data.value > 0 ? "+" : ""}{data.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
