import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Plus, ChevronRight } from 'lucide-react';
import api from '../lib/api';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'monitor' | 'grade'>('create');
  const [labs, setLabs] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [submittedSessions, setSubmittedSessions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    expectedComponents: ''
  });

  useEffect(() => {
    fetchLabs();
    fetchLiveSessions();
    fetchSubmittedSessions();
    const interval = setInterval(() => {
      fetchLiveSessions();
      fetchSubmittedSessions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLabs = async () => {
    try {
      const res = await api.get('/labs');
      setLabs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLiveSessions = async () => {
    try {
      const res = await api.get('/labs/live-sessions');
      setLiveSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmittedSessions = async () => {
    try {
      const res = await api.get('/labs/submissions');
      setSubmittedSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/labs', formData);
      setFormData({ title: '', description: '', instructions: '', expectedComponents: '' });
      fetchLabs();
      alert('Lab created successfully!');
    } catch (err) {
      alert('Failed to create lab');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-lab-dark bg-grid-pattern text-lab-text">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-lab-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-lab-blue flex items-center gap-3">
              <Shield size={32} /> INSTRUCTOR COMMAND CENTER
            </h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            BACK TO WORKSPACE
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            className={`px-4 py-2 font-mono text-sm border-b-2 ${activeTab === 'create' ? 'border-lab-blue text-lab-blue' : 'border-transparent text-lab-muted hover:text-lab-text'}`}
            onClick={() => setActiveTab('create')}
          >
            CREATE ASSIGNMENT
          </button>
          <button 
            className={`px-4 py-2 font-mono text-sm border-b-2 ${activeTab === 'monitor' ? 'border-lab-blue text-lab-blue' : 'border-transparent text-lab-muted hover:text-lab-text'}`}
            onClick={() => setActiveTab('monitor')}
          >
            LIVE MONITORING
          </button>
          <button 
            className={`px-4 py-2 font-mono text-sm border-b-2 ${activeTab === 'grade' ? 'border-lab-green text-lab-green' : 'border-transparent text-lab-muted hover:text-lab-text'}`}
            onClick={() => setActiveTab('grade')}
          >
            GRADING & SUBMISSIONS
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="panel p-6 bg-lab-panel/90">
              <h2 className="text-xl font-bold text-lab-blue mb-6 flex items-center gap-2">
                <Plus size={20} /> NEW TASK LAB
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-sm text-lab-muted mb-1">TITLE</label>
                  <input type="text" className="w-full bg-lab-dark border border-lab-border p-2 text-lab-text font-mono" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block font-mono text-sm text-lab-muted mb-1">DESCRIPTION</label>
                  <input type="text" className="w-full bg-lab-dark border border-lab-border p-2 text-lab-text font-mono" required
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block font-mono text-sm text-lab-muted mb-1">INSTRUCTIONS (MARKDOWN/TEXT)</label>
                  <textarea className="w-full bg-lab-dark border border-lab-border p-2 text-lab-text font-mono h-32" required
                    value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} />
                </div>
                <div>
                  <label className="block font-mono text-sm text-lab-muted mb-1">EXPECTED COMPONENTS (COMMA SEPARATED)</label>
                  <input type="text" className="w-full bg-lab-dark border border-lab-border p-2 text-lab-text font-mono" placeholder="e.g. DC_SOURCE, RESISTOR"
                    value={formData.expectedComponents} onChange={e => setFormData({...formData, expectedComponents: e.target.value})} />
                </div>
                <button type="submit" className="w-full btn-primary bg-lab-blue hover:bg-blue-600 mt-4">
                  DEPLOY ASSIGNMENT
                </button>
              </form>
            </div>
            
            <div className="panel p-6 bg-lab-panel/90 overflow-y-auto max-h-[600px]">
              <h2 className="text-xl font-bold text-lab-muted mb-6">EXISTING LABS</h2>
              <div className="space-y-4">
                {labs.map(lab => (
                  <div key={lab.id} className="border border-lab-border p-4 bg-lab-dark">
                    <h3 className="font-bold text-lg text-lab-text">{lab.title}</h3>
                    <p className="text-lab-muted text-sm mb-2">{lab.description}</p>
                    <div className="font-mono text-xs text-lab-muted">Created: {new Date(lab.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {labs.length === 0 && <div className="text-lab-muted font-mono">No labs created yet.</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="panel p-6 bg-lab-panel/90">
            <h2 className="text-xl font-bold text-lab-amber mb-6 flex items-center gap-2">
              <Eye size={20} /> ACTIVE SESSIONS
            </h2>
            <div className="space-y-4">
              {liveSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between border border-lab-border p-4 bg-lab-dark hover:border-lab-amber transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-lab-text">Lab: {session.lab?.title || 'Unknown'}</h3>
                    <p className="text-lab-muted text-sm font-mono mt-1">Student: {session.owner?.name} ({session.owner?.email})</p>
                    {session.collaborators.length > 1 && (
                      <p className="text-lab-muted text-xs font-mono mt-1">
                        + {session.collaborators.length - 1} Collaborators
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/lab/shared/${session.id}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-lab-amber text-lab-amber hover:bg-lab-amber/10 font-mono text-sm transition-colors"
                  >
                    <Eye size={16} /> SPECTATE <ChevronRight size={16} />
                  </button>
                </div>
              ))}
              {liveSessions.length === 0 && (
                <div className="text-center py-12 text-lab-muted font-mono border border-dashed border-lab-border">
                  NO ACTIVE SESSIONS FOUND FOR YOUR LABS.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grade' && (
          <div className="panel p-6 bg-lab-panel/90">
            <h2 className="text-xl font-bold text-lab-green mb-6 flex items-center gap-2">
              <Shield size={20} /> SUBMISSIONS AWAITING REVIEW
            </h2>
            <div className="space-y-4">
              {submittedSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between border border-lab-border p-4 bg-lab-dark hover:border-lab-green transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-lab-text">Lab: {session.lab?.title}</h3>
                    <p className="text-lab-muted text-sm font-mono mt-1">Student: {session.owner?.name} ({session.owner?.email})</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded font-mono ${session.status === 'SUBMITTED' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                        {session.status}
                      </span>
                      {session.grade && (
                        <span className="text-xs px-2 py-1 rounded font-mono bg-lab-border text-lab-text">
                          Score: {session.grade.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/lab/shared/${session.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-lab-green text-white font-mono text-sm hover:bg-green-600 transition-colors rounded shadow-[0_0_10px_rgba(67,181,129,0.3)]"
                  >
                    REVIEW SUBMISSION <ChevronRight size={16} />
                  </button>
                </div>
              ))}
              {submittedSessions.length === 0 && (
                <div className="text-center py-12 text-lab-muted font-mono border border-dashed border-lab-border">
                  NO SUBMISSIONS FOUND.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
