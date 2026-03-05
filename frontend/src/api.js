import axios from 'axios';

const api = axios.create({ withCredentials: true });

export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

export const getProjects = () => api.get('/api/projects');
export const getGitHubRepos = () => api.get('/api/projects/repos');
export const createProject = data => api.post('/api/projects', data);
export const deleteProject = id => api.delete(`/api/projects/${id}`);

export const getDeployments = pid => api.get(`/api/deployments/project/${pid}`);
export const triggerDeploy = pid => api.post(`/api/deployments/project/${pid}/deploy`);
export const getDeployment = id => api.get(`/api/deployments/${id}`);
export const stopDeployment = id => api.delete(`/api/deployments/${id}`);

export default api;
