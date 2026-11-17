import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, Users, FileText, CheckCircle, X, AlertTriangle } from 'lucide-react';
import ComponentLibrary from '../components/canvas/ComponentLibrary';
import CircuitCanvas from '../components/canvas/CircuitCanvas';
import PropertiesPanel from '../components/canvas/PropertiesPanel';
import SimulationTelemetry from '../components/canvas/SimulationTelemetry';
import CollaboratorPanel from '../components/canvas/CollaboratorPanel';
import LiveCursors from '../components/canvas/LiveCursors';
import ReportGenerator from '../components/canvas/ReportGenerator';
import GradingPanel from '../components/canvas/GradingPanel';
import { useSimulation } from '../hooks/useSimulation';
import { useCollaboration } from '../hooks/useCollaboration';
import CustomComponentModal from '../components/canvas/CustomComponentModal';
import { useCanvasStore } from '../store/canvasStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const SharedLab: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isSimulating, result, error, runSimulation, closeTelemetry } = useSimulation();
  const [showCollabPanel, setShowCollabPanel] = React.useState(false);
  const [showAssignmentDetails, setShowAssignmentDetails] = React.useState(false);
  const [showGradingPanel, setShowGradingPanel] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [showComponentModal, setShowComponentModal] = React.useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [sessionDetails, setSessionDetails] = React.useState<any>(null);
  
  const { user } = useAuthStore();
  
  const { isConnected, remoteCursors, emitCursorMove, emitNodeChanges, emitEdgeChanges, emitFullSync } = useCollaboration(id);
  const { isReadOnly, setEmitters } = useCanvasStore();

  useEffect(() => {
    setEmitters(emitNodeChanges, emitEdgeChanges, emitFullSync);
    return () => setEmitters(() => {}, () => {}, () => {});
  }, [emitNodeChanges, emitEdgeChanges, emitFullSync, setEmitters]);

  useEffect(() => {
    if (id) {
      api.get(`/sessions/${id}`)
        .then(res => setSessionDetails(res.data.session))
        .catch(err => console.error('Failed to load session details', err));
    }
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent) => {
    emitCursorMove(e.clientX, e.clientY);
  };

  const handleSubmitSession = async () => {
    try {
      const res = await api.post(`/sessions/${id}/submit`);
      setSessionDetails(res.data.session);
      setShowSubmitConfirm(false);
    } catch (err) {
      alert('Failed to submit session.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-lab-dark overflow-hidden relative" onMouseMove={handleMouseMove}>
      {/* Top Header */}
      <header className="h-14 bg-lab-panel border-b border-lab-border flex items-center justify-between px-4 shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-lab-muted hover:text-lab-amber transition-colors flex items-center gap-1 font-mono text-sm"
          >
            <ArrowLeft size={16} /> EXIT
          </button>
          <div className="h-4 w-px bg-lab-border"></div>
          <h1 className="font-bold text-lab-text uppercase">
            {sessionDetails ? (sessionDetails.lab?.title || 'FREE EXPERIMENTAL LAB') : 'LOADING...'}
          </h1>
          {isConnected ? (
            <span className="text-xs text-lab-green flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-lab-green animate-pulse"></div> LIVE</span>
          ) : (
            <span className="text-xs text-lab-muted flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-lab-muted"></div> OFFLINE</span>
          )}
          {isReadOnly && (
            <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded ml-2 border border-red-800">VIEW ONLY</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {sessionDetails?.labId && (
            <button
              onClick={() => setShowAssignmentDetails(!showAssignmentDetails)}
              className={`btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 ${showAssignmentDetails ? 'bg-lab-border text-lab-text' : ''}`}
            >
              <FileText size={14} /> ASSIGNMENT
            </button>
          )}
          <button 
            onClick={() => setShowCollabPanel(!showCollabPanel)}
            className={`btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 ${showCollabPanel ? 'bg-lab-border text-lab-text' : ''}`}
          >
            <Users size={14} /> {sessionDetails?.collaborators?.length > 1 ? `COLLABORATORS (${sessionDetails.collaborators.length})` : 'SHARE'}
          </button>
          
          {/* Show the existing ReportGenerator only if it's not locked. Otherwise show View Final Report */}
          {sessionDetails?.status !== 'SUBMITTED' && sessionDetails?.status !== 'GRADED' ? (
            <>
              <button
                onClick={() => setShowComponentModal(true)}
                className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 border-lab-amber text-lab-amber hover:bg-lab-amber/10"
              >
                + BUILD COMPONENT
              </button>
              <ReportGenerator />
            </>
          ) : sessionDetails?.reports && sessionDetails.reports.length > 0 ? (
             <button 
               onClick={() => window.open(sessionDetails.reports[0].fileUrl, '_blank')}
               className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 text-lab-amber border-lab-amber/50 hover:bg-lab-amber/10"
             >
               <FileText size={14} /> VIEW FINAL REPORT
             </button>
          ) : null}

          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}
          </button>
          {user?.role === 'TEACHER' && sessionDetails?.labId && (sessionDetails.status === 'SUBMITTED' || sessionDetails.status === 'GRADED') && (
            <button 
              onClick={() => setShowGradingPanel(!showGradingPanel)}
              className={`btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 ${showGradingPanel ? 'bg-lab-border text-lab-text' : ''}`}
            >
              <CheckCircle size={14} /> {sessionDetails.status === 'GRADED' ? 'VIEW GRADE' : 'EVALUATE'}
            </button>
          )}

          {sessionDetails?.labId && sessionDetails?.status !== 'SUBMITTED' && sessionDetails?.status !== 'GRADED' && user?.role === 'STUDENT' && (
            <button 
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-lab-green text-white font-mono text-sm py-1.5 px-3 rounded flex items-center gap-2 hover:bg-green-600 transition-colors ml-2 shadow-[0_0_10px_rgba(67,181,129,0.3)]"
            >
              <CheckCircle size={14} /> SUBMIT FOR GRADING
            </button>
          )}
          {sessionDetails?.status === 'SUBMITTED' && user?.role === 'STUDENT' && (
            <span className="bg-lab-border text-lab-muted font-mono text-sm py-1.5 px-3 rounded flex items-center gap-2 ml-2">
              <CheckCircle size={14} /> AWAITING EVALUATION
            </span>
          )}
          {sessionDetails?.status === 'GRADED' && user?.role === 'STUDENT' && (
            <button 
              onClick={() => setShowFeedbackModal(!showFeedbackModal)}
              className="bg-lab-green text-white font-mono text-sm py-1.5 px-3 rounded flex items-center gap-2 hover:bg-green-600 transition-colors ml-2 shadow-[0_0_10px_rgba(67,181,129,0.3)]"
            >
              <CheckCircle size={14} /> VIEW FEEDBACK
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative z-0">
        <ComponentLibrary allowedComponents={sessionDetails?.lab?.expectedComponents ? sessionDetails.lab.expectedComponents.split(',') : []} />
        <CircuitCanvas />
        <PropertiesPanel />
        
        {/* Simulation Telemetry Overlay */}
        <SimulationTelemetry result={result} error={error} onClose={closeTelemetry} />
        
        {/* Component Builder Modal */}
        <CustomComponentModal 
          isOpen={showComponentModal} 
          onClose={() => setShowComponentModal(false)} 
          onSave={async (data) => {
            await api.post('/components', data);
            // A small event to trigger ComponentLibrary to refresh could be fired here
            window.dispatchEvent(new Event('refreshCustomComponents'));
          }}
        />

        {/* Collab Panel Overlay */}
        {showCollabPanel && id && (
          <CollaboratorPanel sessionId={id} onClose={() => setShowCollabPanel(false)} />
        )}

        {/* Grading Panel Overlay (Teacher Only) */}
        {showGradingPanel && id && user?.role === 'TEACHER' && (
          <GradingPanel sessionId={id} onClose={() => {
            setShowGradingPanel(false);
            // Refresh session details to get new grade
            api.get(`/sessions/${id}`).then(res => setSessionDetails(res.data.session));
          }} sessionDetails={sessionDetails} />
        )}

        {/* Student Feedback Modal */}
        {showFeedbackModal && sessionDetails?.grade && (
          <div className="absolute top-4 right-4 w-96 bg-lab-panel border border-lab-green rounded shadow-2xl z-40 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-lab-border flex justify-between items-center bg-lab-dark">
              <h3 className="font-bold text-lab-green flex items-center gap-2">
                <CheckCircle size={18} />
                INSTRUCTOR FEEDBACK
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-lab-muted hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-lab-border pb-4">
                <span className="text-lab-muted font-mono text-sm">FINAL SCORE:</span>
                <span className="text-3xl font-bold text-lab-green">{sessionDetails.grade.score}/100</span>
              </div>
              <div>
                <h4 className="font-mono text-xs text-lab-muted mb-2">INSTRUCTOR NOTES:</h4>
                <div className="bg-lab-dark border border-lab-border p-4 text-sm text-lab-text font-mono whitespace-pre-wrap min-h-[100px]">
                  {sessionDetails.grade.feedback || 'No written feedback provided.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Details Overlay */}
        {showAssignmentDetails && sessionDetails?.lab && (
          <div className="absolute top-4 right-4 w-96 bg-lab-panel border border-lab-amber rounded shadow-2xl z-40 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-lab-border flex justify-between items-center bg-lab-dark">
              <h3 className="font-bold text-lab-amber flex items-center gap-2">
                <FileText size={18} />
                ASSIGNMENT DETAILS
              </h3>
              <button onClick={() => setShowAssignmentDetails(false)} className="text-lab-muted hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-2">{sessionDetails.lab.title}</h2>
              <p className="text-lab-muted text-sm mb-6">{sessionDetails.lab.description}</p>
              
              <div className="mb-6">
                <h4 className="font-mono text-xs text-lab-amber mb-2">INSTRUCTIONS:</h4>
                <div className="bg-lab-dark border border-lab-border p-4 text-sm text-lab-text font-mono whitespace-pre-wrap">
                  {sessionDetails.lab.instructions}
                </div>
              </div>

              {sessionDetails.lab.expectedComponents && (
                <div>
                  <h4 className="font-mono text-xs text-lab-amber mb-2">EXPECTED COMPONENTS:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sessionDetails.lab.expectedComponents.split(',').map((comp: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-lab-border text-xs font-mono rounded">
                        {comp.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-lab-dark border border-lab-amber/30 rounded p-6 shadow-[0_0_20px_rgba(255,176,0,0.15)] max-w-md w-full">
              <h3 className="text-lab-amber font-mono text-lg mb-2 flex items-center gap-2">
                <AlertTriangle size={20} />
                CONFIRM SUBMISSION
              </h3>
              <p className="text-lab-muted text-sm mb-6">
                Are you sure you want to submit this session for grading? You won't be able to make further edits once submitted.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 font-mono text-sm text-lab-muted hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSubmitSession}
                  className="btn-primary bg-lab-green hover:bg-green-600 text-white flex items-center gap-2 shadow-[0_0_10px_rgba(67,181,129,0.3)]"
                >
                  <CheckCircle size={16} /> CONFIRM SUBMIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cursors Overlay */}
        <LiveCursors cursors={remoteCursors} />
      </main>
    </div>
  );
};

export default SharedLab;
