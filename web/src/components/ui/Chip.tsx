import { ReactNode, CSSProperties } from 'react';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'category' | 'condition';
  style?: CSSProperties;
  icon?: ReactNode;
}

export default function Chip({ 
  children, 
  selected = false,
  disabled = false,
  onClick, 
  variant = 'default',
  style,
  icon
}: ChipProps) {
  const isClickable = !!onClick && !disabled;

  // Base styles - jelly-bean shaped
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    fontWeight: 'var(--font-semibold)',
    fontFamily: 'var(--font-body)',
    cursor: isClickable ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'all var(--transition-fast)',
    border: '2px solid transparent',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  // Selected/default styles
  const stateStyles: CSSProperties = selected ? {
    background: 'var(--color-brand-tint)',
    color: 'var(--color-brand-ink)',
    borderColor: 'var(--color-brand)',
    fontWeight: 'var(--font-bold)',
    boxShadow: 'var(--shadow-s1)',
  } : {
    background: 'var(--color-chip-bg)',
    color: 'var(--color-text-2)',
  };

  // Variant-specific styles
  const variantStyles: Record<string, CSSProperties> = {
    default: {},
    category: {
      background: selected ? 'var(--color-accent-blue)' : 'var(--color-gray-100)',
      color: selected ? 'white' : 'var(--color-gray-700)',
      borderColor: selected ? 'var(--color-accent-blue)' : 'transparent',
    },
    condition: {
      background: selected ? 'var(--color-accent-purple)' : 'var(--color-gray-100)',
      color: selected ? 'white' : 'var(--color-gray-700)',
      borderColor: selected ? 'var(--color-accent-purple)' : 'transparent',
    },
  };

  // Hover styles - playful bounce
  const getHoverStyles = (): CSSProperties => {
    if (disabled || !isClickable) return {};
    
    return {
      boxShadow: 'var(--shadow-s2)',
      transform: 'translateY(-2px) scale(1.05)',
      color: selected 
        ? (variant === 'category' ? 'white' : variant === 'condition' ? 'white' : 'var(--color-brand-ink)')
        : 'var(--color-text-1)',
    };
  };

  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...stateStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? selected : undefined}
      aria-disabled={disabled}
      style={combinedStyles}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.boxShadow = selected ? 'var(--shadow-s1)' : 'none';
          e.currentTarget.style.transform = 'none';
          
          // Reset color based on variant
          if (variant === 'category' && selected) {
            e.currentTarget.style.color = 'white';
          } else if (variant === 'condition' && selected) {
            e.currentTarget.style.color = 'white';
          } else if (selected) {
            e.currentTarget.style.color = 'var(--color-brand-ink)';
          } else {
            e.currentTarget.style.color = 'var(--color-text-2)';
          }
        }
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
