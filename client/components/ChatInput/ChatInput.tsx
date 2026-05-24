"use client";

import { useMicrophoneInput } from "@/hooks/useMicrophoneInput";
import { MicButton } from "@/components/MicButton/MicButton";
import styles from './ChatInput.module.scss';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export const ChatInput = ({ value, onChange, onSend, disabled = false }: Props) => {
  const mic = useMicrophoneInput(value, onChange);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write what you're feeling or ask for insight..."
        rows={3}
        disabled={disabled}
      />

      {mic.isSupported && (
        <MicButton
          micState={mic.micState}
          onToggle={mic.toggle}
          error={mic.error}
        />
      )}

      <button className={styles.button} onClick={onSend} disabled={disabled || !value.trim()}>
        Send
      </button>
    </div>
  );
};