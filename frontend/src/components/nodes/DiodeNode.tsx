import { Handle, Position } from '@xyflow/react';

const DiodeNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[60px]`}>
      <Handle type="target" position={Position.Top} id="anode" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute top-1 right-2 text-lab-muted font-mono text-[10px]">A</div>
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Diode</div>
      
      {/* SVG for Diode */}
      <svg width="40" height="30" viewBox="0 0 40 30" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="10" strokeWidth="2" />
        <polygon points="10,10 30,10 20,20" className="fill-lab-text" />
        <line x1="10" y1="20" x2="30" y2="20" strokeWidth="3" />
        <line x1="20" y1="20" x2="20" y2="30" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.label || 'D'}
      </div>
      <Handle type="source" position={Position.Bottom} id="cathode" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute bottom-1 right-2 text-lab-muted font-mono text-[10px]">K</div>
    </div>
  );
};

export default DiodeNode;
