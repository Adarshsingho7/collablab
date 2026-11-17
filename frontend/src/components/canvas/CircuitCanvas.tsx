import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { useCanvasStore } from '../../store/canvasStore';
import ResistorNode from '../nodes/ResistorNode';
import VoltageSourceNode from '../nodes/VoltageSourceNode';
import GroundNode from '../nodes/GroundNode';
import CapacitorNode from '../nodes/CapacitorNode';
import InductorNode from '../nodes/InductorNode';
import DiodeNode from '../nodes/DiodeNode';
import TransistorNode from '../nodes/TransistorNode';
import ACSourceNode from '../nodes/ACSourceNode';
import BatteryNode from '../nodes/BatteryNode';
import SwitchNode from '../nodes/SwitchNode';
import AmmeterNode from '../nodes/AmmeterNode';
import VoltmeterNode from '../nodes/VoltmeterNode';
import MultimeterNode from '../nodes/MultimeterNode';
import JunctionNode from '../nodes/JunctionNode';
import CustomComponentNode from '../nodes/CustomComponentNode';
import LEDNode from '../nodes/LEDNode';
import PotentiometerNode from '../nodes/PotentiometerNode';
import FuseNode from '../nodes/FuseNode';
import PushButtonNode from '../nodes/PushButtonNode';

// Map our custom node components
const nodeTypes = {
  resistor: ResistorNode,
  voltage_source: VoltageSourceNode,
  ground: GroundNode,
  capacitor: CapacitorNode,
  inductor: InductorNode,
  diode: DiodeNode,
  transistor: TransistorNode,
  ac_source: ACSourceNode,
  battery: BatteryNode,
  switch: SwitchNode,
  ammeter: AmmeterNode,
  voltmeter: VoltmeterNode,
  multimeter: MultimeterNode,
  junction: JunctionNode,
  custom_component: CustomComponentNode,
  led: LEDNode,
  potentiometer: PotentiometerNode,
  fuse: FuseNode,
  push_button: PushButtonNode,
};

const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    isReadOnly,
  } = useCanvasStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (isReadOnly) return;
    event.dataTransfer.dropEffect = 'move';
  }, [isReadOnly]);

  // Expose store for e2e testing/scripting
  if (typeof window !== 'undefined') {
    (window as any).__canvasStore = {
      nodes, edges, addNode, onConnect, setSelectedNodeId, onNodesChange
    };
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isReadOnly) return;

      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');
      const customDataRaw = event.dataTransfer.getData('application/reactflow/customData');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Project the pixel position to React Flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default values depending on component type
      let value = 0;
      let unit = '';
      if (type === 'resistor') {
        value = 1000;
        unit = 'Ω';
      } else if (type === 'voltage_source' || type === 'ac_source') {
        value = 5;
        unit = 'V';
      } else if (type === 'battery') {
        value = 9;
        unit = 'V';
      } else if (type === 'capacitor') {
        value = 0.0001; // 100uF
        unit = 'F';
      } else if (type === 'inductor') {
        value = 0.001; // 1mH
        unit = 'H';
      } else if (type === 'ammeter' || type === 'fuse') {
        unit = 'A';
      } else if (type === 'voltmeter') {
        unit = 'V';
      } else if (type === 'potentiometer') {
        value = 10000;
        unit = 'Ω';
      }

      let newNodeData: any = { label: `${label} ${nodes.filter(n => n.type === type).length + 1}`, type, value, unit };

      if (type === 'led') {
        newNodeData.color = 'red';
        newNodeData.forward_voltage = 2;
      } else if (type === 'potentiometer') {
        newNodeData.wiper_position = 50;
      } else if (type === 'fuse') {
        newNodeData.blown = false;
        newNodeData.value = 5; // rated current default
      } else if (type === 'push_button') {
        newNodeData.pressed = false;
      }

      if (type === 'custom_component' && customDataRaw) {
        try {
          const customData = JSON.parse(customDataRaw);
          // Hydrate the parameters into the node data, setting their values to default
          newNodeData = {
            label: `${customData.name} ${nodes.filter(n => n.type === type).length + 1}`,
            type,
            name: customData.name,
            symbol: customData.symbol,
            behavior: customData.behavior,
            parameters: { ...customData.parameters }
          };
        } catch (e) {
          console.error('Failed to parse custom data on drop', e);
        }
      }

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: newNodeData,
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode, nodes, isReadOnly]
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: any[] }) => {
    if (nodes.length === 1) {
      setSelectedNodeId(nodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, [setSelectedNodeId]);

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-lab-dark"
      >
        {/* Subtle dot background to match grid-paper aesthetic */}
        <Background color="#36393f" gap={20} size={2} />
        <Controls />
        
        <Panel position="top-left" className="bg-lab-panel border border-lab-border p-2 rounded text-lab-text font-mono text-xs">
          CIRCUIT CANVAS | Drag components here
        </Panel>
      </ReactFlow>
    </div>
  );
};

const CircuitCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default CircuitCanvas;
