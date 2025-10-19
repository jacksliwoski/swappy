import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading,
  disabled,
  fullWidth,
  style,
  ...props
}: ButtonProps) {
  // Base styles for all buttons - playful & rounded
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-semibold)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    textDecoration: 'none',
    userSelect: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
  };

  // Size variants
  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      height: 'var(--control-height-desktop)',
      padding: '0 var(--space-4)',
      fontSize: 'var(--text-small)',
      borderRadius: 'var(--radius-sm)',
    },
    md: {
      height: 'var(--search-height)',
      padding: '0 var(--space-6)',
      fontSize: 'var(--text-body)',
      borderRadius: 'var(--radius-md)',
    },
    lg: {
      height: '56px',
      padding: '0 var(--space-8)',
      fontSize: 'var(--text-h4)',
      borderRadius: 'var(--radius-md)',
    },
  };

  // Variant styles - kid-friendly mint green brand
  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'var(--color-brand)',
      color: 'white',
      boxShadow: 'var(--shadow-s1)',
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-brand-ink)',
      border: '2px solid var(--color-brand)',
      boxShadow: 'var(--shadow-s1)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-2)',
    },
  };

  // Hover/pressed states
  const getHoverStyles = (): CSSProperties => {
    if (disabled) return {};
    
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--color-brand-ink)',
          boxShadow: 'var(--shadow-s2)',
          transform: 'translateY(-2px) scale(1.02)',
        };
      case 'secondary':
        return {
          background: 'var(--color-brand-tint)',
          borderColor: 'var(--color-brand-ink)',
          boxShadow: 'var(--shadow-s2)',
          transform: 'translateY(-1px)',
        };
      case 'ghost':
        return {
          background: 'var(--color-chip-bg)',
          transform: 'scale(1.05)',
        };
      default:
        return {};
    }
  };

  const getPressedStyles = (): CSSProperties => {
    if (disabled) return {};
    
    return {
      transform: 'translateY(0) scale(1)',
      boxShadow: 'var(--shadow-s1)',
    };
  };

  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
          e.currentTarget.style.transform = 'none';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getPressedStyles());
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      {...props}
    >
      {loading ? (
        <span style={{ 
          display: 'inline-block',
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
