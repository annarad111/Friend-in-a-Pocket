'use client';

import { ChatWindow } from '@/components/ChatWindow/ChatWindow';
import { ChatInput } from '@/components/ChatInput/ChatInput';
import { ConnectionBadge } from '@/components/ConnectionBadge/ConnectionBadge';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useChatStore } from '@/store/useChatStore';
import styles from './page.module.scss';

export default function HomePage() {
  const { sendMessage } = useChatSocket();

  const {
    messages,
    input,
    socketStatus,
    isTyping,
    errorMessage,
    setInput,
    addMessage,
    setErrorMessage,
    resetChat,
  } = useChatStore();

  const handleSend = () => {
    const text = input.trim();
    if (!text || socketStatus !== 'connected') return;

    addMessage({
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    });

    const sent = sendMessage({
      type: 'chat:send',
      payload: { text },
    });

    if (!sent) {
      setErrorMessage('Message could not be sent. Please check the connection.');
      return;
    }

    setInput('');
    setErrorMessage(null);
  };

  const handleReset = () => {
    resetChat();
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

          <div className={styles.headerActions}>
            <ConnectionBadge status={socketStatus} />
            <button className={styles.resetButton} onClick={handleReset}>
              Reset chat
            </button>
          </div>
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