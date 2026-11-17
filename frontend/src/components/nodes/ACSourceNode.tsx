import { Handle, Position } from '@xyflow/react';

const ACSourceNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[70px]`}>
      <Handle type="target" position={Position.Top} id="positive" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">AC Source</div>
      
      {/* SVG for AC Source */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="10" strokeWidth="2" />
        <circle cx="20" cy="20" r="10" strokeWidth="2" />
        <path d="M 14 20 Q 17 15 20 20 T 26 20" strokeWidth="2" />
        <line x1="20" y1="30" x2="20" y2="40" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'V'}` : 'V~'}
      </div>
      <Handle type="source" position={Position.Bottom} id="negative" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
    </div>
  );
};

export default ACSourceNode;
