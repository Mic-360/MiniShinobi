import { GitBranch, Plus, Search, Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createProject,
  deleteProject,
  getGitHubRepos,
  getProjects,
} from '../api';
import { Layout } from '../components/Layout';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';

const EMPTY_FORM = {
  name: '',
  repo_url: '',
  branch: 'main',
  install_command: 'npm install',
  build_command: 'npm run build',
  output_dir: '',
  start_command: '',
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState('');

  useEffect(() => {
    setLoadingProjects(true);
    getProjects()
      .then((r) => setProjects(r.data))
      .finally(() => setLoadingProjects(false));
  }, []);

  const loadRepositories = async () => {
    setLoadingRepos(true);
    setRepoError('');
    try {
      const { data } = await getGitHubRepos();
      setRepositories(data.repositories || []);
    } catch (err) {
      setRepositories([]);
      setRepoError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load repositories',
      );
    } finally {
      setLoadingRepos(false);
    }
  };

  const openImportModal = async () => {
    setIsModalOpen(true);
    await loadRepositories();
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setRepoError('');
  };

  const handleRepositorySelect = (cloneUrl) => {
    const selected = repositories.find((r) => r.clone_url === cloneUrl);
    if (!selected) {
      setForm((f) => ({ ...f, repo_url: cloneUrl }));
      return;
    }
    setForm((f) => ({
      ...f,
      repo_url: selected.clone_url,
      branch: selected.default_branch || f.branch,
      name: f.name || selected.name,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await createProject(form);
      setProjects((p) => [data, ...p]);
      if (data.webhook && !data.webhook.ok) {
        alert(
          `Project created, but webhook setup failed: ${data.webhook.message}`,
        );
      }
      resetModal();
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to create project';
      alert(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout
      title='Overview'
      actions={
        <button
          onClick={openImportModal}
          className='bg-white text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors'
        >
          <Plus className='h-4 w-4' />
          Add New...
        </button>
      }
    >
      <div className="flex items-center gap-4 mb-8">
         <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search Projects..." 
              className="w-full bg-[#111] border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
         </div>
      </div>

      {loadingProjects ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-black border border-white/10 rounded-xl p-6 h-[200px]">
                <Skeleton className='h-6 w-2/3 mb-4 bg-white/10' />
                <Skeleton className='h-4 w-3/4 mb-2 bg-white/10' />
                <Skeleton className='h-4 w-1/2 bg-white/10' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/project/${p.id}`}
              className='block group'
            >
              <div className="bg-black border border-white/10 rounded-xl p-6 h-[200px] flex flex-col justify-between transition-all duration-200 hover:border-white/30 hover:bg-[#0a0a0a]">
                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-semibold text-lg text-white group-hover:text-white truncate">{p.name}</h3>
                       <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <Github className="w-3.5 h-3.5 text-white" />
                       </div>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {p.repo_url.replace('https://github.com/', '')}
                    </p>
                 </div>

                 <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                       <GitBranch className="w-4 h-4" />
                       {p.branch}
                    </div>
                    <span className="text-xs text-gray-500">Just now</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loadingProjects && projects.length === 0 && (
        <div className='mt-8 border border-white/10 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a]'>
          <h3 className='text-xl font-semibold text-white'>No projects found</h3>
          <p className='mt-2 text-gray-400 mb-6'>
            Get started by importing a repository from GitHub.
          </p>
          <button
            onClick={openImportModal}
            className='bg-white text-black px-6 py-2 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors'
          >
            Import Project
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetModal}
        title='Import Git Repository'
      >
        <form onSubmit={handleCreate} className='space-y-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-300'>
              Import from GitHub
            </label>
            <select
              className='w-full bg-[#111] border border-white/10 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white/30'
              value={form.repo_url}
              onChange={(e) => handleRepositorySelect(e.target.value)}
              disabled={loadingRepos || isCreating}
              required
            >
              <option value=''>
                {loadingRepos ? 'Loading repositories...' : 'Select a repository...'}
              </option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.clone_url}>
                  {repo.full_name} {repo.private ? ' (Private)' : ''}
                </option>
              ))}
            </select>
            {repoError && <p className='text-xs text-red-400 mt-1'>{repoError}</p>}
          </div>

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h4 className="text-sm font-medium text-gray-300">Project Configuration</h4>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Project Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#111] border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" required placeholder="my-app" />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Branch</label>
                <input type="text" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full bg-[#111] border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="main" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Output Directory</label>
                <input type="text" value={form.output_dir} onChange={e => setForm(f => ({ ...f, output_dir: e.target.value }))} className="w-full bg-[#111] border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="dist" />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Install Command</label>
                <input type="text" value={form.install_command} onChange={e => setForm(f => ({ ...f, install_command: e.target.value }))} className="w-full bg-[#111] border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="npm install" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Build Command</label>
                <input type="text" value={form.build_command} onChange={e => setForm(f => ({ ...f, build_command: e.target.value }))} className="w-full bg-[#111] border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="npm run build" />
              </div>
            </div>
          </div>

          <div className='mt-8 flex justify-end gap-3 pt-6 border-t border-white/10'>
            <button
              type='button'
              onClick={resetModal}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isCreating || loadingRepos}
              className="bg-white text-black px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Importing...' : 'Deploy'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
