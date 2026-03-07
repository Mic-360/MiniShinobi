import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { useAuth } from '../context/AuthContext';

export function Layout({ children, title, subtitle }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  const isDashboard =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/project') ||
    location.pathname.startsWith('/deployment');

  return (
    <div className='flex flex-col min-h-screen bg-[#09090b] text-zinc-400'>
      <header
        className={`sticky top-0 z-40 bg-[#09090b] border-b border-zinc-800 transition-colors ${isScrolled ? 'bg-[#09090b]/80 backdrop-blur-md' : ''
          }`}
      >
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-8'>
            <Link
              to='/dashboard'
              className='flex items-center gap-2.5 hover:opacity-80 transition-opacity'
            >
              <img
                src='/mini-shinobi.png'
                alt='MiniShinobi'
                className='h-6 w-6 object-contain'
              />
              <span className='font-semibold text-white tracking-tight'>MiniShinobi</span>
            </Link>

            {user && isDashboard && (
              <nav className='flex items-center gap-6'>
                <Link
                  to='/dashboard'
                  className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard'
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>

          {user && (
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <span className='text-xs text-zinc-500 hidden sm:inline-block'>{user.username}</span>
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className='w-7 h-7 rounded-full border border-zinc-800'
                />
              </div>
              <button
                onClick={handleLogout}
                className='text-xs font-medium text-zinc-500 hover:text-white transition-colors py-1.5 px-3 border border-zinc-800 rounded-md hover:bg-zinc-800/50'
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className='flex-1 w-full max-w-6xl mx-auto px-6 py-10'>
        {title && (
          <div className='mb-10'>
            <h1 className='text-2xl font-semibold text-white mb-2'>{title}</h1>
            {subtitle && (
              <p className='text-sm text-zinc-500 max-w-2xl'>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className='border-t border-zinc-900 bg-black/20 py-8 mt-auto'>
        <div className='max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-zinc-600 text-xs'>
            © 2026 MiniShinobi · Self-hosted micro-PaaS
          </p>
          <div className='flex items-center gap-6'>
            <a href='#' className='text-zinc-600 hover:text-zinc-400 text-xs transition-colors'>Documentation</a>
            <a href='#' className='text-zinc-600 hover:text-zinc-400 text-xs transition-colors'>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
