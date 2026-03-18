import { ArrowLeft, ChevronRight, Clock3, Rocket } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployments, triggerDeploy } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function Project() {
  const { id } = useParams();
  const [deps, setDeps] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    () =>
      getDeployments(id)
        .then((r) => setDeps(r.data))
        .finally(() => setLoading(false)),
    [id],
  );

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await triggerDeploy(id);
      await load();
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Layout
      title={`Project #${id}`}
      subtitle='Track deployments, monitor status transitions, and ship with confidence.'
      actions={
        <Button
          onClick={handleDeploy}
          disabled={deploying}
        >
          <Rocket className='h-4 w-4' />
          {deploying ? 'Queuing...' : 'Deploy Now'}
        </Button>
      }
    >
      <div className='mb-5 flex items-center gap-2 text-sm'>
        <Link
          to='/dashboard'
          className='inline-flex items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]'
        >
          <ArrowLeft className='h-4 w-4' />
          Projects
        </Link>
        <span className='text-[var(--text-muted)]'>/</span>
        <span className='text-[var(--text-secondary)]'>Project #{id}</span>
      </div>

      <Card className='p-0 overflow-hidden'>
        {loading ? (
          <div className='space-y-3 p-6'>
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-11 w-full' />
          </div>
        ) : deps.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'>
              <Clock3 className='h-5 w-5' />
            </div>
            <p className='text-sm text-[var(--text-secondary)]'>
              No deployments yet.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-[var(--border)]'>
            {deps.map((d) => (
              <Link
                key={d.id}
                to={`/deployment/${d.id}`}
                className='block transition-colors hover:bg-[var(--surface-muted)]/60'
              >
                <div className='flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center'>
                  <div className='flex items-start gap-4 flex-1 min-w-0'>
                    <Badge status={d.status} />
                    <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm text-[var(--text-secondary)]'>
                          #{d.id}
                        </span>
                        {d.commit_sha && (
                          <>
                            <span className='text-[var(--text-muted)]'>·</span>
                            <span className='font-mono text-xs text-[var(--text-muted)]'>
                              {d.commit_sha.substring(0, 7)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className='truncate text-sm text-[var(--text-secondary)]'>
                        {d.commit_msg || 'Manual deployment triggered'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 font-mono text-xs text-[var(--text-muted)]'>
                    {d.tunnel_url && (
                      <span className='hidden lg:inline-block'>
                        {d.tunnel_url.replace('https://', '')}
                      </span>
                    )}
                    <span className='whitespace-nowrap'>
                      {new Date(
                        d.started_at || d.created_at || Date.now(),
                      ).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <ChevronRight className='h-4 w-4 text-[var(--text-muted)]' />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}
