import React, { useEffect, useState } from 'react';
import { Zap, Battery, ArrowDownToLine, Baseline, Activity, Share2, ToggleLeft, ActivitySquare, Gauge, CircleDot, Thermometer, Cpu, Settings, Box, Trash2, Lightbulb, SlidersHorizontal, MinusSquare, Circle } from 'lucide-react';
import api from '../../lib/api';

const iconMap: Record<string, any> = {
  Zap: <Zap size={20} />,
  Activity: <Activity size={20} />,
  Battery: <Battery size={20} />,
  Thermometer: <Thermometer size={20} />,
  Cpu: <Cpu size={20} />,
  Settings: <Settings size={20} />,
  Box: <Box size={20} />
};

interface ComponentLibraryProps {
  allowedComponents?: string[];
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ allowedComponents }) => {
  const [customComponents, setCustomComponents] = useState<any[]>([]);

  const fetchCustomComponents = async () => {
    try {
      const res = await api.get('/components');
      setCustomComponents(res.data.components);
    } catch (err) {
      console.error('Failed to fetch custom components', err);
    }
  };

  useEffect(() => {
    fetchCustomComponents();
    window.addEventListener('refreshCustomComponents', fetchCustomComponents);
    return () => window.removeEventListener('refreshCustomComponents', fetchCustomComponents);
  }, []);

  const handleDeleteCustomComponent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this custom component?')) return;
    try {
      await api.delete(`/components/${id}`);
      fetchCustomComponents();
    } catch (err) {
      console.error('Failed to delete custom component', err);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, customData?: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    if (customData) {
      event.dataTransfer.setData('application/reactflow/customData', JSON.stringify(customData));
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  let components = [
    { type: 'resistor', label: 'Resistor', icon: <Zap size={20} />, unit: 'Ω' },
    { type: 'capacitor', label: 'Capacitor', icon: <Baseline size={20} />, unit: 'F' },
    { type: 'inductor', label: 'Inductor', icon: <Activity size={20} />, unit: 'H' },
    { type: 'diode', label: 'Diode', icon: <Share2 size={20} />, unit: '' },
    { type: 'transistor', label: 'Transistor', icon: <Share2 size={20} />, unit: '' },
    { type: 'voltage_source', label: 'DC Source', icon: <Battery size={20} />, unit: 'V' },
    { type: 'battery', label: 'Battery', icon: <Battery size={20} />, unit: 'V' },
    { type: 'ac_source', label: 'AC Source', icon: <ActivitySquare size={20} />, unit: 'V' },
    { type: 'switch', label: 'Switch', icon: <ToggleLeft size={20} />, unit: '' },
    { type: 'ground', label: 'Ground', icon: <ArrowDownToLine size={20} />, unit: '' },
    { type: 'junction', label: 'Junction', icon: <CircleDot size={20} />, unit: '' },
    { type: 'ammeter', label: 'Ammeter', icon: <Gauge size={20} />, unit: 'A' },
    { type: 'voltmeter', label: 'Voltmeter', icon: <Gauge size={20} />, unit: 'V' },
    { type: 'multimeter', label: 'Multimeter', icon: <Gauge size={20} />, unit: '' },
    { type: 'led', label: 'LED', icon: <Lightbulb size={20} />, unit: '' },
    { type: 'potentiometer', label: 'Potentiometer', icon: <SlidersHorizontal size={20} />, unit: 'Ω' },
    { type: 'fuse', label: 'Fuse', icon: <MinusSquare size={20} />, unit: 'A' },
    { type: 'push_button', label: 'Push Button', icon: <Circle size={20} />, unit: '' },
  ];

  let displayCustom = customComponents;

  if (allowedComponents && allowedComponents.length > 0) {
    const allowed = allowedComponents.map(c => c.trim().toLowerCase());
    // Filter components whose label or type is in the allowed list
    components = components.filter(c => 
      allowed.some(a => c.label.toLowerCase().includes(a) || c.type.toLowerCase().includes(a))
    );
    // Also filter custom components
    displayCustom = customComponents.filter(c =>
      allowed.some(a => c.name.toLowerCase().includes(a))
    );
  }

  return (
    <aside className="w-64 bg-lab-panel border-r border-lab-border flex flex-col">
      <div className="p-4 border-b border-lab-border">
        <h2 className="text-lab-amber font-bold font-mono">COMPONENT LIBRARY</h2>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <p className="text-xs text-lab-muted font-mono mb-4">DRAG & DROP TO CANVAS</p>
        
        {components.map(comp => (
          <div
            key={comp.type}
            className="flex items-center gap-3 p-3 bg-lab-dark border border-lab-border rounded cursor-grab hover:border-lab-amber hover:text-lab-amber transition-colors"
            onDragStart={(event) => onDragStart(event, comp.type, comp.label)}
            draggable
          >
            <div className="text-lab-muted group-hover:text-lab-amber">
              {comp.icon}
            </div>
            <span className="font-mono text-sm">{comp.label}</span>
          </div>
        ))}
        {displayCustom.length > 0 && (
          <>
            <div className="p-4 border-b border-lab-border mt-2">
              <h2 className="text-lab-green font-bold font-mono text-sm">CUSTOM COMPONENTS</h2>
            </div>
            {displayCustom.map(comp => (
              <div
                key={comp.id}
                className="flex items-center justify-between p-3 bg-lab-dark border border-lab-border rounded cursor-grab hover:border-lab-green hover:text-lab-green transition-colors group"
                onDragStart={(event) => onDragStart(event, 'custom_component', comp.name, {
                  id: comp.id,
                  name: comp.name,
                  symbol: comp.symbol,
                  parameters: typeof comp.parameters === 'string' ? JSON.parse(comp.parameters) : comp.parameters,
                  behavior: typeof comp.behavior === 'string' ? JSON.parse(comp.behavior) : comp.behavior
                })}
                draggable
              >
                <div className="flex items-center gap-3">
                  <div className="text-lab-muted group-hover:text-lab-green">
                    {iconMap[comp.symbol] || <Box size={20} />}
                  </div>
                  <span className="font-mono text-sm">{comp.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteCustomComponent(comp.id, e)}
                  className="text-lab-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
};

export default ComponentLibrary;
