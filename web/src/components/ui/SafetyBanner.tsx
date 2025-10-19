import { ReactNode } from 'react';

interface SafetyBannerProps {
  type?: 'warning' | 'error' | 'info';
  children: ReactNode;
  icon?: string;
}

export default function SafetyBanner({ type = 'warning', children, icon }: SafetyBannerProps) {
  const colors = {
    warning: { bg: 'var(--color-sunshine-light)', border: 'var(--color-warning)', text: 'var(--color-gray-900)' },
    error: { bg: 'var(--color-coral-light)', border: 'var(--color-error)', text: 'var(--color-gray-900)' },
    info: { bg: 'var(--color-teal-light)', border: 'var(--color-primary)', text: 'var(--color-gray-900)' },
  };

  const { bg, border, text } = colors[type];

  return (
    <div style={{
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      color: text,
    }}>
      {icon && <span style={{ fontSize: 'var(--text-2xl)' }}>{icon}</span>}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
