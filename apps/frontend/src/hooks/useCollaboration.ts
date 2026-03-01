import { useEffect, useRef, useState, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as sharedb from 'sharedb/lib/client';

interface UseCollaborationProps {
  roomId: string;
  token: string | null;
}

interface UseCollaborationReturn {
  content: string;
  isConnected: boolean;
  updateContent: (newContent: string) => void;
}

export function useCollaboration({ roomId, token }: UseCollaborationProps): UseCollaborationReturn {
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const docRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !token) return;

    const wsUrl = `ws://localhost:3000/sharedb?token=${encodeURIComponent(token)}`;
    const ws = new ReconnectingWebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setIsConnected(true);
    });

    ws.addEventListener('close', () => {
      setIsConnected(false);
    });

    // Create ShareDB connection over this WebSocket 
    const connection = new sharedb.Connection(ws as any);
    connectionRef.current = connection;

    // Subscribe to the room document
    const doc = connection.get('rooms', roomId);
    docRef.current = doc;

    doc.subscribe((err: any) => {
      if (err) {
        console.error('[Collaboration] Subscribe error:', err);
        return;
      }

      if (!doc.type) {
        // Document doesn't exist yet — create with empty content
        doc.create({ content: '' }, (createErr: any) => {
          if (createErr) console.error('[Collaboration] Create error:', createErr);
        });
      }

      // Set initial content
      if (doc.data) {
        setContent(doc.data.content || '');
      }
    });

    // Listen for remote operations
    doc.on('op', (_op: any, source: boolean) => {
      if (!source && doc.data) {
        setContent(doc.data.content || '');
      }
    });

    return () => {
      doc.unsubscribe();
      doc.destroy();
      connection.close();
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, token]);

  const updateContent = useCallback((newContent: string) => {
    const doc = docRef.current;
    if (!doc || !doc.type) return;

    const currentContent = doc.data?.content || '';
    if (currentContent === newContent) return;

    // Submit OT operation to replace content
    const op = [{ p: ['content'], od: currentContent, oi: newContent }];
    doc.submitOp(op, { source: true }, (err: any) => {
      if (err) {
        console.error('[Collaboration] Op submit error:', err);
      }
    });
    setContent(newContent);
  }, []);

  return { content, isConnected, updateContent };
}
