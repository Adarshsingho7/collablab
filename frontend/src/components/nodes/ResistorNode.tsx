import { Handle, Position } from '@xyflow/react';

const ResistorNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded bg-lab-panel border-2 ${selected ? 'border-lab-amber shadow-[0_0_10px_#ffb000]' : 'border-lab-border'} min-w-[100px]`}>
      {/* Top Handle: Terminal 1 */}
      <Handle type="target" position={Position.Top} id="left-target" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark opacity-0" />
      <Handle type="source" position={Position.Top} id="left" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark !absolute" style={{ top: '-6px' }} />
      
      <div className="text-lab-muted font-mono text-[10px] uppercase tracking-wider mb-1">Resistor</div>
      
      {/* SVG Zigzag for Resistor */}
      <svg width="60" height="20" viewBox="0 0 60 20" className="stroke-lab-text stroke-2 fill-none">
        <path d="M 0 10 L 10 10 L 15 2 L 25 18 L 35 2 L 45 18 L 50 10 L 60 10" strokeLinejoin="round" />
      </svg>
      
      <div className="text-lab-amber font-mono text-xs mt-1">
        {data.value ? `${data.value} ${data.unit || 'Ω'}` : 'R'}
      </div>

      {/* Bottom Handle: Terminal 2 */}
      <Handle type="target" position={Position.Bottom} id="right-target" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark opacity-0" />
      <Handle type="source" position={Position.Bottom} id="right" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark !absolute" style={{ bottom: '-6px' }} />
    </div>
  );
};

export default ResistorNode;
