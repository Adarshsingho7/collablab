import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Track active users in rooms
const roomUsers: Record<string, Set<string>> = {};

// Periodic Autosave map
const autosaveTimers: Record<string, NodeJS.Timeout> = {};

// In-memory circuit state for each active session (to avoid hitting the DB on every edit)
const circuitState: Record<string, any> = {};

export const setupCollabSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.user?.id;
    
    if (!userId) {
      authSocket.disconnect();
      return;
    }

    console.log(`User ${userId} connected to collab socket`);

    authSocket.on('join-session', async (sessionId: string) => {
      // Role enforcement check before joining
      try {
        let collab = await prisma.sessionCollaborator.findUnique({
          where: { sessionId_userId: { sessionId, userId } },
        });

        if (!collab) {
          // Check if the user is a TEACHER who owns the lab
          const user = await prisma.user.findUnique({ where: { id: userId } });
          const session = await prisma.circuitSession.findUnique({
             where: { id: sessionId },
             include: { lab: true }
          });
          
          if (user?.role === 'TEACHER' && session?.lab?.teacherId === userId) {
             collab = await prisma.sessionCollaborator.create({
                data: { sessionId, userId, role: 'VIEWER' }
             });
          } else {
            authSocket.emit('error', { message: 'Not a collaborator in this session' });
            return;
          }
        }

        authSocket.join(sessionId);
        if (!roomUsers[sessionId]) {
          roomUsers[sessionId] = new Set();
        }
        roomUsers[sessionId].add(userId);

        // Load circuit state from DB if it's not already in memory
        if (!circuitState[sessionId]) {
          const session = await prisma.circuitSession.findUnique({ where: { id: sessionId }});
          if (session) {
            circuitState[sessionId] = JSON.parse(session.circuitGraph || '{}');
          } else {
            circuitState[sessionId] = {};
          }
        }

        // Start autosave for this room if not already started
        if (!autosaveTimers[sessionId]) {
          autosaveTimers[sessionId] = setInterval(async () => {
             await saveSession(sessionId);
          }, 60000); // 60s
        }

        console.log(`User ${userId} joined session ${sessionId} as ${collab.role}`);
      } catch (err) {
        authSocket.emit('error', { message: 'Failed to join session' });
      }
    });

    const isEditorOrOwner = async (sessionId: string, userId: string) => {
      const session = await prisma.circuitSession.findUnique({
        where: { id: sessionId },
        include: { collaborators: { where: { userId } } }
      });
      if (!session) return false;
      if (session.status === 'SUBMITTED') return false; // Reject edits if submitted
      
      const isOwner = session.ownerId === userId;
      const collab = session.collaborators[0];
      const role = collab ? collab.role : null;
      
      return isOwner || role === 'EDITOR' || role === 'OWNER';
    };

    authSocket.on('node-change', async (data: { sessionId: string, changes: any[] }) => {
      if (!await isEditorOrOwner(data.sessionId, userId)) {
        return; // Reject VIEWER edits silently, do not broadcast
      }

      // Update in-memory state
      // (Simplified: just broadcast to others for now, real implementation would merge into circuitState)
      authSocket.to(data.sessionId).emit('remote-node-change', data.changes);
    });

    authSocket.on('edge-change', async (data: { sessionId: string, changes: any[] }) => {
      if (!await isEditorOrOwner(data.sessionId, userId)) {
        return;
      }
      authSocket.to(data.sessionId).emit('remote-edge-change', data.changes);
    });

    authSocket.on('circuit-full-sync', async (data: { sessionId: string, graph: any }) => {
      console.log(`Received circuit-full-sync for session ${data.sessionId} from user ${userId}`);
      if (!await isEditorOrOwner(data.sessionId, userId)) {
        console.log(`User ${userId} is not editor or owner for session ${data.sessionId}`);
        return;
      }
      circuitState[data.sessionId] = data.graph;
      console.log(`Updated circuitState for ${data.sessionId} to`, JSON.stringify(data.graph));
      authSocket.to(data.sessionId).emit('remote-full-sync', data.graph);
    });

    authSocket.on('cursor-move', (data: { sessionId: string, cursor: { x: number, y: number, name: string } }) => {
      authSocket.to(data.sessionId).emit('remote-cursor-move', { userId, cursor: data.cursor });
    });

    authSocket.on('disconnecting', async () => {
      // Find all rooms this socket was in
      for (const room of authSocket.rooms) {
        if (room !== authSocket.id) {
           if (roomUsers[room]) {
             roomUsers[room].delete(userId);
             if (roomUsers[room].size === 0) {
                // Everyone left!
                await saveSession(room);
                if (autosaveTimers[room]) {
                  clearInterval(autosaveTimers[room]);
                  delete autosaveTimers[room];
                }
                delete roomUsers[room];
                delete circuitState[room];
             }
           }
        }
      }
    });
  });
};

const saveSession = async (sessionId: string) => {
  if (circuitState[sessionId]) {
    try {
      await prisma.circuitSession.update({
        where: { id: sessionId },
        data: { circuitGraph: JSON.stringify(circuitState[sessionId]) }
      });
      console.log(`[Persistence] Saved session ${sessionId} to DB`);
    } catch (err) {
      console.error(`[Persistence Error] Failed to save session ${sessionId}`, err);
    }
  }
};
