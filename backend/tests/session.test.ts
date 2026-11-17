import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

describe('Session Controller API Validation', () => {
  let token: string;
  let ownerId: string;
  let sessionId: string;
  let collabId: string;

  beforeAll(async () => {
    await prisma.sessionCollaborator.deleteMany();
    await prisma.circuitSession.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'owner@test.com',
        name: 'Owner',
        passwordHash: 'hash',
      }
    });
    ownerId = user.id;

    const collabUser = await prisma.user.create({
      data: {
        email: 'collab@test.com',
        name: 'Collab',
        passwordHash: 'hash',
      }
    });
    collabId = collabUser.id;

    token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

    const session = await prisma.circuitSession.create({
      data: {
        ownerId: user.id,
        status: 'IN_PROGRESS',
        collaborators: {
          create: {
            userId: collabUser.id,
            role: 'VIEWER'
          }
        }
      }
    });
    sessionId = session.id;
  });

  afterAll(async () => {
    await prisma.sessionCollaborator.deleteMany();
    await prisma.circuitSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should reject invalid CollaboratorRole with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/sessions/${sessionId}/collaborators/${collabId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'SUPERADMIN' }); // Invalid role

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid role. Must be one of: OWNER, EDITOR, VIEWER');
  });

  it('should update CollaboratorRole with valid role', async () => {
    const res = await request(app)
      .patch(`/api/sessions/${sessionId}/collaborators/${collabId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'EDITOR' }); 

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Role updated successfully');
  });
});
