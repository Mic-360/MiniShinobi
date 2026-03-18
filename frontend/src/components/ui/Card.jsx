import { cn } from '../../lib/utils';

export function Card({ className = '', children, ...props }) {
  return (
    <section
      className={cn('ms-surface p-5 md:p-6', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={cn('mb-4 space-y-1', className)}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return (
    <h3
      className={cn(
        'text-base font-semibold tracking-tight text-[var(--text-primary)]',
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children }) {
  return (
    <p className={cn('text-sm text-[var(--text-secondary)]', className)}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
