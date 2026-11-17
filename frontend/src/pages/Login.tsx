import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Terminal } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to establish connection. Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lab-dark bg-grid-pattern">
      <div className="panel p-8 max-w-md w-full relative overflow-hidden">
        {/* Retro scanline effect purely for aesthetics */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <Terminal size={48} className="text-lab-amber" />
          </div>
          <h1 className="text-3xl font-bold text-lab-text">CollabLab</h1>
          <p className="text-lab-muted font-mono text-sm mt-2">v1.0.0 INITIALIZING...</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          {error && <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded font-mono">{error}</div>}
          <div>
            <label className="block text-sm font-mono text-lab-muted mb-1">EMAIL</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="operator@collablab.net"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-lab-muted mb-1">PASSWORD</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-6" disabled={isLoading}>
            {isLoading ? 'ESTABLISHING CONNECTION...' : 'ESTABLISH CONNECTION'}
          </button>
        </form>

        <div className="text-center mt-6 relative z-10">
          <Link to="/register" className="text-lab-amber font-mono text-sm hover:underline">
            NEW OPERATOR? REGISTER HERE →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
