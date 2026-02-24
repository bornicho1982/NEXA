"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ItemCard, ItemCardProps } from "@/components/inventory/ItemCard";

interface DroppableSlotProps {
    id: string; // Typically the bucketHash (e.g., "1498876634")
    label: string;
    acceptCategory: string; // The equipment category hash string it accepts
    item?: ItemCardProps['item'] | null;
    tooltip?: ReactNode;
    placeholderIcon?: ReactNode;
    className?: string;
    onRemove?: () => void;
}

export function DroppableSlot({ id, label, item, placeholderIcon, className, onRemove }: DroppableSlotProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        data: { accept: id } // Simple validation data
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative aspect-square rounded-sm border-2 transition-all flex items-center justify-center p-0.5",
                isOver ? "border-gold-primary bg-gold-primary/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "border-border-medium bg-bg-tertiary/50",
                className
            )}
        >
            {item ? (
                <div className="relative w-full h-full group">
                    <ItemCard item={item} />
                    {onRemove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="absolute -top-2 -right-2 bg-status-error text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-text-tertiary opacity-50">
                    {placeholderIcon}
                    <span className="text-[10px] uppercase font-bold tracking-widest mt-1">{label}</span>
                </div>
            )}

            {/* Label Overlay when item is equipped */}
            {item && (
                <span className="absolute -bottom-6 text-[10px] uppercase font-bold tracking-widest text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                </span>
            )}
        </div>
    );
}
