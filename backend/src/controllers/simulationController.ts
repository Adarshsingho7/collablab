import { Request, Response } from 'express';
import { solveDC, CircuitGraph } from '../services/simulationService';
import prisma from '../utils/prisma';

export const simulateCircuit = async (req: Request, res: Response) => {
  try {
    const { nodes, edges, sessionId } = req.body;
    console.log("SIMULATE ENDPOINT HIT! Nodes:", JSON.stringify(nodes));
    console.log("SIMULATE ENDPOINT HIT! Nodes:", nodes?.length, "Edges:", edges?.length);

    if (!nodes || !edges) {
      return res.status(400).json({ message: 'Circuit graph (nodes and edges) is required' });
    }

    const graph: CircuitGraph = { nodes, edges };
    const result = solveDC(graph);

    // If this simulation is part of a saved session, we should log it
    // For now, we'll just return the result to the client for the Free Lab
    if (sessionId) {
      await prisma.simulationResult.create({
        data: {
          sessionId,
          nodeVoltages: JSON.stringify(result.nodeVoltages),
          branchCurrents: JSON.stringify(result.branchCurrents),
          graphData: JSON.stringify({ hasRMSApproximation: result.hasRMSApproximation })
        }
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Simulation error:', error.message);
    res.status(500).json({ message: 'Simulation failed', error: error.message });
  }
};
