# Swappy Implementation Guide

This guide provides templates and structure for completing the Swappy kid-friendly trading app.

## What's Already Built

### ✅ Complete
1. **Type Definitions** - `web/src/types.ts` - All types for User, Inventory, Trade, Messages, XP, etc.
2. **API Client** - `web/src/utils/api.ts` - Complete API client for both AI and Data servers
3. **XP System** - `web/src/utils/xp.ts` - Level calculations, XP awards, badge logic
4. **Trade Rating** - `web/src/utils/tradeRating.ts` - great/fair/bad rating calculation
5. **Design System** - `web/src/styles/tokens.css` - Complete design tokens and base styles
6. **Backend Endpoints** - visa-server routes for discover, messages, user inventory, XP, badges, quests

### 🔨 To Build

## Directory Structure

```
web/src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx          # Top navigation with logo, avatar
│   │   ├── HamburgerDrawer.tsx    # Side drawer navigation
│   │   └── Navigation.tsx         # Nav links component
│   ├── cards/
│   │   ├── ItemCard.tsx           # Inventory item display
│   │   ├── ListingCard.tsx        # Discover browse card
│   │   └── UserAvatar.tsx         # Avatar with level badge
│   ├── gamification/
│   │   ├── XPProgressRing.tsx     # Circular XP progress
│   │   ├── LevelBadge.tsx         # User level badge
│   │   ├── BadgeGrid.tsx          # Earned badges display
│   │   └── QuestCard.tsx          # Weekly quest card
│   ├── ui/
│   │   ├── Button.tsx             # Reusable button
│   │   ├── Chip.tsx               # Category/condition chips
│   │   ├── RatingChip.tsx         # great/fair/bad chip
│   │   ├── SafetyBanner.tsx       # Warning banner
│   │   └── Confetti.tsx           # Celebration animation
│   └── forms/
│       ├── SearchBar.tsx          # Search input
│       ├── FilterRow.tsx          # Filter chips row
│       └── PhotoUpload.tsx        # Multi-photo uploader
├── screens/
│   ├── Discover.tsx               # Browse/discover screen
│   ├── Inventory.tsx              # My inventory screen
│   ├── AddToInventory.tsx         # 5-step add flow
│   ├── TradeBuilder.tsx           # Steam-style trade UI
│   ├── Messages.tsx               # Chat interface
│   ├── MeetupSuggestions.tsx      # Safe venue finder
│   ├── Profile.tsx                # User profile + XP/badges
│   └── Settings.tsx               # App settings
├── App.tsx                        # Router setup
└── main.tsx                       # Entry point
```

## Component Templates

### 1. AppHeader Component

```tsx
// web/src/components/layout/AppHeader.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '../cards/UserAvatar';

export default function AppHeader({ user, onMenuClick }: {
  user: User;
  onMenuClick: () => void;
}) {
  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--color-white)',
      borderBottom: '2px solid var(--color-gray-200)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <button onClick={onMenuClick} className="btn" style={{ marginRight: 'var(--space-4)' }}>
        ☰
      </button>
      <Link to="/" style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-primary)',
        flex: 1,
      }}>
        Swappy 🔄
      </Link>
      <Link to="/profile">
        <UserAvatar user={user} size="sm" showLevel />
      </Link>
    </header>
  );
}
```

### 2. UserAvatar Component

```tsx
// web/src/components/cards/UserAvatar.tsx
import { getLevelTooltip } from '../../utils/xp';
import type { User } from '../../types';

export default function UserAvatar({
  user,
  size = 'md',
  showLevel = false
}: {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const avatarSize = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-lilac-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? 'var(--text-base)' : 'var(--text-xl)',
      }}>
        {user.avatar}
      </div>
      {showLevel && (
        <span
          className="chip"
          style={{ background: 'var(--color-primary)', color: 'white' }}
          title={getLevelTooltip(user.level, user.xp, user.xpToNextLevel)}
        >
          Lv{user.level}
        </span>
      )}
    </div>
  );
}
```

### 3. ListingCard Component

```tsx
// web/src/components/cards/ListingCard.tsx
import { calculateTradeRating, getRatingChipProps } from '../../utils/tradeRating';
import UserAvatar from './UserAvatar';
import RatingChip from '../ui/RatingChip';
import type { InventoryItem, User } from '../../types';

export default function ListingCard({
  item,
  viewerOfferValue,
  onAddToTrade,
  onViewInventory,
  onMessage,
}: {
  item: InventoryItem & { user: User };
  viewerOfferValue?: number;
  onAddToTrade: () => void;
  onViewInventory: () => void;
  onMessage: () => void;
}) {
  const rating = viewerOfferValue
    ? calculateTradeRating(viewerOfferValue, item.valuation.estimate.mid)
    : null;

  return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      {/* User row with level badge */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <UserAvatar user={item.user} size="sm" showLevel />
        <span style={{ marginLeft: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>
          {item.user.username}
        </span>
      </div>

      {/* Item image */}
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

      {/* Title + chips */}
      <h3 style={{ marginBottom: 'var(--space-2)' }}>{item.title}</h3>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <span className="chip">{item.category}</span>
        <span className="chip">{item.condition}</span>
      </div>

      {/* Rating chip */}
      {rating ? (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <RatingChip rating={rating} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginTop: 'var(--space-1)' }}>
            Based on your current offer
          </p>
        </div>
      ) : (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
          Pick items to see rating
        </p>
      )}

      {/* Description */}
      <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
        {item.description?.slice(0, 140)}...
      </p>

      {/* Est. Value pill */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <span className="chip">Est. Value: ${item.valuation.estimate.mid}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onAddToTrade}>
          Add to Trade
        </button>
        <button className="btn btn-secondary" onClick={onViewInventory}>
          View Inventory
        </button>
        <button className="btn btn-secondary" onClick={onMessage}>
          Message
        </button>
      </div>
    </div>
  );
}
```

### 4. Discover Screen

```tsx
// web/src/screens/Discover.tsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ListingCard from '../components/cards/ListingCard';
import SearchBar from '../components/forms/SearchBar';
import FilterRow from '../components/forms/FilterRow';
import type { InventoryItem, User } from '../types';

export default function Discover() {
  const [items, setItems] = useState<(InventoryItem & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    tradeValue: '' as '' | 'great' | 'fair' | 'bad',
    sort: 'best',
  });
  const [currentOfferValue, setCurrentOfferValue] = useState(0); // Get from draft trade

  useEffect(() => {
    loadItems();
  }, [filters, search]);

  async function loadItems() {
    setLoading(true);
    try {
      const result = await api.discover.browse({ ...filters, search });
      setItems(result.items);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* Search bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search toys, sets, games..."
      />

      {/* Filter row */}
      <FilterRow
        filters={filters}
        onChange={setFilters}
        hasCurrentOffer={currentOfferValue > 0}
      />

      {/* Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gray-600)' }}>
            No treasures found. Try fewer filters or another word ✨
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
        }}>
          {items.map(item => (
            <ListingCard
              key={item.id}
              item={item}
              viewerOfferValue={currentOfferValue}
              onAddToTrade={() => {/* Add to trade */}}
              onViewInventory={() => {/* Navigate to user inventory */}}
              onMessage={() => {/* Open messages */}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Main App Router

```tsx
// web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AppHeader from './components/layout/AppHeader';
import HamburgerDrawer from './components/layout/HamburgerDrawer';
import Discover from './screens/Discover';
import Inventory from './screens/Inventory';
import AddToInventory from './screens/AddToInventory';
import TradeBuilder from './screens/TradeBuilder';
import Messages from './screens/Messages';
import MeetupSuggestions from './screens/MeetupSuggestions';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import type { User } from './types';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser] = useState<User>({
    id: 'user-1',
    username: 'You',
    avatar: '😊',
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    hasGuardian: true,
    createdAt: new Date().toISOString(),
  });

  return (
    <BrowserRouter>
      <div>
        <AppHeader user={currentUser} onMenuClick={() => setDrawerOpen(true)} />
        <HamburgerDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          user={currentUser}
        />

        <main style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'var(--space-4)',
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddToInventory />} />
            <Route path="/trades/:tradeId?" element={<TradeBuilder />} />
            <Route path="/messages/:conversationId?" element={<Messages />} />
            <Route path="/meetup" element={<MeetupSuggestions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### 6. Update main.tsx

```tsx
// web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Remaining Components to Build

Use the patterns above to build:

1. **HamburgerDrawer** - Side navigation with links
2. **Inventory Screen** - Grid of user's items with filters
3. **AddToInventory Flow** - 5-step wizard using existing AI components
4. **TradeBuilder** - Two-column layout with fairness meter
5. **Messages** - Chat UI with moderation integration
6. **Profile** - XP progress, badges, quests display
7. **RatingChip, Button, Chip, SearchBar, FilterRow** - UI components using design tokens

## Key Integration Points

### AI Features Integration
- Vision Facts: `ai.visionFacts(images, description)`
- Valuation: `ai.valuation(facts)`
- Fairness: `ai.unevenScore(sideA, sideB)`
- Moderation: `ai.moderateStream(msg)`
- Meetup: `ai.meetupSuggestions(...)`

### Data/State Management
- User inventory: `api.users.getInventory(userId)`
- Discover browse: `api.discover.browse(filters)`
- Draft trade: `api.trades.getDraft(userId)`
- Messages: `api.messages.getConversations(userId)`
- XP/Badges: `api.users.getBadges(userId)`, `api.users.getQuests(userId)`

### XP Awards
Award XP after actions using:
```typescript
import { calculateTradeXP, estimateTradeXP } from './utils/xp';
await api.users.awardXP(userId, xp, reason);
```

## Testing

1. Start both servers: `npm run dev` (from root)
2. Frontend: http://localhost:5173
3. Test discover browse, filters, trade rating
4. Test add flow with AI integration
5. Test XP awards and level-up

## Next Steps

1. Build remaining component files using templates above
2. Wire up navigation in HamburgerDrawer
3. Implement AddToInventory 5-step flow
4. Build TradeBuilder with fairness meter
5. Add confetti animations on success actions
6. Test full user journey from Discover → Add → Trade → Complete
