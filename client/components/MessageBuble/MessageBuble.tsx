'use client';

import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import styles from './MessageBuble.module.scss';

type Props = {
  message: ChatMessage;
};

export const MessageBubble = ({ message }: Props) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant}`}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <div className={styles.bubble}>
        <p className={styles.text}>{message.text}</p>
        <span className={styles.meta}>
          {message.sender} •{' '}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
};