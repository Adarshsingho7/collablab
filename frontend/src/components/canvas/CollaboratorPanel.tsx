import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { X, Shield, Eye, Edit2, UserMinus } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import api from '../../lib/api';

interface Collaborator {
  id: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user: {
    name: string;
    email: string;
  };
}

export default function CollaboratorPanel({ sessionId, onClose }: { sessionId: string, onClose: () => void }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const currentUser = useAuthStore(state => state.user);
  const { setReadOnly } = useCanvasStore();

  const fetchCollaborators = async () => {
    try {
      const res = await api.get(`/sessions/${sessionId}/collaborators`);
      const data = res.data;
      setCollaborators(data.collaborators);
      
      // Update local readonly state
      const myCollab = data.collaborators.find((c: Collaborator) => c.userId === currentUser?.id);
      if (myCollab) {
        setReadOnly(myCollab.role === 'VIEWER');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCollaborators();
    // In a real app we would listen for socket events to refresh this list automatically.
    // For MVP, we'll poll every 5s while the panel is open.
    const interval = setInterval(fetchCollaborators, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const updateRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/sessions/${sessionId}/collaborators/${userId}`, { role });
      fetchCollaborators();
    } catch (e) {
      console.error(e);
    }
  };

  const kickUser = async (userId: string) => {
    try {
      await api.delete(`/sessions/${sessionId}/collaborators/${userId}`);
      fetchCollaborators();
    } catch (e) {
      console.error(e);
    }
  };

  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('EDITOR');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');

  const addCollaborator = async () => {
    if (!newCollabEmail) return;
    setInviteStatus('idle');
    try {
      await api.post(`/sessions/${sessionId}/collaborators`, { email: newCollabEmail, role: newCollabRole });
      
      setInviteStatus('success');
      setInviteMessage('User added successfully');
      setNewCollabEmail('');
      fetchCollaborators();
      
      setTimeout(() => setInviteStatus('idle'), 3000);
    } catch (e: any) {
      setInviteStatus('error');
      setInviteMessage(e.response?.data?.message || e.message || 'Failed to add collaborator');
      setTimeout(() => setInviteStatus('idle'), 3000);
    }
  };

  const myCollab = collaborators.find(c => c.userId === currentUser?.id);
  const isOwner = myCollab?.role === 'OWNER';

  return (
    <div className="absolute top-16 right-4 w-80 bg-lab-panel border border-lab-border rounded shadow-xl flex flex-col z-50">
      <div className="flex justify-between items-center p-3 border-b border-lab-border">
        <h3 className="text-sm font-bold text-lab-text">Collaborators ({collaborators.length})</h3>
        <button onClick={onClose} className="text-lab-muted hover:text-lab-text">
          <X size={16} />
        </button>
      </div>

      {isOwner && (
        <div className="p-3 border-b border-lab-border bg-lab-dark/50 flex flex-col gap-2">
          <label className="text-xs text-lab-muted">Invite via Email</label>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address"
              value={newCollabEmail}
              onChange={e => setNewCollabEmail(e.target.value)}
              className="flex-1 bg-lab-dark border border-lab-border text-sm rounded px-2 py-1 outline-none focus:border-lab-amber"
            />
            <select 
              value={newCollabRole}
              onChange={e => setNewCollabRole(e.target.value)}
              className="bg-lab-dark border border-lab-border text-xs rounded px-1 outline-none"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button onClick={addCollaborator} className="btn-secondary text-xs px-2 py-1">Add</button>
          </div>
          {inviteStatus !== 'idle' && (
            <div className={`text-xs ${inviteStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {inviteMessage}
            </div>
          )}
        </div>
      )}

      <div className="p-2 flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar">
        {collaborators.map(c => (
          <div key={c.id} className="flex items-center justify-between p-2 rounded bg-lab-dark border border-lab-border">
            <div className="flex flex-col">
              <span className="text-sm text-lab-text font-medium flex items-center gap-1">
                {c.user.name} {c.userId === currentUser?.id && '(You)'}
              </span>
              <span className="text-xs text-lab-muted">{c.user.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {c.role === 'OWNER' && <span title="Owner"><Shield size={14} className="text-lab-amber" /></span>}
              
              {isOwner && c.role !== 'OWNER' ? (
                <div className="flex items-center gap-1">
                  <select 
                    value={c.role} 
                    onChange={(e) => updateRole(c.userId, e.target.value)}
                    className="bg-lab-panel text-xs text-lab-text border border-lab-border rounded p-1"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button onClick={() => kickUser(c.userId)} className="text-red-500 hover:text-red-400 p-1" title="Remove">
                    <UserMinus size={14} />
                  </button>
                </div>
              ) : (
                c.role !== 'OWNER' && (
                  <span className="text-xs text-lab-muted uppercase flex items-center gap-1">
                    {c.role === 'VIEWER' ? <Eye size={12}/> : <Edit2 size={12}/>}
                    {c.role}
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
