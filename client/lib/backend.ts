// Keep HTTP and WebSocket requests on the same backend.
const configuredApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const API_BASE_URL = (
  configuredApi || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : 'https://friend-in-a-pocket.onrender.com')
).replace(/\/+$/, '');

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  API_BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
