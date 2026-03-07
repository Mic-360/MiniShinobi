import { cn } from "../../lib/utils";

export function Badge({ children, status, className = "" }) {
    const variants = {
        queued: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        building: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        failed: "bg-red-500/10 text-red-500 border-red-500/20",
        cancelled: "bg-zinc-800 text-zinc-400 border-zinc-700",
        live: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        default: "bg-zinc-900 text-zinc-400 border-zinc-800",
    };

    const style = variants[status] || variants.default;

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-[4px] border px-1.5 py-0.5 text-[11px] font-medium transition-colors gap-1.5",
                style,
                className
            )}
        >
            {status === "live" && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
            )}
            <span className="capitalize">{children || status}</span>
        </span>
    );
}
