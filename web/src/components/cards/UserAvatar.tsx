import { CSSProperties } from 'react';
import { getLevelTooltip, LEVELS } from '../../utils/xp';
import type { User } from '../../types';

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
  const sizes = { 
    sm: 'var(--avatar-sm)', 
    md: 'var(--avatar-md)', 
    lg: 'var(--avatar-lg)' 
  };
  const avatarSize = sizes[size];
  const levelInfo = LEVELS.find(l => l.level === user.level) || LEVELS[0];

  const containerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const avatarStyles: CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand-tint)',
    border: '3px solid var(--color-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 'sm' 
      ? 'var(--text-body)' 
      : size === 'md' 
      ? 'var(--text-h3)' 
      : 'var(--text-h1)',
    flexShrink: 0,
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sticker)',
  };

  const infoStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    minWidth: 0, // Allow text truncation
  };

  const usernameStyles: CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-bold)',
    fontSize: size === 'sm' ? 'var(--text-small)' : 'var(--text-body)',
    lineHeight: size === 'sm' ? 'var(--text-small-lh)' : 'var(--text-body-lh)',
    color: 'var(--color-text-1)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const levelBadgeStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    fontWeight: 'var(--font-bold)',
    fontFamily: 'var(--font-body)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-accent-yellow)',
    color: 'var(--color-text-1)',
    cursor: 'help',
    whiteSpace: 'nowrap',
    border: '2px solid var(--color-accent-yellow)80',
    boxShadow: 'var(--shadow-s1)',
  };

  return (
    <div style={containerStyles}>
      <div style={avatarStyles}>
        {user.avatar}
      </div>
      {(showUsername || showLevel) && (
        <div style={infoStyles}>
          {showUsername && (
            <span style={usernameStyles}>
              {user.username}
            </span>
          )}
          {showLevel && (
            <span 
              style={levelBadgeStyles}
              title={getLevelTooltip(user.level, user.xp, user.xpToNextLevel)}
            >
              Lv{user.level} {levelInfo.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
