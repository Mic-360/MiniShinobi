import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RetroGrid } from '../components/ui/RetroGrid';
import { Terminal, AnimatedSpan } from '../components/ui/Terminal';
import { Button } from '../components/ui/Button';
import { Marquee } from '../components/ui/Marquee';
import { Safari } from '../components/ui/Safari';
import { BorderBeam } from '../components/ui/BorderBeam';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { motion } from 'framer-motion';

const tech = [
    { name: 'React', icon: '⚡' },
    { name: 'Next.js', icon: '▲' },
    { name: 'Vite', icon: '🔥' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'Cloudflare', icon: '☁️' },
    { name: 'Termux', icon: '📱' },
];

export default function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    return (
        <div className='min-h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-zinc-800 selection:text-white'>
            {/* Navigation */}
            <nav className='fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md'>
                <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <img src='/mini-shinobi.png' alt='MiniShinobi' className='h-6 w-6' />
                        <span className='font-bold text-white tracking-tight'>MiniShinobi</span>
                    </div>
                    <div className='flex items-center gap-6'>
                        <a href='#' className='text-sm hover:text-white transition-colors'>Docs</a>
                        <Link to='/login' className='text-sm font-medium text-white px-3 py-1.5 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors'>
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className='relative pt-32 pb-20 overflow-hidden'>
                <RetroGrid className="opacity-40" />
                <div className='relative z-10 max-w-7xl mx-auto px-6 text-center'>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]'
                    >
                        Universal Micro-PaaS <br /> for your home lab.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed'
                    >
                        The simplest way to deploy Git-based applications on any Linux box.
                        Automatic builds, direct Cloudflare Tunnels, and zero-config GitHooks.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-20'
                    >
                        <Button onClick={() => window.location.href = '/auth/github'} className="h-12 px-8 text-base">
                            Get Started — Deploy Now
                        </Button>
                        <a href='https://github.com/Mic-360/MiniShinobi' className='text-sm font-medium text-zinc-400 hover:text-white transition-colors h-12 flex items-center px-6 border border-zinc-800 rounded-md bg-zinc-900/50'>
                            View on GitHub
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className='relative max-w-5xl mx-auto border border-zinc-800 rounded-xl bg-black/40 overflow-hidden shadow-2xl'
                    >
                        <Safari
                            url="minishinobi.local/dashboard"
                            imageSrc="/minishinobi_dashboard_mockup.png"
                            className="w-full object-fill"
                        />
                        <BorderBeam size={200} duration={12} delay={9} />
                    </motion.div>
                </div>
            </section>

            {/* How it Works / Terminal Demo */}
            <section className='py-24 border-y border-zinc-900 bg-zinc-900/10'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
                        <div>
                            <h2 className='text-3xl font-bold text-white mb-6 tracking-tight'>
                                Push to Git. <br />
                                We handle the rest.
                            </h2>
                            <div className='space-y-8'>
                                <div className='flex gap-4'>
                                    <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1'>1</div>
                                    <div>
                                        <h4 className='text-white font-medium mb-1'>Connect Repo</h4>
                                        <p className='text-sm text-zinc-500 leading-relaxed'>Connect your GitHub account and select your repository. MiniShinobi automatically configures Webhooks for you.</p>
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1'>2</div>
                                    <div>
                                        <h4 className='text-white font-medium mb-1'>Automated Build</h4>
                                        <p className='text-sm text-zinc-500 leading-relaxed'>On every push, we pull the changes, run your install/build commands, and start the application process.</p>
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1'>3</div>
                                    <div>
                                        <h4 className='text-white font-medium mb-1'>Exposed Tunnel</h4>
                                        <p className='text-sm text-zinc-500 leading-relaxed'>Cloudflare Tunnel is automatically managed. Your app is accessible via a secure HTTPS URL without opening router ports.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='relative'>
                            <Terminal className="h-[400px] border border-zinc-800 shadow-xl bg-black">
                                <AnimatedSpan className="text-zinc-500">$ minishinobi deploy --repo site-preview</AnimatedSpan>
                                <AnimatedSpan className="text-emerald-500 mt-2">✔ Clone repository successful</AnimatedSpan>
                                <AnimatedSpan className="text-zinc-400">→ Running: npm install...</AnimatedSpan>
                                <AnimatedSpan className="text-zinc-400">→ Running: npm run build...</AnimatedSpan>
                                <AnimatedSpan className="text-emerald-500 mt-2">✔ Build complete</AnimatedSpan>
                                <AnimatedSpan className="text-blue-400 mt-2">ℹ Starting Cloudflare Tunnel...</AnimatedSpan>
                                <AnimatedSpan className="text-white mt-2 font-bold underline">
                                    ✔ Deployed to: https://dashboard.minishinobi.tech
                                </AnimatedSpan>
                                <AnimatedSpan className="text-zinc-600 mt-4 italic">Watching for changes on main branch...</AnimatedSpan>
                            </Terminal>
                            <BorderBeam />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Support Marquee */}
            <section className='py-20 border-b border-zinc-900'>
                <div className='text-center mb-10'>
                    <span className='text-xs font-bold text-zinc-600 uppercase tracking-[0.2em]'>Full Stack Versatility</span>
                </div>
                <Marquee pauseOnHover className="[--duration:20s]">
                    {tech.map((t) => (
                        <div key={t.name} className='flex items-center gap-2 px-8 py-3 rounded-lg border border-zinc-800 bg-zinc-900/20 text-white font-medium'>
                            <span>{t.icon}</span>
                            <span>{t.name}</span>
                        </div>
                    ))}
                </Marquee>
            </section>

            {/* Bento Features */}
            <section className='py-24 max-w-7xl mx-auto px-6'>
                <div className='text-center mb-16'>
                    <h2 className='text-3xl font-bold text-white tracking-tight'>Engineered for Reliability</h2>
                </div>
                <BentoGrid className='lg:grid-rows-2 lg:grid-cols-3'>
                    <BentoCard
                        name="Termux Support"
                        className='lg:col-span-2 lg:row-span-1 border border-zinc-800'
                        description="Native support for Android/Termux environments. Turn your old phone into a production server."
                        Icon={() => <span>📱</span>}
                        href="https://github.com/Mic-360/MiniShinobi"
                        cta="Learn more"
                    />
                    <BentoCard
                        name="Auto Tunnels"
                        className='lg:col-span-1 lg:row-span-2 border border-zinc-800 bg-zinc-900/40'
                        description="No port forwarding required. Secure tunnels managed by MiniShinobi."
                        Icon={() => <span>⚡</span>}
                        href="/login"
                        cta="Try now"
                    />
                    <BentoCard
                        name="Zero Config"
                        className='lg:col-span-1 lg:row-span-1 border border-zinc-800'
                        description="Minimal setup perfectly tuned for home labs and developer sandboxes."
                        Icon={() => <span>⚙️</span>}    
                    />
                    <BentoCard
                        name="Live Logs"
                        className='lg:col-span-1 lg:row-span-1 border border-zinc-800'
                        description="Real-time streaming of build and runtime logs directly in your browser."
                        Icon={() => <span>📟</span>}
                        href="/dashboard"
                        cta="Dashboard"
                    />
                </BentoGrid>
            </section>

            {/* CTA Final */}
            <section className='py-24 relative overflow-hidden border-t border-zinc-900'>
                <div className='max-w-7xl mx-auto px-6 text-center relative z-10'>
                    <h2 className='text-4xl font-bold text-white mb-6'>Ship it from your basement.</h2>
                    <p className='text-zinc-500 mb-10 text-lg'>MiniShinobi is open source and ready to host your next project.</p>
                    <Button onClick={() => window.location.href = '/auth/github'} className="h-12 px-10 text-base">
                        Join the Beta
                    </Button>
                </div>
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-zinc-500/5 blur-[120px] rounded-full' />
            </section>

            {/* Footer */}
            <footer className='py-12 border-t border-zinc-900/50'>
                <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6'>
                    <div className='flex items-center gap-2'>
                        <img src='/mini-shinobi.png' alt='MiniShinobi' className='h-5 w-5' />
                        <span className='font-bold text-white text-sm'>MiniShinobi</span>
                    </div>
                    <p className='text-xs text-zinc-600'>Built by developers for developers. © 2026</p>
                    <div className='flex gap-6'>
                        <a href='#' className='text-xs text-zinc-600 hover:text-white'>Twitter</a>
                        <a href='#' className='text-xs text-zinc-600 hover:text-white'>GitHub</a>
                        <a href='#' className='text-xs text-zinc-600 hover:text-white'>Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
