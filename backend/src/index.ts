import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import prisma from './utils/prisma';

dotenv.config();

// Production Environment Checks
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  if (!process.env.TEACHER_SIGNUP_CODE) {
    console.error('FATAL: TEACHER_SIGNUP_CODE environment variable is required in production to protect teacher registration.');
    process.exit(1);
  }
}

const app = express();
const server = http.createServer(app);

// CORS configuration based on FRONTEND_URL
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, be permissive with localhost ports
    callback(null, true);
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

app.use(express.json());

// Health check endpoint for Render/uptime monitoring
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test DB Connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((e) => console.error('Database connection failed', e));

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import labRoutes from './routes/labRoutes';
import sessionRoutes from './routes/sessionRoutes';
import componentRoutes from './routes/componentRoutes';
import reportRoutes from './routes/reportRoutes';
import gradeRoutes from './routes/gradeRoutes';
import simulationRoutes from './routes/simulationRoutes';
import { authenticate } from './middleware/authMiddleware';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', authenticate, sessionRoutes);
app.use('/api/components', authenticate, componentRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/labs', authenticate, labRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/simulation', simulationRoutes);

import { socketAuth, AuthenticatedSocket } from './middleware/socketAuth';
import { setupCollabSockets } from './sockets/collabHandler';

// Socket.io Authentication Middleware
io.use((socket, next) => {
  socketAuth(socket as AuthenticatedSocket, next);
});

// Setup Collab Sockets
setupCollabSockets(io);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export { app, io, server };
