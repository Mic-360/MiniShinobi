export function Input({ label, className = '', ...props }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && <label className="block text-xs font-medium text-zinc-400">{label}</label>}
            <input
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...props}
            />
        </div>
    );
}
