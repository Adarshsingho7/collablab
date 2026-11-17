import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Activity, Battery, Thermometer, Cpu, Settings, Box } from 'lucide-react';

const iconMap: Record<string, any> = {
  Zap: <Zap size={24} />,
  Activity: <Activity size={24} />,
  Battery: <Battery size={24} />,
  Thermometer: <Thermometer size={24} />,
  Cpu: <Cpu size={24} />,
  Settings: <Settings size={24} />,
  Box: <Box size={24} />
};

const CustomComponentNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const behavior = data.behavior || {};
  const baseType = behavior.baseType || 'resistor';
  const symbol = data.symbol || 'Box';
  const name = data.name || 'Custom';

  return (
    <div className={`
      relative bg-lab-panel border-2 rounded-lg p-3 min-w-[80px] flex flex-col items-center justify-center gap-2
      ${selected ? 'border-lab-amber shadow-[0_0_15px_rgba(255,176,0,0.3)]' : 'border-lab-border'}
      transition-all
    `}>
      {/* Handles depend on baseType */}
      {(baseType === 'resistor' || baseType === 'capacitor' || baseType === 'inductor' || baseType === 'diode' || baseType === 'switch' || baseType === 'ammeter') && (
        <>
          <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
          <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-lab-amber border-2 border-lab-dark" />
        </>
      )}

      {(baseType === 'voltage_source' || baseType === 'battery' || baseType === 'ac_source' || baseType === 'voltmeter') && (
        <>
          <Handle type="target" position={Position.Top} id="positive" className="w-3 h-3 bg-red-500 border-2 border-lab-dark" />
          <Handle type="source" position={Position.Bottom} id="negative" className="w-3 h-3 bg-blue-500 border-2 border-lab-dark" />
        </>
      )}
      
      <div className="text-lab-green">
        {iconMap[symbol] || <Box size={24} />}
      </div>
      <div className="font-mono text-[10px] text-lab-text font-bold uppercase tracking-wider text-center break-words max-w-[80px]">
        {name}
      </div>
    </div>
  );
};

export default memo(CustomComponentNode);
