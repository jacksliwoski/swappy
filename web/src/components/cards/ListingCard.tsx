import { CSSProperties, useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const rating = viewerOfferValue ? calculateTradeRating(viewerOfferValue, item.valuation.estimate.mid) : null;

  const cardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--color-border)',
    padding: 'var(--space-4)',
    transition: 'all var(--transition-base)',
    boxShadow: isHovered ? 'var(--shadow-s2)' : 'var(--shadow-s1)',
    transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
  };

  const levelBadgeStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    fontWeight: 'var(--font-bold)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-accent-purple)',
    color: 'white',
    marginLeft: 'auto',
    boxShadow: 'var(--shadow-s1)',
    border: '2px solid var(--color-accent-purple)80',
  };

  const imageContainerStyles: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    marginBottom: 'var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    background: 'var(--color-gray-200)',
    border: '2px solid var(--color-border)',
  };

  const imageStyles: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: imageLoaded ? 'block' : 'none',
  };

  const skeletonStyles: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: imageLoaded ? 'none' : 'block',
  };

  const titleStyles: CSSProperties = {
    fontSize: 'var(--text-h4)',
    lineHeight: 'var(--text-h4-lh)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-1)',
    marginBottom: 'var(--space-2)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const chipsRowStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
    flexWrap: 'wrap',
  };

  const descriptionStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    color: 'var(--color-text-2)',
    marginBottom: 'var(--space-3)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const valueChipStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-bold)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand-tint)',
    color: 'var(--color-brand-ink)',
    marginBottom: 'var(--space-4)',
    display: 'inline-block',
    border: '2px solid var(--color-brand)',
    boxShadow: 'var(--shadow-s1)',
  };

  const actionsStyles: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    marginTop: 'auto',
  };

  return (
    <div
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header: Avatar + Username + Level Badge */}
      <div style={headerStyles}>
        <UserAvatar user={item.user} size="sm" />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-1)',
          }}>
            {item.user.username}
          </div>
        </div>
        <span style={levelBadgeStyles}>
          Lv{item.user.level}
        </span>
      </div>

      {/* Image */}
      <div style={imageContainerStyles}>
        <div className="skeleton" style={skeletonStyles} />
        <img
          src={item.images[0]}
          alt={item.title}
          style={imageStyles}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Title */}
      <h3 style={titleStyles}>{item.title}</h3>

      {/* Category & Condition Chips */}
      <div style={chipsRowStyles}>
        <Chip variant="category">{item.category}</Chip>
        <Chip variant="condition">{item.condition}</Chip>
      </div>

      {/* Rating Chip or Placeholder */}
      {rating ? (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <RatingChip rating={rating} size="sm" />
        </div>
      ) : (
        <div style={{
          fontSize: 'var(--text-small)',
          lineHeight: 'var(--text-small-lh)',
          color: 'var(--color-gray-400)',
          fontStyle: 'italic',
          marginBottom: 'var(--space-3)',
        }}>
          Pick items to see trade rating ✨
        </div>
      )}

      {/* Description */}
      {item.description && (
        <p style={descriptionStyles}>
          {item.description}
        </p>
      )}

      {/* Value Chip */}
      <div style={valueChipStyles}>
        Est. {formatValue(item.valuation.estimate.mid)}
      </div>

      {/* Actions */}
      <div style={actionsStyles}>
        <Button variant="primary" size="sm" onClick={onAddToTrade} fullWidth>
          Add to Trade
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMessage}
          style={{ minWidth: '44px', padding: '0' }}
          aria-label="Send message"
        >
          💬
        </Button>
      </div>
    </div>
  );
}
