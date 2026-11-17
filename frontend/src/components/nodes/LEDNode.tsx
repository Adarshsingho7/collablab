import { Handle, Position } from '@xyflow/react';

const LEDNode: React.FC<{ data: any; selected?: boolean }> = ({ data, selected }) => {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    green: '#22c55e',
    blue: '#3b82f6',
    yellow: '#eab308',
  };
  
  const ledColor = colorMap[data.color as string] || '#ffb000';

  return (
    <div className={`relative flex items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_rgba(255,176,0,0.3)]' : 'border-lab-border'}`}>
      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 bg-lab-text" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-lab-text" />
      
      <div className="flex flex-col items-center">
        <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-lab-text">
          {/* Wire left */}
          <line x1="0" y1="14" x2="10" y2="14" strokeWidth="2" />
          
          {/* Triangle */}
          <polygon points="10,6 25,14 10,22" fill="transparent" strokeWidth="2" />
          
          {/* Vertical line (cathode) */}
          <line x1="25" y1="6" x2="25" y2="22" strokeWidth="2" />
          
          {/* Wire right */}
          <line x1="25" y1="14" x2="40" y2="14" strokeWidth="2" />

          {/* Light rays */}
          <g stroke={ledColor} strokeWidth="1.5">
            <line x1="20" y1="4" x2="26" y2="-2" />
            <polygon points="26,-2 24,-2 26,0" fill={ledColor} />
            <line x1="14" y1="2" x2="20" y2="-4" />
            <polygon points="20,-4 18,-4 20,-2" fill={ledColor} />
          </g>
        </svg>
        <span className="text-[10px] font-mono text-lab-muted mt-1">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 bg-lab-text" />
      <Handle type="target" position={Position.Right} id="right-target" className="w-2 h-2 bg-lab-text" />
    </div>
  );
};

export default LEDNode;
