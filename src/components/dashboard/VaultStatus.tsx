import Link from "next/link";
import { cn } from "@/lib/utils";

interface VaultStatusProps {
    used: number;
    total: number;
}

export function VaultStatus({ used, total }: VaultStatusProps) {
    const isOverCapacity = used > total;
    const percentage = Math.min((used / total) * 100, 100);
    const overCount = Math.max(0, used - total);

    return (
        <div className="bg-bg-secondary rounded-xl p-6 border border-border-subtle h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Vault Status</h3>
                {isOverCapacity && (
                    <span className="px-3 py-1 rounded-full bg-status-error/20 text-status-error text-xs font-bold uppercase tracking-wider animate-pulse">
                        Over Capacity
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-end gap-2">
                    <span className={cn("text-4xl font-bold font-mono-stat", isOverCapacity ? "text-status-error" : "text-white")}>
                        {used}
                    </span>
                    <span className="text-text-tertiary mb-1 font-mono-stat">/ {total}</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                            isOverCapacity
                                ? "bg-gradient-to-r from-wd-primary-600 to-status-error"
                                : "bg-gradient-to-r from-blue-vanguard to-wd-primary-600"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">
                    {isOverCapacity ? (
                        <>
                            <span className="text-status-error font-bold">{overCount} items over capacity.</span>
                            {' '}Consider dismantling unused gear to avoid losing Postmaster items.
                        </>
                    ) : (
                        `You have ${total - used} slots remaining.`
                    )}
                </p>

                <Link
                    href="/inventory"
                    className={cn(
                        "w-full mt-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors text-center inline-block",
                        isOverCapacity
                            ? "bg-status-error/10 hover:bg-status-error/20 text-status-error"
                            : "bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-white"
                    )}
                >
                    Manage Vault
                </Link>
            </div>
        </div>
    );
}
