'use client';

import { useEffect } from 'react';
import { ChatWindow } from '@/components/ChatWindow/ChatWindow';
import { ChatInput } from '@/components/ChatInput/ChatInput';
import { ConnectionBadge } from '@/components/ConnectionBadge/ConnectionBadge';
import { createSocketConnection, closeSocketConnection, sendSocketMessage } from '@/lib/socket';
import { useChatStore } from '@/store/useChatStore';
import { ServerEvent } from '@/types/chat';
import styles from './page.module.scss';

export default function HomePage() {
  const {
    messages,
    input,
    socketStatus,
    isTyping,
    errorMessage,
    setInput,
    addMessage,
    setSocketStatus,
    setTyping,
    setErrorMessage,
  } = useChatStore();

  useEffect(() => {
    setSocketStatus('connecting');

    createSocketConnection({
      onOpen: () => {
        setSocketStatus('connected');
        setErrorMessage(null);
        sendSocketMessage({ type: 'session:start' });
      },
      onClose: () => {
        setSocketStatus('disconnected');
      },
      onError: () => {
        setSocketStatus('error');
        setErrorMessage('Could not connect to the assistant.');
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

    return () => {
      closeSocketConnection();
    };
  }, [addMessage, setErrorMessage, setSocketStatus, setTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || socketStatus !== 'connected') return;

    addMessage({
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    });

    sendSocketMessage({
      type: 'chat:send',
      payload: { text },
    });

    setInput('');
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1>Friend in a Pocket</h1>
            <p>
              A reflective chat companion for emotional patterns, self-understanding,
              and relationship insight.
            </p>
          </div>

          <ConnectionBadge status={socketStatus} />
        </div>

        <div className={styles.notice}>
          This app is for reflection and emotional education. It does not provide
          diagnosis or replace professional mental health care.
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <ChatWindow messages={messages} isTyping={isTyping} />

        <div className={styles.inputArea}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={socketStatus !== 'connected'}
          />
        </div>
      </section>
    </main>
  );
}