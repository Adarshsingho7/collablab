import { Handle, Position } from '@xyflow/react';

const PushButtonNode: React.FC<{ data: any; selected?: boolean }> = ({ data, selected }) => {
  const isPressed = data.pressed;

  return (
    <div className={`relative flex items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_rgba(255,176,0,0.3)]' : 'border-lab-border'}`}>
      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 bg-lab-text" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-lab-text" />
      
      <div className="flex flex-col items-center">
        <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-lab-text">
          {/* Wire left */}
          <line x1="0" y1="12" x2="12" y2="12" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" className="fill-lab-dark" strokeWidth="2" />
          
          {/* Push Button Contact */}
          <g transform={`translate(0, ${isPressed ? 0 : -6})`}>
            <line x1="12" y1="10" x2="28" y2="10" strokeWidth="2" />
            <line x1="20" y1="10" x2="20" y2="4" strokeWidth="2" />
            <circle cx="20" cy="2" r="2" className="fill-lab-amber stroke-lab-amber" />
          </g>
          
          {/* Wire right */}
          <circle cx="28" cy="12" r="2" className="fill-lab-dark" strokeWidth="2" />
          <line x1="28" y1="12" x2="40" y2="12" strokeWidth="2" />
        </svg>
        <span className="text-[10px] font-mono text-lab-muted mt-1">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 bg-lab-text" />
      <Handle type="target" position={Position.Right} id="right-target" className="w-2 h-2 bg-lab-text" />
    </div>
  );
};

export default PushButtonNode;
