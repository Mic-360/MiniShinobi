import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { useAuth } from '../context/AuthContext';

export function Layout({ children, title, subtitle, variant = 'app' }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isLanding = variant === 'landing';

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
    <div className='flex flex-col min-h-screen min-w-screen bg-[#0B0F0C] text-[#A8B5AE]'>
      <header
        className={`${isLanding ? 'fixed' : 'sticky'} top-0 z-40 bg-[#0B0F0C] border-b border-[#1F2A24] transition-all ${
          isScrolled ? 'bg-[#0B0F0C]/80 backdrop-blur-md' : ''
        }`}
      >
        <div
          className={`${isLanding ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-6 h-16 flex items-center justify-between gap-4`}
        >
          <div className='flex items-center gap-8'>
            <Link
              to={isLanding ? '/' : '/dashboard'}
              className='flex items-center gap-2.5 hover:opacity-80 transition-opacity'
            >
              <img
                src='/mini-shinobi.png'
                alt='MiniShinobi'
                className='h-6 w-6 object-contain'
              />
              <span className='font-semibold text-white tracking-tight'>
                MiniShinobi
              </span>
            </Link>

            {isLanding && (
              <nav className='hidden md:flex items-center gap-6'>
                <a
                  href='#features'
                  className='text-sm text-[#A8B5AE] hover:text-[#9CAF88] transition-colors'
                >
                  Features
                </a>
                <a
                  href='#how-it-works'
                  className='text-sm text-[#A8B5AE] hover:text-[#9CAF88] transition-colors'
                >
                  How it Works
                </a>
              </nav>
            )}

            {!isLanding && user && isDashboard && (
              <nav className='flex items-center gap-6'>
                <Link
                  to='/dashboard'
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-white'
                      : 'text-[#A8B5AE] hover:text-[#9CAF88]'
                  }`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>

          {isLanding ? (
            <div className='flex items-center gap-3'>
              {user ? (
                <Link
                  to='/dashboard'
                  className='text-sm font-medium text-[#A8B5AE] hover:text-white transition-colors'
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to='/login'
                  className='hidden sm:inline-flex text-sm font-medium text-[#A8B5AE] hover:text-white transition-colors'
                >
                  Login
                </Link>
              )}
              <a
                href='/auth/github'
                className='bg-[#9CAF88] text-[#0B0F0C] hover:bg-[#a8c29a] text-sm font-medium px-4 py-2 rounded-lg transition-all'
              >
                Get Started
              </a>
            </div>
          ) : (
            user && (
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-3'>
                  <span className='text-xs text-[#A8B5AE] hidden sm:inline-block'>
                    {user.username}
                  </span>
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className='w-7 h-7 rounded-full border border-[#1F2A24]'
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className='text-xs font-medium text-[#A8B5AE] hover:text-white transition-colors py-1.5 px-3 border border-[#1F2A24] rounded-md hover:bg-[#121715]'
                >
                  Sign out
                </button>
              </div>
            )
          )}
        </div>
      </header>

      <main
        className={`${isLanding ? 'flex-1 w-full' : 'flex-1 w-full max-w-6xl mx-auto px-6 py-10'}`}
      >
        {title && (
          <div className='mb-10'>
            <h1 className='text-2xl font-semibold text-white mb-2'>{title}</h1>
            {subtitle && (
              <p className='text-sm text-[#A8B5AE] max-w-2xl'>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className='relative border-t border-[#1F2A24] py-16 px-6 bg-[#0B0F0C]'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-4 gap-12 mb-12'>
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <img
                  src='/mini-shinobi.png'
                  alt='MiniShinobi'
                  className='h-5 w-5'
                />
                <span className='font-semibold text-white'>MiniShinobi</span>
              </div>
              <p className='text-sm text-[#A8B5AE]'>
                Decentralized edge computing for developers.
              </p>
            </div>

            <div>
              <h4 className='font-semibold text-white mb-4'>Product</h4>
              <ul className='space-y-2 text-sm text-[#A8B5AE]'>
                <li>
                  <a
                    href='/#features'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='/#how-it-works'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold text-white mb-4'>Resources</h4>
              <ul className='space-y-2 text-sm text-[#A8B5AE]'>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold text-white mb-4'>Connect</h4>
              <ul className='space-y-2 text-sm text-[#A8B5AE]'>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-[#9CAF88] transition-colors'
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-[#1F2A24] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#A8B5AE]'>
            <p>© 2026 MiniShinobi. All rights reserved.</p>
            <div className='flex gap-6 mt-4 md:mt-0'>
              <a
                href='#'
                className='hover:text-[#9CAF88] transition-colors'
              >
                Privacy
              </a>
              <a
                href='#'
                className='hover:text-[#9CAF88] transition-colors'
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
