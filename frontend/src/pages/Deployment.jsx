import { ArrowLeft, ExternalLink, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployment, stopDeployment } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Terminal } from '../components/ui/Terminal';

const lineColor = {
  stdout: 'text-[var(--text-secondary)]',
  stderr: 'text-red-300',
  system: 'text-[var(--accent-hover)] font-medium',
};

export default function Deployment() {
  const { id } = useParams();
  const [dep, setDep] = useState(null);
  const [logs, setLogs] = useState([]);
  const [live, setLive] = useState(true);
  const bottomRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    getDeployment(id).then((r) => setDep(r.data));
  }, [id]);

  useEffect(() => {
    const es = new EventSource(`/api/deployments/${id}/logs`, {
      withCredentials: true,
    });
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message === '[END]') {
        es.close();
        setLive(false);
        return;
      }
      setLogs((p) => [...p, data]);
    };
    es.onerror = () => {
      es.close();
      setLive(false);
    };
    return () => es.close();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs]);

  useEffect(() => {
    const t = setInterval(() => {
      getDeployment(id).then((r) => {
        setDep(r.data);
        if (['ready', 'failed', 'cancelled'].includes(r.data.status)) {
          clearInterval(t);
          setLive(false);
        }
      });
    }, 3000);
    return () => clearInterval(t);
  }, [id]);

  const handleStop = async () => {
    if (!confirm('Are you sure you want to stop this deployment?')) return;
    await stopDeployment(id);
    setDep((d) => ({ ...d, status: 'cancelled' }));
    setLive(false);
    esRef.current?.close();
  };

  return (
    <Layout
      title={`Deployment #${id}`}
      subtitle='Live stream build output with precise control over deployment lifecycle.'
    >
      <div className='flex h-full min-h-0 flex-col'>
        <div className='mb-6 flex flex-col gap-4'>
          <div className='flex items-center gap-2 text-sm'>
            <Link
              to={dep ? `/project/${dep.project_id}` : '/dashboard'}
              className='inline-flex items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]'
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              Project #{dep?.project_id || '...'}
            </Link>
            <span className='text-[var(--text-muted)]'>/</span>
            <span className='text-[var(--text-secondary)]'>
              Deployment #{id}
            </span>
          </div>

          <Card className='flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              <h2 className='text-lg font-semibold'>Execution Logs</h2>
              {dep && (
                <Badge
                  status={
                    dep.status === 'building' && live ? 'live' : dep.status
                  }
                />
              )}
            </div>

            <div className='flex items-center gap-3'>
              {dep?.tunnel_url && (
                <Button
                  onClick={() => window.open(dep.tunnel_url, '_blank')}
                  variant='secondary'
                  className='h-9 px-4'
                >
                  <ExternalLink className='h-4 w-4' />
                  Open App
                </Button>
              )}
              {live && (
                <Button
                  onClick={handleStop}
                  variant='danger'
                  className='h-9 px-4'
                >
                  <Square className='h-3.5 w-3.5' />
                  Stop
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className='ms-surface flex min-h-0 flex-1 flex-col overflow-hidden p-2'>
          <Terminal className='flex-1 p-0 rounded-none border-none'>
            <div className='space-y-0.5 p-4 font-mono text-[13px] leading-relaxed'>
              <div className='mb-2 text-[var(--text-muted)]'>
                $ minishinobi deploy --id {id}
              </div>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={lineColor[log.stream] || 'text-zinc-300'}
                >
                  {log.message}
                </div>
              ))}
              {live && (
                <div className='mt-2 flex items-center gap-2 text-[var(--text-muted)]'>
                  <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]' />
                  Listening for output...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </Terminal>
        </div>
      </div>
    </Layout>
  );
}
