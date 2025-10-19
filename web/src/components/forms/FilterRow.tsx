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

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Category */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'var(--font-semibold)', marginRight: '1rem', display: 'inline-block', minWidth: '100px' }}>
          Category:
        </label>
        {categories.map(c => (
          <Chip
            key={c}
            bgColor={filters.category === c ? 'var(--color-primary)' : undefined}
            color={filters.category === c ? 'white' : undefined}
            onClick={() => onChange({ ...filters, category: filters.category === c ? '' : c })}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {c}
          </Chip>
        ))}
      </div>

      {/* Condition */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'var(--font-semibold)', marginRight: '1rem', display: 'inline-block', minWidth: '100px' }}>
          Condition:
        </label>
        {conditions.map(c => (
          <Chip
            key={c}
            bgColor={filters.condition === c ? 'var(--color-primary)' : undefined}
            color={filters.condition === c ? 'white' : undefined}
            onClick={() => onChange({ ...filters, condition: filters.condition === c ? '' : c })}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {c}
          </Chip>
        ))}
      </div>

      {/* Trade Value */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'var(--font-semibold)', marginRight: '1rem', display: 'inline-block', minWidth: '100px' }}>
          Trade Value:
        </label>
        {ratings.map(r => (
          <Chip
            key={r}
            bgColor={filters.tradeValue === r ? 'var(--color-primary)' : hasCurrentOffer ? undefined : 'var(--color-gray-100)'}
            color={filters.tradeValue === r ? 'white' : hasCurrentOffer ? undefined : 'var(--color-gray-400)'}
            onClick={hasCurrentOffer ? () => onChange({ ...filters, tradeValue: filters.tradeValue === r ? '' : r }) : undefined}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              cursor: hasCurrentOffer ? 'pointer' : 'not-allowed',
            }}
          >
            <span title={!hasCurrentOffer ? 'Pick items in Trade Builder to see ratings here' : ''}>
              {r}
            </span>
          </Chip>
        ))}
      </div>

      {/* Sort */}
      <div>
        <label style={{ fontWeight: 'var(--font-semibold)', marginRight: '1rem', display: 'inline-block', minWidth: '100px' }}>
          Sort:
        </label>
        {sorts.map(s => (
          <Chip
            key={s}
            bgColor={filters.sort === s ? 'var(--color-primary)' : undefined}
            color={filters.sort === s ? 'white' : undefined}
            onClick={() => onChange({ ...filters, sort: s })}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {s}
          </Chip>
        ))}
      </div>
    </div>
  );
}
