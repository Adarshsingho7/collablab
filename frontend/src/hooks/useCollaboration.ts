import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCanvasStore } from '../store/canvasStore';
import { useAuthStore } from '../store/authStore';
import { BACKEND_URL } from '../lib/api';

const SOCKET_URL = BACKEND_URL;

export interface CursorData {
  userId: string;
  cursor: {
    x: number;
    y: number;
    name: string;
  };
}

export const useCollaboration = (sessionId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, CursorData>>({});
  const [isConnected, setIsConnected] = useState(false);
  
  const { applyRemoteNodesChange, applyRemoteEdgesChange, setNodes, setEdges } = useCanvasStore();

  useEffect(() => {
    if (!sessionId || !token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-session', sessionId);
    });

    socket.on('remote-node-change', (changes) => {
      applyRemoteNodesChange(changes);
    });

    socket.on('remote-edge-change', (changes) => {
      applyRemoteEdgesChange(changes);
    });

    socket.on('remote-full-sync', (graph) => {
      if (graph.nodes) setNodes(graph.nodes);
      if (graph.edges) setEdges(graph.edges);
    });

    socket.on('remote-cursor-move', (data: CursorData) => {
      setRemoteCursors(prev => ({
        ...prev,
        [data.userId]: data
      }));
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, token, applyRemoteNodesChange, applyRemoteEdgesChange, setNodes, setEdges]);

  // Hook to emit local changes
  const emitNodeChanges = useCallback((changes: any) => {
    if (socketRef.current?.connected && sessionId) {
      socketRef.current.emit('node-change', { sessionId, changes });
    }
  }, [sessionId]);

  const emitEdgeChanges = useCallback((changes: any) => {
    if (socketRef.current?.connected && sessionId) {
      socketRef.current.emit('edge-change', { sessionId, changes });
    }
  }, [sessionId]);

  const emitCursorMove = useCallback((x: number, y: number) => {
    if (socketRef.current?.connected && sessionId && user) {
      socketRef.current.emit('cursor-move', {
        sessionId,
        cursor: { x, y, name: user.name }
      });
    }
  }, [sessionId, user?.name]);

  const emitFullSync = useCallback((graph: any) => {
    if (socketRef.current?.connected && sessionId) {
      socketRef.current.emit('circuit-full-sync', { sessionId, graph });
    }
  }, [sessionId]);

  return {
    isConnected,
    remoteCursors,
    emitNodeChanges,
    emitEdgeChanges,
    emitCursorMove,
    emitFullSync
  };
};
