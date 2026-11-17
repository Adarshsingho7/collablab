import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

const TaskLabSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [experiments, setExperiments] = useState<any[]>([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await api.get('/labs');
        setExperiments(res.data);
      } catch (err) {
        console.error('Failed to load labs', err);
      }
    };
    fetchLabs();
  }, []);

  const handleStart = async (labId: string) => {
    try {
      const res = await api.post('/sessions/share', {
        labId,
        circuitGraph: '{}'
      });
      navigate(`/lab/shared/${res.data.session.id}`);
    } catch (err) {
      alert('Failed to start session');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-lab-dark text-lab-text">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-lab-muted hover:text-lab-amber mb-8 transition-colors">
          <ArrowLeft size={16} /> RETURN TO WORKSPACE
        </button>

        <h1 className="text-3xl font-bold text-lab-green mb-2">TASK LAB</h1>
        <p className="font-mono text-lab-muted mb-8 border-b border-lab-border pb-4">SELECT AN EXPERIMENT TO BEGIN</p>

        <div className="space-y-4">
          {experiments.map(exp => {
            const userSession = exp.sessions?.find((s: any) => s.ownerId === user?.id);

            return (
              <div key={exp.id} className="p-6 bg-lab-dark border border-lab-border hover:border-lab-blue transition-colors">
                <h3 className="text-xl font-bold text-lab-blue mb-2">{exp.title}</h3>
                <p className="text-lab-muted font-mono text-sm mb-4">Instructor: {exp.teacher?.name}</p>
                <p className="text-lab-text mb-6">{exp.description}</p>
                
                <div className="flex justify-between items-center mt-4">
                  {userSession ? (
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-mono rounded ${
                        userSession.status === 'SUBMITTED' ? 'bg-yellow-900 text-yellow-300' :
                        userSession.status === 'GRADED' ? 'bg-green-900 text-green-300' :
                        'bg-lab-border text-lab-muted'
                      }`}>
                        {userSession.status === 'IN_PROGRESS' ? 'IN PROGRESS' : userSession.status}
                      </span>
                      
                      {userSession.status === 'GRADED' && userSession.grade && (
                        <span className="text-sm font-bold text-lab-green font-mono border border-lab-green px-2 py-1">
                          SCORE: {userSession.grade.score}/100
                        </span>
                      )}

                      <button 
                        onClick={() => navigate(`/lab/shared/${userSession.id}`)}
                        className="btn-primary"
                      >
                        {userSession.status === 'GRADED' ? 'VIEW FEEDBACK' : 'RESUME SESSION'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStart(exp.id)}
                      className="btn-primary"
                    >
                      START ASSIGNMENT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {experiments.length === 0 && (
            <div className="text-center py-12 text-lab-muted font-mono border border-dashed border-lab-border">
              NO LABS AVAILABLE AT THIS TIME.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskLabSelection;
