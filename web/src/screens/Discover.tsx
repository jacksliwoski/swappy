import { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import SearchBar from '../components/forms/SearchBar';
import FilterRow from '../components/forms/FilterRow';
import ListingCard from '../components/cards/ListingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { InventoryItem, User } from '../types';

export default function Discover() {
  const navigate = useNavigate();
  const [items, setItems] = useState<(InventoryItem & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    tradeValue: '',
    sort: 'best',
  });
  const [currentOfferValue, setCurrentOfferValue] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user first
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        setCurrentUserId(res.user.id);
        loadCurrentOffer(res.user.id);
      }
    }).catch(err => {
      console.error('Failed to get current user:', err);
    });
  }, []);

  useEffect(() => {
    loadItems();
  }, [filters, search]);

  async function loadCurrentOffer(userId: string) {
    try {
      const draft = await api.trades.getDraft(userId);
      if (draft && draft.offerA) {
        const total = draft.offerA.items.reduce((sum: number, item: any) =>
          sum + (item.valuation?.estimate?.mid || 0), 0
        );
        setCurrentOfferValue(total);
      }
    } catch (error) {
      console.error('Failed to load draft trade:', error);
    }
  }

  async function loadItems() {
    setLoading(true);
    try {
      const result = await api.discover.browse({
        ...filters,
        search: search || undefined,
      });
      setItems(result.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToTrade(item: InventoryItem & { user: User }) {
    try {
      // Get current draft
      const draft = await api.trades.getDraft('user-1');
      const updatedDraft = {
        ...draft,
        offerB: {
          items: [...(draft?.offerB?.items || []), item],
          totalValue: (draft?.offerB?.totalValue || 0) + item.valuation.estimate.mid,
        },
      };
      await api.trades.saveDraft(updatedDraft);

      // Show toast (simplified - in real app use toast library)
      alert(`Added ${item.title} to your trade!`);

      // Refresh current offer value
      loadCurrentOffer();
    } catch (error) {
      console.error('Failed to add to trade:', error);
    }
  }

  function handleMessage(userId: string) {
    navigate(`/messages?user=${userId}`);
  }

  const containerStyles: CSSProperties = {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: 'var(--container-gutter)',
  };

  const headerStyles: CSSProperties = {
    marginBottom: 'var(--space-8)',
    paddingTop: 'var(--space-6)',
  };

  const titleContainerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-2)',
  };

  const iconStyles: CSSProperties = {
    fontSize: '28px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-accent-blue)20',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2)',
  };

  const titleStyles: CSSProperties = {
    fontSize: 'var(--text-h1)',
    lineHeight: 'var(--text-h1-lh)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-text-1)',
    margin: 0,
  };

  const subtitleStyles: CSSProperties = {
    fontSize: 'var(--text-body)',
    lineHeight: 'var(--text-body-lh)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-medium)',
  };

  const emptyStateStyles: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-10) var(--space-6)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-border)',
    margin: 'var(--space-8) 0',
    boxShadow: 'var(--shadow-s1)',
  };

  const emptyIconStyles: CSSProperties = {
    fontSize: '56px',
    marginBottom: 'var(--space-4)',
    animation: 'bounce 2s ease-in-out infinite',
  };

  const emptyTitleStyles: CSSProperties = {
    fontSize: 'var(--text-h2)',
    lineHeight: 'var(--text-h2-lh)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-text-1)',
    marginBottom: 'var(--space-2)',
  };

  const emptyTextStyles: CSSProperties = {
    fontSize: 'var(--text-body)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-medium)',
  };

  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--space-6)',
    marginTop: 'var(--space-8)',
  };

  const loadingContainerStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--space-10)',
  };

  const resultsCountStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-semibold)',
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-2) var(--space-4)',
    background: 'var(--color-brand-tint)',
    borderRadius: 'var(--radius-pill)',
    display: 'inline-block',
    border: '2px solid var(--color-brand-border)',
  };

  return (
    <div style={containerStyles}>
      {/* Header Section */}
      <div style={headerStyles}>
        <div style={titleContainerStyles}>
          <span style={iconStyles}>🔍</span>
          <h1 style={titleStyles}>Discover</h1>
        </div>
        <p style={subtitleStyles}>
          Find amazing toys, games, and treasures to trade!
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search toys, sets, games…"
      />

      {/* Filters */}
      <FilterRow
        filters={filters}
        onChange={setFilters}
        hasCurrentOffer={currentOfferValue > 0}
      />

      {/* Content Area */}
      {loading ? (
        <div style={loadingContainerStyles}>
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div style={emptyStateStyles}>
          <div style={emptyIconStyles}>✨</div>
          <h2 style={emptyTitleStyles}>No treasures found</h2>
          <p style={emptyTextStyles}>
            Try fewer filters or another word ✨
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div style={resultsCountStyles}>
            {items.length} awesome {items.length === 1 ? 'treasure' : 'treasures'} found!
          </div>

          {/* Card Grid */}
          <div style={gridStyles}>
            {items.map(item => (
              <ListingCard
                key={item.id}
                item={item}
                viewerOfferValue={currentOfferValue}
                onAddToTrade={() => handleAddToTrade(item)}
                onMessage={() => handleMessage(item.userId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
