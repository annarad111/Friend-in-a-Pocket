import { SocketStatus } from '@/types/chat';
import styles from './ConnectionBadge.module.scss';

type Props = {
  status: SocketStatus;
};

export const ConnectionBadge = ({ status }: Props) => {
  return (
    <div className={`${styles.badge} ${styles[status]}`}>
      {status === 'connected' && 'Connected'}
      {status === 'connecting' && 'Connecting...'}
      {status === 'disconnected' && 'Disconnected'}
      {status === 'error' && 'Connection error'}
      {status === 'idle' && 'Idle'}
    </div>
  );
};