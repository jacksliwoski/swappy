import { getRatingChipProps } from '../../utils/tradeRating';
import type { TradeRating } from '../../types';
import Chip from './Chip';

interface RatingChipProps {
  rating: TradeRating;
  showDescription?: boolean;
}

export default function RatingChip({ rating, showDescription = false }: RatingChipProps) {
  const { color, label, icon, description } = getRatingChipProps(rating);

  return (
    <div>
      <Chip
        bgColor={color}
        color="white"
        style={{ fontWeight: 'var(--font-semibold)' }}
      >
        {icon} {label}
      </Chip>
      {showDescription && (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-gray-600)',
          marginTop: 'var(--space-1)',
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
