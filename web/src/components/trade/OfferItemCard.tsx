import { formatValue } from '../../utils/tradeRating';
import type { InventoryItem } from '../../types';
import Chip from '../ui/Chip';

interface OfferItemCardProps {
  item: InventoryItem;
  onRemove: () => void;
  side: 'yours' | 'theirs';
}

export default function OfferItemCard({ item, onRemove, side }: OfferItemCardProps) {
  const sideColor = side === 'yours' ? 'var(--color-teal)' : 'var(--color-lilac)';
  
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemove();
    }
  }

  return (
    <div
      className="offer-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${sideColor}`,
        transition: 'all var(--transition-fast)',
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label={`${item.title} in offer - Press Delete to remove`}
    >
      {/* Thumbnail */}
      <img
        src={item.images[0]}
        alt={item.title}
        style={{
          width: '48px',
          height: '48px',
          objectFit: 'cover',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            marginBottom: 'var(--space-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Chip style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
            {item.category}
          </Chip>
          <Chip style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
            {item.condition}
          </Chip>
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-bold)',
          color: sideColor,
          flexShrink: 0,
        }}
      >
        {formatValue(item.valuation.estimate.mid)}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.title}`}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-gray-200)',
          color: 'var(--color-gray-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-lg)',
          flexShrink: 0,
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-error)';
          e.currentTarget.style.color = 'var(--color-white)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-gray-200)';
          e.currentTarget.style.color = 'var(--color-gray-600)';
        }}
      >
        ×
      </button>
    </div>
  );
}

