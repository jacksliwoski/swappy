# Trading Room Layout Guide

## Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🔄 Trading Room                                     │
│     ⌨️ Keyboard: Click or Enter to add • Delete to remove • Space to       │
│                  toggle ready • Enter to confirm                             │
├────────────────┬──────────────────────────────────┬────────────────────────┤
│                │                                  │                         │
│  Your          │  ┌─────────────────────────────┐│  Their                 │
│  Inventory     │  │ TRADE EVENTS LOG            ││  Inventory             │
│  (Teal)        │  │ • You added: LEGO Set       ││  (Lilac)               │
│                │  │ • They added: Switch Game   ││                        │
│  ┌──────────┐  │  │ • You are ready            ││  ┌──────────┐          │
│  │   📦     │  │  └─────────────────────────────┘│  │   🎮     │          │
│  │ Item 1   │  │                                  │  │ Item A   │          │
│  │ $50      │  │  ┌─────────────────────────────┐│  │ $45      │          │
│  └──────────┘  │  │ 👤 You         ✓ Ready      ││  └──────────┘          │
│                │  ├─────────────────────────────┤│                        │
│  ┌──────────┐  │  │ YOUR OFFER                  ││  ┌──────────┐          │
│  │   🎲     │  │  │ ┌───────────────────────┐   ││  │   🧸     │          │
│  │ Item 2   │  │  │ │ 📦 LEGO Set  [game] $50│×│││  │ Item B   │          │
│  │ $30      │  │  │ └───────────────────────┘   ││  │ $60      │          │
│  └──────────┘  │  │ ┌───────────────────────┐   ││  └──────────┘          │
│                │  │ │ 🎲 Board Game [ln] $30 │×│││                        │
│  ┌──────────┐  │  │ └───────────────────────┘   ││  ┌──────────┐          │
│  │   📚     │  │  │                             ││  │   🎸     │          │
│  │ Item 3   │  │  │ Drop items here...          ││  │ Item C   │          │
│  │ $25      │  │  └─────────────────────────────┘│  │ $55      │          │
│  └──────────┘  │                                  │  └──────────┘          │
│                │  ┌─────────────────────────────┐│                        │
│  [Scrollable]  │  │ 👤 TradingBuddy  ✓ Ready   ││  [Scrollable]          │
│                │  ├─────────────────────────────┤│                        │
│  ┌──────────┐  │  │ THEIR OFFER                 ││  ┌──────────┐          │
│  │   🎯     │  │  │ ┌───────────────────────┐   ││  │   🔧     │          │
│  │ Item 4   │  │  │ │ 🎮 Switch Game  $45   │×│││  │ Item D   │          │
│  │ $40      │  │  │ └───────────────────────┘   ││  │ $70      │          │
│  └──────────┘  │  │ ┌───────────────────────┐   ││  └──────────┘          │
│                │  │ │ 🧸 Plushie [good] $35 │×│││                        │
│     ...        │  │ └───────────────────────┘   ││      ...               │
│                │  │                             ││                        │
│                │  │ Drop items here...          ││                        │
│                │  └─────────────────────────────┘│                        │
│                │                                  │                        │
│                │  ┌─────────────────────────────┐│                        │
│                │  │  You: $80    [fair]  Them: $80│                       │
│                │  │  ████████░░░ 85%            ││                        │
│                │  │  💡 Trade looks balanced!   ││                        │
│                │  └─────────────────────────────┘│                        │
│                │                                  │                        │
│                │  [ ✓ Ready to Trade ]            │                        │
│                │                                  │                        │
│                │  [Demo: Toggle Their Ready]      │                        │
│                │                                  │                        │
│                │  ┌─────────────────────────────┐│                        │
│                │  │   🎉 Confirm Trade          ││                        │
│                │  └─────────────────────────────┘│                        │
│                │       (pulsing green)            │                        │
└────────────────┴──────────────────────────────────┴────────────────────────┘
```

## Mobile Layout (≤ 1024px)

```
┌─────────────────────────────────────┐
│       🔄 Trading Room               │
│    ⌨️ Keyboard shortcuts...         │
├─────────────────────────────────────┤
│                                     │
│  [Your Inventory] [Their Inventory] │
│   (active tab)                      │
│                                     │
│  ┌────────┐  ┌────────┐            │
│  │  📦    │  │  🎲    │            │
│  │ Item 1 │  │ Item 2 │            │
│  │  $50   │  │  $30   │            │
│  └────────┘  └────────┘            │
│                                     │
│  ┌────────┐  ┌────────┐            │
│  │  📚    │  │  🎯    │            │
│  │ Item 3 │  │ Item 4 │            │
│  │  $25   │  │  $40   │            │
│  └────────┘  └────────┘            │
│                                     │
│  [Scrollable grid]                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Your Offer (2)] [Their Offer (2)] │
│    (active tab)                     │
│                                     │
│  👤 You            ✓ Ready          │
│  ┌─────────────────────────────┐   │
│  │ 📦 LEGO Set    [game]  $50 │×│  │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🎲 Board Game   [ln]  $30  │×│  │
│  └─────────────────────────────┘   │
│                                     │
│  [Scrollable list]                  │
│                                     │
├─────────────────────────────────────┤
│  TRADE EVENTS LOG                   │
│  • You added: LEGO Set              │
│  • They added: Switch Game          │
│  • Both ready — confirm available   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  STICKY FOOTER (fixed at bottom)    │
├─────────────────────────────────────┤
│  You: $80     [fair]     Them: $80  │
│  💡 Trade looks balanced!           │
│                                     │
│  [ ✓ Ready ]  [ 🎉 Confirm Trade ] │
└─────────────────────────────────────┘
```

## Key Interactions

### Adding Items
```
Inventory Item → [Click/Drag/Enter] → Offer Pane
```

### Removing Items
```
Offer Item → [× Button/Delete Key] → Back to Available
```

### Ready Flow
```
1. Add items to both offers
   ↓
2. Toggle "Ready to Trade"
   ↓
3. Wait for other side
   ↓
4. Both ready → Confirm button appears
   ↓
5. Click "Confirm Trade"
   ↓
6. Confetti + Redirect
```

### Safety Reset
```
[Both Ready] → [Any Offer Change] → [Both Not Ready]
                                      ↓
                           Yellow notice appears
```

## Color Coding

- **Teal** = Your side (inventory, offer, totals)
- **Lilac** = Their side (inventory, offer, totals)
- **Green** = Ready state, success, "great" rating
- **Yellow/Amber** = Warnings, "fair" rating
- **Red** = "bad" rating, errors
- **Gray** = Not ready state, neutral

## Visual States

### Item States
- Normal: White background, subtle shadow
- Selected: Border in side color (teal/lilac)
- Dragging: Reduced opacity, grabbing cursor
- Focused: 3px outline in primary color

### Ready States
- Not Ready: Gray background, gray text
- Ready: Green background, white text, ✓ icon

### Offer Panes
- Empty: Placeholder text
- Dragging Over: Dashed border in side color
- Has Items: List of compact item cards

### Confirm Button
- Hidden: When not both ready
- Visible + Pulsing: When both ready (green glow animation)

