import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', repo_url: '', branch: 'main',
    install_command: 'npm install', build_command: 'npm run build', output_dir: 'dist',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { getProjects().then(r => setProjects(r.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await createProject(form);
      setProjects(p => [data, ...p]);
      setIsModalOpen(false);
      setForm({ name: '', repo_url: '', branch: 'main', install_command: 'npm install', build_command: 'npm run build', output_dir: 'dist' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this project?')) return;
    await deleteProject(id);
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and deploy your applications.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <Link
            key={p.id}
            to={`/project/${p.id}`}
            className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold tracking-tight text-white truncate pr-4">{p.name}</h3>
                <div
                  className="flex items-center justify-center p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors z-10"
                  onClick={(e) => handleDelete(e, p.id)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                <svg className="w-4 h-4 shrink-0 text-zinc-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>
                <span className="truncate">{p.repo_url.replace('https://github.com/', '')}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{p.branch}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 text-center">
          <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-white">No projects found</h3>
          <p className="text-sm text-zinc-400 mt-1 mb-5 max-w-sm">Get started by creating your first project and connect your GitHub repository.</p>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Create Project</Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Import Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name" placeholder="my-app" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="GitHub Repository URL" placeholder="https://github.com/user/repo" value={form.repo_url} onChange={e => setForm(f => ({ ...f, repo_url: e.target.value }))} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Branch" placeholder="main" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
            <Input label="Output Directory" placeholder="dist" value={form.output_dir} onChange={e => setForm(f => ({ ...f, output_dir: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Install Command" placeholder="npm install" value={form.install_command} onChange={e => setForm(f => ({ ...f, install_command: e.target.value }))} />
            <Input label="Build Command" placeholder="npm run build" value={form.build_command} onChange={e => setForm(f => ({ ...f, build_command: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>{isCreating ? 'Importing...' : 'Deploy'}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
