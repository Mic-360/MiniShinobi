import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api';

export function Layout({ children }) {
    const { user, setUser } = useAuth();

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    return (
        <div className="min-h-screen flex flex-col selection:bg-[#3B82F6]/30 selection:text-white">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#1A1A1A] bg-[#0A0A0A]/80 px-6 backdrop-blur">
                <Link to="/dashboard" className="flex items-center gap-2 font-[600] tracking-tight text-[#FAFAFA] hover:opacity-80 transition-opacity">
                    <img src="/mini-shinobi.png" alt="MiniShinobi" className="w-6 h-6 object-contain" />
                    <span className="mb-[1px]">MiniShinobi</span>
                </Link>

                {user && (
                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img src={user.avatar_url} alt={user.username} className="h-6 w-6 rounded-full border border-zinc-800" />
                            <span className="text-sm font-medium text-zinc-300 hidden sm:inline-block">{user.username}</span>
                        </div>
                        <div className="h-4 w-px bg-zinc-800" />
                        <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                            Logout
                        </button>
                    </div>
                )}
            </header>
            <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">
                {children}
            </main>
        </div>
    );
}
