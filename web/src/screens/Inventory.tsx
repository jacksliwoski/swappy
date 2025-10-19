import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatValue } from '../utils/tradeRating';
import ItemCard from '../components/cards/ItemCard';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { InventoryItem } from '../types';

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    valueBand: '', // low < 50, mid 50-150, high > 150
  });

  useEffect(() => {
    // Get current user first
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        setCurrentUser(res.user);
        loadInventory(res.user.id);
      }
    }).catch(err => {
      console.error('Failed to get current user:', err);
      setLoading(false);
    });
  }, []);

  async function loadInventory(userId: string) {
    setLoading(true);
    try {
      const data = await api.users.getInventory(userId);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.valueBand) {
      const value = item.valuation.estimate.mid;
      if (filters.valueBand === 'low' && value >= 50) return false;
      if (filters.valueBand === 'mid' && (value < 50 || value > 150)) return false;
      if (filters.valueBand === 'high' && value <= 150) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>📦 Your Toy Box</h1>
        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>
          Your toy box is empty—let's fill it up! 📦
        </p>
        <Link to="/add">
          <Button variant="primary" size="lg">
            ➕ Add to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const categories = [...new Set(items.map(i => i.category))];
  const conditions = [...new Set(items.map(i => i.condition))];

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)' }}>📦 Your Toy Box</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/add">
            <Button variant="primary">➕ Add Item</Button>
          </Link>
          <Link to="/trades">
            <Button variant="secondary">🔄 Start Trade</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        <div>
          <label style={{ fontWeight: 'var(--font-semibold)', marginRight: 'var(--space-2)' }}>Category:</label>
          {categories.map(cat => (
            <Chip
              key={cat}
              bgColor={filters.category === cat ? 'var(--color-primary)' : undefined}
              color={filters.category === cat ? 'white' : undefined}
              onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }))}
            >
              {cat}
            </Chip>
          ))}
        </div>

        <div>
          <label style={{ fontWeight: 'var(--font-semibold)', marginRight: 'var(--space-2)' }}>Condition:</label>
          {conditions.map(cond => (
            <Chip
              key={cond}
              bgColor={filters.condition === cond ? 'var(--color-primary)' : undefined}
              color={filters.condition === cond ? 'white' : undefined}
              onClick={() => setFilters(f => ({ ...f, condition: f.condition === cond ? '' : cond }))}
            >
              {cond}
            </Chip>
          ))}
        </div>

        <div>
          <label style={{ fontWeight: 'var(--font-semibold)', marginRight: 'var(--space-2)' }}>Value:</label>
          {['low', 'mid', 'high'].map(band => (
            <Chip
              key={band}
              bgColor={filters.valueBand === band ? 'var(--color-primary)' : undefined}
              color={filters.valueBand === band ? 'white' : undefined}
              onClick={() => setFilters(f => ({ ...f, valueBand: f.valueBand === band ? '' : band }))}
            >
              {band === 'low' ? '<$50' : band === 'mid' ? '$50-150' : '>$150'}
            </Chip>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {filteredItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onSelect={() => navigate(`/trades?item=${item.id}`)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-gray-600)' }}>
          No items match your filters
        </div>
      )}
    </div>
  );
}

