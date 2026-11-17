import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Terminal } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [teacherCode, setTeacherCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role,
        teacherCode: role === 'TEACHER' ? teacherCode : undefined
      });
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to establish connection. Registration failed.');
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
          <p className="text-lab-muted font-mono text-sm mt-2">NEW OPERATOR REGISTRATION</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          {error && <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded font-mono">{error}</div>}
          
          <div>
            <label className="block text-sm font-mono text-lab-muted mb-1">NAME</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

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

          <div>
            <label className="block text-sm font-mono text-lab-muted mb-1">ROLE</label>
            <select
              className="input-field"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
            </select>
          </div>

          {role === 'TEACHER' && (
            <div>
              <label className="block text-sm font-mono text-lab-amber mb-1">TEACHER ACCESS CODE</label>
              <input 
                type="password" 
                className="input-field border-lab-amber/50 focus:border-lab-amber" 
                placeholder="Enter teacher registration code"
                value={teacherCode}
                onChange={e => setTeacherCode(e.target.value)}
                required
              />
            </div>
          )}
          
          <button type="submit" className="btn-primary w-full mt-6" disabled={isLoading}>
            {isLoading ? 'INITIALIZING OPERATOR...' : 'REGISTER OPERATOR'}
          </button>
        </form>

        <div className="text-center mt-6 relative z-10">
          <Link to="/" className="text-lab-amber font-mono text-sm hover:underline">
            ← BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
