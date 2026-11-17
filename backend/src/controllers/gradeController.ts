import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const submitGrade = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const sessionId = req.params.sessionId as string;
    const { score, feedback } = req.body;

    if (!teacherId || req.user?.role !== 'TEACHER') {
      return res.status(403).json({ message: 'Only teachers can submit grades.' });
    }

    if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be a number between 0 and 100.' });
    }

    const session = await prisma.circuitSession.findUnique({
      where: { id: sessionId },
      include: { lab: true }
    });

    if (!session || !session.lab) {
      return res.status(404).json({ message: 'Session or Lab not found.' });
    }

    if (session.lab.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Only the lab creator can grade this session.' });
    }

    if (session.status !== 'SUBMITTED' && session.status !== 'GRADED') {
      return res.status(400).json({ message: 'Session is not submitted for grading.' });
    }

    // Upsert Grade
    const grade = await prisma.grade.upsert({
      where: { sessionId },
      update: {
        score,
        feedback,
        gradedAt: new Date()
      },
      create: {
        sessionId,
        teacherId,
        score,
        feedback
      }
    });

    // Update Session status
    await prisma.circuitSession.update({
      where: { id: sessionId },
      data: { status: 'GRADED' }
    });

    res.json({ message: 'Grade submitted successfully.', grade });
  } catch (error) {
    console.error('Submit Grade Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGrade = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;

    const grade = await prisma.grade.findUnique({
      where: { sessionId },
      include: { teacher: { select: { id: true, name: true } } }
    });

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found for this session.' });
    }

    res.json({ grade });
  } catch (error) {
    console.error('Get Grade Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
