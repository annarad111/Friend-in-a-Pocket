// → server/src/index.ts (drop-in replacement)
//
// Same as your existing index.ts, with the new POST /api/daily-prompt
// handler added between the onboarding-profile route and the fallback
// "backend is running" response.
//
// Diff (if you'd rather patch manually):
//   1. Two new imports at the top (generateDailyPrompt, DailyPromptRequest).
//   2. New `if (req.method === 'POST' && req.url === '/api/daily-prompt')`
//      block in http.createServer, BEFORE the final fallback res.end.

import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { generateAssistantReply } from './ai/generateReply';
import { generateOnboardingProfile } from './ai/generateOnboardingProfile';
import { generateDailyPrompt } from './ai/generateDailyPrompt';
import { interpretPsychTest } from './ai/interpretPsychTest';
import { generatePersonalityProfile } from './ai/generatePersonalityProfile';
import { generateBirthChart } from './ai/generateBirthChart';
import { ALL_TESTS } from './ai/psychTestPrompts';
import { IncomingEvent } from './types/chat';
import { OnboardingRequest } from './types/onboarding';
import { DailyPromptRequest } from './types/journal';
import type { InterpretTestRequest, PersonalityProfileRequest, BirthChartRequest } from './ai/insightsTypes';

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

  // ─── NEW: journal daily-prompt endpoint ────────────────────────
  if (req.method === 'POST' && req.url === '/api/daily-prompt') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = (body ? JSON.parse(body) : {}) as DailyPromptRequest;

        const generated = await generateDailyPrompt(parsed);

        res.writeHead(200, {
          ...corsHeaders,
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(generated));
      } catch (error) {
        console.error('Daily prompt generation error:', error);

        res.writeHead(500, {
          ...corsHeaders,
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            message: 'Could not generate daily prompt.',
          }),
        );
      }
    });

    return;
  }
  // ─── GET /api/tests ───────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/api/tests') {
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ALL_TESTS));
    return;
  }

  // ─── POST /api/interpret-test ─────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/interpret-test') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body) as InterpretTestRequest;
        if (!parsed.testType || !Array.isArray(parsed.responses) || parsed.responses.length === 0) {
          res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'testType and responses are required.' }));
          return;
        }
        const result = await interpretPsychTest(parsed);
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Test interpretation error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Could not interpret test.' }));
      }
    });
    return;
  }

  // ─── POST /api/personality-profile ───────────────────────────
  if (req.method === 'POST' && req.url === '/api/personality-profile') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body) as PersonalityProfileRequest;
        if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) {
          res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'At least one journal entry is required.' }));
          return;
        }
        const result = await generatePersonalityProfile(parsed);
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Personality profile error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Could not generate personality profile.' }));
      }
    });
    return;
  }
  // ─── POST /api/birth-chart ────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/birth-chart') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body) as BirthChartRequest;
        if (!parsed.date?.trim()) {
          res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Birth date is required.' }));
          return;
        }
        const result = await generateBirthChart(parsed);
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Birth chart error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Could not generate birth chart.' }));
      }
    });
    return;
  }
  // ─────────────────────────────────────────────────────────────

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
        const birthChart = event.payload?.birthChart || null;

        if (!text) {
          sendError(ws, 'Message cannot be empty.');
          return;
        }

        sendTyping(ws, true);

        try {
          const response = await generateAssistantReply(text, history, profile, birthChart);

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
