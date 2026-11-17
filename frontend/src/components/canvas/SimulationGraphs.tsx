import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useCanvasStore } from '../../store/canvasStore';
import { Info } from 'lucide-react';

interface SimulationGraphsProps {
  timeSeriesData?: any[];
}

const COLORS = [
  '#4ade80', // green-400
  '#60a5fa', // blue-400
  '#f87171', // red-400
  '#fbbf24', // amber-400
  '#c084fc', // purple-400
  '#2dd4bf', // teal-400
];

const SimulationGraphs: React.FC<SimulationGraphsProps> = ({ timeSeriesData }) => {
  const { nodes } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'voltages' | 'currents'>('voltages');

  if (!timeSeriesData || timeSeriesData.length === 0) return null;

  // Find which keys to plot
  const dataKeys = Object.keys(timeSeriesData[0]).filter(k => k !== 'time');
  const voltageKeys = dataKeys.filter(k => k.startsWith('v_'));
  const currentKeys = dataKeys.filter(k => k.startsWith('i_'));

  const getLabel = (key: string) => {
    const id = key.substring(2);
    const node = nodes.find(n => n.id === id);
    if (!node) return key;
    return node.data?.label || node.id;
  };

  const hasACSource = nodes.some(n => n.type === 'ac_source');
  const hasCapOrInd = nodes.some(n => n.type === 'capacitor' || n.type === 'inductor');

  return (
    <div className="flex flex-col h-full bg-lab-panel rounded-b-lg font-mono">
      {/* Disclaimer / Warning */}
      {hasACSource && hasCapOrInd && (
        <div className="bg-amber-950/30 border-b border-amber-900/50 p-2 flex items-start gap-2 text-xs text-amber-200/80">
          <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
          <p>
            <strong className="text-amber-400">Limitation:</strong> Capacitor/inductor AC behavior is not yet simulated. 
            They are treated as static DC open/short at each time step. 
            You will not see charging curves, phase shifts, or filtering effects.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-lab-border">
        <button
          onClick={() => setActiveTab('voltages')}
          className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'voltages' ? 'bg-lab-border text-white' : 'text-lab-muted hover:text-white hover:bg-lab-border/50'
          }`}
        >
          Node Voltages (V)
        </button>
        <button
          onClick={() => setActiveTab('currents')}
          className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'currents' ? 'bg-lab-border text-white' : 'text-lab-muted hover:text-white hover:bg-lab-border/50'
          }`}
        >
          Branch Currents (A)
        </button>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] p-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af" 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(val) => `${val}ms`}
              minTickGap={20}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(val) => {
                if (Math.abs(val) >= 1000) return `${val / 1000}k`;
                if (Math.abs(val) > 0 && Math.abs(val) < 0.001) return `${val * 1000000}µ`;
                if (Math.abs(val) > 0 && Math.abs(val) < 1) return `${val * 1000}m`;
                return val.toString();
              }}
              width={40}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#e5e7eb' }}
              labelFormatter={(val) => `Time: ${val}ms`}
              formatter={(value, name) => {
                const strName = String(name ?? '');
                const numVal = typeof value === 'number' ? value : Number(value) || 0;
                const unit = strName.startsWith('v_') ? 'V' : 'A';
                let formatted = numVal.toFixed(3);
                if (Math.abs(numVal) < 1e-6) formatted = (numVal * 1e9).toFixed(2) + ' n';
                else if (Math.abs(numVal) < 1e-3) formatted = (numVal * 1e6).toFixed(2) + ' µ';
                else if (Math.abs(numVal) < 1) formatted = (numVal * 1e3).toFixed(2) + ' m';
                return [formatted + unit, getLabel(strName)];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              formatter={(value) => getLabel(value)}
            />
            
            {activeTab === 'voltages' && voltageKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
            
            {activeTab === 'currents' && currentKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulationGraphs;
