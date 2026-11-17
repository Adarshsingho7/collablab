import { Handle, Position } from '@xyflow/react';

const MultimeterNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[70px]`}>
      <Handle type="target" position={Position.Top} id="t1" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute top-1 right-2 text-red-500 font-mono text-[10px]">+</div>
      
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1 mt-1">DMM</div>
      
      {/* SVG for Multimeter Screen */}
      <div className="w-12 h-6 bg-lab-dark border border-lab-border rounded mb-1 flex items-center justify-center">
        <span className="text-lab-green font-mono text-[10px]">0.00</span>
      </div>
      
      <div className="text-lab-amber font-mono text-xs">
        {data.label || 'M'}
      </div>
      
      <Handle type="source" position={Position.Bottom} id="t2" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
      <div className="absolute bottom-1 right-2 text-black font-mono text-[10px] bg-lab-muted px-0.5 rounded leading-none">-</div>
    </div>
  );
};

export default MultimeterNode;
