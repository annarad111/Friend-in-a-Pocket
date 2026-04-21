import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { generateAssistantReply } from './ai/generateReply';
import { generateOnboardingProfile } from './ai/generateOnboardingProfile';
import { IncomingEvent } from './types/chat';
import { OnboardingRequest } from './types/onboarding';

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

const port = Number(process.env.PORT || 8080);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/onboarding-profile') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body) as OnboardingRequest;

        if (
          !parsed.friendName?.trim() ||
          !parsed.favoriteAnimal?.trim() ||
          !parsed.favoriteColor?.trim() ||
          !parsed.favoriteInstrument?.trim()
        ) {
          res.writeHead(400, {
            ...corsHeaders,
            'Content-Type': 'application/json',
          });
          res.end(
            JSON.stringify({
              message: 'All onboarding fields are required.',
            })
          );
          return;
        }

        const generatedProfile = await generateOnboardingProfile(parsed);

        res.writeHead(200, {
          ...corsHeaders,
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(generatedProfile));
      } catch (error) {
        console.error('Onboarding generation error:', error);

        res.writeHead(500, {
          ...corsHeaders,
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            message: 'Could not generate onboarding profile.',
          })
        );
      }
    });

    return;
  }

  res.writeHead(200, {
    ...corsHeaders,
    'Content-Type': 'text/plain',
  });
  res.end('Friend in a Pocket backend is running.');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (raw) => {
    try {
      const event = JSON.parse(raw.toString()) as IncomingEvent;

      if (event.type === 'session:start') {
        return;
      }

      if (event.type === 'chat:send') {
        const text = event.payload?.text?.trim();
        const history = event.payload?.history || [];
        const profile = event.payload?.profile || null;

        if (!text) {
          sendError(ws, 'Message cannot be empty.');
          return;
        }

        sendTyping(ws, true);

        try {
          const response = await generateAssistantReply(text, history, profile);

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
          sendError(
            ws,
            'The assistant is experiencing high demand right now. Please try again in a moment.'
          );
        }
      }
    } catch {
      sendError(ws, 'Invalid message format.');
    }
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

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});