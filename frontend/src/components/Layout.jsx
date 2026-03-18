import {
  ChevronLeft,
  FolderCode,
  LayoutGrid,
  Menu,
  MoonStar,
  SunMedium,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

const APP_NAV = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutGrid,
    matcher: (path) =>
      path === '/dashboard' ||
      path.startsWith('/project') ||
      path.startsWith('/deployment'),
  },
  {
    label: 'Projects',
    to: '/dashboard',
    icon: FolderCode,
    matcher: (path) => path === '/dashboard',
  },
];

const THEME_KEY = 'minishinobi-theme';

export function Layout({
  children,
  title,
  subtitle,
  actions,
  variant = 'app',
}) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(THEME_KEY) || 'dark';
  });
  const isLanding = variant === 'landing';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    setIsMobileSidebarOpen(false);
    navigate('/');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  const pageTitle =
    title ||
    (location.pathname.startsWith('/deployment')
      ? 'Deployment'
      : location.pathname.startsWith('/project')
        ? 'Project'
        : 'Dashboard');

  const pageSubtitle =
    subtitle ||
    'Calm power for edge-native deployments, with every detail in your control.';

  const ThemeIcon = theme === 'light' ? MoonStar : SunMedium;

  if (!isLanding) {
    return (
      <div className='min-h-screen bg-[var(--bg)] text-[var(--text-primary)]'>
        <div className='pointer-events-none fixed inset-0 ms-grid-bg opacity-40' />

        {isMobileSidebarOpen && (
          <button
            className='fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden'
            aria-label='Close navigation overlay'
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[color:color-mix(in_oklab,var(--bg-elevated),transparent_8%)] transition-all duration-200 lg:translate-x-0 ${
            isSidebarCollapsed ? 'w-[86px]' : 'w-[252px]'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:flex`}
        >
          <div className='flex h-16 items-center justify-between border-b border-[var(--border)] px-4'>
            <Link
              to='/dashboard'
              className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}
            >
              <img
                src='/mini-shinobi.png'
                alt='MiniShinobi'
                className='h-7 w-7 rounded-md'
              />
              {!isSidebarCollapsed && (
                <div>
                  <p className='text-sm font-semibold tracking-tight'>
                    MiniShinobi
                  </p>
                  <p className='text-[11px] text-[var(--text-muted)]'>
                    Micro‑PaaS Control
                  </p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className='hidden h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] lg:inline-flex'
              aria-label='Toggle sidebar'
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className='inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-muted)] lg:hidden'
              aria-label='Close sidebar'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <nav className='flex-1 space-y-2 p-3'>
            {APP_NAV.map((item) => {
              const Icon = item.icon;
              const active = item.matcher(location.pathname);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`group flex items-center rounded-[10px] border px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'border-[color:color-mix(in_oklab,var(--accent),transparent_58%)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-2.5'}`}
                >
                  <Icon className='h-4 w-4 shrink-0' />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className='border-t border-[var(--border)] p-3'>
            <div
              className={`rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-2.5 ${isSidebarCollapsed ? 'text-center' : ''}`}
            >
              <p className='text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]'>
                Node Health
              </p>
              <p className='mt-1 text-sm font-medium text-[var(--text-primary)]'>
                Stable · 99.97%
              </p>
            </div>
          </div>
        </aside>

        <div
          className={`${isSidebarCollapsed ? 'lg:pl-[86px]' : 'lg:pl-[252px]'} min-h-screen transition-all duration-200`}
        >
          <header
            className={`sticky top-0 z-30 border-b border-[var(--border)] bg-[color:color-mix(in_oklab,var(--bg),transparent_15%)] px-4 backdrop-blur-xl md:px-6 lg:px-8 ${
              isScrolled ? 'shadow-[0_8px_28px_rgba(0,0,0,0.2)]' : ''
            }`}
          >
            <div className='mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] lg:hidden'
                  aria-label='Open sidebar'
                >
                  <Menu className='h-4 w-4' />
                </button>
                <div>
                  <p className='text-sm font-semibold tracking-tight text-[var(--text-primary)]'>
                    {pageTitle}
                  </p>
                  <p className='hidden text-xs text-[var(--text-muted)] md:block'>
                    {pageSubtitle}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 md:gap-3'>
                {actions}
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={toggleTheme}
                  aria-label='Toggle theme'
                  title='Toggle dark/light mode'
                >
                  <ThemeIcon className='h-4 w-4' />
                </Button>

                {user && (
                  <div className='flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5'>
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className='h-7 w-7 rounded-full border border-[var(--border-strong)]'
                    />
                    <span className='hidden max-w-[120px] truncate text-xs text-[var(--text-secondary)] sm:inline-block'>
                      {user.username}
                    </span>
                    <Button
                      onClick={handleLogout}
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-[11px]'
                    >
                      Sign out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className='ms-page px-4 py-6 md:px-6 md:py-8 lg:px-8'>
            <div className='mx-auto w-full max-w-[1160px]'>{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex min-h-screen min-w-screen flex-col bg-[var(--bg)] text-[var(--text-secondary)]'>
      <div className='pointer-events-none absolute inset-0 ms-grid-bg opacity-55' />
      <header
        className={`fixed top-0 z-40 w-full border-b border-[var(--border)] transition-all ${
          isScrolled
            ? 'bg-[color:color-mix(in_oklab,var(--bg),transparent_14%)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex items-center gap-2.5 transition-opacity hover:opacity-85'
            >
              <img
                src='/mini-shinobi.png'
                alt='MiniShinobi'
                className='h-7 w-7 object-contain'
              />
              <span className='font-semibold tracking-tight text-[var(--text-primary)]'>
                MiniShinobi
              </span>
            </Link>

            <nav className='hidden items-center gap-6 md:flex'>
              <a
                href='#features'
                className='text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]'
              >
                How it Works
              </a>
            </nav>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              aria-label='Toggle theme'
            >
              <ThemeIcon className='h-4 w-4' />
            </Button>
            {user ? (
              <Link
                to='/dashboard'
                className='text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]'
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to='/login'
                className='hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex'
              >
                Login
              </Link>
            )}
            <a
              href='/auth/github'
              className='rounded-[10px] border border-[color:color-mix(in_oklab,var(--accent),white_15%)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#0f150f] transition-all duration-200 hover:bg-[var(--accent-hover)]'
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className='relative z-10 flex-1 pt-16'>{children}</main>

      <footer className='relative z-10 border-t border-[var(--border)] bg-[var(--bg)] px-6 py-14'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-12 grid gap-10 md:grid-cols-4'>
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <img
                  src='/mini-shinobi.png'
                  alt='MiniShinobi'
                  className='h-5 w-5'
                />
                <span className='font-semibold text-[var(--text-primary)]'>
                  MiniShinobi
                </span>
              </div>
              <p className='text-sm text-[var(--text-secondary)]'>
                Decentralized edge computing for developers.
              </p>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-[var(--text-primary)]'>
                Product
              </h4>
              <ul className='space-y-2 text-sm text-[var(--text-secondary)]'>
                <li>
                  <a
                    href='/#features'
                    className='transition-colors hover:text-[var(--text-primary)]'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='/#how-it-works'
                    className='transition-colors hover:text-[var(--text-primary)]'
                  >
                    How it Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-[var(--text-primary)]'>
                Resources
              </h4>
              <ul className='space-y-2 text-sm text-[var(--text-secondary)]'>
                <li>
                  <a
                    href='#'
                    className='transition-colors hover:text-[var(--text-primary)]'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='https://github.com/Mic-360/MiniShinobi'
                    className='transition-colors hover:text-[var(--text-primary)]'
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-[var(--text-primary)]'>
                Built for
              </h4>
              <ul className='space-y-2 text-sm text-[var(--text-secondary)]'>
                <li>Home labs</li>
                <li>Indie teams</li>
                <li>Edge-native builders</li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col items-center justify-between border-t border-[var(--border)] pt-8 text-sm text-[var(--text-secondary)] md:flex-row'>
            <p>© 2026 MiniShinobi. All rights reserved.</p>
            <p className='mt-4 text-xs text-[var(--text-muted)] md:mt-0'>
              Calm power. Invisible complexity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
