import { Handle, Position } from '@xyflow/react';

const PotentiometerNode: React.FC<{ data: any; selected?: boolean }> = ({ data, selected }) => {
  return (
    <div className={`relative flex items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_rgba(255,176,0,0.3)]' : 'border-lab-border'}`}>
      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 bg-lab-text" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-lab-text" />
      
      <div className="flex flex-col items-center">
        {/* Wiper Handle (Top) */}
        <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2">
          <Handle type="source" position={Position.Top} id="wiper" className="w-2 h-2 bg-lab-amber border-none" />
          <Handle type="target" position={Position.Top} id="wiper-target" className="w-2 h-2 bg-lab-amber border-none" />
        </div>

        <svg width="40" height="30" viewBox="0 0 40 30" className="stroke-lab-text">
          {/* Wire left */}
          <line x1="0" y1="20" x2="5" y2="20" strokeWidth="2" />
          
          {/* Zigzag */}
          <polyline points="5,20 8,15 14,25 20,15 26,25 32,15 35,20" fill="transparent" strokeWidth="2" />
          
          {/* Wire right */}
          <line x1="35" y1="20" x2="40" y2="20" strokeWidth="2" />

          {/* Wiper Arrow */}
          <g className="stroke-lab-amber">
            <line x1="20" y1="5" x2="20" y2="13" strokeWidth="2" />
            <polygon points="17,10 23,10 20,15" fill="#ffb000" />
          </g>
        </svg>
        <span className="text-[10px] font-mono text-lab-muted mt-1">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 bg-lab-text" />
      <Handle type="target" position={Position.Right} id="right-target" className="w-2 h-2 bg-lab-text" />
    </div>
  );
};

export default PotentiometerNode;
