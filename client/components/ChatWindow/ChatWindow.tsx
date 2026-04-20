import { ChatMessage } from '@/types/chat';
import { MessageBubble } from '@/components/MessageBuble/MessageBuble';
import styles from './ChatWindow.module.scss';

type Props = {
  messages: ChatMessage[];
  isTyping: boolean;
};

export const ChatWindow = ({ messages, isTyping }: Props) => {
  return (
    <div className={styles.container}>
      {messages.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Friend in a Pocket</h2>
          <p>
            Ask about emotional patterns, attachment dynamics, self-understanding,
            or relationship behaviors.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className={styles.typing}>
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
};