# Steam-Style Offer-Based Trading System

## Overview
The trading system has been updated to work like Steam's trading system - users create trade offers that are sent to the recipient for review via the Messages section.

## How It Works

### 1. **Creating a Trade Offer** (TradeBuilder)
- User navigates to `/trades` (Trading Room)
- They can view two inventories side by side:
  - **Your Inventory** (left): Items they own
  - **Their Inventory** (right): Items from the other user
- User selects items by clicking on them:
  - Items from their own inventory = what they're offering
  - Items from the other user's inventory = what they're requesting
- System calculates fairness in real-time using AI
- When both users are "ready", the **"📤 Send Trade Offer"** button appears
- User clicks button and can add an optional message
- Trade offer is sent to the recipient via Messages

### 2. **Receiving a Trade Offer** (Messages)
- Trade offers appear as special cards in the Messages section
- The **TradeOfferCard** displays:
  - Who sent the offer
  - What items are being offered by each side
  - Total value of each offer
  - Fairness rating (Great/Fair/Bad)
  - Current status badge (Proposed/Accepted/Declined/Countered)

### 3. **Responding to Trade Offers**
Recipients have three options:

#### ✓ **Accept Trade**
- Marks the trade as accepted
- Both parties can then arrange a meetup
- Status changes to "Accepted"

#### ✖️ **Decline Trade**
- Politely declines the offer
- Status changes to "Declined"
- Trade offer remains visible but inactive

#### 🔄 **Counter Offer**
- User clicks "Counter Offer"
- Navigates to Trade Builder with the original offer loaded
- They can modify the items to create a counter-offer
- Counter-offer is sent back as a new trade offer
- Original offer is marked as "Countered"

### 4. **Trade Status Flow**
```
draft → proposed → [accepted | declined | countered]
                   ↓
              completed (after meetup)
```

## Key Features

### TradeOfferCard Component
- **Visual Design**: 
  - Color-coded offer boxes (purple for what they offer, blue for what you requested)
  - Item thumbnails with values
  - Directional arrow showing trade flow
  - Fairness progress bar
  
- **Smart Context**:
  - Automatically determines if you're the sender or receiver
  - Shows appropriate actions based on trade status
  - Different views for sent vs received offers

### Messages Integration
- Trade offers appear inline with regular messages
- Full-width cards for easy viewing
- All trade details visible without leaving messages
- Actions can be taken directly from the message

### Safety Features
- Trade fairness analysis visible upfront
- Optional message to communicate intent
- Clear confirmation dialogs before accepting/declining
- All trade history preserved in messages

## Technical Implementation

### Updated Types
```typescript
export type Trade = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  offerA: TradeOffer; // from user's offer (what they're giving)
  offerB: TradeOffer; // to user's offer (what they're requesting)
  status: 'draft' | 'proposed' | 'accepted' | 'declined' | 'completed' | 'canceled' | 'countered';
  fairness: FairnessResponse;
  proposedAt?: string;
  respondedAt?: string;
  completedAt?: string;
  counterOfferTo?: string; // ID of original offer if this is a counter
  message?: string; // Optional message with the offer
};

export type Message = {
  // ... existing fields
  tradeOffer?: TradeOfferMessage; // If this is a trade offer message
};
```

### New Components
- **TradeOfferCard.tsx**: Full-featured trade offer display with actions
  - Responsive design
  - Status-aware UI
  - Integrated fairness visualization

### API Methods (Mocked, ready for backend)
```typescript
api.trades.propose(trade)     // Send trade offer
api.trades.accept(tradeId)    // Accept offer
api.trades.decline(tradeId)   // Decline offer  
api.trades.counter(tradeId, counterOffer) // Send counter-offer
```

## User Experience Flow

### Scenario: Jack wants to trade with Anderson

1. **Jack's Action**:
   - Goes to Trading Room
   - Selects his LEGO set to offer
   - Selects Anderson's Pokemon cards he wants
   - Reviews fairness (shows "Great")
   - Clicks "Send Trade Offer"
   - Adds message: "Hey! Interested in these cards!"
   - Offer sent ✅

2. **Anderson's View**:
   - Gets notification in Messages
   - Opens Messages, sees trade offer card
   - Reviews what Jack is offering vs what he's requesting
   - Sees fairness is "Great"
   - Options:
     - ✓ Accept → Trade accepted, can plan meetup
     - 🔄 Counter → Opens Trade Builder, adjusts items, sends back
     - ✖️ Decline → Politely declines

3. **If Anderson Counters**:
   - Trade Builder opens with original items pre-selected
   - Anderson adds one more item to make it fairer
   - Sends counter-offer back to Jack
   - Jack now sees the counter-offer in Messages
   - Jack can accept, decline, or counter again

4. **When Accepted**:
   - Both see "Trade Accepted!" message
   - Meetup Assistant becomes available
   - They plan their meetup
   - Complete trade in person
   - Leave ratings and earn XP

## Benefits Over Previous System

- ✅ **Asynchronous**: Don't need both users online simultaneously
- ✅ **Review Time**: Recipient can take time to consider the offer
- ✅ **Negotiation**: Back-and-forth counter-offers possible
- ✅ **Message History**: All offers preserved in conversation
- ✅ **Clear States**: Easy to see status of any offer
- ✅ **Steam-Like UX**: Familiar to millions of users
- ✅ **Less Pressure**: No instant accept/decline required

## Next Steps for Backend Implementation

When connecting to a real backend, implement these endpoints:

```
POST   /api/trades                 - Create new trade offer
GET    /api/trades/:id             - Get trade details
PUT    /api/trades/:id/accept      - Accept trade
PUT    /api/trades/:id/decline     - Decline trade  
POST   /api/trades/:id/counter     - Create counter-offer
GET    /api/trades/user/:userId    - Get user's trades
```

## Notes

- Trade offers are currently mocked but fully functional UI-wise
- All components are ready for backend integration
- Counter-offer support is built-in but needs TradeBuilder enhancements to pre-populate from existing trades
- Trade persistence in Messages needs backend support for full functionality

