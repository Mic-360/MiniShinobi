import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDeployments, triggerDeploy } from '../api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function Project() {
  const { id } = useParams();
  const [deps, setDeps] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const load = () => getDeployments(id).then((r) => setDeps(r.data));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

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
    <Layout>
      <div className="mb-8">
        <div className='flex items-center gap-2 mb-2 text-sm'>
          <Link
            to='/dashboard'
            className='text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1'
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Projects
          </Link>
          <span className='text-zinc-700'>/</span>
          <span className='text-zinc-300'>Project #{id}</span>
        </div>

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <h1 className='text-2xl font-semibold text-white'>
            Deployments
          </h1>
          <Button
            onClick={handleDeploy}
            disabled={deploying}
            className='w-full sm:w-auto px-4'
          >
            {deploying ? 'Queuing...' : 'Deploy Now'}
          </Button>
        </div>
      </div>

      <div className='border border-zinc-800 rounded-lg bg-zinc-900/40 overflow-hidden'>
        {deps.length === 0 ? (
          <div className='py-20 flex flex-col items-center justify-center text-center'>
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className='text-sm text-zinc-500'>
              No deployments yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {deps.map((d) => (
              <Link
                key={d.id}
                to={`/deployment/${d.id}`}
                className="block hover:bg-zinc-800/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-5 gap-4">
                  <div className='flex items-start gap-4 flex-1 min-w-0'>
                    <Badge status={d.status} />
                    <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm text-zinc-300'>
                          #{d.id}
                        </span>
                        {d.commit_sha && (
                          <>
                            <span className='text-zinc-700'>·</span>
                            <span className='font-mono text-xs text-zinc-500'>
                              {d.commit_sha.substring(0, 7)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className='text-sm text-zinc-400 truncate'>
                        {d.commit_msg || 'Manual deployment triggered'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 text-xs text-zinc-500 font-mono'>
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
                        minute: '2-digit'
                      })}
                    </span>
                    <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
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
