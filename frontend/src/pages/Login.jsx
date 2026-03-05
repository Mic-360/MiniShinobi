import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen px-4 py-8 relative overflow-hidden bg-bg-primary'>
      {/* Background decorations */}
      <div className='absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-5 bg-gradient-to-b from-sage to-transparent animate-float'></div>
      <div className='absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-5 bg-gradient-to-b from-sage to-transparent animate-float-reverse'></div>

      <div className='relative z-10 w-full max-w-md'>
        <div className='bg-bg-secondary border border-bg-tertiary rounded-3xl px-10 py-12 shadow-xl animate-slide-up'>
          {/* Header */}
          <div className='text-center mb-10'>
            <div className='inline-block text-5xl text-sage mb-4 animate-slide-down'>
              ◆
            </div>
            <h1 className='text-3xl font-bold font-display mb-2'>
              MiniShinobi
            </h1>
            <p className='text-text-secondary text-base leading-relaxed'>
              Self-hosted micro-PaaS for Git-based deployments
            </p>
          </div>

          {/* Features */}
          <div className='space-y-4 mb-8 animate-fade-in'>
            <div className='flex gap-4 p-4 bg-bg-tertiary border border-bg-hover rounded-xl hover:bg-bg-hover hover:border-sage transition-all duration-150'>
              <div className='flex-shrink-0 text-2xl'>⚡</div>
              <div>
                <h4 className='font-semibold text-text-primary text-base mb-1'>
                  Deploy from Git
                </h4>
                <p className='text-text-secondary text-sm'>
                  Push to GitHub, MiniShinobi builds and deploys automatically
                </p>
              </div>
            </div>

            <div className='flex gap-4 p-4 bg-bg-tertiary border border-bg-hover rounded-xl hover:bg-bg-hover hover:border-sage transition-all duration-150'>
              <div className='flex-shrink-0 text-2xl'>🌐</div>
              <div>
                <h4 className='font-semibold text-text-primary text-base mb-1'>
                  Global Access
                </h4>
                <p className='text-text-secondary text-sm'>
                  Exposed via Cloudflare Tunnel on your custom domain
                </p>
              </div>
            </div>

            <div className='flex gap-4 p-4 bg-bg-tertiary border border-bg-hover rounded-xl hover:bg-bg-hover hover:border-sage transition-all duration-150'>
              <div className='flex-shrink-0 text-2xl'>📱</div>
              <div>
                <h4 className='font-semibold text-text-primary text-base mb-1'>
                  Runs Everywhere
                </h4>
                <p className='text-text-secondary text-sm'>
                  Works on Android (Termux), Raspberry Pi, or any Linux box
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='flex items-center gap-4 mb-8'>
            <div className='flex-1 h-px bg-bg-tertiary'></div>
          </div>

          {/* GitHub Button */}
          <button
            onClick={() => (window.location.href = '/auth/github')}
            className='w-full py-4 px-6 bg-gradient-to-r from-sage to-sage-dark text-bg-primary rounded-xl font-display font-semibold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 shadow-sage hover:shadow-sage-lg'
          >
            <svg
              className='w-5 h-5'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z' />
            </svg>
            Continue with GitHub
          </button>

          {/* Footer */}
          <div className='text-center mt-8 pt-8 border-t border-bg-tertiary'>
            <p className='text-text-tertiary text-sm'>
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
