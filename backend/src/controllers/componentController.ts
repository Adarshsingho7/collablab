import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const isSafeExpression = (expr: string, parameters: Record<string, any>) => {
  // Strip out spaces
  const noSpaceExpr = expr.replace(/\s+/g, '');
  
  // 1. Basic character whitelist check: only digits, decimal point, operators (+, -, *, /), parens, and word characters (variables).
  if (!/^[\d\.\+\-\*\/\(\)a-zA-Z_]+$/.test(noSpaceExpr)) {
    return false;
  }
  
  // 2. Variable strict checking
  // Strip out all operators, numbers, and parens to leave only the alphabetic variable names
  const onlyVars = noSpaceExpr.replace(/[\d\.\+\-\*\/\(\)]/g, ' ');
  const varsInExpr = onlyVars.split(' ').filter(v => v.length > 0);
  
  const allowedVars = Object.keys(parameters);
  
  // Ensure every variable found in the expression is exactly one of the declared parameters
  for (const v of varsInExpr) {
    if (!allowedVars.includes(v)) {
      return false; // Found an undeclared variable
    }
  }
  
  return true;
};

export const getCustomComponents = async (req: AuthRequest, res: Response) => {
  try {
    const components = await prisma.customComponent.findMany({
      where: { creatorId: req.user!.id }
    });
    res.json({ components });
  } catch (error) {
    console.error('Error fetching custom components:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCustomComponent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, symbol, parameters, behavior } = req.body;
    
    if (!name || !parameters || !behavior) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let parsedParams: Record<string, any>;
    try {
      parsedParams = JSON.parse(parameters);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid parameters JSON' });
    }
    
    // Validate behavior structure: { baseType, valueExpression }
    let parsedBehavior: any;
    try {
      parsedBehavior = JSON.parse(behavior);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid behavior JSON' });
    }

    if (!parsedBehavior.baseType || !parsedBehavior.valueExpression) {
      return res.status(400).json({ message: 'Behavior must include baseType and valueExpression' });
    }

    // STRICT SECURITY VALIDATION
    if (!isSafeExpression(parsedBehavior.valueExpression, parsedParams)) {
      return res.status(400).json({ 
        message: 'Invalid or malicious expression. Use only numbers, basic math operators, and declared parameters.' 
      });
    }

    const component = await prisma.customComponent.create({
      data: {
        name,
        symbol,
        parameters,
        behavior,
        creatorId: req.user!.id
      }
    });

    res.status(201).json({ component });
  } catch (error) {
    console.error('Error creating custom component:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCustomComponent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const component = await prisma.customComponent.findUnique({ where: { id } });
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    if (component.creatorId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to delete this component' });
    }
    
    await prisma.customComponent.delete({ where: { id } });
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom component:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
