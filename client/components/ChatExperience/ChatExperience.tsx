"use client";

import { ChatWindow } from "@/components/ChatWindow/ChatWindow";
import { ChatInput } from "@/components/ChatInput/ChatInput";
import { ConnectionBadge } from "@/components/ConnectionBadge/ConnectionBadge";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatStore } from "@/store/useChatStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useInsightsStore } from "@/store/useInsightsStore";
import { Notebook, Mail, Sparkles, RotateCcw } from "lucide-react";
import styles from "./ChatExperience.module.scss";
import Link from "next/link";
import { JournalInvite } from "../Journal/JournalInvite/JournalInvite";
import { useJournalStore } from "@/store/useJournalStore";
import { detectJournalIntent } from "@/lib/detectJournalIntent";

const MAX_HISTORY_MESSAGES = 8;

export const ChatExperience = () => {
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

  const { profile } = useOnboardingStore();
  const birthChart = useInsightsStore((s) => s.birthChart);

  const friendshipDay = profile?.lockedAt
    ? Math.floor(
        (Date.now() - new Date(profile.lockedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    : null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || socketStatus !== "connected") return;
    if (detectJournalIntent(text)) {
      useJournalStore.getState().openJournalInvite();
    }
    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user" as const,
      text,
      createdAt: new Date().toISOString(),
    };

    addMessage(userMessage);

    const recentHistory = [...messages, userMessage].slice(
      -MAX_HISTORY_MESSAGES,
    );

    const sent = sendMessage({
      type: "chat:send",
      payload: {
        text,
        history: recentHistory,
        profile,
        birthChart: birthChart
          ? { sunSign: birthChart.sunSign, moonSign: birthChart.moonSign, ascendant: birthChart.ascendant }
          : null,
      },
    });

    if (!sent) {
      setErrorMessage(
        "Message could not be sent. Please check the connection.",
      );
      return;
    }

    setInput("");
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
            <h1>{profile?.friendName || "Friend in a Pocket"}</h1>
            <p>
              A reflective chat companion for emotional patterns,
              self-understanding, and relationship insight.
            </p>
            {friendshipDay !== null && (
              <p className={styles.friendshipDay}>
                day {friendshipDay} of your friendship
              </p>
            )}
          </div>

          <div className={styles.headerActions}>
            <ConnectionBadge status={socketStatus} />
            <div className={styles.actionButtons}>
              <button
                className={styles.resetButton}
                onClick={handleReset}
                aria-label="Reset chat"
                title="Reset chat"
              >
                <RotateCcw className={styles.resetIcon} size={18} />
              </button>
              <Link
                href="/journal/past"
                className={styles.journalButton}
                title="Open journal"
                aria-label="Open journal"
              >
                <Notebook size={18} />
              </Link>
              <Link
                href="/journal/letters"
                className={styles.journalButton}
                title="Letters to future self"
                aria-label="Letters"
              >
                <Mail size={18} />
              </Link>
              <Link
                href="/insights"
                className={styles.journalButton}
                title="Your inner portrait & tests"
                aria-label="Insights"
              >
                <Sparkles size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.notice}>
          This app is for reflection and emotional education. It does not
          provide diagnosis or replace professional mental health care.
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <ChatWindow messages={messages} isTyping={isTyping} />

        <div className={styles.inputArea}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={socketStatus !== "connected"}
          />
        </div>
      </section>
    </main>
  );
};
