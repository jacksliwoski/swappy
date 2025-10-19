import { CSSProperties, useState } from 'react';
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

export default function ItemCard({ 
  item, 
  onSelect, 
  onRemove, 
  selected = false, 
  draggable = false, 
  onDragStart 
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasMultipleImages = item.images && item.images.length > 1;
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? (item.images?.length || 1) - 1 : prev - 1
    );
    setImageLoaded(false);
    setImageError(false);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === (item.images?.length || 1) - 1 ? 0 : prev + 1
    );
    setImageLoaded(false);
    setImageError(false);
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  }

  const cardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: selected 
      ? '3px solid var(--color-brand)' 
      : '2px solid var(--color-border)',
    padding: 'var(--space-4)',
    cursor: onSelect ? 'pointer' : 'default',
    transition: 'all var(--transition-base)',
    boxShadow: (isHovered || selected) ? 'var(--shadow-s2)' : 'var(--shadow-s1)',
    transform: (isHovered && !selected) ? 'translateY(-3px) scale(1.03)' : selected ? 'scale(1.02)' : 'none',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
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

  const valueChipStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-bold)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand-tint)',
    color: 'var(--color-brand-ink)',
    marginBottom: onRemove ? 'var(--space-3)' : 0,
    display: 'inline-block',
    border: '2px solid var(--color-brand)',
    boxShadow: 'var(--shadow-s1)',
  };

  const selectedBadgeStyles: CSSProperties = {
    position: 'absolute',
    top: 'var(--space-2)',
    right: 'var(--space-2)',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand)',
    color: 'white',
    display: selected ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'var(--font-bold)',
    boxShadow: 'var(--shadow-sticker)',
    border: '2px solid white',
    animation: 'scaleIn 0.2s ease-out',
  };

  const imageNavButtonStyles: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-pill)',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    border: '2px solid white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'var(--font-bold)',
    transition: 'all var(--transition-base)',
    zIndex: 10,
  };

  const imageIndicatorsStyles: CSSProperties = {
    position: 'absolute',
    bottom: 'var(--space-2)',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 'var(--space-1)',
    zIndex: 10,
  };

  const indicatorDotStyles = (isActive: boolean): CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(0, 0, 0, 0.3)',
    transition: 'all var(--transition-base)',
  });

  return (
    <div
      style={cardStyles}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={draggable}
      onDragStart={onDragStart}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      aria-pressed={selected}
      aria-label={`${item.title} - ${item.category} - ${item.condition}`}
    >
      {/* Selected Badge */}
      <div style={selectedBadgeStyles}>✓</div>

      {/* Image */}
      <div style={imageContainerStyles}>
        {!imageLoaded && !imageError && (
          <div className="skeleton" style={skeletonStyles} />
        )}
        {item.images && item.images.length > 0 && !imageError ? (
          <>
            <img
              src={item.images[currentImageIndex]}
              alt={`${item.title} - Image ${currentImageIndex + 1}`}
              style={imageStyles}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            
            {/* Navigation Arrows - only show if multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  style={{ ...imageNavButtonStyles, left: 'var(--space-2)' }}
                  onClick={handlePrevImage}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  style={{ ...imageNavButtonStyles, right: 'var(--space-2)' }}
                  onClick={handleNextImage}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  aria-label="Next image"
                >
                  →
                </button>
                
                {/* Image Indicators */}
                <div style={imageIndicatorsStyles}>
                  {item.images.map((_, index) => (
                    <div 
                      key={index} 
                      style={indicatorDotStyles(index === currentImageIndex)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-gray-100)',
            fontSize: '48px',
          }}>
            📦
          </div>
        )}
      </div>

      {/* Title */}
      <h4 style={titleStyles}>{item.title}</h4>

      {/* Category & Condition Chips */}
      <div style={chipsRowStyles}>
        <Chip variant="category">{item.category}</Chip>
        <Chip variant="condition">{item.condition}</Chip>
      </div>

      {/* Value Chip */}
      <div style={valueChipStyles}>
        {formatValue(item.valuation.estimate.mid)}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={(e) => { 
            e.stopPropagation(); 
            onRemove(); 
          }}
          fullWidth
        >
          Remove
        </Button>
      )}
    </div>
  );
}
