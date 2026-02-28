"use client";

import { ItemCardProps } from "../ItemCard";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
    id: string;
    item: ItemCardProps['item'];
    data: Record<string, unknown>;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function DraggableItem({ id, data, children, disabled, className }: DraggableItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data,
        disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "touch-none", // Important for mobile DnD
                isDragging ? "opacity-50 z-50 cursor-grabbing" : "cursor-grab",
                className
            )}
        >
            {children}
        </div>
    );
}
