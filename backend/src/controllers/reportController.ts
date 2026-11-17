import { Request, Response } from 'express';
import { generateReportPDF } from '../services/reportService';
import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/authMiddleware';

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { sessionId, activityLog } = req.body;

    if (!sessionId || !activityLog) {
      return res.status(400).json({ message: 'Missing sessionId or activityLog' });
    }

    // Fetch session and latest simulation results
    const session = await prisma.circuitSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const latestSim = await prisma.simulationResult.findFirst({
      where: { sessionId },
      orderBy: { timestamp: 'desc' }
    });

    const circuitGraph = JSON.parse(session.circuitGraph || '{}');
    let simResultParsed = null;
    if (latestSim) {
      simResultParsed = {
        nodeVoltages: JSON.parse(latestSim.nodeVoltages),
        branchCurrents: JSON.parse(latestSim.branchCurrents)
      };
    }

    const { fileUrl, content } = await generateReportPDF(sessionId, activityLog, circuitGraph, simResultParsed);

    // Persist Report to Database
    const report = await prisma.report.create({
      data: {
        sessionId,
        fileUrl,
        content // Stored in database as Base64 so reports survive restarts
      }
    });

    res.status(201).json(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Report generation failed', error: error.message });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const report = await prisma.report.findFirst({
      where: { sessionId },
      orderBy: { generatedAt: 'desc' }
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get report' });
  }
};

export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const report = await prisma.report.findFirst({
      where: {
        fileUrl: {
          endsWith: filename
        }
      },
      include: {
        session: {
          include: {
            collaborators: true,
            lab: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check: Only session owner, collaborators, or the lab's teacher
    const isOwner = report.session.ownerId === userId;
    const isCollaborator = report.session.collaborators.some(c => c.userId === userId);
    const isTeacher = report.session.lab?.teacherId === userId;

    if (!isOwner && !isCollaborator && !isTeacher) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to view or download this report.' });
    }

    const reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'reports');
    const filepath = path.join(reportsDir, filename);

    // 1. Try local disk cache
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.sendFile(filepath);
    }

    // 2. Fetch from database content field
    if (report.content) {
      const buffer = Buffer.from(report.content, 'base64');
      try {
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        fs.writeFileSync(filepath, buffer);
      } catch (cacheErr) {
        // Cache write is optional
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }

    return res.status(404).json({ message: 'Report binary content not found' });
  } catch (error: any) {
    console.error('Download report error:', error);
    res.status(500).json({ message: 'Failed to download report', error: error.message });
  }
};
