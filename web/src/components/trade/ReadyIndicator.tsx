import UserAvatar from '../cards/UserAvatar';
import type { User } from '../../types';

interface ReadyIndicatorProps {
  user: User;
  ready: boolean;
  side: 'yours' | 'theirs';
}

export default function ReadyIndicator({ user, ready, side }: ReadyIndicatorProps) {
  const sideColor = side === 'yours' ? 'var(--color-teal)' : 'var(--color-lilac)';
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        background: ready ? 'var(--color-success)' : 'var(--color-gray-200)',
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--transition-base)',
        border: `2px solid ${ready ? 'var(--color-success)' : sideColor}`,
      }}
    >
      <UserAvatar user={user} size="sm" showUsername />
      <div style={{ flex: 1 }} />
      {ready ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-white)',
            fontWeight: 'var(--font-bold)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <span>✓</span>
          <span>Ready</span>
        </div>
      ) : (
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gray-600)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Not Ready
        </div>
      )}
    </div>
  );
}

