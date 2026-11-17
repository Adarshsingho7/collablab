import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import authRoutes from '../src/routes/authRoutes';
import labRoutes from '../src/routes/labRoutes';
import bcrypt from 'bcrypt';

// Create a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);

// Mock prisma
jest.mock('../src/utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      }
    }
  };
});

import prismaMock from '../src/utils/prisma';

describe('User Roles and Access Management (Module 11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration & Login', () => {
    it('should register a new user successfully', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedpassword',
        name: 'Test',
        role: 'STUDENT'
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'STUDENT'
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'STUDENT');
    });

    it('should login an existing user successfully', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash,
        name: 'Test',
        role: 'STUDENT'
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'password123'
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('Role-Based Access Control', () => {
    const generateToken = (role: string) => {
      return jwt.sign({ id: '1', role }, process.env.JWT_SECRET || 'supersecret');
    };

    it('should allow STUDENT to access authenticated route', async () => {
      const token = generateToken('STUDENT');
      const res = await request(app)
        .get('/api/labs/student-or-teacher')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
    });

    it('should NOT allow STUDENT to access TEACHER-only route', async () => {
      const token = generateToken('STUDENT');
      const res = await request(app)
        .post('/api/labs/teacher-only')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied: insufficient permissions');
    });

    it('should allow TEACHER to access TEACHER-only route', async () => {
      const token = generateToken('TEACHER');
      const res = await request(app)
        .post('/api/labs/teacher-only')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
    });
  });
});
