import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeployments, triggerDeploy } from '../api';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function Project() {
  const { id } = useParams();
  const [deps, setDeps] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const load = () => getDeployments(id).then(r => setDeps(r.data));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

  const handleDeploy = async () => {
    setDeploying(true);
    await triggerDeploy(id);
    await load();
    setDeploying(false);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Projects</Link>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-medium text-zinc-100">Project #{id}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Deployments</h1>
        </div>
        <Button onClick={handleDeploy} disabled={deploying}>
          {deploying ? 'Queuing...' : 'Deploy Now'}
        </Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {deps.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-400">No deployments yet. Trigger a deployment to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {deps.map((d, i) => (
              <Link
                key={d.id}
                to={`/deployment/${d.id}`}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-5 hover:bg-zinc-800/30 transition-colors ${i === 0 ? 'bg-zinc-800/20' : ''}`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="mt-1">
                    <Badge status={d.status} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-zinc-100 font-medium">#{d.id}</span>
                      <span className="text-zinc-600">·</span>
                      {d.commit_sha ? (
                        <span className="font-mono text-[12px] text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded">{d.commit_sha}</span>
                      ) : (
                        <span className="text-[12px] text-zinc-500 italic">Processing commit...</span>
                      )}
                    </div>
                    <p className="text-[13px] text-zinc-400 mt-1 line-clamp-1 truncate pr-4">{d.commit_msg || 'Triggered manual deployment'}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-4">
                  {d.tunnel_url && (
                    <a
                      href={d.tunnel_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[12px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 py-1 px-2.5 rounded-full truncate max-w-[220px]"
                    >
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <span className="truncate">{d.tunnel_url.replace('https://', '')}</span>
                    </a>
                  )}
                  <span className="text-[12px] text-zinc-500 font-medium whitespace-nowrap ml-auto sm:ml-0">
                    {new Date(d.started_at || d.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
