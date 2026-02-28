"use client";

import { useDraggable } from "@dnd-kit/core";
import { ItemCard, ItemCardProps } from "@/components/inventory/ItemCard";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
    id: string;
    item?: ItemCardProps['item'];
    disabled?: boolean;
}

export function DraggableItem({ id, item, disabled }: DraggableItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: item,
        disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("touch-none", isDragging ? "opacity-50" : "")}>
            <ItemCard item={item} className={isDragging ? "ring-2 ring-wd-primary-600 shadow-2xl" : ""} />
        </div>
    );
}
