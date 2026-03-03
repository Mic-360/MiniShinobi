export function Badge({ children, status, className = '' }) {
    const variants = {
        queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/15',
        building: 'bg-blue-500/10 text-[#3B82F6] border-blue-500/20',
        ready: 'bg-emerald-500/10 text-[#10B981] border-emerald-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
        cancelled: 'bg-[#111] text-[#737373] border-[#222]',
        live: 'bg-[#0A0A0A] text-[#10B981] border-[#10B981]/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        default: 'bg-[#0A0A0A] text-[#737373] border-[#1A1A1A]'
    };

    const style = variants[status] || variants.default;

    return (
        <span className={`inline-flex items-center rounded-full border px-[0.45rem] py-0.5 text-[10px] font-bold tracking-wider transition-colors uppercase gap-1.5 ${style} ${className}`}>
            {status === 'live' && <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span></span>}
            {children || status}
        </span>
    );
}
