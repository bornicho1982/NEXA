import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Nexa Card Component
 * Premium surface with subtle depth and rounded corners.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "nexa-card p-6 bg-bg-secondary text-text-primary",
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

/**
 * Nexa Input Component
 * Clean, accessible input with focus rings.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type = "text", ...props }, ref) => {
        return (
            <div className="relative group w-full">
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-md border border-border-medium bg-bg-tertiary/50 px-4 py-2 text-sm text-text-primary transition-all placeholder:text-text-tertiary",
                        "focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 focus:bg-bg-tertiary focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = "Input";

/**
 * Nexa Button Component
 * Professional action elements with refined states.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const variants = {
    default: "bg-gold-primary text-bg-primary font-bold hover:bg-gold-primary/90 shadow-md shadow-gold-primary/20",
    secondary: "bg-bg-tertiary text-white font-medium hover:bg-bg-tertiary/80 border border-border-medium",
    ghost: "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
    destructive: "bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error/20",
    outline: "border border-border-medium bg-transparent text-text-secondary hover:text-white hover:border-white/20",
};

const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", isLoading = false, children, ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
