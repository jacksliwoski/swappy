import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadCurrentOffer();
  }, []);

  useEffect(() => {
    loadItems();
  }, [filters, search]);

  async function loadCurrentOffer() {
    try {
      const draft = await api.trades.getDraft('user-1');
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

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
        🔍 Discover
      </h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search toys, sets, games..."
      />

      <FilterRow
        filters={filters}
        onChange={setFilters}
        hasCurrentOffer={currentOfferValue > 0}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-12)',
          color: 'var(--color-gray-600)',
        }}>
          <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
            ✨ No treasures found
          </p>
          <p>Try fewer filters or another word</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
        }}>
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
      )}
    </div>
  );
}
