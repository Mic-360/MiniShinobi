import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyled =
    'inline-flex items-center justify-center gap-2 rounded-[10px] border text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary:
      'bg-[var(--accent)] text-[#0f150f] border-[color:color-mix(in_oklab,var(--accent),white_15%)] shadow-[0_8px_28px_rgba(145,169,130,0.26)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5',
    secondary:
      'bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--border-strong)] hover:border-[var(--accent)]/60 hover:bg-[color:color-mix(in_oklab,var(--surface-elevated),var(--accent)_8%)]',
    ghost:
      'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
    danger:
      'bg-[color:color-mix(in_oklab,var(--danger),transparent_86%)] text-[var(--danger)] border-[color:color-mix(in_oklab,var(--danger),transparent_72%)] hover:bg-[color:color-mix(in_oklab,var(--danger),transparent_76%)]',
  };

  const sizes = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-10 px-4',
    lg: 'h-11 px-6 text-base',
    icon: 'h-10 w-10',
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
