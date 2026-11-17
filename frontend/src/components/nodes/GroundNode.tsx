import { Handle, Position } from '@xyflow/react';

const GroundNode = ({ selected }: { selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-dark border-2 ${selected ? 'border-lab-green shadow-[0_0_10px_#43b581]' : 'border-lab-border'}`}>
      {/* Top Handle: Ground Connection */}
      <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3 bg-lab-green border-2 border-lab-dark opacity-0" />
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3 bg-lab-green border-2 border-lab-dark !absolute" style={{ top: '-6px' }} />
      
      {/* SVG for Ground */}
      <svg width="30" height="25" viewBox="0 0 30 25" className="stroke-lab-green fill-none">
        <line x1="15" y1="0" x2="15" y2="10" strokeWidth="2" />
        <line x1="0" y1="10" x2="30" y2="10" strokeWidth="2" />
        <line x1="5" y1="16" x2="25" y2="16" strokeWidth="2" />
        <line x1="10" y1="22" x2="20" y2="22" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default GroundNode;
