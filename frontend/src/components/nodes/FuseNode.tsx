import { Handle, Position } from '@xyflow/react';

const FuseNode: React.FC<{ data: any; selected?: boolean }> = ({ data, selected }) => {
  const isBlown = data.blown;

  return (
    <div className={`relative flex items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_rgba(255,176,0,0.3)]' : 'border-lab-border'}`}>
      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 bg-lab-text" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-lab-text" />
      
      <div className="flex flex-col items-center">
        <svg width="40" height="20" viewBox="0 0 40 20" className="stroke-lab-text">
          {/* Wire left */}
          <line x1="0" y1="10" x2="8" y2="10" strokeWidth="2" />
          
          {/* Rectangle */}
          <rect x="8" y="5" width="24" height="10" fill="transparent" strokeWidth="2" />
          
          {/* Internal Wire */}
          {isBlown ? (
            <g strokeWidth="1.5">
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="24" y1="10" x2="32" y2="10" />
            </g>
          ) : (
            <line x1="8" y1="10" x2="32" y2="10" strokeWidth="1.5" />
          )}

          {/* Wire right */}
          <line x1="32" y1="10" x2="40" y2="10" strokeWidth="2" />
        </svg>
        <span className="text-[10px] font-mono text-lab-muted mt-1">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 bg-lab-text" />
      <Handle type="target" position={Position.Right} id="right-target" className="w-2 h-2 bg-lab-text" />
    </div>
  );
};

export default FuseNode;
