import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { SimulationResult } from '../../hooks/useSimulation';
import { X, AlertTriangle, Activity, BarChart2, Hash } from 'lucide-react';
import SimulationGraphs from './SimulationGraphs';

interface SimulationTelemetryProps {
  result: SimulationResult | null;
  error: string | null;
  onClose: () => void;
}

const formatValue = (val: number, unit: string) => {
  if (Math.abs(val) < 1e-9) return `0.00 ${unit}`;
  if (Math.abs(val) < 1e-6) return `${(val * 1e9).toFixed(2)} n${unit}`;
  if (Math.abs(val) < 1e-3) return `${(val * 1e6).toFixed(2)} µ${unit}`;
  if (Math.abs(val) < 1) return `${(val * 1e3).toFixed(2)} m${unit}`;
  if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(2)} k${unit}`;
  return `${val.toFixed(2)} ${unit}`;
};

const SimulationTelemetry: React.FC<SimulationTelemetryProps> = ({ result, error, onClose }) => {
  const { nodes } = useCanvasStore();
  const [viewMode, setViewMode] = useState<'raw' | 'graph'>('graph');

  if (!result && !error) return null;

  return (
    <div className={`absolute top-16 right-4 bg-lab-panel border border-lab-border rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden font-mono transition-all ${viewMode === 'graph' ? 'w-[500px]' : 'w-80'}`}>
      <div className={`h-10 px-3 flex items-center justify-between border-b ${error ? 'bg-red-950/30 border-red-900/50' : 'bg-lab-dark border-lab-border'}`}>
        <div className="flex items-center gap-2">
          {error ? <AlertTriangle size={16} className="text-red-500" /> : <Activity size={16} className="text-lab-amber" />}
          <span className={`text-xs font-bold ${error ? 'text-red-400' : 'text-lab-amber'}`}>
            {error ? 'SIMULATION ERROR' : 'TELEMETRY DATA'}
          </span>
        </div>
        
        {!error && (
          <div className="flex items-center gap-1 bg-lab-darker rounded-md p-0.5 border border-lab-border/50">
            <button 
              onClick={() => setViewMode('graph')}
              className={`p-1 rounded ${viewMode === 'graph' ? 'bg-lab-border text-white' : 'text-lab-muted hover:text-white'}`}
              title="Graph View"
            >
              <BarChart2 size={14} />
            </button>
            <button 
              onClick={() => setViewMode('raw')}
              className={`p-1 rounded ${viewMode === 'raw' ? 'bg-lab-border text-white' : 'text-lab-muted hover:text-white'}`}
              title="Raw Values View"
            >
              <Hash size={14} />
            </button>
          </div>
        )}

        <button onClick={onClose} className="text-lab-muted hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
        {error ? (
          <div className="p-3 text-sm text-red-400 bg-red-950/20 border-b border-red-900/30 leading-relaxed overflow-y-auto">
            {error}
          </div>
        ) : result ? (
          <>
            {viewMode === 'graph' ? (
              <SimulationGraphs timeSeriesData={result.timeSeriesData} />
            ) : (
              <div className="p-3 overflow-y-auto space-y-4">
                {result.hasRMSApproximation && (
                  <div className="text-xs text-lab-amber bg-amber-950/20 border border-amber-900/30 rounded p-2 mb-2 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>AC sources were simulated using their RMS DC-equivalent voltage.</span>
                  </div>
                )}
                
                <div>
                  <h3 className="text-xs font-bold text-lab-muted mb-2 border-b border-lab-border pb-1">BRANCH CURRENTS</h3>
                  <div className="space-y-1">
                    {Object.entries(result.branchCurrents).map(([id, current]) => {
                      const node = nodes.find(n => n.id === id);
                      if (!node || node.data.type === 'ground' || node.data.type === 'junction') return null;
                      
                      return (
                        <div key={`i-${id}`} className="flex justify-between text-sm py-1 border-b border-lab-border/30 last:border-0">
                          <span className="text-gray-400">{node.data.label || node.id}</span>
                          <span className="text-lab-amber font-semibold">{formatValue(current, 'A')}</span>
                        </div>
                      );
                    })}
                    {Object.keys(result.branchCurrents).length === 0 && (
                      <div className="text-xs text-lab-muted py-2 italic">No currents to display</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-lab-muted mb-2 border-b border-lab-border pb-1 mt-4">NODE VOLTAGES</h3>
                  <div className="space-y-1">
                    {Object.entries(result.nodeVoltages).map(([id, voltage]) => {
                      const node = nodes.find(n => n.id === id);
                      if (!node) return null;
                      
                      return (
                        <div key={`v-${id}`} className="flex justify-between text-sm py-1 border-b border-lab-border/30 last:border-0">
                          <span className="text-gray-400">{node.data.label || node.id}</span>
                          <span className="text-white font-semibold">{formatValue(voltage, 'V')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SimulationTelemetry;
