import { Handle, Position } from '@xyflow/react';

const BatteryNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[60px]`}>
      <Handle type="target" position={Position.Top} id="pos" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute top-1 right-2 text-lab-muted font-mono text-[10px]">+</div>
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Battery</div>
      
      {/* SVG for Battery (long/short parallel lines) */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="stroke-lab-text fill-none">
        {/* Top wire */}
        <line x1="20" y1="0" x2="20" y2="12" strokeWidth="2" />
        
        {/* Long line (positive) */}
        <line x1="10" y1="12" x2="30" y2="12" strokeWidth="3" />
        
        {/* Short line (negative) */}
        <line x1="15" y1="18" x2="25" y2="18" strokeWidth="4" />
        
        {/* Long line */}
        <line x1="10" y1="24" x2="30" y2="24" strokeWidth="3" />
        
        {/* Short line (negative) */}
        <line x1="15" y1="30" x2="25" y2="30" strokeWidth="4" />
        
        {/* Bottom wire */}
        <line x1="20" y1="30" x2="20" y2="40" strokeWidth="2" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'V'}` : 'BAT'}
      </div>
      <Handle type="source" position={Position.Bottom} id="neg" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute bottom-1 right-2 text-lab-muted font-mono text-[10px]">-</div>
    </div>
  );
};

export default BatteryNode;
