"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "vertical" | "horizontal";
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, orientation = "vertical", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative overflow-hidden", // Container
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        "h-full w-full",
                        orientation === "vertical" ? "overflow-y-auto overflow-x-hidden" : "overflow-x-auto overflow-y-hidden",
                        // Custom Scrollbar Styling (Webkit)
                        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bg-tertiary hover:scrollbar-thumb-gold-primary/50"
                    )}
                >
                    {children}
                </div>
            </div>
        );
    }
);
ScrollArea.displayName = "ScrollArea";
