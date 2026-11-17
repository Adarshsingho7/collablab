import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import ComponentLibrary from '../components/canvas/ComponentLibrary';
import CircuitCanvas from '../components/canvas/CircuitCanvas';
import PropertiesPanel from '../components/canvas/PropertiesPanel';
import SimulationTelemetry from '../components/canvas/SimulationTelemetry';
import { useSimulation } from '../hooks/useSimulation';
import { useCanvasStore } from '../store/canvasStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const FreeLab: React.FC = () => {
  const navigate = useNavigate();
  const { isSimulating, result, error, runSimulation, closeTelemetry } = useSimulation();
  const [isSharing, setIsSharing] = React.useState(false);
  const token = useAuthStore(state => state.token);
  const { nodes, edges } = useCanvasStore();

  // Expose store to window for E2E testing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).useCanvasStore = useCanvasStore;
    }
  }, []);

  const handleShare = async () => {
    if (!token) return;
    try {
      setIsSharing(true);
      const res = await api.post('/sessions/share', { circuitGraph: JSON.stringify({ nodes, edges }) });
      navigate(`/lab/shared/${res.data.session.id}`);
    } catch (err) {
      console.error('Failed to share session', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-lab-dark overflow-hidden relative">
      {/* Top Header */}
      <header className="h-14 bg-lab-panel border-b border-lab-border flex items-center justify-between px-4 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-lab-muted hover:text-lab-amber transition-colors flex items-center gap-1 font-mono text-sm"
          >
            <ArrowLeft size={16} /> EXIT
          </button>
          <div className="h-4 w-px bg-lab-border"></div>
          <h1 className="font-bold text-lab-text">FREE EXPERIMENTAL LAB</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3 disabled:opacity-50"
          >
            {isSharing ? <Loader2 size={14} className="animate-spin" /> : null}
            SHARE
          </button>
          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative z-0">
        <ComponentLibrary />
        <CircuitCanvas />
        <PropertiesPanel />
        
        {/* Simulation Telemetry Overlay */}
        <SimulationTelemetry result={result} error={error} onClose={closeTelemetry} />
      </main>
    </div>
  );
};

export default FreeLab;
