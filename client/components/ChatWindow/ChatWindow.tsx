"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { MessageBubble } from "@/components/MessageBuble/MessageBuble";
import styles from "./ChatWindow.module.scss";
import { useOnboardingStore } from "@/store/useOnboardingStore";

type Props = {
  messages: ChatMessage[];
  isTyping: boolean;
};

export const ChatWindow = ({ messages, isTyping }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
    const {
      profile
    } = useOnboardingStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className={styles.container}>
      {messages.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Friend in a Pocket</h2>
          <p>
            Ask about emotional patterns, attachment dynamics,
            self-understanding, or relationship behaviors.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className={styles.typingWrapper}>
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
          <p className={styles.typingLabel}>
            {profile?.friendName} is reflecting...
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
