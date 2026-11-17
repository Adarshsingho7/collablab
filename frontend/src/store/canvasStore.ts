import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

// Define the custom data type for our circuit nodes
export type ComponentData = {
  label: string;
  type: string; // 'resistor', 'voltage_source', 'ground', etc.
  value?: number; // e.g. resistance in Ohms, voltage in Volts
  unit?: string;  // e.g. 'Ω', 'V'
  color?: string;
  forward_voltage?: number;
  wiper_position?: number;
  blown?: boolean;
  closed?: boolean;
  pressed?: boolean;
  parameters?: Record<string, number | string>;
  behavior?: string;
};

export type CircuitNode = Node<ComponentData>;

export interface ActivityLogEntry {
  timestamp: string;
  action: string;
}

interface CanvasState {
  nodes: CircuitNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  activityLog: ActivityLogEntry[];
  addLogEntry: (action: string) => void;
  onNodesChange: OnNodesChange<CircuitNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: CircuitNode) => void;
  updateNodeData: (id: string, data: Partial<ComponentData>) => void;
  setSelectedNodeId: (id: string | null) => void;
  // Collaboration actions
  isReadOnly: boolean;
  setReadOnly: (readonly: boolean) => void;
  applyRemoteNodesChange: (changes: NodeChange<CircuitNode>[]) => void;
  applyRemoteEdgesChange: (changes: EdgeChange[]) => void;
  setNodes: (nodes: CircuitNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  emitNodeChanges?: (changes: NodeChange<CircuitNode>[]) => void;
  emitEdgeChanges?: (changes: EdgeChange[]) => void;
  emitFullSync?: (graph: any) => void;
  setEmitters: (emitNodeChanges: (c: any) => void, emitEdgeChanges: (c: any) => void, emitFullSync: (g: any) => void) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  activityLog: [],
  addLogEntry: (action: string) => {
    set({
      activityLog: [...get().activityLog, { timestamp: new Date().toISOString(), action }]
    });
  },
  onNodesChange: (changes: NodeChange<CircuitNode>[]) => {
    if (get().isReadOnly) return;
    set({
      nodes: applyNodeChanges(changes, get().nodes) as CircuitNode[],
    });
    if (get().emitNodeChanges) get().emitNodeChanges!(changes);
    if (get().emitFullSync) get().emitFullSync!({ nodes: get().nodes, edges: get().edges });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    if (get().isReadOnly) return;
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    if (get().emitEdgeChanges) get().emitEdgeChanges!(changes);
    if (get().emitFullSync) get().emitFullSync!({ nodes: get().nodes, edges: get().edges });
  },
  onConnect: (connection: Connection) => {
    if (get().isReadOnly) return;
    const newEdge: Edge = { ...connection, id: uuidv4(), type: 'smoothstep', style: { stroke: '#43b581', strokeWidth: 2 } };
    set({ edges: addEdge<Edge>(newEdge, get().edges) });
    get().addLogEntry(`Connected ${connection.source} to ${connection.target}`);
    // Simulate an edge add change for sockets
    if (get().emitEdgeChanges) get().emitEdgeChanges!([{ type: 'add', item: newEdge }]);
    if (get().emitFullSync) get().emitFullSync!({ nodes: get().nodes, edges: get().edges });
  },
  addNode: (node: CircuitNode) => {
    if (get().isReadOnly) return;
    set({ nodes: [...get().nodes, node] });
    get().addLogEntry(`Added component: ${node.data.label || node.data.type}`);
    if (get().emitNodeChanges) get().emitNodeChanges!([{ type: 'add', item: node }]);
    if (get().emitFullSync) get().emitFullSync!({ nodes: get().nodes, edges: get().edges });
  },
  updateNodeData: (id: string, data: Partial<ComponentData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          get().addLogEntry(`Updated parameter for ${node.data.label || node.data.type}`);
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
    });
    if (get().emitFullSync) get().emitFullSync!({ nodes: get().nodes, edges: get().edges });
  },
  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },
  isReadOnly: false,
  setReadOnly: (readonly: boolean) => set({ isReadOnly: readonly }),
  applyRemoteNodesChange: (changes: NodeChange<CircuitNode>[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as CircuitNode[] });
  },
  applyRemoteEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  setNodes: (nodes: CircuitNode[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  setEmitters: (emitNodeChanges, emitEdgeChanges, emitFullSync) => set({ emitNodeChanges, emitEdgeChanges, emitFullSync }),
}));
