import { ArrowLeft, ExternalLink, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployment, stopDeployment } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';

const lineColor = {
  stdout: 'text-gray-400',
  stderr: 'text-red-400',
  system: 'text-blue-400 font-medium',
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
      title={`Deployment ${id}`}
      actions={
        <div className='flex items-center gap-3'>
          {dep?.tunnel_url && (
            <button
              onClick={() => window.open(dep.tunnel_url, '_blank')}
              className='px-4 py-2 border border-white/10 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-white flex items-center gap-2'
            >
              <ExternalLink className='h-4 w-4' />
              Visit
            </button>
          )}
          {live && (
            <button
              onClick={handleStop}
              className='px-4 py-2 bg-red-900/50 text-red-200 border border-red-500/30 rounded-md text-sm font-medium hover:bg-red-900 transition-colors flex items-center gap-2'
            >
              <Square className='h-3.5 w-3.5 fill-current' />
              Cancel
            </button>
          )}
        </div>
      }
    >
      <div className='mb-6 flex flex-col gap-4'>
        <div className='flex items-center gap-2 text-sm'>
          <Link
            to={dep ? `/project/${dep.project_id}` : '/dashboard'}
            className='inline-flex items-center gap-1 text-gray-500 hover:text-white transition-colors'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Project {dep?.project_id || '...'}
          </Link>
          <span className='text-gray-700'>/</span>
          <span className='text-gray-300'>
            Deployment {id}
          </span>
        </div>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden bg-black flex flex-col min-h-[60vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
           <h3 className="text-white font-medium flex items-center gap-3">
             Build Logs
             {dep && (
               <Badge
                 status={
                   dep.status === 'building' && live ? 'live' : dep.status
                 }
               />
             )}
           </h3>
        </div>
        <div className='flex-1 bg-black p-4 overflow-y-auto font-mono text-[13px] leading-loose selection:bg-white/20 selection:text-white'>
          <div className='mb-4 text-gray-500'>
            $ minishinobi deploy --id {id}
          </div>
          {logs.map((log, i) => (
            <div
              key={i}
              className={lineColor[log.stream] || 'text-gray-300'}
            >
              {log.message}
            </div>
          ))}
          {live && (
            <div className='mt-4 flex items-center gap-2 text-gray-500'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-white' />
              Building...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </Layout>
  );
}
