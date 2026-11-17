import { Handle, Position } from '@xyflow/react';

const CapacitorNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[60px]`}>
      <Handle type="target" position={Position.Top} id="left" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Capacitor</div>
      
      {/* SVG for Capacitor */}
      <svg width="40" height="20" viewBox="0 0 40 20" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="8" strokeWidth="2" />
        <line x1="5" y1="8" x2="35" y2="8" strokeWidth="3" />
        <line x1="5" y1="12" x2="35" y2="12" strokeWidth="3" />
        <line x1="20" y1="12" x2="20" y2="20" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'F'}` : 'C'}
      </div>
      <Handle type="source" position={Position.Bottom} id="right" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
    </div>
  );
};

export default CapacitorNode;
