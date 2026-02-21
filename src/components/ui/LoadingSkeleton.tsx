import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string; // Allow overrides
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-bg-tertiary", className)}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="nexa-card p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}
