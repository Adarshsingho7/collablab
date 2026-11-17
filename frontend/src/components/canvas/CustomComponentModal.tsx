import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Parameter {
  name: string;
  default: number;
}

interface CustomComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (componentData: any) => Promise<void>;
}

const CustomComponentModal: React.FC<CustomComponentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [baseType, setBaseType] = useState('resistor');
  const [icon, setIcon] = useState('Zap');
  const [valueExpression, setValueExpression] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddParam = () => {
    setParameters([...parameters, { name: `param${parameters.length + 1}`, default: 1 }]);
  };

  const handleUpdateParam = (index: number, field: keyof Parameter, value: string) => {
    const newParams = [...parameters];
    if (field === 'name') {
      newParams[index].name = value;
    } else {
      newParams[index].default = parseFloat(value) || 0;
    }
    setParameters(newParams);
  };

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !valueExpression) {
      setError('Name and Value Expression are required.');
      return;
    }

    const paramObj = parameters.reduce((acc, curr) => {
      acc[curr.name] = curr.default;
      return acc;
    }, {} as Record<string, number>);

    // Basic frontend validation for safety before sending
    const noSpaceExpr = valueExpression.replace(/\s+/g, '');
    if (!/^[\d\.\+\-\*\/\(\)a-zA-Z_]+$/.test(noSpaceExpr)) {
      setError('Expression contains invalid characters. Use only numbers, math operators, and declared parameters.');
      return;
    }

    const behaviorObj = {
      baseType,
      valueExpression
    };

    const payload = {
      name,
      symbol: icon,
      parameters: JSON.stringify(paramObj),
      behavior: JSON.stringify(behaviorObj)
    };

    setIsSaving(true);
    try {
      await onSave(payload);
      // Reset form
      setName('');
      setBaseType('resistor');
      setIcon('Zap');
      setValueExpression('');
      setParameters([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  const ICONS = ['Zap', 'Activity', 'Battery', 'Thermometer', 'Cpu', 'Settings', 'Box'];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-lab-panel border border-lab-border w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-lab-border bg-lab-dark">
          <h2 className="text-xl font-bold text-lab-amber uppercase tracking-widest">BUILD CUSTOM COMPONENT</h2>
          <button onClick={onClose} className="text-lab-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-6 rounded text-sm">
              {error}
            </div>
          )}

          <form id="component-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-lab-muted mb-2">COMPONENT NAME</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="input-field" 
                  placeholder="e.g. Thermistor"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-lab-muted mb-2">ICON (SYMBOL)</label>
                <select 
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="input-field"
                >
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-lab-muted mb-2">BASE COMPONENT (PHYSICAL BEHAVIOR)</label>
              <select 
                value={baseType}
                onChange={e => setBaseType(e.target.value)}
                className="input-field"
              >
                <option value="resistor">Resistor (Ω)</option>
                <option value="capacitor">Capacitor (F)</option>
                <option value="inductor">Inductor (H)</option>
                <option value="voltage_source">DC Voltage Source (V)</option>
                <option value="ac_source">AC Voltage Source (Amplitude V)</option>
              </select>
              <p className="text-xs text-lab-muted mt-2">
                This dictates how the component acts in the circuit simulation matrix.
              </p>
            </div>

            <div className="border border-lab-border rounded p-4 bg-lab-dark/50">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm text-lab-muted">PARAMETERS (VARIABLES)</label>
                <button type="button" onClick={handleAddParam} className="text-xs flex items-center gap-1 text-lab-amber hover:text-white transition-colors">
                  <Plus size={14} /> ADD PARAMETER
                </button>
              </div>
              
              {parameters.length === 0 ? (
                <div className="text-xs text-lab-muted/50 italic mb-2">No parameters defined. (Optional)</div>
              ) : (
                <div className="space-y-3 mb-4">
                  {parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={param.name} 
                        onChange={e => handleUpdateParam(idx, 'name', e.target.value)} 
                        className="input-field flex-1" 
                        placeholder="Parameter Name (e.g. temp)"
                      />
                      <span className="text-lab-muted">=</span>
                      <input 
                        type="number" 
                        value={param.default} 
                        onChange={e => handleUpdateParam(idx, 'default', e.target.value)} 
                        className="input-field w-32" 
                        placeholder="Default"
                      />
                      <button type="button" onClick={() => handleRemoveParam(idx)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-lab-amber mb-2">VALUE EXPRESSION</label>
              <input 
                type="text" 
                value={valueExpression} 
                onChange={e => setValueExpression(e.target.value)} 
                className="input-field border-lab-amber/50 focus:border-lab-amber font-mono" 
                placeholder="e.g. 1000 + (temp - 25) * 10"
                required
              />
              <p className="text-xs text-lab-muted mt-2">
                Enter a math expression using your defined parameters. Only numbers, parameters, and (+ - * / ( )) are allowed. 
                This calculates the primary value for the Base Component.
              </p>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-lab-border bg-lab-dark flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-lab-muted hover:text-white transition-colors font-mono">
            CANCEL
          </button>
          <button type="submit" form="component-form" disabled={isSaving} className="btn-primary text-sm font-mono">
            {isSaving ? 'SAVING...' : 'SAVE TO LIBRARY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomComponentModal;
