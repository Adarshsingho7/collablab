import { Handle, Position } from '@xyflow/react';

const TransistorNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[70px] min-h-[70px]`}>
      
      {/* Collector (Top) */}
      <Handle type="target" position={Position.Top} id="c" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" style={{ left: '60%' }} />
      <div className="absolute top-1 right-2 text-lab-muted font-mono text-[9px]">C</div>

      {/* Base (Left) */}
      <Handle type="target" position={Position.Left} id="b" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" style={{ top: '50%' }} />
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-lab-muted font-mono text-[9px]">B</div>
      
      <div className="text-lab-muted font-mono text-[9px] uppercase tracking-wider mb-1 mt-2">NPN</div>
      
      {/* SVG for NPN Transistor */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="stroke-lab-text fill-none">
        <circle cx="20" cy="20" r="16" strokeWidth="2" />
        <line x1="0" y1="20" x2="10" y2="20" strokeWidth="2" />
        <line x1="10" y1="10" x2="10" y2="30" strokeWidth="3" />
        <line x1="10" y1="15" x2="25" y2="5" strokeWidth="2" />
        <line x1="25" y1="5" x2="25" y2="0" strokeWidth="2" />
        {/* Emitter arrow */}
        <line x1="10" y1="25" x2="25" y2="35" strokeWidth="2" />
        <line x1="25" y1="35" x2="25" y2="40" strokeWidth="2" />
        <polygon points="25,35 20,33 23,30" className="fill-lab-text" strokeWidth="1" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.label || 'Q'}
      </div>

      {/* Emitter (Bottom) */}
      <Handle type="source" position={Position.Bottom} id="e" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" style={{ left: '60%' }} />
      <div className="absolute bottom-1 right-2 text-lab-muted font-mono text-[9px]">E</div>
    </div>
  );
};

export default TransistorNode;
