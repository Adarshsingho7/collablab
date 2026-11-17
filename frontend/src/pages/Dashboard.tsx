import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircuitBoard, Network, LogOut, Shield, Clock, Play } from 'lucide-react';
import api from '../lib/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isCreatingFree, setIsCreatingFree] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/sessions');
        setSessions(res.data.sessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    if (token) fetchSessions();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartFreeLab = async () => {
    if (!token) return;
    try {
      setIsCreatingFree(true);
      const res = await api.post('/sessions/share', { circuitGraph: '{}', labId: null });
      navigate(`/lab/shared/${res.data.session.id}`);
    } catch (err) {
      console.error('Failed to start free lab', err);
      setIsCreatingFree(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-lab-dark bg-grid-pattern text-lab-text">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-lab-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-lab-amber">WORKSPACE SELECT</h1>
            <p className="font-mono text-lab-muted mt-2">OPERATOR: {user?.name} | ROLE: {user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
            <LogOut size={16} /> DISCONNECT
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Experimental Lab */}
          <div className="panel p-6 border-l-4 border-l-transparent hover:border-l-lab-amber hover:shadow-[0_0_20px_rgba(255,176,0,0.1)] transition-all cursor-pointer group bg-lab-panel/90" 
               onClick={isCreatingFree ? undefined : handleStartFreeLab}>
            <div className="mb-4 text-lab-muted group-hover:text-lab-amber transition-colors flex items-center justify-between">
              <CircuitBoard size={48} strokeWidth={1.5} />
              <div className="h-2 w-2 rounded-full bg-lab-amber/20 group-hover:bg-lab-amber group-hover:shadow-[0_0_8px_#ffb000] transition-all"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-wide uppercase">Free Experimental</h2>
            <p className="text-lab-muted text-sm">
              An open, unrestricted workspace. Build and simulate any circuit with no assignment constraints. Your progress is saved automatically.
            </p>
            <div className="mt-6 font-mono text-xs text-lab-amber opacity-0 group-hover:opacity-100 transition-opacity border-t border-lab-amber/20 pt-2">
              {isCreatingFree ? '> INITIATING...' : '> INITIATE_FREE_MODE'}
            </div>
          </div>

          {/* Task Lab */}
          <div className="panel p-6 border-l-4 border-l-transparent hover:border-l-lab-green hover:shadow-[0_0_20px_rgba(67,181,129,0.1)] transition-all cursor-pointer group bg-lab-panel/90" onClick={() => navigate('/task-lab')}>
            <div className="mb-4 text-lab-muted group-hover:text-lab-green transition-colors flex items-center justify-between">
              <Network size={48} strokeWidth={1.5} />
              <div className="h-2 w-2 rounded-full bg-lab-green/20 group-hover:bg-lab-green group-hover:shadow-[0_0_8px_#43b581] transition-all"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-wide uppercase">Task Lab</h2>
            <p className="text-lab-muted text-sm">
              Instructor-assigned experiments. Select an experiment, follow instructions, and submit your final circuit and report for grading.
            </p>
            <div className="mt-6 font-mono text-xs text-lab-green opacity-0 group-hover:opacity-100 transition-opacity border-t border-lab-green/20 pt-2">
              &gt; INITIATE_TASK_MODE
            </div>
          </div>

          {/* Teacher Controls */}
          {user?.role === 'TEACHER' && (
            <div className="panel p-6 border-l-4 border-l-transparent hover:border-l-lab-blue hover:shadow-[0_0_20px_rgba(33,150,243,0.1)] transition-all cursor-pointer group bg-lab-panel/90 md:col-span-2" onClick={() => navigate('/teacher')}>
              <div className="mb-4 text-lab-muted group-hover:text-lab-blue transition-colors flex items-center justify-between">
                <Shield size={48} strokeWidth={1.5} />
                <div className="h-2 w-2 rounded-full bg-lab-blue/20 group-hover:bg-lab-blue group-hover:shadow-[0_0_8px_#2196f3] transition-all"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-wide uppercase">Instructor Cmd Ctr</h2>
              <p className="text-lab-muted text-sm">
                Create new lab assignments, grade submissions, and monitor active student sessions in real time.
              </p>
              <div className="mt-6 font-mono text-xs text-lab-blue opacity-0 group-hover:opacity-100 transition-opacity border-t border-lab-blue/20 pt-2">
                &gt; ADMIN_OVERRIDE
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-lab-border pb-2">
            <Clock size={20} className="text-lab-muted" /> RECENT SESSIONS
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-lab-border text-lab-muted font-mono text-sm">
              NO PREVIOUS SESSIONS FOUND.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} 
                     className="flex items-center justify-between p-4 bg-lab-panel border border-lab-border hover:border-lab-amber transition-colors cursor-pointer"
                     onClick={() => navigate(`/lab/shared/${session.id}`)}>
                  <div>
                    <h3 className="font-bold text-lab-text">
                      {session.lab ? session.lab.title : 'Free Experimental Session'}
                    </h3>
                    <div className="text-xs font-mono text-lab-muted mt-1 flex gap-4">
                      <span>ROLE: {session.ownerId === user?.id ? 'OWNER' : 'COLLABORATOR'}</span>
                      <span>UPDATED: {new Date(session.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-mono rounded ${
                      session.status === 'SUBMITTED' ? 'bg-yellow-900 text-yellow-300' :
                      session.status === 'GRADED' ? 'bg-green-900 text-green-300' :
                      'bg-lab-dark border border-lab-border text-lab-muted'
                    }`}>
                      {session.status.replace('_', ' ')}
                    </span>
                    <button className="text-lab-amber hover:text-white transition-colors">
                      <Play size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
