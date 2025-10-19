import { getLevelTooltip, LEVELS } from '../../utils/xp';
import type { User } from '../../types';
import Chip from '../ui/Chip';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showUsername?: boolean;
}

export default function UserAvatar({
  user,
  size = 'md',
  showLevel = false,
  showUsername = false
}: UserAvatarProps) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const avatarSize = sizes[size];
  const levelInfo = LEVELS.find(l => l.level === user.level) || LEVELS[0];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-lilac-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? 'var(--text-base)' : size === 'md' ? 'var(--text-xl)' : 'var(--text-3xl)',
        flexShrink: 0,
      }}>
        {user.avatar}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {showUsername && (
          <span style={{ fontWeight: 'var(--font-medium)', fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)' }}>
            {user.username}
          </span>
        )}
        {showLevel && (
          <Chip
            bgColor="var(--color-primary)"
            color="white"
            style={{
              fontSize: 'var(--text-xs)',
              padding: 'var(--space-1) var(--space-2)',
            }}
          >
            <span title={getLevelTooltip(user.level, user.xp, user.xpToNextLevel)}>
              Lv{user.level} {levelInfo.name}
            </span>
          </Chip>
        )}
      </div>
    </div>
  );
}
