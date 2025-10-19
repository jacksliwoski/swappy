import { calculateTradeRating, formatValue } from '../../utils/tradeRating';
import UserAvatar from './UserAvatar';
import RatingChip from '../ui/RatingChip';
import Chip from '../ui/Chip';
import Button from '../ui/Button';
import type { InventoryItem, User } from '../../types';

interface ListingCardProps {
  item: InventoryItem & { user: User };
  viewerOfferValue?: number;
  onAddToTrade: () => void;
  onMessage: () => void;
}

export default function ListingCard({ item, viewerOfferValue, onAddToTrade, onMessage }: ListingCardProps) {
  const rating = viewerOfferValue ? calculateTradeRating(viewerOfferValue, item.valuation.estimate.mid) : null;

  return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <UserAvatar user={item.user} showLevel showUsername />
      </div>

      <img
        src={item.images[0]}
        alt={item.title}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-3)',
        }}
      />

      <h3 style={{ marginBottom: 'var(--space-2)' }}>{item.title}</h3>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        <Chip>{item.category}</Chip>
        <Chip>{item.condition}</Chip>
      </div>

      {rating ? (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <RatingChip rating={rating} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginTop: 'var(--space-1)' }}>
            Based on your current offer
          </p>
        </div>
      ) : (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
          Pick items in Trade Builder to see rating
        </p>
      )}

      {item.description && (
        <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', color: 'var(--color-gray-700)' }}>
          {item.description.slice(0, 140)}{item.description.length > 140 ? '...' : ''}
        </p>
      )}

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Chip bgColor="var(--color-gray-200)">Est. Value: {formatValue(item.valuation.estimate.mid)}</Chip>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="primary" onClick={onAddToTrade} style={{ flex: 1 }}>
          Add to Trade
        </Button>
        <Button variant="secondary" onClick={onMessage}>
          💬
        </Button>
      </div>
    </div>
  );
}
