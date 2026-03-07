import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProject, deleteProject, getGitHubRepos, getProjects } from '../api';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState('');

  useEffect(() => {
    getProjects().then(r => setProjects(r.data));
  }, []);

  const loadRepositories = async () => {
    setLoadingRepos(true);
    setRepoError('');
    try {
      const { data } = await getGitHubRepos();
      setRepositories(data.repositories || []);
    } catch (err) {
      setRepositories([]);
      setRepoError(err.response?.data?.error || err.message || 'Failed to load repositories');
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
    const selected = repositories.find(r => r.clone_url === cloneUrl);
    if (!selected) {
      setForm(f => ({ ...f, repo_url: cloneUrl }));
      return;
    }
    setForm(f => ({
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
      setProjects(p => [data, ...p]);
      if (data.webhook && !data.webhook.ok) {
        alert(`Project created, but webhook setup failed: ${data.webhook.message}`);
      }
      resetModal();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to create project';
      alert(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    await deleteProject(id);
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <Layout>
      <div className='flex flex-row justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-semibold text-white'>
            Projects
          </h1>
          <p className='text-sm text-zinc-500 mt-1'>
            Manage and deploy your applications.
          </p>
        </div>
        <Button onClick={openImportModal} className='h-9 px-4'>
          + New Project
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/project/${p.id}`}
            className='group flex flex-col justify-between p-5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors'
          >
            <div>
              <div className='flex items-start justify-between mb-4'>
                <h3 className='font-medium text-white truncate'>
                  {p.name}
                </h3>
                <button
                  className='p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100'
                  onClick={(e) => handleDelete(e, p.id)}
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                </button>
              </div>
              <div className='flex items-center gap-2 text-xs text-zinc-500 mb-4 font-mono'>
                <svg className='w-3.5 h-3.5' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z' />
                </svg>
                <span className='truncate'>{p.repo_url.replace('https://github.com/', '')}</span>
              </div>
            </div>
            <div className='flex items-center gap-1.5 pt-4 border-t border-zinc-800/80 mt-auto'>
              <svg className='w-3.5 h-3.5 text-zinc-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
              </svg>
              <span className='text-[10px] font-bold text-zinc-600 uppercase tracking-wider'>
                {p.branch}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className='flex flex-col items-center justify-center p-12 mt-4 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/10 text-center'>
          <h3 className='text-sm font-medium text-white'>No projects found</h3>
          <p className='text-sm text-zinc-500 mt-1 mb-5'>Get started by creating your first project.</p>
          <Button onClick={openImportModal} variant='secondary'>Create Project</Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={resetModal} title='Import Project'>
        <form onSubmit={handleCreate} className='space-y-4'>
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium text-zinc-500'>GitHub Repository</label>
            <select
              className='flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50'
              value={form.repo_url}
              onChange={(e) => handleRepositorySelect(e.target.value)}
              disabled={loadingRepos || isCreating}
              required
            >
              <option value=''>{loadingRepos ? 'Loading repositories...' : 'Select a repository'}</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.clone_url}>
                  {repo.full_name}{repo.private ? ' (private)' : ''}
                </option>
              ))}
            </select>
          </div>
          <Input label='Project Name' placeholder='my-app' value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Branch' placeholder='main' value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} />
            <Input label='Output Directory' placeholder='dist' value={form.output_dir} onChange={(e) => setForm((f) => ({ ...f, output_dir: e.target.value }))} />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Install Command' placeholder='npm install' value={form.install_command} onChange={(e) => setForm((f) => ({ ...f, install_command: e.target.value }))} />
            <Input label='Build Command' placeholder='npm run build' value={form.build_command} onChange={(e) => setForm((f) => ({ ...f, build_command: e.target.value }))} />
          </div>
          <Input label='Start Command' placeholder='npm start' value={form.start_command} onChange={(e) => setForm((f) => ({ ...f, start_command: e.target.value }))} />
          <div className='flex justify-end gap-3 pt-5 mt-4 border-t border-zinc-800'>
            <Button type='button' variant='ghost' onClick={resetModal}>Cancel</Button>
            <Button type='submit' disabled={isCreating || loadingRepos}>
              {isCreating ? 'Importing...' : 'Import Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
