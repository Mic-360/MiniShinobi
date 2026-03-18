import { ArrowLeft, Github, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-4'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute left-[12%] top-[10%] h-64 w-64 rounded-full bg-[var(--accent)]/12 blur-[110px]' />
        <div className='absolute bottom-[-40px] right-[12%] h-72 w-72 rounded-full bg-[var(--accent)]/9 blur-[120px]' />
      </div>

      <div className='relative z-10 w-full max-w-sm'>
        <div className='ms-surface p-9 text-center md:p-10'>
          <div className='mb-8'>
            <img
              src='/mini-shinobi.png'
              alt='MiniShinobi'
              className='mb-4 inline-block h-12 w-12'
            />
            <h1 className='text-xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]'>
              Sign in to MiniShinobi
            </h1>
            <p className='mt-2 text-sm text-[var(--text-secondary)]'>
              Secure access to your edge deployment control plane.
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = '/auth/github')}
            className='flex h-11 w-full items-center justify-center gap-2 px-6'
          >
            <Github className='h-4 w-4' />
            Continue with GitHub
          </Button>

          <div className='mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]'>
            <ShieldCheck className='h-3.5 w-3.5 text-[var(--accent-hover)]' />
            OAuth only · no password stored
          </div>

          <div className='mt-7 border-t border-[var(--border)] pt-7'>
            <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]'>
              Micro‑PaaS · Home Lab Edition
            </p>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <Link
            to='/'
            className='inline-flex items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]'
          >
            <ArrowLeft className='h-3 w-3' />
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}
