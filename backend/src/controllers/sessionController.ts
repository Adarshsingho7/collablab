import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

const VALID_SUBMISSION_STATUSES = ['IN_PROGRESS', 'SUBMITTED', 'GRADED'];
const VALID_COLLABORATOR_ROLES = ['OWNER', 'EDITOR', 'VIEWER'];

// Share a Free Lab session
export const createSharedSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { circuitGraph, labId } = req.body;

    const session = await prisma.circuitSession.create({
      data: {
        ownerId: userId,
        status: 'IN_PROGRESS',
        labId: labId || null,
        circuitGraph: circuitGraph || '{}',
        collaborators: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Create Shared Session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollaborators = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const collaborators = await prisma.sessionCollaborator.findMany({
      where: { sessionId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ collaborators });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const { email, role } = req.body;

    if (!VALID_COLLABORATOR_ROLES.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_COLLABORATOR_ROLES.join(', ')}` });
    }

    const session = await prisma.circuitSession.findUnique({ where: { id } });
    if (!session || session.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the session owner can add collaborators' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Upsert to handle re-adding or updating role if already there
    const collab = await prisma.sessionCollaborator.upsert({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: userToAdd.id
        }
      },
      update: { role },
      create: {
        sessionId: id,
        userId: userToAdd.id,
        role
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ message: 'Collaborator added successfully', collaborator: collab });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCollaboratorRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const collaboratorId = req.params.collaboratorId as string;
    const { role } = req.body;

    if (!VALID_COLLABORATOR_ROLES.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_COLLABORATOR_ROLES.join(', ')}` });
    }

    // Verify owner
    const session = await prisma.circuitSession.findUnique({ where: { id } });
    if (!session || session.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the session owner can modify roles' });
    }

    if (session.ownerId === collaboratorId) {
       return res.status(400).json({ message: 'Cannot change the role of the owner' });
    }

    const updated = await prisma.sessionCollaborator.update({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: collaboratorId
        }
      },
      data: { role }
    });

    res.json({ message: 'Role updated successfully', collaborator: updated });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const collaboratorId = req.params.collaboratorId as string;

    // Verify owner
    const session = await prisma.circuitSession.findUnique({ where: { id } });
    if (!session || session.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the session owner can remove collaborators' });
    }

    if (session.ownerId === collaboratorId) {
       return res.status(400).json({ message: 'Cannot remove the owner' });
    }

    await prisma.sessionCollaborator.delete({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: collaboratorId
        }
      }
    });

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const session = await prisma.circuitSession.findUnique({
      where: { id },
      include: { lab: true }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the session owner can submit' });
    }

    if (!session.labId) {
      return res.status(400).json({ message: 'Cannot submit a free lab session' });
    }

    if (session.status === 'SUBMITTED') {
      return res.status(400).json({ message: 'Session is already submitted' });
    }

    const updatedSession = await prisma.circuitSession.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    res.json({ message: 'Session submitted successfully', session: updatedSession });
  } catch (error) {
    console.error('Submit Session Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = await prisma.circuitSession.findUnique({
      where: { id },
      include: {
        lab: true,
        collaborators: true,
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1
        },
        grade: true
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sessions = await prisma.circuitSession.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } }
        ]
      },
      include: {
        lab: true,
        grade: true,
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get User Sessions Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
