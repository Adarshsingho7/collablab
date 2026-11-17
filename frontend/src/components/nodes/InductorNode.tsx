import { Handle, Position } from '@xyflow/react';

const InductorNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[70px]`}>
      <Handle type="target" position={Position.Top} id="left" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Inductor</div>
      
      {/* SVG for Inductor */}
      <svg width="50" height="20" viewBox="0 0 50 20" className="stroke-lab-text stroke-2 fill-none">
        <path d="M 0 10 L 10 10 A 5 5 0 0 1 20 10 A 5 5 0 0 1 30 10 A 5 5 0 0 1 40 10 L 50 10" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'H'}` : 'L'}
      </div>
      <Handle type="source" position={Position.Bottom} id="right" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
    </div>
  );
};

export default InductorNode;
