import { ChatMessage } from '@/types/chat';
import styles from './MessageBuble.module.scss';

type Props={
    message: ChatMessage;
}

export const MessageBubble = ({message} : Props) => {
    const isUser = message.sender === 'user';
    return (
    <div className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.bubble}>
        <p className={styles.text}>{message.text}</p>
        <span className={styles.meta}>
          {message.sender} • {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}