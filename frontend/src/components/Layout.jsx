import {
  FolderCode,
  LayoutGrid,
  Menu,
  Moon,
  Sun,
  X,
  Triangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

const APP_NAV = [
  {
    label: 'Overview',
    to: '/dashboard',
    icon: LayoutGrid,
    matcher: (path) =>
      path === '/dashboard' ||
      path.startsWith('/project') ||
      path.startsWith('/deployment'),
  },
  {
    label: 'Integrations',
    to: '#',
    icon: FolderCode,
    matcher: (path) => false,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const pageTitle =
    title ||
    (location.pathname.startsWith('/deployment')
      ? 'Deployment'
      : location.pathname.startsWith('/project')
        ? 'Project'
        : 'Overview');

  const pageSubtitle = subtitle;

  if (!isLanding) {
    return (
      <div className="min-h-screen bg-black text-white font-['Outfit'] selection:bg-white/30">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex h-16 items-center px-4 md:px-8 max-w-[1400px] mx-auto justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center">
                   <Triangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-black fill-black rotate-180" />
                </div>
                <span className="font-semibold tracking-tight text-white text-base md:text-lg">MiniShinobi</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-1 ml-4 border-l border-white/10 pl-6">
                 {APP_NAV.map((item) => {
                   const active = item.matcher(location.pathname);
                   return (
                     <Link
                       key={item.label}
                       to={item.to}
                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                         active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                       }`}
                     >
                       {item.label}
                     </Link>
                   )
                 })}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block">{actions}</div>
              {user && (
                <div className="flex items-center gap-3 pl-0 md:pl-4 md:border-l border-white/10">
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-7 w-7 md:h-8 md:w-8 rounded-full border border-white/20"
                  />
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="hidden md:block text-xs text-gray-400 hover:text-white h-8 px-3"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-4 space-y-4">
               <nav className="flex flex-col space-y-2">
                 {APP_NAV.map((item) => {
                   const active = item.matcher(location.pathname);
                   return (
                     <Link
                       key={item.label}
                       to={item.to}
                       onClick={() => setIsMobileMenuOpen(false)}
                       className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                         active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                       }`}
                     >
                       {item.label}
                     </Link>
                   )
                 })}
                 <button
                   onClick={handleLogout}
                   className="px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 text-left"
                 >
                   Logout
                 </button>
               </nav>
            </div>
          )}
        </header>

        <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight break-all md:break-normal">{pageTitle}</h1>
            {pageSubtitle && <p className="text-gray-400 mt-2 text-sm max-w-2xl">{pageSubtitle}</p>}
          </div>
          <div className="block md:hidden mb-6 w-full overflow-x-auto pb-2">{actions}</div>
          {children}
        </main>
      </div>
    );
  }

  // Landing Variant (Vercel-like Minimalist Header/Footer)
  return (
    <div className="relative flex min-h-screen flex-col bg-black text-gray-400 font-['Outfit'] selection:bg-white/30">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3'
            : 'bg-transparent py-4 md:py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 relative z-10">
             <div className="w-6 h-6 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center">
                <Triangle className="w-3 h-3 md:w-3.5 md:h-3.5 text-black fill-black rotate-180" />
             </div>
            <span className="font-semibold tracking-tight text-white text-base md:text-lg">MiniShinobi</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-white">Features</a>
            <a href="#architecture" className="text-sm font-medium transition-colors hover:text-white">Architecture</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-white">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium transition-colors hover:text-white">
                Log In
              </Link>
            )}
            <a
              href="/auth/github"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
            >
              Deploy
            </a>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white relative z-10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Landing Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full md:hidden border-b border-white/10 bg-black/95 backdrop-blur-xl px-4 py-6 shadow-2xl flex flex-col gap-4 h-[calc(100vh-60px)] overflow-y-auto">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white px-4 py-3 border-b border-white/5">Features</a>
            <a href="#architecture" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white px-4 py-3 border-b border-white/5">Architecture</a>
            {user ? (
              <Link to="/dashboard" className="text-lg font-medium text-white px-4 py-3 border-b border-white/5">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-lg font-medium text-white px-4 py-3 border-b border-white/5">
                Log In
              </Link>
            )}
            <div className="mt-auto pb-12 pt-8">
              <a
                href="/auth/github"
                className="flex items-center justify-center w-full rounded-full bg-white px-5 py-4 text-base font-medium text-black"
              >
                Start Deploying
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-black pt-12 md:pt-16 pb-8 px-6 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                 <Triangle className="w-3 h-3 text-black fill-black rotate-180" />
              </div>
              <span className="font-semibold text-white">MiniShinobi</span>
            </div>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Decentralized edge computing for developers. Calm power, invisible complexity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Frameworks</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Next.js</a></li>
              <li><a href="#" className="hover:text-white transition-colors">React</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vue</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="https://github.com/Mic-360/MiniShinobi" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">© {new Date().getFullYear()} MiniShinobi Inc.</p>
          <div className="flex flex-wrap justify-center gap-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
