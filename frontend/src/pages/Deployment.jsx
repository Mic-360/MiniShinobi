import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployment, stopDeployment } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { Terminal, AnimatedSpan } from '../components/ui/Terminal';
import { Button } from '../components/ui/Button';

const lineColor = {
  stdout: 'text-zinc-300',
  stderr: 'text-red-400',
  system: 'text-emerald-400 font-medium',
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
    <Layout>
      <div className="flex flex-col min-h-0 h-full">
        <div className='flex flex-col gap-4 mb-8'>
          <div className='flex items-center gap-2 text-sm'>
            <Link
              to={dep ? `/project/${dep.project_id}` : '/dashboard'}
              className='text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1'
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Project #{dep?.project_id || '...'}
            </Link>
            <span className='text-zinc-700'>/</span>
            <span className='text-zinc-300'>Deployment #{id}</span>
          </div>

          <div className='flex flex-row justify-between items-end gap-4'>
            <div className='flex items-center gap-4'>
              <h1 className='text-2xl font-semibold text-white'>
                Logs
              </h1>
              {dep && (
                <Badge
                  status={dep.status === 'building' && live ? 'live' : dep.status}
                />
              )}
            </div>

            <div className='flex items-center gap-3'>
              {dep?.tunnel_url && (
                <Button
                  onClick={() => window.open(dep.tunnel_url, '_blank')}
                  variant="secondary"
                  className='h-9 px-4'
                >
                  Open App
                </Button>
              )}
              {live && (
                <Button
                  onClick={handleStop}
                  variant="ghost"
                  className='h-9 px-4 text-red-400 hover:bg-red-500/10'
                >
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col border border-zinc-800 rounded-lg bg-black overflow-hidden">
          <Terminal className="flex-1 p-0 rounded-none border-none">
            <div className="p-4 space-y-0.5 font-mono text-sm">
              <div className="text-zinc-500 mb-2">$ minishinobi deploy --id {id}</div>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={lineColor[log.stream] || 'text-zinc-300'}
                >
                  {log.message}
                </div>
              ))}
              {live && (
                <div className="flex items-center gap-2 text-zinc-600 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
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
