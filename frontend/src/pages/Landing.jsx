import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Code,
  GitBranch,
  Globe,
  Lock,
  ServerCog,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
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
    <Layout variant='landing'>
      <div className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute -top-24 -right-45 h-130 w-130 rounded-full bg-(--accent)/12 blur-[130px]' />
          <div className='absolute -bottom-45 -left-35 h-105 w-105 rounded-full bg-(--accent)/9 blur-[120px]' />
        </div>

        <section className='relative px-6 pb-20 pt-28 md:pt-32'>
          <div className='max-w-5xl mx-auto'>
            <Motion.div
              variants={staggerContainer}
              initial='initial'
              animate='animate'
              className='space-y-9'
            >
              <Motion.div
                variants={fadeInUp}
                className='inline-flex'
              >
                <div className='rounded-full border border-(--border) bg-(--surface)/80 px-3 py-1 backdrop-blur-sm'>
                  <span className='text-sm text-(--text-secondary)'>
                    <span className='mr-2 inline-block h-2 w-2 rounded-full bg-(--accent)' />
                    Now in Beta
                  </span>
                </div>
              </Motion.div>

              <Motion.h1
                variants={fadeInUp}
                className='max-w-4xl text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl'
              >
                Micro‑PaaS for builders
                <br />
                <span className='text-(--accent)'>
                  shipping from edge hardware.
                </span>
              </Motion.h1>

              <Motion.p
                variants={fadeInUp}
                className='max-w-2xl text-lg text-(--text-secondary)'
              >
                MiniShinobi deploys production apps through Android compute
                nodes. Low latency, no lock-in, and a workflow your team already
                understands.
              </Motion.p>

              <Motion.div
                variants={fadeInUp}
                className='flex flex-col gap-4 pt-2 sm:flex-row'
              >
                <Button
                  onClick={() => (window.location.href = '/auth/github')}
                  className='h-11 px-6'
                >
                  Start Building
                  <ArrowRight className='w-4 h-4' />
                </Button>
                <a
                  href='https://github.com/Mic-360/MiniShinobi'
                  className='inline-flex h-11 items-center gap-2 rounded-[10px] border border-(--border) px-5 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--surface-muted) hover:text-(--text-primary)'
                >
                  View on GitHub
                </a>
              </Motion.div>

              <Motion.div
                variants={fadeInUp}
                className='grid gap-4 pt-2 sm:grid-cols-3'
              >
                {[
                  ['Deploy latency', '< 4.2s'],
                  ['Infra control', '100% self-owned'],
                  ['Usage model', 'Pay $0 for idle'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className='ms-surface px-4 py-3'
                  >
                    <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>
                      {label}
                    </p>
                    <p className='mt-1 text-base font-semibold text-(--text-primary)'>
                      {value}
                    </p>
                  </div>
                ))}
              </Motion.div>
            </Motion.div>
          </div>
        </section>

        <section className='relative border-y border-(--border) px-6 py-16'>
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='text-center'
            >
              <p className='text-sm font-semibold uppercase tracking-[0.14em] text-(--accent)'>
                Built for Developers
              </p>
              <p className='mt-4 text-sm text-(--text-secondary)'>
                Open source, self-hosted, and purpose-built for edge-native
                teams.
              </p>
            </Motion.div>
          </div>
        </section>

        <section className='relative px-6 py-20'>
          <div className='max-w-6xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-12'
            >
              <h2 className='mb-4 text-center text-4xl font-semibold tracking-tight'>
                A dashboard made for deep work
              </h2>
              <p className='mx-auto max-w-2xl text-center text-(--text-secondary)'>
                Observe deploy streams, inspect statuses, and control app
                surfaces with a calm, no-noise workflow.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='ms-surface relative overflow-hidden p-6 md:p-8'
            >
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(145,169,130,0.12),transparent_40%)]' />
              <div className='relative grid gap-4 md:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Project queue</CardTitle>
                    <CardDescription>
                      Control release cadence across all nodes.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment logs</CardTitle>
                    <CardDescription>
                      Readable streams with terminal-first semantics.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Health telemetry</CardTitle>
                    <CardDescription>
                      Know where each edge tunnel is performing.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </Motion.div>
          </div>
        </section>

        <section
          id='features'
          className='relative px-6 py-20'
        >
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-16'
            >
              <h2 className='text-4xl font-semibold tracking-tight'>
                Everything you need <br /> to deploy anywhere
              </h2>
            </Motion.div>

            <Motion.div
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Motion.div
                    key={idx}
                    variants={fadeInUp}
                    className='ms-surface group p-6 transition-all hover:border-[color-mix(in_oklab,var(--accent),transparent_50%)]'
                  >
                    <div className='mb-4'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-subtle) transition-colors group-hover:bg-[color-mix(in_oklab,var(--accent-subtle),white_6%)]'>
                        <Icon className='h-5 w-5 text-(--accent-hover)' />
                      </div>
                    </div>
                    <h3 className='mb-2 font-semibold text-(--text-primary)'>
                      {feature.title}
                    </h3>
                    <p className='text-sm text-(--text-secondary)'>
                      {feature.description}
                    </p>
                  </Motion.div>
                );
              })}
            </Motion.div>
          </div>
        </section>

        <section
          id='how-it-works'
          className='relative border-y border-(--border) px-6 py-20'
        >
          <div className='max-w-7xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-16'
            >
              <h2 className='mb-4 text-4xl font-semibold tracking-tight'>
                How it works
              </h2>
              <p className='max-w-2xl text-(--text-secondary)'>
                From zero to live in three simple steps. No infrastructure
                expertise required.
              </p>
            </Motion.div>

            <Motion.div
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
              className='grid gap-8 md:grid-cols-3'
            >
              {steps.map((step, idx) => (
                <Motion.div
                  key={idx}
                  variants={fadeInUp}
                  className='ms-surface relative p-6'
                >
                  {idx < steps.length - 1 && (
                    <div className='absolute -right-4 top-8 hidden h-0.5 w-8 bg-linear-to-r from-(--accent)/50 to-transparent md:block' />
                  )}
                  <div className='mb-2'>
                    <div className='text-4xl font-bold text-(--accent)/30'>
                      {step.number}
                    </div>
                  </div>
                  <h3 className='mb-3 text-lg font-semibold text-(--text-primary)'>
                    {step.title}
                  </h3>
                  <p className='text-sm text-(--text-secondary)'>
                    {step.description}
                  </p>
                </Motion.div>
              ))}
            </Motion.div>
          </div>
        </section>

        <section className='relative px-6 py-20'>
          <div className='max-w-4xl mx-auto'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='mb-12'
            >
              <h2 className='mb-4 text-3xl font-semibold tracking-tight'>
                Deploy with one command
              </h2>
              <p className='text-(--text-secondary)'>
                Simple, elegant CLI. Everything you need, nothing you don't.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='relative ms-surface overflow-hidden p-8'
            >
              <div className='absolute top-4 left-4 flex gap-2'>
                <div className='h-2.5 w-2.5 rounded-full bg-red-400/65' />
                <div className='h-2.5 w-2.5 rounded-full bg-amber-400/65' />
                <div className='h-2.5 w-2.5 rounded-full bg-(--accent)' />
              </div>
              <pre className='overflow-x-auto pt-4 text-[13px] leading-relaxed text-(--text-secondary)'>
                <code>
                  {`$ npx minishinobi deploy

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
            </Motion.div>
          </div>
        </section>

        <section className='relative border-y border-(--border) px-6 py-20'>
          <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Traditional cloud</CardTitle>
              </CardHeader>
              <ul className='space-y-3 text-sm text-(--text-secondary)'>
                {[
                  'Recurring infra spend',
                  'Vendor lock-in',
                  'Long region distances',
                  'Complex setup',
                ].map((item) => (
                  <li
                    key={item}
                    className='flex items-start gap-2'
                  >
                    <span className='text-red-300'>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className='border-[color-mix(in_oklab,var(--accent),transparent_50%)]'>
              <CardHeader>
                <CardTitle className='text-(--accent-hover)'>
                  MiniShinobi
                </CardTitle>
              </CardHeader>
              <ul className='space-y-3 text-sm text-(--text-secondary)'>
                {[
                  'Owned and local compute',
                  'Open-source by design',
                  'Fast setup path',
                  'Edge-first performance',
                ].map((item) => (
                  <li
                    key={item}
                    className='flex items-start gap-2'
                  >
                    <CheckCircle2 className='mt-0.5 h-4 w-4 text-(--accent-hover)' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section className='relative px-6 py-24'>
          <div className='mx-auto max-w-4xl text-center'>
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='space-y-7'
            >
              <div className='inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-1 text-xs uppercase tracking-[0.14em] text-(--text-muted)'>
                <ServerCog className='h-3.5 w-3.5' />
                Calm power for dev infra
              </div>
              <h2 className='text-4xl font-semibold tracking-tight md:text-5xl'>
                Start deploying today
              </h2>
              <p className='mx-auto max-w-2xl text-lg text-(--text-secondary)'>
                Launch your first app from your own edge compute in minutes.
                Practical infrastructure, no cloud fatigue.
              </p>
              <div className='flex justify-center pt-2'>
                <Button
                  onClick={() => (window.location.href = '/auth/github')}
                  className='h-12 px-8'
                >
                  Get Started
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
