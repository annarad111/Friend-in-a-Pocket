import { SocketStatus } from '@/types/chat';
import { Sparkles, WifiOff, Loader2 } from 'lucide-react';
import styles from './ConnectionBadge.module.scss';

type Props = {
  status: SocketStatus;
};

export const ConnectionBadge = ({ status }: Props) => {
  const getContent = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          icon: <Sparkles className={styles.sparkles} size={16} />,
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          icon: <Loader2 className={styles.spinner} size={16} />,
        };
      case 'disconnected':
      case 'error':
        return {
          label: 'Disconnected',
          icon: <WifiOff size={16} />,
        };
      default:
        return {
          label: 'Idle',
          icon: null,
        };
    }
  };

  const { label, icon } = getContent();

  return (
    <div className={`${styles.badge} ${styles[status]}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};