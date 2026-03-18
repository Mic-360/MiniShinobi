import { cn } from '../../lib/utils';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'rounded-[10px] bg-[color:color-mix(in_oklab,var(--surface-muted),transparent_6%)] animate-pulse',
        className,
      )}
    />
  );
}
