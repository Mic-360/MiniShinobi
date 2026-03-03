export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    const baseStyled = "inline-flex items-center justify-center rounded-[4px] font-[500] tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
        primary: "bg-[#FAFAFA] text-[#050505] hover:bg-[#E5E5E5] shadow-[0_0_10px_rgba(255,255,255,0.05)]",
        secondary: "bg-[#0A0A0A] text-[#FAFAFA] hover:bg-[#111] hover:border-[#333] border border-[#1A1A1A] shadow-sm",
        ghost: "hover:bg-[#111] hover:text-[#FAFAFA] text-[#737373] border border-transparent",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/15 border border-red-500/20",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-8 text-sm",
        icon: "h-9 w-9",
    };

    return (
        <button
            className={`${baseStyled} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
