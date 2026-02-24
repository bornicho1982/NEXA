"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useEffect } from "react";
import { ItemCard, ItemCardProps } from "./ItemCard";

interface VirtualGridProps {
    items: ItemCardProps['item'][];
    itemHeight: number; // Height of the card + gap
    minItemWidth: number; // Minimum width of a card
    gap?: number;
    className?: string;
}

export function VirtualGrid({ items, itemHeight, minItemWidth, gap = 8, className }: VirtualGridProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Resize Observer to get container width
    useEffect(() => {
        if (!parentRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(parentRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Calculate columns
    const columns = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
    const rows = Math.ceil(items.length / columns);

    const rowVirtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight,
        overscan: 5,
    });

    return (
        <div
            ref={parentRef}
            className={`h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bg-tertiary ${className}`}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowIndex = virtualRow.index;
                    const rowItems = items.slice(rowIndex * columns, (rowIndex + 1) * columns);

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                display: 'grid',
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                gap: `${gap}px`,
                                padding: `0 ${gap / 2}px` // slight padding compensation
                            }}
                        >
                            {rowItems.map((item, index) => {
                                if (!item) return <div key={index} className="w-full" />;
                                return (
                                    <ItemCard
                                        key={`${item.itemInstanceId || item.itemHash}-${index}`}
                                        item={item}
                                        className="w-full"
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
