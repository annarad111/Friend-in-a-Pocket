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
  socket = new WebSocket('ws://localhost:8080');

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
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(message));
};

export const closeSocketConnection = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};