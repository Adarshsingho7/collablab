import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Settings2 } from 'lucide-react';

const PropertiesPanel: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeData } = useCanvasStore();
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-72 bg-lab-panel border-l border-lab-border p-4 flex flex-col items-center justify-center text-center text-lab-muted">
        <Settings2 size={48} className="mb-4 opacity-50" />
        <p className="font-mono text-sm">NO COMPONENT SELECTED</p>
      </aside>
    );
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      updateNodeData(selectedNode.id, { value: val });
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(selectedNode.id, { label: e.target.value });
  };

  return (
    <aside className="w-72 bg-lab-panel border-l border-lab-border flex flex-col">
      <div className="p-4 border-b border-lab-border flex items-center gap-2 text-lab-amber">
        <Settings2 size={20} />
        <h2 className="font-bold font-mono uppercase">PROPERTIES</h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <label className="block text-xs font-mono text-lab-muted mb-2">COMPONENT TYPE</label>
          <div className="font-mono text-sm text-white bg-lab-dark px-3 py-2 border border-lab-border rounded uppercase">
            {selectedNode.data.type.replace('_', ' ')}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-lab-muted mb-2">LABEL (DESIGNATOR)</label>
          <input
            type="text"
            className="input-field text-sm"
            value={selectedNode.data.label}
            onChange={handleLabelChange}
          />
        </div>

        {selectedNode.data.type === 'custom_component' ? (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-lab-amber uppercase border-b border-lab-border pb-2">Custom Parameters</h3>
            {selectedNode.data.parameters && Object.entries(selectedNode.data.parameters).map(([paramName, paramValue]) => (
              <div key={paramName}>
                <label className="block text-xs font-mono text-lab-muted mb-2">
                  {paramName}
                </label>
                <input
                  type="number"
                  className="input-field text-sm"
                  value={paramValue as number}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    updateNodeData(selectedNode.id, { 
                      parameters: { 
                        ...selectedNode.data.parameters, 
                        [paramName]: val 
                      } 
                    });
                  }}
                  step="any"
                />
              </div>
            ))}
          </div>
        ) : selectedNode.data.type === 'led' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-lab-muted mb-2">COLOR</label>
              <select
                className="input-field text-sm"
                value={selectedNode.data.color || 'red'}
                onChange={(e) => updateNodeData(selectedNode.id, { color: e.target.value })}
              >
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-lab-muted mb-2">FORWARD VOLTAGE (V)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={selectedNode.data.forward_voltage || 2}
                onChange={(e) => updateNodeData(selectedNode.id, { forward_voltage: parseFloat(e.target.value) || 0 })}
                step="0.1"
              />
            </div>
          </div>
        ) : selectedNode.data.type === 'potentiometer' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-lab-muted mb-2">TOTAL RESISTANCE (Ω)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={selectedNode.data.value || 10000}
                onChange={handleValueChange}
                step="any"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-lab-muted mb-2">WIPER POSITION (%)</label>
              <input
                type="range"
                className="w-full accent-lab-amber"
                min="0"
                max="100"
                value={selectedNode.data.wiper_position || 50}
                onChange={(e) => updateNodeData(selectedNode.id, { wiper_position: parseInt(e.target.value, 10) })}
              />
              <div className="text-right text-xs text-lab-muted mt-1">{selectedNode.data.wiper_position || 50}%</div>
            </div>
          </div>
        ) : selectedNode.data.type === 'fuse' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-lab-muted mb-2">RATED CURRENT (A)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={selectedNode.data.value || 5}
                onChange={handleValueChange}
                step="0.1"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id={`blown-${selectedNode.id}`}
                checked={selectedNode.data.blown || false}
                onChange={(e) => updateNodeData(selectedNode.id, { blown: e.target.checked })}
                className="w-4 h-4 accent-lab-amber"
              />
              <label htmlFor={`blown-${selectedNode.id}`} className="text-sm font-mono text-lab-text">BLOWN (OPEN CIRCUIT)</label>
            </div>
          </div>
        ) : selectedNode.data.type === 'switch' ? (
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id={`closed-${selectedNode.id}`}
              checked={selectedNode.data.closed || false}
              onChange={(e) => updateNodeData(selectedNode.id, { closed: e.target.checked })}
              className="w-4 h-4 accent-lab-amber"
            />
            <label htmlFor={`closed-${selectedNode.id}`} className="text-sm font-mono text-lab-text">SWITCH CLOSED</label>
          </div>
        ) : selectedNode.data.type === 'push_button' ? (
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id={`pressed-${selectedNode.id}`}
              checked={selectedNode.data.pressed || false}
              onChange={(e) => updateNodeData(selectedNode.id, { pressed: e.target.checked })}
              className="w-4 h-4 accent-lab-amber"
            />
            <label htmlFor={`pressed-${selectedNode.id}`} className="text-sm font-mono text-lab-text">BUTTON PRESSED</label>
          </div>
        ) : selectedNode.data.type !== 'ground' && selectedNode.data.type !== 'junction' && selectedNode.data.type !== 'diode' && selectedNode.data.type !== 'transistor' && (
          <div>
            <label className="block text-xs font-mono text-lab-muted mb-2">
              VALUE ({selectedNode.data.unit || 'UNITS'})
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={selectedNode.data.value || 0}
              onChange={handleValueChange}
              step="any"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default PropertiesPanel;
