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
      setIsScrolled(window.scrollY > 8);
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
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-bg-primary to-[#0a0e15]'>
      <header
        className={`sticky top-0 z-40 border-b border-bg-tertiary bg-black/85 backdrop-blur-xl transition-all duration-250 ${isScrolled ? 'shadow-lg border-bg-hover' : ''}`}
      >
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between gap-8'>
            <Link
              to='/dashboard'
              className='flex items-center gap-3 font-display text-xl font-bold text-text-primary hover:text-sage transition-colors'
            >
              <div className='text-2xl text-sage'>◆</div>
              <span>MiniShinobi</span>
            </Link>

            {user && isDashboard && (
              <nav className='flex gap-8'>
                <Link
                  to='/dashboard'
                  className={`font-medium transition-colors duration-150 relative ${location.pathname === '/dashboard' ? 'text-sage' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Projects
                  {location.pathname === '/dashboard' && (
                    <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-sage'></span>
                  )}
                </Link>
              </nav>
            )}

            {user && (
              <div className='flex items-center gap-6 ml-auto'>
                <div className='flex items-center'>
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className='w-9 h-9 rounded-full border border-sage-wash hover:border-sage transition-colors cursor-pointer shadow-sage'
                    title={user.username}
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className='px-5 py-2 bg-transparent text-text-secondary border border-text-tertiary rounded-lg font-medium text-sm hover:text-text-primary hover:border-sage hover:bg-sage-wash transition-all duration-150'
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1 w-full max-w-7xl mx-auto px-6 py-8'>
        {title && (
          <section className='mb-12 animate-slide-down'>
            <div className='flex items-start justify-between gap-8'>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-text-primary to-sage bg-clip-text text-transparent mb-2'>
                  {title}
                </h1>
                {subtitle && (
                  <p className='text-text-secondary text-lg'>{subtitle}</p>
                )}
              </div>
            </div>
          </section>
        )}
        {children}
      </main>

      <footer className='border-t border-bg-tertiary bg-black/60 py-8 mt-auto'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <p className='text-text-tertiary text-sm'>
            © 2026 MiniShinobi · Self-hosted micro-PaaS
          </p>
        </div>
      </footer>
    </div>
  );
}
