import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : '';

  const sizeStyles = {
    sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', minHeight: '36px' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)', minHeight: '48px' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)', minHeight: '56px' },
  };

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      style={sizeStyles[size]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : (
        <>
          {icon && <span style={{ marginRight: 'var(--space-2)' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
