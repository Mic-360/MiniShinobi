import { cn } from '../../lib/utils';

export function Badge({ children, status, className = '' }) {
  const variants = {
    queued: 'bg-amber-500/12 text-amber-300 border-amber-400/25',
    building: 'bg-sky-500/12 text-sky-300 border-sky-400/25',
    ready:
      'bg-[var(--accent-subtle)] text-[var(--accent-hover)] border-[color:color-mix(in_oklab,var(--accent),transparent_62%)]',
    failed: 'bg-red-500/12 text-red-300 border-red-400/30',
    cancelled:
      'bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]',
    live: 'bg-[var(--accent-subtle)] text-[var(--accent-hover)] border-[color:color-mix(in_oklab,var(--accent),transparent_52%)]',
    default:
      'bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const style = variants[status] || variants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors gap-1.5',
        style,
        className,
      )}
    >
      {status === 'live' && (
        <span className='relative flex h-1.5 w-1.5 shrink-0'>
          <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500'></span>
        </span>
      )}
      <span className='capitalize'>{children || status}</span>
    </span>
  );
}
