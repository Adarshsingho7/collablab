import { Handle, Position } from '@xyflow/react';

const VoltmeterNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[60px]`}>
      <Handle type="target" position={Position.Top} id="positive" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Voltmeter</div>
      
      {/* SVG for Voltmeter */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="stroke-lab-text fill-none">
        <line x1="20" y1="0" x2="20" y2="10" strokeWidth="2" />
        <circle cx="20" cy="20" r="10" strokeWidth="2" />
        <text x="20" y="24" textAnchor="middle" className="fill-lab-text font-mono text-[12px] stroke-none">V</text>
        <line x1="20" y1="30" x2="20" y2="40" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.label || 'VM'}
      </div>
      <Handle type="source" position={Position.Bottom} id="negative" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
    </div>
  );
};

export default VoltmeterNode;
