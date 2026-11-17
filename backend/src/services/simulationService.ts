import { create, all } from 'mathjs';

const math = create(all, {});

// Standard component interfaces expected from frontend
export interface CircuitNode {
  id: string;
  type: string;
  data: any;
}

export interface CircuitEdge {
  id: string;
  source: string;
  sourceHandle: string | null;
  target: string;
  targetHandle: string | null;
}

export interface CircuitGraph {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
}

export interface SimulationResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
  hasRMSApproximation?: boolean;
  timeSeriesData?: any[];
}

// Disjoint Set (Union-Find) for building Nets
class UnionFind {
  parent: Map<string, string>;
  
  constructor() {
    this.parent = new Map();
  }

  find(i: string): string {
    if (!this.parent.has(i)) {
      this.parent.set(i, i);
      return i;
    }
    if (this.parent.get(i) === i) return i;
    const root = this.find(this.parent.get(i)!);
    this.parent.set(i, root);
    return root;
  }

  union(i: string, j: string) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent.set(rootI, rootJ);
    }
  }
}

const getPinId = (nodeId: string, handle: string | null) => {
  return `${nodeId}_${(handle || 'default').replace('-target', '')}`;
};

interface SolverResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
  hasRMSApproximation: boolean;
}

// Core MNA Solver for a specific instant in time
const solveForInstant = (graph: CircuitGraph, time: number = 0, useRMS: boolean = false): SolverResult => {
  const uf = new UnionFind();
  let hasRMSApproximation = false;
  const allPins = new Set<string>();

  graph.nodes.forEach(node => {
    if (node.type === 'ground') {
      allPins.add(getPinId(node.id, 'top'));
    } else if (['resistor', 'capacitor', 'inductor', 'ammeter', 'switch', 'diode', 'led', 'fuse', 'push_button'].includes(node.type)) {
      allPins.add(getPinId(node.id, 'left'));
      allPins.add(getPinId(node.id, 'right'));
    } else if (node.type === 'potentiometer') {
      allPins.add(getPinId(node.id, 'left'));
      allPins.add(getPinId(node.id, 'right'));
      allPins.add(getPinId(node.id, 'wiper'));
    } else if (['voltage_source', 'battery', 'ac_source', 'voltmeter'].includes(node.type)) {
      allPins.add(getPinId(node.id, 'positive'));
      allPins.add(getPinId(node.id, 'negative'));
    } else if (node.type === 'transistor') {
      allPins.add(getPinId(node.id, 'base'));
      allPins.add(getPinId(node.id, 'collector'));
      allPins.add(getPinId(node.id, 'emitter'));
    } else if (node.type === 'junction') {
      allPins.add(getPinId(node.id, 'center'));
    }
  });

  graph.edges.forEach(edge => {
    const srcPin = getPinId(edge.source, edge.sourceHandle);
    const tgtPin = getPinId(edge.target, edge.targetHandle);
    uf.union(srcPin, tgtPin);
  });

  const rootToNetId = new Map<string, number>();
  let nextNetId = 1;
  let groundRoot: string | null = null;

  graph.nodes.forEach(node => {
    if (node.type === 'ground') {
      const gndPin = getPinId(node.id, 'top');
      const root = uf.find(gndPin);
      groundRoot = root;
      rootToNetId.set(root, 0);
    }
  });

  if (groundRoot === null && graph.nodes.length > 0) {
    throw new Error('Circuit must have at least one Ground node');
  }

  allPins.forEach(pin => {
    const root = uf.find(pin);
    if (!rootToNetId.has(root)) {
      rootToNetId.set(root, nextNetId++);
    }
  });

  const numNets = nextNetId - 1;
  const voltageSources: { id: string; V: number; posNet: number; negNet: number; nodeIndex: number }[] = [];
  
  graph.nodes.forEach(node => {
    if (['voltage_source', 'battery', 'ac_source'].includes(node.type)) {
      let v = 0;
      if (node.type === 'ac_source') {
        const amplitude = parseFloat(node.data?.amplitude ?? node.data?.value ?? 5);
        const freq = parseFloat(node.data?.frequency ?? 50);
        if (useRMS) {
          v = amplitude / Math.sqrt(2);
          hasRMSApproximation = true;
        } else {
          v = amplitude * Math.sin(2 * Math.PI * freq * time);
        }
      } else {
        v = parseFloat(node.data?.voltage ?? node.data?.value ?? 0);
      }

      const posPin = getPinId(node.id, 'positive');
      const negPin = getPinId(node.id, 'negative');
      const posNet = rootToNetId.get(uf.find(posPin))!;
      const negNet = rootToNetId.get(uf.find(negPin))!;
      
      voltageSources.push({
        id: node.id,
        V: v,
        posNet,
        negNet,
        nodeIndex: voltageSources.length
      });
    }
  });

  const numVSources = voltageSources.length;
  const n = numNets + numVSources;

  if (n === 0) {
    return { nodeVoltages: {}, branchCurrents: {}, hasRMSApproximation: false };
  }

  const A = Array.from({ length: n }, () => Array(n).fill(0));
  const z = Array(n).fill(0);

  const addConductance = (net1: number, net2: number, g: number) => {
    if (net1 !== 0) A[net1 - 1][net1 - 1] += g;
    if (net2 !== 0) A[net2 - 1][net2 - 1] += g;
    if (net1 !== 0 && net2 !== 0) {
      A[net1 - 1][net2 - 1] -= g;
      A[net2 - 1][net1 - 1] -= g;
    }
  };

  graph.nodes.forEach(node => {
    let resistance: number | null = null;
    let net1: number = 0;
    let net2: number = 0;

    if (node.type === 'resistor') {
      resistance = parseFloat(node.data?.resistance ?? node.data?.value ?? 1000);
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'ammeter') {
      resistance = 1e-6;
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'voltmeter') {
      resistance = 1e9;
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'positive')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'negative')))!;
    } else if (node.type === 'switch') {
      resistance = node.data?.closed ? 1e-6 : 1e9;
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'capacitor') {
      resistance = 1e9; // DC Open
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'inductor') {
      resistance = 1e-6; // DC Short
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'diode' || node.type === 'led') {
      resistance = 1e9; // Start open
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'fuse') {
      resistance = node.data?.blown ? 1e9 : 1e-6;
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'push_button') {
      resistance = node.data?.pressed ? 1e-6 : 1e9;
      net1 = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      net2 = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
    } else if (node.type === 'potentiometer') {
      const total_r = parseFloat(node.data?.value ?? 10000);
      const wiper_pos = parseFloat(node.data?.wiper_position ?? 50) / 100;
      
      const r1 = Math.max(total_r * wiper_pos, 1e-6);
      const r2 = Math.max(total_r * (1 - wiper_pos), 1e-6);
      
      const netLeft = rootToNetId.get(uf.find(getPinId(node.id, 'left')))!;
      const netRight = rootToNetId.get(uf.find(getPinId(node.id, 'right')))!;
      const netWiper = rootToNetId.get(uf.find(getPinId(node.id, 'wiper')))!;
      
      addConductance(netLeft, netWiper, 1 / r1);
      addConductance(netWiper, netRight, 1 / r2);
    }

    if (resistance !== null && resistance > 0) {
      addConductance(net1, net2, 1 / resistance);
    }
  });

  voltageSources.forEach(vs => {
    const srcIdx = numNets + vs.nodeIndex;
    if (vs.posNet !== 0) {
      A[vs.posNet - 1][srcIdx] = 1;
      A[srcIdx][vs.posNet - 1] = 1;
    }
    if (vs.negNet !== 0) {
      A[vs.negNet - 1][srcIdx] = -1;
      A[srcIdx][vs.negNet - 1] = -1;
    }
    z[srcIdx] = vs.V;
  });

  for (let i = 0; i < numNets; i++) {
    A[i][i] += 1e-12;
  }

  console.log("Matrix A:", JSON.stringify(A));
  console.log("Vector z:", JSON.stringify(z));

  let x: number[];
  try {
    const solved = math.lusolve(A, z) as any[];
    x = solved.map(val => val[0] as number);
  } catch (e) {
    throw new Error('Circuit matrix is singular or unsolvable. Check for floating components.');
  }

  const nodeVoltages: Record<string, number> = {};
  const branchCurrents: Record<string, number> = {};

  const getNetVoltage = (netId: number) => {
    if (netId === 0) return 0;
    return x[netId - 1];
  };

  graph.nodes.forEach(node => {
    if (node.type === 'ground') {
      nodeVoltages[node.id] = 0;
    } else {
      const pins = Array.from(allPins).filter(p => p.startsWith(node.id + '_'));
      if (pins.length > 0) {
        const netId = rootToNetId.get(uf.find(pins[0]))!;
        nodeVoltages[node.id] = parseFloat(getNetVoltage(netId).toFixed(6));
      }
    }
  });

  voltageSources.forEach(vs => {
    const current = x[numNets + vs.nodeIndex];
    branchCurrents[vs.id] = parseFloat(current.toFixed(6));
  });

  graph.nodes.forEach(node => {
    if (node.type === 'resistor') {
      const r = parseFloat(node.data?.resistance ?? node.data?.value ?? 1000);
      const v1 = getNetVoltage(rootToNetId.get(uf.find(getPinId(node.id, 'left')))!);
      const v2 = getNetVoltage(rootToNetId.get(uf.find(getPinId(node.id, 'right')))!);
      branchCurrents[node.id] = parseFloat(((v1 - v2) / r).toFixed(6));
    }
  });

  return { nodeVoltages, branchCurrents, hasRMSApproximation };
};

export const solveDC = (originalGraph: CircuitGraph): SimulationResult => { console.log("SOLVEDC RUNNING");
  // Pre-process custom components
  const graph: CircuitGraph = {
    ...originalGraph,
    nodes: originalGraph.nodes.map(node => {
      if (node.type === 'custom_component' && node.data?.behavior) {
        try {
          const behavior = typeof node.data.behavior === 'string' ? JSON.parse(node.data.behavior) : node.data.behavior;
          const { baseType, valueExpression } = behavior;
          const params = node.data.parameters || {};
          
          // Strict whitelist check before evaluation
          const noSpaceExpr = valueExpression.replace(/\s+/g, '');
          if (!/^[\d\.\+\-\*\/\(\)a-zA-Z_]+$/.test(noSpaceExpr)) {
             throw new Error('Invalid characters in expression');
          }
          const onlyVars = noSpaceExpr.replace(/[\d\.\+\-\*\/\(\)]/g, ' ');
          const varsInExpr = onlyVars.split(' ').filter((v: string) => v.length > 0);
          const allowedVars = Object.keys(params);
          for (const v of varsInExpr) {
            if (!allowedVars.includes(v)) throw new Error(`Undeclared variable: ${v}`);
          }

          const evaluatedValue = math.evaluate(valueExpression, params);
          
          let mappedData = { ...node.data };
          if (baseType === 'resistor') mappedData.resistance = evaluatedValue;
          else if (baseType === 'capacitor') mappedData.capacitance = evaluatedValue;
          else if (baseType === 'inductor') mappedData.inductance = evaluatedValue;
          else if (baseType === 'voltage_source' || baseType === 'battery') mappedData.voltage = evaluatedValue;
          else if (baseType === 'ac_source') mappedData.amplitude = evaluatedValue;
          
          return {
            ...node,
            type: baseType,
            data: mappedData
          };
        } catch (e: any) {
          console.error(`Failed to evaluate custom component ${node.id}: ${e.message}`);
          throw new Error(`Custom Component Error: ${e.message}`);
        }
      }
      return node;
    })
  };

  // Solve for DC steady state with RMS for AC
  const dcResult = solveForInstant(graph, 0, true);
  
  // Now build the pseudo-transient time-series data
  const timeSeriesData: any[] = [];
  
  const acSources = graph.nodes.filter(n => n.type === 'ac_source');
  
  if (acSources.length > 0) {
    // Find min frequency to determine simulation window
    let minFreq = Infinity;
    acSources.forEach(src => {
      const freq = parseFloat(src.data?.frequency || 50);
      if (freq > 0 && freq < minFreq) minFreq = freq;
    });
    
    if (minFreq === Infinity) minFreq = 50;
    
    const period = 1 / minFreq;
    const duration = period * 2; // Simulate 2 full periods
    const steps = 100;
    const dt = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const stepResult = solveForInstant(graph, t, false);
      
      const dataPoint: any = { time: parseFloat((t * 1000).toFixed(2)) }; // time in ms
      
      // Flatten voltages and currents for Recharts
      Object.entries(stepResult.nodeVoltages).forEach(([id, v]) => {
        dataPoint[`v_${id}`] = v;
      });
      Object.entries(stepResult.branchCurrents).forEach(([id, i]) => {
        dataPoint[`i_${id}`] = i;
      });
      
      timeSeriesData.push(dataPoint);
    }
  } else {
    // Pure DC circuit, just generate two points for a flat line over 1 second
    const dataPoint1: any = { time: 0 };
    const dataPoint2: any = { time: 1000 };
    
    Object.entries(dcResult.nodeVoltages).forEach(([id, v]) => {
      dataPoint1[`v_${id}`] = v;
      dataPoint2[`v_${id}`] = v;
    });
    Object.entries(dcResult.branchCurrents).forEach(([id, i]) => {
      dataPoint1[`i_${id}`] = i;
      dataPoint2[`i_${id}`] = i;
    });
    
    timeSeriesData.push(dataPoint1, dataPoint2);
  }

  return {
    ...dcResult,
    timeSeriesData
  };
};
