import { ArrowLeft, ChevronRight, Clock3, Github } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployments, triggerDeploy } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';

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
      title={
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Github className="w-4 h-4 text-white" />
           </div>
           <span>Project {id}</span>
        </div>
      }
      actions={
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="px-4 py-2 border border-white/10 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-white hidden md:block">
            View Settings
          </Link>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="bg-white text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {deploying ? 'Building...' : 'Deploy'}
          </button>
        </div>
      }
    >
      <div className='mb-8 flex items-center gap-2 text-sm'>
        <Link
          to='/dashboard'
          className='inline-flex items-center gap-1 text-gray-500 hover:text-white transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Overview
        </Link>
        <span className='text-gray-700'>/</span>
        <span className='text-gray-300'>Project {id}</span>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden bg-black">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
           <h3 className="text-white font-medium">Deployments</h3>
        </div>
        {loading ? (
          <div className='space-y-0'>
            <div className='h-16 border-b border-white/5 bg-white/5 animate-pulse w-full' />
            <div className='h-16 border-b border-white/5 bg-white/5 animate-pulse w-full' />
            <div className='h-16 border-b border-white/5 bg-white/5 animate-pulse w-full' />
          </div>
        ) : deps.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-500'>
              <Clock3 className='h-6 w-6' />
            </div>
            <p className='text-sm text-gray-400'>
              No deployments yet. Trigger a deploy to get started.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-white/10'>
            {deps.map((d) => (
              <Link
                key={d.id}
                to={`/deployment/${d.id}`}
                className='block transition-colors hover:bg-white/5 group'
              >
                <div className='flex flex-col items-start justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center'>
                  <div className='flex items-center gap-4 flex-1 min-w-0'>
                    <Badge status={d.status} />
                    <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
                      <div className='flex items-center gap-2'>
                        <span className='text-white font-medium'>
                          {d.commit_msg || 'Manual deployment triggered'}
                        </span>
                        {d.commit_sha && (
                          <span className='font-mono text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded'>
                            {d.commit_sha.substring(0, 7)}
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-gray-500'>
                        {d.branch || 'main'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 font-mono text-xs text-gray-500'>
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
                      })}
                    </span>
                    <ChevronRight className='h-4 w-4 text-gray-500 group-hover:text-white transition-colors' />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
