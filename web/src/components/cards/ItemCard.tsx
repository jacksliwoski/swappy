import { formatValue } from '../../utils/tradeRating';
import type { InventoryItem } from '../../types';
import Chip from '../ui/Chip';
import Button from '../ui/Button';

interface ItemCardProps {
  item: InventoryItem;
  onSelect?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function ItemCard({ item, onSelect, onRemove, selected, draggable = false, onDragStart }: ItemCardProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-4)',
        border: selected ? '2px solid var(--color-primary)' : undefined,
        cursor: onSelect ? 'pointer' : undefined,
        transition: 'all var(--transition-fast)',
      }}
      onClick={onSelect}
      draggable={draggable}
      onDragStart={onDragStart}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      aria-pressed={selected}
      aria-label={`${item.title} - ${item.category} - ${item.condition}`}
    >
      <img
        src={item.images[0]}
        alt={item.title}
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-3)',
        }}
      />
      <h4 style={{ marginBottom: 'var(--space-2)' }}>{item.title}</h4>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        <Chip>{item.category}</Chip>
        <Chip>{item.condition}</Chip>
      </div>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <Chip bgColor="var(--color-teal-light)" color="var(--color-teal-dark)">
          {formatValue(item.valuation.estimate.mid)}
        </Chip>
      </div>
      {onRemove && (
        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          Remove
        </Button>
      )}
    </div>
  );
}
