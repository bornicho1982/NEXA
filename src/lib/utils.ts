import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
}

// ... existing code ...
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60 * 1000) {
        return "Just now";
    }

    // Minutes
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}m ago`;
    }

    // Hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}h ago`;
    }

    // Days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}d ago`;
    }

    // Date
    return new Date(timestamp).toLocaleDateString();
}

