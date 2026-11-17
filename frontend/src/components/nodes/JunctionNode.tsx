import { Handle, Position } from '@xyflow/react';

const JunctionNode = ({ selected }: { selected: boolean }) => {
  return (
    <div className={`relative flex items-center justify-center p-1 rounded-full bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-text'} min-w-[20px] min-h-[20px]`}>
      <Handle type="target" position={Position.Top} id="center" className="w-1.5 h-1.5 bg-lab-text border-0" style={{ top: -3 }} />
      <Handle type="source" position={Position.Right} id="t2" className="w-1.5 h-1.5 bg-lab-text border-0" style={{ right: -3 }} />
      <Handle type="source" position={Position.Bottom} id="t3" className="w-1.5 h-1.5 bg-lab-text border-0" style={{ bottom: -3 }} />
      <Handle type="target" position={Position.Left} id="t4" className="w-1.5 h-1.5 bg-lab-text border-0" style={{ left: -3 }} />
      <div className="w-2 h-2 bg-lab-text rounded-full"></div>
    </div>
  );
};

export default JunctionNode;
