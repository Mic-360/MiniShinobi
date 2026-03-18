import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6'>
      <div
        className='fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />
      <div className='relative z-50 w-full max-w-2xl overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)]'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(145,169,130,0.16),transparent_44%)]' />
        <div className='relative flex items-center justify-between border-b border-[var(--border)] px-6 py-5'>
          <h2 className='text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]'>
            {title}
          </h2>
          <button
            onClick={onClose}
            className='inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
            aria-label='Close modal'
          >
            ✕
          </button>
        </div>
        <div className='relative p-6 md:p-7'>{children}</div>
      </div>
    </div>
  );
}
