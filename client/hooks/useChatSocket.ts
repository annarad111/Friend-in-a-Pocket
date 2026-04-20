'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createSocketConnection, closeSocketConnection, sendSocketMessage } from '@/lib/socket';
import { useChatStore } from '@/store/useChatStore';
import { ServerEvent } from '@/types/chat';

const MAX_RECONNECT_ATTEMPTS = 5;

export const useChatSocket = () => {
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    addMessage,
    setSocketStatus,
    setTyping,
    setErrorMessage,
  } = useChatStore();

  const connect = useCallback(() => {
    setSocketStatus('connecting');

    createSocketConnection({
      onOpen: () => {
        reconnectAttemptsRef.current = 0;
        setSocketStatus('connected');
        setErrorMessage(null);
        sendSocketMessage({ type: 'session:start' });
      },

      onClose: () => {
        setSocketStatus('disconnected');

        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setErrorMessage('Connection lost. Please refresh or try again later.');
          return;
        }

        const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 8000);
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      },

      onError: () => {
        setSocketStatus('error');
        setErrorMessage('There was a connection error.');
      },

      onMessage: (data: ServerEvent) => {
        if (data.type === 'chat:message') {
          addMessage(data.payload);
        }

        if (data.type === 'chat:typing') {
          setTyping(data.payload.value);
        }

        if (data.type === 'system:error') {
          setErrorMessage(data.payload.message);
        }
      },
    });
  }, [addMessage, setErrorMessage, setSocketStatus, setTyping]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      closeSocketConnection();
    };
  }, [connect]);

  return {
    sendMessage: sendSocketMessage,
    reconnect: connect,
  };
};