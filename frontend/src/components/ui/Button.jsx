import { cn } from "../../lib/utils";

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}) {
    const baseStyled = "inline-flex items-center justify-center rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "bg-white text-black hover:bg-zinc-200 border border-zinc-200",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
        ghost: "bg-transparent text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-9 w-9",
    };

    return (
        <button
            className={cn(baseStyled, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
