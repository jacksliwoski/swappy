# Cursor AI: Complete Swappy Kid-Friendly Trading App

## Context
You're completing a kid-friendly local trading app called "Swappy". The foundation is 100% complete including:
- ✅ All TypeScript types (`web/src/types.ts`)
- ✅ Complete API client (`web/src/utils/api.ts`) for AI server (port 3000) and Data server (port 7002)
- ✅ XP system with levels 1-10 (`web/src/utils/xp.ts`)
- ✅ Trade rating algorithm (`web/src/utils/tradeRating.ts`)
- ✅ Kid-friendly design system (`web/src/styles/tokens.css`)
- ✅ All backend mock endpoints in `visa-server/src/routes/`
- ✅ Reusable components: Button, Chip, RatingChip, SafetyBanner, Confetti, LoadingSpinner, UserAvatar, ItemCard, ListingCard
- ✅ Existing AI integration components: VisionForm, FactsCard, ValuationCard, FairnessTester, StreamModerationTester, MeetupSuggestions

## Your Task
Complete the remaining screen implementations. All infrastructure exists - you're just assembling components and wiring API calls.

---

## Screen 1: Discover (Browse)
**File:** `web/src/screens/Discover.tsx`

### Requirements:
1. Fetch items from `api.discover.browse(filters)`
2. Search bar at top with debounced search (300ms)
3. Filter row beneath search with chips:
   - Category (toys, games, sports, books, etc.)
   - Condition (new, ln, good, fair, poor)
   - Trade Value (great, fair, bad) - **DISABLED** if no current offer, tooltip: "Pick items in Trade Builder to see ratings here"
   - Sort (best match, newest, closest, highest value)
4. Grid of ListingCard components
5. Get current offer value from draft trade: `api.trades.getDraft('user-1')`
6. Pass `viewerOfferValue` to each ListingCard for rating calculation
7. "Add to Trade" → add item to draft trade and show toast
8. "Message" → navigate to `/messages` with user
9. Loading state: skeleton cards
10. Empty state: "No treasures found. Try fewer filters or another word ✨"

### Code Pattern:
```tsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ListingCard from '../components/cards/ListingCard';
// ... implement with state for filters, items, loading, currentOfferValue
```

---

## Screen 2: My Inventory
**File:** `web/src/screens/Inventory.tsx`

### Requirements:
1. Header: "Your Toy Box" with two CTAs:
   - "Add to Inventory" → navigate to `/add`
   - "Start a Trade" → navigate to `/trades`
2. Fetch inventory: `api.users.getInventory('user-1')`
3. Grid of ItemCard components
4. Filter chips: category, condition, value band (Low < $50, Mid $50-150, High > $150)
5. Click item → navigate to `/trades` with item pre-selected
6. Empty state: "Your toy box is empty—let's fill it up! 📦" with big "Add to Inventory" button

---

## Screen 3: Add to Inventory (5-Step Wizard)
**File:** `web/src/screens/AddToInventory.tsx`

### Requirements:
**Reuse existing components:**
- VisionForm for Steps 1-2
- FactsCard for Step 3
- ValuationCard for Step 4

### Steps:
1. **Photos** (1-4 images) + Description (optional)
   - Use VisionForm, get images + description
2. **Magic Facts**
   - Call `ai.visionFacts(images, description)`
   - Show FactsCard (editable)
   - "Next" button
3. **Valuation**
   - Call `ai.valuation(facts)`
   - Show ValuationCard with Low/Mid/High + explanation
   - "Next" button
4. **Save**
   - Call `api.users.addToInventory('user-1', { images, title, description, facts, valuation, category, condition })`
   - Show Confetti component
   - Award XP: `api.users.awardXP('user-1', 5, 'quality_photos')` if 3-4 photos
   - Toast: "+5 XP Quality Photos!"
   - Navigate to `/inventory`

### Progress Dots:
Show 4 dots at top indicating current step (filled vs empty circles)

---

## Screen 4: Trade Builder
**File:** `web/src/screens/TradeBuilder.tsx`

### Requirements:
**Reuse FairnessTester logic** but with two-column layout

### Layout:
- **Left Column:** "Your Offer"
  - Fetch user inventory: `api.users.getInventory('user-1')`
  - Grid of ItemCards with selection
  - Show total value at bottom
- **Right Column:** "Their Offer"
  - Mock: show 2-3 items from another user OR
  - Fetch from URL param if coming from Discover
  - Show total value at bottom
- **Center:** Fairness Meter
  - Calculate live with `ai.unevenScore([...yourValues], [...theirValues])`
  - Color-coded bar: green (fair), yellow (almost), red (uneven)
  - Show balancing hint: "Add ~$25 or another small item"
  - XP Preview: "Complete this fair trade to earn ~70 XP"

### Actions:
- "Propose Trade" → `api.trades.propose(trade)` → Confetti → Navigate to `/messages`
- "Reset" → Clear all selections
- Draft auto-save every 2 seconds: `api.trades.saveDraft(trade)`

---

## Screen 5: Messages
**File:** `web/src/screens/Messages.tsx`

### Requirements:
**Reuse StreamModerationTester for moderation**

### Layout:
- **Left Sidebar (30%):** Conversation list
  - Fetch: `api.messages.getConversations('user-1')`
  - Show avatar, username, last message preview, unread badge
  - Click → load conversation
- **Right Panel (70%):** Chat interface
  - Messages list (scrollable)
  - Input box at bottom
  - "Send" → POST to `api.messages.send()` → Stream to `ai.moderateStream(text)` for safety
  - If moderation returns tags (SCAM_DEPOSIT, MOVE_OFF_APP), show SafetyBanner
  - Quick actions above input:
    - "📍 Suggest Safe Meet Spot" → Insert link to meetup
    - "🕐 Share Meet Time" → Insert formatted time

### Empty State:
"No messages yet. Start trading to connect with others!"

---

## Screen 6: Profile & XP
**File:** `web/src/screens/Profile.tsx`

### Requirements:
1. Fetch user: `api.users.get('user-1')`
2. Fetch badges: `api.users.getBadges('user-1')`
3. Fetch quests: `api.users.getQuests('user-1')`

### Sections:
**Header:**
- Large avatar (64px) + username
- Level badge: "Lv3 Trader"
- XP Progress bar: current/next level with percentage fill

**XP Section:**
- Linear progress bar
- Text: "220 / 300 XP to Level 4"
- Calculate using `calculateLevel(totalXP)` from utils/xp.ts

**Badges Grid:**
- Show earned badges with icon + name
- Grayed out badges not yet earned
- Examples: First Swap!, Safety Star, Fair Trader, Picture Pro

**Weekly Quests:**
- List of quests with progress bars
- "Trade 2 different categories this week" (1/2)
- "Use a safe public meet spot" (0/1)
- "+15 XP" reward shown
- Checkmark when completed

**Safety Card:**
- Toggle: "I have a grown-up helping me"
- Rules list: Ages 8+, Meet in public, No deposits, Max $250

---

## Screen 7: Settings
**File:** `web/src/screens/Settings.tsx`

### Simple Implementation:
```tsx
export default function Settings() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem' }}>⚙️ Settings</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Notifications</h3>
        <label><input type="checkbox" defaultChecked /> Trade updates</label>
        <label><input type="checkbox" defaultChecked /> New messages</label>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Accessibility</h3>
        <label>Text Size: <select><option>Normal</option><option>Large</option></select></label>
        <label><input type="checkbox" /> High Contrast</label>
      </div>

      <div className="card">
        <h3>Account</h3>
        <p>User ID: user-1</p>
        <button className="btn btn-secondary">Sign Out</button>
      </div>
    </div>
  );
}
```

---

## AppContext (Global State)
**File:** `web/src/context/AppContext.tsx`

### Create React Context for:
```tsx
interface AppContextType {
  currentUser: User;
  draftTrade: Trade | null;
  updateDraftTrade: (trade: Trade) => void;
  currentOfferValue: number; // calculated from draftTrade
}
```

Mock current user:
```tsx
const mockUser: User = {
  id: 'user-1',
  username: 'You',
  avatar: '😊',
  level: 1,
  xp: 0,
  xpToNextLevel: 50,
  hasGuardian: true,
  createdAt: new Date().toISOString(),
};
```

Wrap App.tsx with `<AppContext.Provider>`

---

## Form Components (Quick Implementations)

### SearchBar
**File:** `web/src/components/forms/SearchBar.tsx`
```tsx
import { useState, useEffect } from 'react';

export default function SearchBar({ value, onChange, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(input), 300);
    return () => clearTimeout(timer);
  }, [input, onChange]);

  return (
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: 'var(--space-4)',
        fontSize: 'var(--text-lg)',
        border: '2px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-4)',
      }}
    />
  );
}
```

### FilterRow
**File:** `web/src/components/forms/FilterRow.tsx`
```tsx
import Chip from '../ui/Chip';

export default function FilterRow({ filters, onChange, hasCurrentOffer }: {
  filters: any;
  onChange: (filters: any) => void;
  hasCurrentOffer: boolean;
}) {
  const categories = ['toys', 'games', 'sports', 'books'];
  const conditions = ['new', 'ln', 'good', 'fair', 'poor'];
  const ratings = ['great', 'fair', 'bad'];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <div>
        <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Category:</label>
        {categories.map(c => (
          <Chip
            key={c}
            bgColor={filters.category === c ? 'var(--color-primary)' : undefined}
            color={filters.category === c ? 'white' : undefined}
            onClick={() => onChange({ ...filters, category: filters.category === c ? '' : c })}
          >
            {c}
          </Chip>
        ))}
      </div>
      {/* Repeat for conditions, ratings (with hasCurrentOffer check for ratings) */}
    </div>
  );
}
```

---

## Gamification Components

### XPProgressBar
**File:** `web/src/components/gamification/XPProgressBar.tsx`
```tsx
import { calculateLevel } from '../../utils/xp';

export default function XPProgressBar({ xp }: { xp: number }) {
  const { level, levelName, xpToNextLevel, progressPercent } = calculateLevel(xp);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 'bold' }}>Lv{level} {levelName}</span>
        <span>{xp} / {xpToNextLevel} XP</span>
      </div>
      <div style={{
        width: '100%',
        height: '16px',
        background: 'var(--color-gray-200)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-teal), var(--color-lilac))',
          transition: 'width var(--transition-slow)',
        }} />
      </div>
    </div>
  );
}
```

### BadgeGrid, QuestCard
Create simple displays - badge is icon + name, quest is title + progress bar.

---

## Final Integration Steps

1. **Update App.tsx:**
   - Import all screen components
   - Wrap with AppContext.Provider
   - Replace placeholder screens with real implementations

2. **Test Flow:**
   - Start at Discover → browse items
   - Click "Add to Inventory" → go through 5-step flow → see confetti
   - Go to My Inventory → see new item
   - Start trade → select items → see fairness meter
   - Check Profile → see XP progress

3. **Polish:**
   - Add Confetti to trade completion
   - Add XP toast notifications
   - Ensure all navigation works

---

## Key Integration Points

### AI Server (port 3000):
```typescript
import { ai } from '../utils/api';

// Vision
const facts = await ai.visionFacts(imagesBase64, description);

// Valuation
const val = await ai.valuation(facts);

// Fairness
const fairness = await ai.unevenScore([100, 50], [120]);

// Moderation (streaming)
const response = await ai.moderateStream(message);
const reader = response.body?.getReader();
// ... handle SSE stream

// Meetup
const meetup = await ai.meetupSuggestions(locA, locB, time, prefs);
```

### Data Server (port 7002):
```typescript
import { api } from '../utils/api';

// Inventory
const inventory = await api.users.getInventory('user-1');
await api.users.addToInventory('user-1', itemData);

// Discover
const items = await api.discover.browse({ category: 'toys' });

// Trades
const draft = await api.trades.getDraft('user-1');
await api.trades.saveDraft(tradeData);
await api.trades.propose(tradeData);

// XP
await api.users.awardXP('user-1', 50, 'completed_trade');
```

---

## Success Criteria

✅ All 7 screens functional (no "Coming Soon")
✅ Discover shows items with live trade ratings
✅ Add flow: upload → AI facts → AI valuation → save → confetti + XP
✅ Inventory displays user items
✅ Trade Builder calculates fairness live
✅ Messages with safety moderation
✅ Profile shows XP/badges/quests
✅ Settings page complete
✅ Navigation works between all screens
✅ Kid-friendly design throughout

---

## Estimated Completion Time
- Discover screen: 30 min
- Inventory screen: 20 min
- Add flow: 45 min
- Trade Builder: 45 min
- Messages: 30 min
- Profile: 30 min
- Settings: 10 min
- AppContext + integration: 20 min
- **Total: ~4 hours**

All the hard work is done. You're just wiring components together!
