import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Deployment from './pages/Deployment';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-zinc-400">Loading...</div>
  );
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/project/:id" element={<Private><Project /></Private>} />
          <Route path="/deployment/:id" element={<Private><Deployment /></Private>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
