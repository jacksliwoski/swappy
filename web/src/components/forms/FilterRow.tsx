import { CSSProperties } from 'react';
import Chip from '../ui/Chip';

interface FilterRowProps {
  filters: {
    category: string;
    condition: string;
    tradeValue: string;
    sort: string;
  };
  onChange: (filters: any) => void;
  hasCurrentOffer: boolean;
}

export default function FilterRow({ filters, onChange, hasCurrentOffer }: FilterRowProps) {
  const categories = ['toys', 'games', 'sports', 'books', 'electronics'];
  const conditions = ['new', 'ln', 'good', 'fair'];
  const ratings = ['great', 'fair', 'bad'];
  const sorts = ['best', 'newest', 'closest', 'value'];

  const sectionStyles: CSSProperties = {
    marginBottom: 'var(--space-6)',
  };

  const labelStyles: CSSProperties = {
    fontSize: 'var(--text-body)',
    lineHeight: 'var(--text-body-lh)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-1)',
    marginBottom: 'var(--space-3)',
    display: 'block',
  };

  const chipRowStyles: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  };

  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      {/* Category */}
      <div style={sectionStyles}>
        <label style={labelStyles}>Category</label>
        <div style={chipRowStyles}>
          {categories.map(c => (
            <Chip
              key={c}
              selected={filters.category === c}
              onClick={() => onChange({ ...filters, category: filters.category === c ? '' : c })}
              variant="category"
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div style={sectionStyles}>
        <label style={labelStyles}>Condition</label>
        <div style={chipRowStyles}>
          {conditions.map(c => (
            <Chip
              key={c}
              selected={filters.condition === c}
              onClick={() => onChange({ ...filters, condition: filters.condition === c ? '' : c })}
              variant="condition"
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* Trade Value */}
      <div style={sectionStyles}>
        <label style={labelStyles}>
          Trade Value
          {!hasCurrentOffer && (
            <span style={{
              fontSize: 'var(--text-small)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-gray-400)',
              marginLeft: 'var(--space-2)',
              fontStyle: 'italic',
            }}>
              (pick items first!)
            </span>
          )}
        </label>
        <div style={chipRowStyles}>
          {ratings.map(r => (
            <Chip
              key={r}
              selected={filters.tradeValue === r}
              disabled={!hasCurrentOffer}
              onClick={hasCurrentOffer ? () => onChange({ ...filters, tradeValue: filters.tradeValue === r ? '' : r }) : undefined}
            >
              <span title={!hasCurrentOffer ? 'Pick items in Trade Builder to see ratings here' : ''}>
                {r}
              </span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div style={sectionStyles}>
        <label style={labelStyles}>Sort by</label>
        <div style={chipRowStyles}>
          {sorts.map(s => (
            <Chip
              key={s}
              selected={filters.sort === s}
              onClick={() => onChange({ ...filters, sort: s })}
            >
              {s}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
