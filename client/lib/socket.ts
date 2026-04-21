import { ClientEvent, ServerEvent } from '@/types/chat';

let socket: WebSocket | null = null;

type SocketHandlers = {
  onOpen: () => void;
  onClose: () => void;
  onError: () => void;
  onMessage: (data: ServerEvent) => void;
};

export const createSocketConnection = ({
  onOpen,
  onClose,
  onError,
  onMessage,
}: SocketHandlers) => {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    onOpen();
  };

  socket.onclose = () => {
    onClose();
  };

  socket.onerror = () => {
    onError();
  };

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as ServerEvent;
      onMessage(parsed);
    } catch {
      onError();
    }
  };

  return socket;
};

export const sendSocketMessage = (message: ClientEvent) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify(message));
  return true;
};

export const isSocketOpen = () => {
  return socket?.readyState === WebSocket.OPEN;
};

export const closeSocketConnection = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};