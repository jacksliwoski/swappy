# Steam-Style Trading Room Guide

## Overview

The Trading Room is a Steam-inspired interface for conducting peer-to-peer item trades with fairness assessment and ready/confirm flow.

## Layout

### Desktop (3-column)
- **Left**: Your Inventory (grid)
- **Center**: Trade Room with two offer panes + event log
- **Right**: Their Inventory (grid)

### Mobile (tabs + sticky footer)
- **Inventory tabs**: Switch between "Yours" and "Theirs"
- **Offer tabs**: Switch between "Your Offer" and "Their Offer"
- **Sticky footer**: Shows totals, fairness, ready toggle, and confirm button

## Features

### 1. Item Movement
- **Click**: Add item from inventory to offer
- **Drag & Drop**: Drag items from inventory into offer panes
- **Remove**: Click × button or press Delete/Backspace on focused item
- **Duplicate prevention**: Attempting to add same item shows highlight pulse

### 2. Ready & Confirm Flow
- Each side has a "Ready to trade" toggle
- Both sides must be ready before confirm button appears
- **Any change to offers clears both ready states** (Steam-style safety)
- Yellow notice appears when readiness is cleared due to changes

### 3. Fairness Assessment
- Real-time calculation based on MID values
- **Ratings**: `great`, `fair`, `bad` (lowercase per requirements)
- Visual meter shows fairness percentage
- Balancing suggestion when trade is uneven
- Example: "Add ~$35 or 1 small item"

### 4. Event Log
- Chronological list of actions:
  - "You added: [Item Name]"
  - "They removed: [Item Name]"
  - "You are ready / not ready"
  - "Both ready — confirm available"
  - "Trade confirmed!"
- Auto-scrolls to show latest events

### 5. Keyboard Navigation
- **Enter/Space**: Add item (when focused on inventory item)
- **Delete/Backspace**: Remove item (when focused on offer item)
- **Space**: Toggle ready (when offers are not empty)
- **Enter**: Confirm trade (when both ready)
- **Tab**: Navigate through focusable elements

### 6. Accessibility
- Full keyboard operation support
- Focus indicators (3px outline)
- ARIA labels for screen readers
- Semantic HTML roles
- High contrast colors

## User Flow

1. Browse inventories (yours and theirs)
2. Click or drag items into respective offer panes
3. Monitor fairness meter and balancing suggestions
4. When satisfied, toggle "Ready to trade"
5. Wait for other side to be ready
6. Click "Confirm Trade" when both ready
7. Trade is proposed and sent to messages

## Technical Notes

### Components
- `TradeBuilder.tsx` - Main screen
- `OfferItemCard.tsx` - Compact item display for offers
- `ReadyIndicator.tsx` - User ready state visualization
- `EventLog.tsx` - Trade event history

### State Management
- Offers tracked as arrays of item IDs
- Ready states are independent booleans
- Any offer change triggers `clearReadiness()`
- Fairness calculated via AI endpoint (`ai.unevenScore`)

### Data Models
All existing types preserved:
- `InventoryItem` - Items with facts, valuation, metadata
- `FairnessResponse` - A, B, diff, fairness, warn
- `Trade` - Complete trade with offers, status, fairness
- `TradeRating` - 'great' | 'fair' | 'bad'

### Endpoints Used
- `api.users.getInventory(userId)` - Load user inventory
- `api.discover.browse()` - Load other items (mock for demo)
- `ai.unevenScore(sideA, sideB)` - Calculate fairness
- `api.trades.saveDraft()` - Auto-save draft
- `api.trades.propose()` - Finalize trade

## Demo Features

- "Toggle Their Ready" button simulates other user's ready state
- In production, this would be handled by WebSocket/real-time updates

## Design Tokens

- **Your side**: Teal colors (`--color-teal`, `--color-teal-light`, `--color-teal-dark`)
- **Their side**: Lilac colors (`--color-lilac`, `--color-lilac-light`, `--color-lilac-dark`)
- **Success**: Green (`--color-success`)
- **Warning**: Yellow/Amber (`--color-warning`)
- **Error**: Red (`--color-error`)

## Responsive Breakpoint

- **Desktop**: > 1024px (3-column layout)
- **Mobile**: ≤ 1024px (tabs + sticky footer)

