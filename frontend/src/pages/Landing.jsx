import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TerminalWindow, Infinity as InfinityIcon, ShieldCheck, GlobeHemisphereWest, Cpu } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const images = {
  hero: '/hero.png',
  inline: '/inline.png',
  card1: '/card1.png',
  card2: '/card2.png',
  stack1: '/stack1.png',
  stack2: '/stack2.png',
};

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const container = useRef(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useGSAP(() => {
    // Only run complex GSAP on non-mobile devices to prevent jank on small screens
    const isMobile = window.innerWidth < 768;

    gsap.utils.toArray('.gsap-fade-scale').forEach((el) => {
      gsap.fromTo(
        el,
        { scale: isMobile ? 0.95 : 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 20%',
            scrub: true,
          },
        }
      );
    });

    const scrubText = document.querySelector('.gsap-scrub-text');
    if (scrubText && !isMobile) {
      const chars = scrubText.innerText.split(' ');
      scrubText.innerHTML = '';
      chars.forEach(char => {
        const span = document.createElement('span');
        span.innerText = char + ' ';
        span.style.opacity = '0.1';
        scrubText.appendChild(span);
      });
      
      gsap.to(scrubText.children, {
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: scrubText,
          start: 'top 85%',
          end: 'bottom 50%',
          scrub: true,
        }
      });
    }

    if (!isMobile) {
      gsap.utils.toArray('.gsap-stack-card').forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top ' + (15 + i * 5) + '%',
          endTrigger: '.stack-container',
          end: 'bottom bottom',
          pin: true,
          pinSpacing: false,
        });
      });
    }
  }, { scope: container });

  return (
    <Layout variant='landing'>
      <main ref={container} className="w-full max-w-full overflow-x-hidden font-['Outfit']">
        
        {/* ATTENTION: Hero Section (Cinematic Center) */}
        <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg)] z-10" />
            <img src={images.hero} className="w-full h-full object-cover mix-blend-luminosity opacity-40 grayscale" alt="Background" />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="w-full max-w-6xl mx-auto text-center z-20">
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] leading-[1.1] font-semibold tracking-tight text-white mx-auto">
              Deploy Edge Infrastructure 
              <span 
                className="inline-block w-16 h-8 md:w-32 md:h-14 rounded-full align-middle bg-cover bg-center mx-2 md:mx-4 border-2 border-white/10 shadow-xl" 
                style={{ backgroundImage: `url(${images.inline})` }}
              />
              From Your Pocket
            </h1>
            <p className="mt-6 md:mt-8 max-w-2xl mx-auto text-base md:text-xl text-gray-400">
              Transform Android compute nodes into a resilient, globally distributed application platform. No cloud fatigue, just pure edge power.
            </p>
            
            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full px-4 sm:px-0">
              <Button onClick={() => (window.location.href = '/auth/github')} className="h-14 px-10 text-base md:text-lg bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
                Deploy Now
              </Button>
              <a href="https://github.com/Mic-360/MiniShinobi" className="h-14 px-10 flex items-center justify-center border border-white/20 rounded-md text-base md:text-lg text-white hover:bg-white/5 transition-colors w-full sm:w-auto">
                View Source
              </a>
            </div>
          </div>
        </section>

        {/* MARQUEE: Trusted Partners / Tech */}
        <div className="w-full border-y border-white/5 bg-white/5 py-6 md:py-8 overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee flex gap-8 md:gap-16 items-center w-max px-4 md:px-8">
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-gray-500 font-semibold"><TerminalWindow weight="duotone" className="w-6 h-6 md:w-8 md:h-8"/> ANDROID COMPUTE</div>
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-gray-500 font-semibold"><GlobeHemisphereWest weight="duotone" className="w-6 h-6 md:w-8 md:h-8"/> CLOUDFLARE EDGE</div>
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-gray-500 font-semibold"><ShieldCheck weight="duotone" className="w-6 h-6 md:w-8 md:h-8"/> SECURE TUNNELS</div>
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-gray-500 font-semibold"><InfinityIcon weight="duotone" className="w-6 h-6 md:w-8 md:h-8"/> ZERO LATENCY</div>
            <div className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-gray-500 font-semibold"><Cpu weight="duotone" className="w-6 h-6 md:w-8 md:h-8"/> LOCAL HARDWARE</div>
          </div>
        </div>

        {/* INTEREST: Gapless Bento Grid */}
        <section className="py-24 md:py-48 px-4 md:px-6 max-w-7xl mx-auto" id="features">
          <h2 className="text-3xl md:text-6xl font-semibold text-center mb-16 md:mb-24 max-w-4xl mx-auto gsap-scrub-text leading-tight">
            A brutalist approach to modern infrastructure. Complete control without the traditional cloud overhead.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[250px] md:auto-rows-[300px] grid-flow-dense gap-4">
            
            <div className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 relative group overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-900 border border-white/10">
              <img src={images.card1} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay md:group-hover:scale-105 transition-transform duration-700 ease-out" alt="Code" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-10">
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 md:mb-3">API First Deployment</h3>
                <p className="text-gray-400 text-sm md:text-lg max-w-md">Trigger instant edge builds directly from your git pushes. The infrastructure responds immediately.</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 row-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl md:rounded-3xl bg-[#111] border border-white/10 flex flex-col justify-center p-6 md:p-10">
              <TerminalWindow className="w-8 h-8 md:w-12 md:h-12 text-white mb-4 md:mb-6" />
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Native Terminal</h3>
              <p className="text-gray-400 text-sm md:text-base">Stream deployment logs securely via websocket with zero configuration.</p>
            </div>

            <div className="col-span-1 md:col-span-1 row-span-1 md:row-span-2 relative group overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-900 border border-white/10">
              <img src={images.card2} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity md:group-hover:scale-105 transition-transform duration-700 ease-out" alt="Server" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="absolute top-0 left-0 p-6 md:p-10">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-3">Global Edge Ready</h3>
                <p className="text-gray-400 text-sm md:text-base">Integrated natively with Cloudflare Tunnels for instant global presence.</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 row-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl md:rounded-3xl bg-[#111] border border-white/10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0">
               <div>
                 <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">Zero Latency</h3>
                 <p className="text-gray-400 text-sm md:text-base max-w-sm">Skip the build queues. Your hardware, your execution speed.</p>
               </div>
               <div className="h-16 w-16 md:h-32 md:w-32 rounded-full border border-white/20 flex items-center justify-center bg-white/5 shrink-0 self-end md:self-auto">
                 <InfinityIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
               </div>
            </div>

          </div>
        </section>

        {/* DESIRE: Card Stacking (GSAP) */}
        <section className="py-24 md:py-48 bg-neutral-950 relative stack-container px-4 md:px-6" id="architecture">
          <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
            <h2 className="text-3xl md:text-5xl font-semibold text-center mb-16 md:mb-32">The Architecture</h2>
            
            <div className="gsap-stack-card w-full min-h-[40vh] md:h-[60vh] rounded-[1.5rem] md:rounded-[2rem] bg-neutral-900 border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden group flex flex-col justify-end">
              <img src={images.stack1} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale md:group-hover:scale-105 transition-transform duration-700 ease-out" alt="Stack 1" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col justify-end h-full mt-24 md:mt-0">
                <h3 className="text-2xl md:text-4xl font-semibold text-white mb-3 md:mb-4">Hardware Utilization</h3>
                <p className="text-base md:text-xl text-gray-300 max-w-2xl">Don't let older hardware become e-waste. Turn spare devices into dedicated nodes capable of serving thousands of users via optimized rust and node runtimes.</p>
              </div>
            </div>

            <div className="gsap-stack-card w-full min-h-[40vh] md:h-[60vh] rounded-[1.5rem] md:rounded-[2rem] bg-neutral-800 border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden group flex flex-col justify-end">
              <img src={images.stack2} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale md:group-hover:scale-105 transition-transform duration-700 ease-out" alt="Stack 2" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col justify-end h-full mt-24 md:mt-0">
                <h3 className="text-2xl md:text-4xl font-semibold text-white mb-3 md:mb-4">Cryptographic Security</h3>
                <p className="text-base md:text-xl text-gray-300 max-w-2xl">By utilizing outbound-only Cloudflare Tunnels, your devices never expose open ports. Your physical infrastructure remains entirely hidden and cryptographically verified.</p>
              </div>
            </div>
            
            <div className="gsap-stack-card w-full min-h-[40vh] md:h-[60vh] rounded-[1.5rem] md:rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col justify-center items-center text-center">
              <h3 className="text-3xl md:text-5xl font-semibold text-white mb-4 md:mb-6">Complete Isolation</h3>
              <p className="text-base md:text-xl text-gray-400 max-w-xl">Every project runs in its own isolated environment directly on the device, ensuring clean state and predictable performance metrics.</p>
            </div>

          </div>
        </section>

        {/* ACTION: High-contrast CTA */}
        <section className="py-24 md:py-48 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center bg-white text-black rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 shadow-2xl gsap-fade-scale">
            <h2 className="text-4xl md:text-7xl font-semibold tracking-tight mb-6 md:mb-8 leading-tight">Ready to reclaim your infrastructure?</h2>
            <p className="text-base md:text-xl text-gray-700 mb-10 md:mb-12 max-w-2xl mx-auto">
              Stop paying for idle cloud compute. Transform your devices into an edge-native application platform today.
            </p>
            <Button onClick={() => (window.location.href = '/auth/github')} className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl bg-black text-white hover:bg-gray-800 rounded-xl md:rounded-2xl w-full sm:w-auto">
              Start Deploying For Free
            </Button>
          </div>
        </section>

      </main>
    </Layout>
  );
}
