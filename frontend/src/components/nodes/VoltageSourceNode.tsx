import { Handle, Position } from '@xyflow/react';

const VoltageSourceNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[80px]`}>
      {/* Top Handle: Positive Terminal */}
      <Handle type="target" position={Position.Top} id="positive-target" className="w-3 h-3 bg-red-500 border-2 border-lab-dark opacity-0" />
      <Handle type="source" position={Position.Top} id="positive" className="w-3 h-3 bg-red-500 border-2 border-lab-dark !absolute" style={{ top: '-6px' }} />
      
      <div className="absolute top-1 left-2 text-red-500 font-mono text-[10px]">+</div>
      <div className="absolute bottom-1 left-2 text-blue-500 font-mono text-[10px]">-</div>

      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-2">DC Source</div>
      
      {/* SVG for Battery/DC Source */}
      <svg width="40" height="30" viewBox="0 0 40 30" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="10" strokeWidth="2" />
        <line x1="5" y1="10" x2="35" y2="10" strokeWidth="3" />
        <line x1="12" y1="18" x2="28" y2="18" strokeWidth="5" />
        <line x1="20" y1="18" x2="20" y2="30" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'V'}` : 'V'}
      </div>

      {/* Bottom Handle: Negative Terminal */}
      <Handle type="target" position={Position.Bottom} id="negative-target" className="w-3 h-3 bg-blue-500 border-2 border-lab-dark opacity-0" />
      <Handle type="source" position={Position.Bottom} id="negative" className="w-3 h-3 bg-blue-500 border-2 border-lab-dark !absolute" style={{ bottom: '-6px' }} />
    </div>
  );
};

export default VoltageSourceNode;
