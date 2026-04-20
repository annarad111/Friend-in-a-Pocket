import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import { generateAssistantReply } from './ai/generateReply';

type IncomingEvent =
  | { type: 'session:start' }
  | { type: 'chat:send'; payload: { text: string } };

type OutgoingMessage = {
  type: 'chat:message';
  payload: {
    id: string;
    sender: 'assistant' | 'system';
    text: string;
    createdAt: string;
  };
};

type OutgoingTyping = {
  type: 'chat:typing';
  payload: {
    value: boolean;
  };
};

type OutgoingError = {
  type: 'system:error';
  payload: {
    message: string;
  };
};

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (raw) => {
    try {
      const event = JSON.parse(raw.toString()) as IncomingEvent;

      if (event.type === 'session:start') {
        return;
      }

      if (event.type === 'chat:send') {
        const text = event.payload?.text?.trim();

        if (!text) {
          sendError(ws, 'Message cannot be empty.');
          return;
        }

        sendTyping(ws, true);

        try {
          const response = await generateAssistantReply(text);

          sendTyping(ws, false);

          sendMessage(ws, {
            type: 'chat:message',
            payload: {
              id: crypto.randomUUID(),
              sender: 'assistant',
              text: response,
              createdAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Gemini generation error:', error);

          sendTyping(ws, false);
          sendError(ws, 'The assistant is temporarily unavailable. Please try again.');
        }
      }
    } catch {
      sendError(ws, 'Invalid message format.');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function sendMessage(ws: WebSocket, message: OutgoingMessage) {
  ws.send(JSON.stringify(message));
}

function sendTyping(ws: WebSocket, value: boolean) {
  const payload: OutgoingTyping = {
    type: 'chat:typing',
    payload: { value },
  };
  ws.send(JSON.stringify(payload));
}

function sendError(ws: WebSocket, message: string) {
  const payload: OutgoingError = {
    type: 'system:error',
    payload: { message },
  };
  ws.send(JSON.stringify(payload));
}

console.log('WebSocket server running on ws://localhost:8080');