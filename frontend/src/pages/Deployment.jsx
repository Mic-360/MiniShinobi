import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeployment, stopDeployment } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const lineColor = {
  stdout: 'text-zinc-300',
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
    getDeployment(id).then(r => setDep(r.data));
  }, [id]);

  useEffect(() => {
    const es = new EventSource(`/api/deployments/${id}/logs`, { withCredentials: true });
    esRef.current = es;
    es.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.message === '[END]') { es.close(); setLive(false); return; }
      setLogs(p => [...p, data]);
    };
    es.onerror = () => { es.close(); setLive(false); };
    return () => es.close();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const t = setInterval(() => {
      getDeployment(id).then(r => {
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
    setDep(d => ({ ...d, status: 'cancelled' }));
    setLive(false);
    esRef.current?.close();
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={dep ? `/project/${dep.project_id}` : '/dashboard'} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Project #{dep?.project_id || '...'}
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-medium text-zinc-100">Deployment #{id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Execution Logs</h1>
            {dep && <Badge status={dep.status === 'building' && live ? 'live' : dep.status} />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dep?.tunnel_url && (
            <Button variant="secondary" onClick={() => window.open(dep.tunnel_url, '_blank')} className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Open App
            </Button>
          )}
          {live && (
            <Button variant="danger" onClick={handleStop} className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              Stop
            </Button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl border border-zinc-800 bg-[#0c0c0c] overflow-hidden shadow-sm h-[65vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 ml-2 font-mono uppercase tracking-wider">Console Output</span>
          </div>
          {live && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium tracking-widest uppercase">Streaming</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 py-5 font-mono text-[13px] leading-relaxed select-text scroll-smooth">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 group">
              <span className="text-zinc-700 select-none w-8 text-right opacity-50 group-hover:opacity-100 transition-opacity text-[11px] pt-0.5 shrink-0">{i + 1}</span>
              <div className={`whitespace-pre-wrap break-all flex-1 ${lineColor[log.stream] || 'text-zinc-300'}`}>
                {log.message}
              </div>
            </div>
          ))}
          {!live && logs.length === 0 && <div className="text-zinc-500 italic pl-12 flex items-center h-full">No log output generated.</div>}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </Layout>
  );
}
