import { WebSocketServer, WebSocket } from 'ws';

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
  sendMessage(ws, {
    type: 'chat:message',
    payload: {
      id: crypto.randomUUID(),
      sender: 'assistant',
      text:
        "Hi, I'm Friend in a Pocket. You can ask me about emotional patterns, attachment styles, relationship dynamics, or self-understanding.",
      createdAt: new Date().toISOString(),
    },
  });

  ws.on('message', (raw) => {
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

        const response = buildMockReflection(text);

        setTimeout(() => {
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
        }, 900);
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

function buildMockReflection(input: string) {
  const normalized = input.toLowerCase();

  if (
    normalized.includes('afraid') ||
    normalized.includes('abandon') ||
    normalized.includes('leave me')
  ) {
    return `What you describe may be connected to fear of abandonment. Sometimes this can resemble anxious attachment patterns, where the nervous system becomes highly alert to distance or rejection. This is not a diagnosis, but it may help to explore when this fear first became familiar in your life.`;
  }

  if (
    normalized.includes('distance') ||
    normalized.includes('pull away') ||
    normalized.includes('close to people')
  ) {
    return `It sounds like closeness may feel unsafe or overwhelming at times. In some cases, that can resemble avoidant attachment patterns, where emotional distance becomes a form of protection. A useful reflection is: what happens inside you right before you disconnect?`;
  }

  if (
    normalized.includes('childhood') ||
    normalized.includes('parents') ||
    normalized.includes('mother') ||
    normalized.includes('father')
  ) {
    return `Childhood experiences often shape the emotional meaning we give to love, safety, conflict, and abandonment. A gentle question to explore is: what emotional role did you have to play in your family in order to feel safe or accepted?`;
  }

  return `What you're describing may point to a repeating emotional pattern. You could explore three things: what you feel, what story your mind creates around that feeling, and what deeper need may exist underneath it.`;
}

console.log('WebSocket server running on ws://localhost:8080');