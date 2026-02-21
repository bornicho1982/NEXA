"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableZoneProps {
    id: string;
    data: any;
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
}

export function DroppableZone({ id, data, children, className, activeClassName }: DroppableZoneProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                className,
                isOver && (activeClassName || "ring-2 ring-gold-primary ring-offset-2 ring-offset-black bg-white/5")
            )}
        >
            {children}
        </div>
    );
}
