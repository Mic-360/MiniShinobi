export function Input({ label, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className='block text-xs font-medium tracking-wide text-[var(--text-secondary)]'>
          {label}
        </label>
      )}
      <input
        className='flex h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] shadow-sm transition-all duration-200 placeholder:text-[var(--text-muted)] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-[var(--accent)]/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50'
        {...props}
      />
    </div>
  );
}
