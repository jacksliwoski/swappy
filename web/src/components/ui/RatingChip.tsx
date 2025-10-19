import { CSSProperties } from 'react';
import { getRatingChipProps } from '../../utils/tradeRating';
import type { TradeRating } from '../../types';

interface RatingChipProps {
  rating: TradeRating;
  showDescription?: boolean;
  size?: 'sm' | 'md';
}

export default function RatingChip({ 
  rating, 
  showDescription = false,
  size = 'md'
}: RatingChipProps) {
  const { bgColor, textColor, label, icon, description } = getRatingChipProps(rating);

  const chipStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: size === 'sm' ? '6px 12px' : '8px 14px',
    borderRadius: 'var(--radius-pill)',
    fontSize: size === 'sm' ? 'var(--text-small)' : 'var(--text-body)',
    lineHeight: size === 'sm' ? 'var(--text-small-lh)' : 'var(--text-body-lh)',
    fontWeight: 'var(--font-bold)',
    fontFamily: 'var(--font-body)',
    background: bgColor,
    color: textColor,
    userSelect: 'none',
    boxShadow: 'var(--shadow-s1)',
    border: `2px solid ${textColor}20`,
  };

  const iconStyles: CSSProperties = {
    fontSize: size === 'sm' ? '12px' : '14px',
    fontWeight: 'var(--font-bold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <span 
        style={chipStyles}
        role="status"
        aria-label={`trade rating: ${label}`}
      >
        <span style={iconStyles}>{icon}</span>
        {label}
      </span>
      {showDescription && (
        <p style={{
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-2)',
          marginTop: 'var(--space-1)',
          marginBottom: 0,
          fontWeight: 'var(--font-medium)',
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
