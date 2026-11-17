import { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../lib/api';

export interface SimulationResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
  hasRMSApproximation?: boolean;
  timeSeriesData?: any[];
}

export const useSimulation = () => {
  const { nodes, edges } = useCanvasStore();
  const { token } = useAuthStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    setResult(null);
    
    // Log simulation
    useCanvasStore.getState().addLogEntry('Executed Simulation');

    try {
      const response = await fetch(`${API_URL}/simulation/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, type: n.data.type || n.type, data: n.data })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            sourceHandle: e.sourceHandle,
            target: e.target,
            targetHandle: e.targetHandle
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Simulation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const closeTelemetry = () => {
    setResult(null);
    setError(null);
  };

  return {
    isSimulating,
    result,
    error,
    runSimulation,
    closeTelemetry
  };
};
