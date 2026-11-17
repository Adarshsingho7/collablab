import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

export const createLab = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, instructions, expectedComponents } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lab = await prisma.lab.create({
      data: {
        title,
        description,
        instructions,
        expectedComponents,
        teacherId
      }
    });

    res.status(201).json(lab);
  } catch (error) {
    console.error('Create Lab Error:', error);
    res.status(500).json({ error: 'Failed to create lab' });
  }
};

export const getLabs = async (req: AuthRequest, res: Response) => {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        teacher: {
          select: { name: true }
        },
        sessions: {
          include: {
            grade: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(labs);
  } catch (error) {
    console.error('Get Labs Error:', error);
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
};

export const getLabById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const lab = await prisma.lab.findUnique({
      where: { id },
      include: { teacher: { select: { name: true } } }
    });
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    console.error('Get Lab Error:', error);
    res.status(500).json({ error: 'Failed to fetch lab' });
  }
};

export const getLiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Scoped query: only active sessions linked to a lab created by this teacher
    const liveSessions = await prisma.circuitSession.findMany({
      where: {
        status: 'IN_PROGRESS',
        lab: {
          teacherId: teacherId
        }
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        lab: {
          select: { title: true }
        },
        collaborators: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(liveSessions);
  } catch (error) {
    console.error('Get Live Sessions Error:', error);
    res.status(500).json({ error: 'Failed to fetch live sessions' });
  }
};

export const getSubmittedSessions = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can view submissions.' });
    }

    const sessions = await prisma.circuitSession.findMany({
      where: {
        lab: { teacherId },
        status: { in: ['SUBMITTED', 'GRADED'] }
      },
      include: {
        lab: { select: { title: true } },
        owner: { select: { name: true, email: true } },
        reports: { orderBy: { generatedAt: 'desc' }, take: 1 },
        grade: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get Submitted Sessions Error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};
