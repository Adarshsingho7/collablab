import { Socket } from 'socket.io';
import { verifyToken } from './authMiddleware';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: string;
  };
}

export const socketAuth = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
