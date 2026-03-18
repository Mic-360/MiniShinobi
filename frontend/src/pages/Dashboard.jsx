import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createProject,
  deleteProject,
  getGitHubRepos,
  getProjects,
} from '../api';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Input } from '../components/ui/Input';
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

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    await deleteProject(id);
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  return (
    <Layout
      title='Projects'
      subtitle='Deploy from edge nodes with a clean, deterministic release workflow.'
      actions={
        <Button
          onClick={openImportModal}
          className='px-4'
        >
          <Plus className='h-4 w-4' />
          New Project
        </Button>
      }
    >
      <div className='mb-8 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardDescription>Total projects</CardDescription>
            <CardTitle>{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Most common branch</CardDescription>
            <CardTitle>{projects[0]?.branch || 'main'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Source control</CardDescription>
            <CardTitle>GitHub</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loadingProjects ? (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent>
                <Skeleton className='h-5 w-2/3' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/project/${p.id}`}
              className='block'
            >
              <Card className='group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:color-mix(in_oklab,var(--accent),transparent_40%)]'>
                <CardHeader className='flex-row items-start justify-between space-y-0'>
                  <div className='min-w-0'>
                    <CardTitle className='truncate'>{p.name}</CardTitle>
                    <CardDescription className='mt-1 truncate font-mono text-xs'>
                      {p.repo_url.replace('https://github.com/', '')}
                    </CardDescription>
                  </div>
                  <button
                    className='inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-all hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100'
                    onClick={(e) => handleDelete(e, p.id)}
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]'>
                      Repository
                    </p>
                    <p className='truncate text-xs text-[var(--text-secondary)]'>
                      {p.repo_url}
                    </p>
                  </div>

                  <div className='flex items-center justify-between border-t border-[var(--border)] pt-3'>
                    <div className='inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]'>
                      <GitBranch className='h-3.5 w-3.5' />
                      <span className='font-mono'>{p.branch}</span>
                    </div>
                    <span className='text-xs font-medium text-[var(--accent-hover)]'>
                      Open project →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loadingProjects && projects.length === 0 && (
        <div className='ms-surface mt-6 flex flex-col items-center justify-center border-dashed px-8 py-16 text-center'>
          <h3 className='text-base font-semibold text-[var(--text-primary)]'>
            No projects yet
          </h3>
          <p className='mb-5 mt-2 text-sm text-[var(--text-secondary)]'>
            Connect a repository and ship your first edge deployment.
          </p>
          <Button
            onClick={openImportModal}
            variant='secondary'
          >
            Create Project
          </Button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetModal}
        title='Import Project'
      >
        <form
          onSubmit={handleCreate}
          className='space-y-4'
        >
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium tracking-wide text-[var(--text-secondary)]'>
              GitHub Repository
            </label>
            <select
              className='flex h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)]/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50'
              value={form.repo_url}
              onChange={(e) => handleRepositorySelect(e.target.value)}
              disabled={loadingRepos || isCreating}
              required
            >
              <option value=''>
                {loadingRepos
                  ? 'Loading repositories...'
                  : 'Select a repository'}
              </option>
              {repositories.map((repo) => (
                <option
                  key={repo.id}
                  value={repo.clone_url}
                >
                  {repo.full_name}
                  {repo.private ? ' (private)' : ''}
                </option>
              ))}
            </select>
            {repoError && <p className='text-xs text-red-300'>{repoError}</p>}
          </div>
          <Input
            label='Project Name'
            placeholder='my-app'
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Branch'
              placeholder='main'
              value={form.branch}
              onChange={(e) =>
                setForm((f) => ({ ...f, branch: e.target.value }))
              }
            />
            <Input
              label='Output Directory'
              placeholder='dist'
              value={form.output_dir}
              onChange={(e) =>
                setForm((f) => ({ ...f, output_dir: e.target.value }))
              }
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Install Command'
              placeholder='npm install'
              value={form.install_command}
              onChange={(e) =>
                setForm((f) => ({ ...f, install_command: e.target.value }))
              }
            />
            <Input
              label='Build Command'
              placeholder='npm run build'
              value={form.build_command}
              onChange={(e) =>
                setForm((f) => ({ ...f, build_command: e.target.value }))
              }
            />
          </div>
          <Input
            label='Start Command'
            placeholder='npm start'
            value={form.start_command}
            onChange={(e) =>
              setForm((f) => ({ ...f, start_command: e.target.value }))
            }
          />
          <div className='mt-5 flex justify-end gap-3 border-t border-[var(--border)] pt-5'>
            <Button
              type='button'
              variant='ghost'
              onClick={resetModal}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isCreating || loadingRepos}
            >
              {isCreating ? 'Importing...' : 'Import Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
