import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Code,
  GitBranch,
  Globe,
  Lock,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Safari } from '../components/ui/Safari';
import { useAuth } from '../context/AuthContext';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const features = [
  {
    icon: Smartphone,
    title: 'Android Native',
    description:
      'Deploy your apps from Android devices. Turn your pocket into production infrastructure.',
  },
  {
    icon: Zap,
    title: 'Zero Latency Deploy',
    description:
      'Push to Git and watch your app deploy in seconds. No build queues, no waiting.',
  },
  {
    icon: Globe,
    title: 'Global Edge Ready',
    description:
      'Cloudflare integration gives your app instant global presence with zero configuration.',
  },
  {
    icon: Code,
    title: 'API First',
    description:
      'Full REST API and CLI for deep integration into your development workflow.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'Secure tunnels, automatic TLS, no exposed ports. Your infrastructure stays private.',
  },
  {
    icon: GitBranch,
    title: 'Git Native',
    description:
      'Works with any Git repository. Webhook-driven deployments, branch-based environments.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect Device',
    description:
      'Pair your Android device to MiniShinobi. Your home lab becomes your cloud.',
  },
  {
    number: '02',
    title: 'Push Code',
    description:
      'Push to your repository. Webhooks trigger instant builds on your device.',
  },
  {
    number: '03',
    title: 'Go Live',
    description:
      'Cloudflare Tunnel exposes your app globally. No port forwarding, no DNS hassle.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <Layout>
      <div
        className='relative text-white overflow-hidden'
        style={{
          '--sage-green': '#9CAF88',
          '--surface': '#121715',
          '--border': '#1F2A24',
        }}
      >
        {/* Animated background gradient */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-1/2 right-0 w-200 h-200 rounded-full bg-[#9CAF88]/5 blur-[120px]' />
          <div className='absolute -bottom-1/4 left-1/4 w-150 h-150 rounded-full bg-[#9CAF88]/3 blur-[100px]' />
        </div>

        {/* Hero Section */}
        <section className='relative pt-32 pb-24 px-6'>
          <div className='max-w-5xl mx-auto'>
            <Motion.div
              variants={staggerContainer}
              initial='initial'
              animate='animate'
              className='space-y-8'
            >
              {/* Badge */}
              <Motion.div
                variants={fadeInUp}
                className='inline-flex'
              >
                <div className='px-3 py-1 rounded-full border border-[#1F2A24] bg-[#121715]/50 backdrop-blur-sm'>
                  <span className='text-sm text-[#A8B5AE]'>
                    <span className='inline-block w-2 h-2 rounded-full bg-[#9CAF88] mr-2' />
                    Now in Beta
                  </span>
                </div>
              </Motion.div>

              {/* Headline */}
              <Motion.h1
                variants={fadeInUp}
                className='text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]'
              >
                Your Cloud.
                <br />
                <span className='text-[#9CAF88]'>In Your Pocket.</span>
              </Motion.h1>

              {/* Subheadline */}
              <Motion.p
                variants={fadeInUp}
                className='text-lg text-[#A8B5AE] max-w-2xl leading-relaxed'
              >
                Deploy production applications from your Android device.
                MiniShinobi transforms edge computing from a concept into a
                practical reality—no data center required, no monthly bills,
                just your infrastructure on your terms.
              </Motion.p>

              {/* CTA Buttons */}
              <Motion.div
                variants={fadeInUp}
                className='flex flex-col sm:flex-row gap-4 pt-4'
              >
                <Button
                  onClick={() => (window.location.href = '/auth/github')}
                  className='bg-[#9CAF88] text-[#0B0F0C] hover:bg-[#a8c29a] font-semibold px-6 py-3 h-12 rounded-lg transition-all inline-flex items-center gap-2'
                >
                  Start Building
                  <ArrowRight className='w-4 h-4' />
                </Button>
                <a
                  href='https://github.com/Mic-360/MiniShinobi'
                  className='px-6 py-3 rounded-lg border border-[#1F2A24] text-[#A8B5AE] hover:bg-[#121715] transition-colors inline-flex items-center gap-2'
                >
                  View on GitHub
                  <ChevronRight className='w-4 h-4' />
                </a>
              </Motion.div>
            </Motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className='relative py-20 px-6 border-y border-[#1F2A24]'>
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='text-center'
            >
              <p className='text-sm font-semibold text-[#9CAF88] uppercase tracking-wider'>
                Built for Developers
              </p>
              <p className='mt-4 text-[#A8B5AE] text-sm'>
                Open source. Self-hosted. Community-driven.
              </p>
            </Motion.div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className='relative py-24 px-6'>
          <div className='max-w-6xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-12'
            >
              <h2 className='text-4xl font-bold tracking-tight text-center mb-4'>
                Your dashboard awaits
              </h2>
              <p className='text-center text-[#A8B5AE] max-w-2xl mx-auto'>
                A sleek, intuitive interface to manage your deployments, view
                logs, and monitor your infrastructure in real-time.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='relative'
            >
              <Safari
                url='minishinobi.local/dashboard'
                videoSrc='/vdo.mp4'
                className='w-full shadow-2xl'
              />
            </Motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section
          id='features'
          className='relative py-24 px-6'
        >
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-16'
            >
              <h2 className='text-4xl font-bold tracking-tight'>
                Everything you need <br /> to deploy anywhere
              </h2>
            </Motion.div>

            <Motion.div
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Motion.div
                    key={idx}
                    variants={fadeInUp}
                    className='p-6 rounded-xl border border-[#1F2A24] bg-[#121715]/50 hover:border-[#9CAF88]/30 transition-all group'
                  >
                    <div className='mb-4'>
                      <div className='w-10 h-10 rounded-lg bg-[#9CAF88]/10 flex items-center justify-center group-hover:bg-[#9CAF88]/20 transition-colors'>
                        <Icon className='w-5 h-5 text-[#9CAF88]' />
                      </div>
                    </div>
                    <h3 className='font-semibold mb-2 text-white'>
                      {feature.title}
                    </h3>
                    <p className='text-sm text-[#A8B5AE]'>
                      {feature.description}
                    </p>
                  </Motion.div>
                );
              })}
            </Motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id='how-it-works'
          className='relative py-24 px-6 border-y border-[#1F2A24]'
        >
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-16'
            >
              <h2 className='text-4xl font-bold tracking-tight mb-4'>
                How it works
              </h2>
              <p className='text-[#A8B5AE] max-w-2xl'>
                From zero to live in three simple steps. No infrastructure
                expertise required.
              </p>
            </Motion.div>

            <Motion.div
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              className='grid md:grid-cols-3 gap-8'
            >
              {steps.map((step, idx) => (
                <Motion.div
                  key={idx}
                  variants={fadeInUp}
                  className='relative'
                >
                  {idx < steps.length - 1 && (
                    <div className='hidden md:block absolute -right-4 top-8 w-8 h-0.5 bg-linear-to-r from-[#9CAF88]/50 to-transparent' />
                  )}
                  <div className='mb-4'>
                    <div className='text-5xl font-bold text-[#9CAF88]/30'>
                      {step.number}
                    </div>
                  </div>
                  <h3 className='text-xl font-semibold mb-3'>{step.title}</h3>
                  <p className='text-[#A8B5AE]'>{step.description}</p>
                </Motion.div>
              ))}
            </Motion.div>
          </div>
        </section>

        {/* Code Snippet Section */}
        <section className='relative py-24 px-6'>
          <div className='max-w-4xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-12'
            >
              <h2 className='text-3xl font-bold tracking-tight mb-4'>
                Deploy with one command
              </h2>
              <p className='text-[#A8B5AE]'>
                Simple, elegant CLI. Everything you need, nothing you don't.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='bg-[#121715] border border-[#1F2A24] rounded-xl p-8 overflow-hidden'>
                <div className='absolute top-4 left-4 flex gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500/50' />
                  <div className='w-3 h-3 rounded-full bg-yellow-500/50' />
                  <div className='w-3 h-3 rounded-full bg-green-500/50' />
                </div>
                <pre className='text-sm text-[#A8B5AE] font-mono pt-6'>
                  <code>{`$ npx minishinobi deploy

✔ Authenticated as user
→ Reading configuration...
→ Building application...
✔ Build successful (12.4s)
→ Starting Cloudflare Tunnel...
✔ Connected to https://myapp.minishinobi.app

🚀 Your app is live!
`}
                                  </code>
                </pre>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className='relative py-24 px-6 border-y border-[#1F2A24]'>
          <div className='max-w-5xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-12'
            >
              <h2 className='text-3xl font-bold tracking-tight text-center'>
                Built differently
              </h2>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='grid md:grid-cols-2 gap-8'
            >
              <div className='p-8 rounded-xl border border-[#1F2A24] bg-[#121715]/50'>
                <h3 className='font-semibold mb-6 text-[#A8B5AE]'>
                  Traditional Cloud
                </h3>
                <ul className='space-y-3 text-sm text-[#A8B5AE]'>
                  <li className='flex gap-3'>
                    <span className='text-red-400'>✕</span>
                    <span>Expensive monthly bills</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-red-400'>✕</span>
                    <span>Vendor lock-in</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-red-400'>✕</span>
                    <span>Complex configuration</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-red-400'>✕</span>
                    <span>Data centers far away</span>
                  </li>
                </ul>
              </div>

              <div className='p-8 rounded-xl border border-[#9CAF88]/20 bg-[#9CAF88]/5'>
                <h3 className='font-semibold mb-6 text-[#9CAF88]'>
                  MiniShinobi
                </h3>
                <ul className='space-y-3 text-sm text-[#A8B5AE]'>
                  <li className='flex gap-3'>
                    <span className='text-[#9CAF88]'>✓</span>
                    <span>Zero cloud costs</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-[#9CAF88]'>✓</span>
                    <span>100% open source</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-[#9CAF88]'>✓</span>
                    <span>Zero configuration</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-[#9CAF88]'>✓</span>
                    <span>Deploy from anywhere</span>
                  </li>
                </ul>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='relative py-24 px-6'>
          <div className='max-w-4xl mx-auto text-center'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='space-y-8'
            >
              <h2 className='text-5xl font-bold tracking-tight'>
                Start deploying today
              </h2>
              <p className='text-lg text-[#A8B5AE] max-w-2xl mx-auto'>
                Join the beta. Deploy your first app in minutes. Join developers
                who are rethinking infrastructure.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
                <Button
                  onClick={() => (window.location.href = '/auth/github')}
                  className='bg-[#9CAF88] text-[#0B0F0C] hover:bg-[#a8c29a] font-semibold px-8 py-3 h-12 rounded-lg transition-all inline-flex items-center justify-center gap-2'
                >
                  Get Started Free
                  <ArrowRight className='w-4 h-4' />
                </Button>
              </div>
            </Motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
