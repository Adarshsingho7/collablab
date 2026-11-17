import { Handle, Position } from '@xyflow/react';

const SwitchNode = ({ data, selected }: { data: any, selected: boolean }) => {
  const isClosed = data.closed || false;
  
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[70px]`}>
      <Handle type="target" position={Position.Top} id="left" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Switch</div>
      
      {/* SVG for SPST Switch */}
      <svg width="40" height="30" viewBox="0 0 40 30" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="8" strokeWidth="2" />
        <circle cx="20" cy="10" r="2" strokeWidth="2" />
        <circle cx="20" cy="20" r="2" strokeWidth="2" />
        {/* Switch blade */}
        <line x1="20" y1="10" x2={isClosed ? "20" : "28"} y2={isClosed ? "20" : "18"} strokeWidth="2" className="transition-all duration-200" />
        <line x1="20" y1="22" x2="20" y2="30" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.label || 'SW'}
      </div>
      <Handle type="source" position={Position.Bottom} id="right" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
    </div>
  );
};

export default SwitchNode;
