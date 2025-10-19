# 🎯 Bounty System - Quick Reference Card

## 🎮 Treasure Hunt vs Lost & Found Quick Comparison

| Feature | Lost Item | Treasure Hunt |
|---------|-----------|---------------|
| **Purpose** | Recover lost property | Community game/event |
| **Intent** | Accidental loss | Intentional hiding |
| **Info Provided** | Last seen location | Hunt area + clues |
| **Competition** | First verified return | Race to find (first wins) |
| **Time Limit** | 30 days | 1 hour - 7 days |
| **Visibility** | Private/local | Public event |
| **Verification** | AI + owner review | Location + photo proof |
| **Social Aspect** | Personal | Community/viral |
| **Use Cases** | Lost phone, wallet, keys | Money drops, scavenger hunts |

---

## 📋 Implementation Checklist

### Phase 1: Core Infrastructure (Backend)
```
□ Create data models
  □ visa-server/data/bounties.json
  □ visa-server/data/claims.json
  □ visa-server/data/bountyHunters.json

□ Create API routes
  □ visa-server/src/routes/bounties.js
  □ Register in visa-server/src/index.js

□ Extend existing models
  □ users.json: Add bountyHunter profile
  □ inventory.json: Add reservation status

□ Create Visa integration stubs
  □ visa-server/src/visa/visaDirect.js
  □ visa-server/src/visa/paymentValidation.js
  □ visa-server/src/visa/tokenService.js
```

### Phase 2: Frontend Components
```
□ Main screens
  □ web/src/screens/LostAndFound.tsx (✅ exists, needs real UI)
  □ web/src/screens/CreateBounty.tsx
  □ web/src/screens/BountyDetail.tsx
  □ web/src/screens/MyBounties.tsx

□ Reusable components
  □ web/src/components/bounty/BountyCard.tsx
  □ web/src/components/bounty/BountyFilters.tsx
  □ web/src/components/bounty/RewardSelector.tsx
  □ web/src/components/bounty/ClaimForm.tsx
  □ web/src/components/bounty/VerificationModal.tsx
  □ web/src/components/bounty/BountyHunterBadge.tsx
  
□ Treasure Hunt components (NEW)
  □ web/src/components/bounty/TreasureHuntCard.tsx
  □ web/src/components/bounty/ClueDisplay.tsx
  □ web/src/components/bounty/HuntLiveFeed.tsx
  □ web/src/components/bounty/HuntersList.tsx
  □ web/src/components/bounty/CreateTreasureHunt.tsx

□ Update existing components
  □ web/src/App.tsx: Add bounty routes
  □ web/src/components/trade/TradeOfferCard.tsx: Support bounty messages
  □ web/src/screens/Messages.tsx: Handle bounty claim messages
  □ web/src/screens/GuardianDashboard.tsx: Add bounty alerts
```

### Phase 3: API Client (Frontend)
```
□ web/src/utils/api.ts
  □ api.bounties.create()
  □ api.bounties.list()
  □ api.bounties.get()
  □ api.bounties.update()
  □ api.bounties.delete()
  □ api.bounties.claim()
  □ api.bounties.verify()
  □ api.bounties.reject()
  □ api.bountyHunters.getProfile()
  □ api.bountyHunters.getLeaderboard()
```

### Phase 4: AI Integration
```
□ src/features/bountyVerification.ts (AI Server)
  □ Image matching with Gemini Vision
  □ Confidence scoring
  □ Auto-verification logic

□ Update moderation
  □ Extend safety checks for bounty coordination
```

### Phase 5: Visa API Integration
```
□ Visa Direct
  □ Account setup & credentials
  □ Test mode implementation
  □ Production payout flow
  □ Error handling

□ Payment Account Validation
  □ Card validation flow
  □ Token storage
  □ Expiration handling

□ Visa Token Service
  □ Identity verification
  □ Risk scoring
  □ 3D Secure integration
```

### Phase 6: Testing & Polish
```
□ Unit tests
  □ API endpoints
  □ Data models
  □ Payment validation

□ Integration tests
  □ Full bounty lifecycle
  □ Payment flow
  □ Inventory transfer

□ UI/UX polish
  □ Loading states
  □ Error messages
  □ Success animations
  □ Mobile responsive
```

---

## 🔌 Complete API Reference

### Bounties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bounties` | ✅ | Create new bounty |
| `GET` | `/api/bounties` | ✅ | List all active bounties |
| `GET` | `/api/bounties/:id` | ✅ | Get bounty details |
| `PATCH` | `/api/bounties/:id` | ✅ | Update bounty (owner only) |
| `DELETE` | `/api/bounties/:id` | ✅ | Cancel bounty (owner only) |
| `GET` | `/api/bounties/my` | ✅ | Get user's posted bounties |
| `POST` | `/api/bounties/:id/claim` | ✅ | Submit claim |
| `POST` | `/api/bounties/:id/verify` | ✅ | Verify return (owner only) |
| `POST` | `/api/bounties/:id/reject` | ✅ | Reject claim (owner only) |

### Claims

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/claims/:id` | ✅ | Get claim details |
| `GET` | `/api/claims/my` | ✅ | Get user's claims |
| `POST` | `/api/claims/:id/message` | ✅ | Send message about claim |
| `POST` | `/api/claims/:id/dispute` | ✅ | Open dispute |

### Bounty Hunters

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/bounty-hunters/:userId` | ✅ | Get hunter profile |
| `GET` | `/api/bounty-hunters/leaderboard` | ✅ | Get top hunters |
| `POST` | `/api/bounty-hunters/claim-badge` | ✅ | Claim earned badge |
| `GET` | `/api/bounty-hunters/perks` | ✅ | Get active perks |

### Payments (Visa Integration)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/validate` | ✅ | Validate payment method |
| `POST` | `/api/payments/payout` | ✅ | Process Visa Direct payout |
| `GET` | `/api/payments/transaction/:id` | ✅ | Get transaction status |

### AI Verification

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/verify-claim` | ✅ | AI image matching |
| `POST` | `/ai/fraud-check` | ✅ | Fraud detection |

---

## 📦 Request/Response Examples

### Create Bounty (Monetary)

**Request:**
```javascript
POST /api/bounties
Authorization: Bearer <token>
Content-Type: application/json

{
  "lostItem": {
    "title": "iPhone 14 Pro - Black",
    "description": "Lost at Central Park near fountain",
    "category": "electronics",
    "images": ["data:image/jpeg;base64,..."],
    "lastSeenLocation": {
      "address": "Central Park, NYC",
      "coordinates": { "lat": 40.785091, "lng": -73.968285 }
    },
    "lastSeenDate": "2025-10-18T15:30:00Z",
    "identifyingFeatures": ["Blue case", "Cracked screen"]
  },
  "rewardType": "monetary",
  "monetaryReward": {
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": {
      "cardNumber": "4111111111111111",
      "cvv": "123",
      "expiry": "12/26"
    }
  }
}
```

**Response:**
```javascript
{
  "ok": true,
  "bounty": {
    "id": "bounty_abc123",
    "status": "active",
    "createdAt": "2025-10-19T10:00:00Z",
    "expiresAt": "2025-11-19T10:00:00Z",
    // ... full bounty object
  }
}
```

### Create Bounty (Inventory Trade)

**Request:**
```javascript
POST /api/bounties

{
  "lostItem": { /* same as above */ },
  "rewardType": "inventory",
  "inventoryReward": {
    "offeredItems": ["item_789", "item_456"],
    "finderCanChoose": true,
    "maxItems": 1
  }
}
```

### Submit Claim

**Request:**
```javascript
POST /api/bounties/bounty_abc123/claim

{
  "proofOfPossession": {
    "images": ["data:image/jpeg;base64,..."],
    "description": "Found near the fountain",
    "location": "Central Park Fountain Area",
    "foundDate": "2025-10-19T12:00:00Z"
  },
  "selectedRewardItems": ["item_789"] // For inventory trades
}
```

**Response:**
```javascript
{
  "ok": true,
  "claim": {
    "id": "claim_xyz789",
    "bountyId": "bounty_abc123",
    "status": "submitted",
    "verificationScore": 0.94,
    "autoVerified": true,
    "message": "High confidence match! Owner notified."
  }
}
```

### Verify Claim (Owner)

**Request:**
```javascript
POST /api/bounties/bounty_abc123/verify

{
  "claimId": "claim_xyz789",
  "confirmed": true,
  "rating": 5,
  "review": "Found it super fast!"
}
```

**Response:**
```javascript
{
  "ok": true,
  "payout": {
    "status": "completed",
    "transactionId": "VD_12345",
    "amount": 50.00,
    "timestamp": "2025-10-19T16:16:32Z"
  },
  "xpAwarded": 500,
  "badgeProgress": {
    "current": 3,
    "next": "bronze",
    "remaining": 2
  }
}
```

---

## 🎨 Component Props

### BountyCard
```typescript
interface BountyCardProps {
  bounty: Bounty;
  onClick?: () => void;
  showDistance?: boolean;
  currentLocation?: { lat: number; lng: number };
}
```

### RewardSelector
```typescript
interface RewardSelectorProps {
  mode: 'monetary' | 'inventory';
  onModeChange: (mode: 'monetary' | 'inventory') => void;
  
  // Monetary
  amount?: number;
  onAmountChange?: (amount: number) => void;
  paymentValidated?: boolean;
  
  // Inventory
  selectedItems?: InventoryItem[];
  onItemsChange?: (items: InventoryItem[]) => void;
  availableItems?: InventoryItem[];
}
```

### ClaimForm
```typescript
interface ClaimFormProps {
  bounty: Bounty;
  onSubmit: (claim: ClaimSubmission) => Promise<void>;
  onCancel: () => void;
}

interface ClaimSubmission {
  proofImages: string[]; // base64
  description: string;
  foundLocation: string;
  foundDate: Date;
  selectedRewardItems?: string[]; // For inventory trades
}
```

---

## 🔐 Environment Variables

Add to `.env` files:

```bash
# Visa API Credentials
VISA_USER_ID=your_user_id
VISA_PASSWORD=your_password
VISA_CERT_PATH=./certs/visa_cert.pem
VISA_KEY_PATH=./certs/visa_key.pem

# Visa Direct
VISA_DIRECT_BASE_URL=https://sandbox.api.visa.com
PLATFORM_ACCOUNT_NUMBER=4111111111111111

# Payment Account Validation
VISA_PAV_BASE_URL=https://sandbox.api.visa.com

# Visa Token Service
VISA_VTS_BASE_URL=https://sandbox.api.visa.com
VISA_VTS_API_KEY=your_vts_api_key

# Bounty Settings
BOUNTY_MAX_MONETARY=500
BOUNTY_MIN_MONETARY=5
BOUNTY_EXPIRATION_DAYS=30
BOUNTY_EARLY_ACCESS_THRESHOLD=100
```

---

## 🎮 Badge System Reference

| Badge | Icon | Requirement | XP Multiplier | Early Access | Other Perks |
|-------|------|-------------|---------------|--------------|-------------|
| None | - | 0 returns | 1.0x | - | - |
| Bronze | 🥉 | 5 returns | 1.2x | - | Profile flair |
| Silver | 🥈 | 15 returns | 1.5x | 12 hours | Profile flair |
| Gold | 🥇 | 30 returns, 85%+ success | 2.0x | 24 hours | Priority verification, flair |
| Elite | ⭐ | 50 returns, 90%+ success, 4.5★ | 2.5x | 48 hours | All perks + custom banner |

---

## 📊 Key Thresholds & Limits

### Lost Item Bounties

| Setting | Value | Reason |
|---------|-------|--------|
| Min monetary bounty | $5 | Prevent spam |
| Max monetary bounty | $500 | Fraud prevention |
| Bounty expiration | 30 days | Keep listings fresh |
| Max images per bounty | 5 | Storage limits |
| Max claims per bounty | 10 | Prevent abuse |
| Claim dispute window | 48 hours | Fair resolution time |
| High-value threshold | $100 | Extra verification needed |
| Early access threshold | $100 | Badge perk trigger |
| AI auto-verify score | 0.90+ | High confidence only |
| AI review needed score | 0.70-0.89 | Owner decides |
| AI reject score | <0.70 | Likely not a match |
| Minor bounty limit | $50 | Guardian oversight |
| Guardian approval required | $50+ | Protect minors |
| XP per successful return | 500 | Base reward |
| First return bonus | +1000 XP | Encourage participation |

### Treasure Hunts (NEW)

| Setting | Value | Reason |
|---------|-------|--------|
| Min monetary prize | $5 | Prevent spam |
| Max monetary prize | $200 | Safety/crowd control |
| Min hunt duration | 1 hour | Minimum engagement |
| Max hunt duration | 7 days | Keep it active |
| Min clues required | 2 | Must have hints |
| Max clues allowed | 5 | Too many = confusing |
| Max hunt radius | 5 miles | Searchable area |
| Max active hunters | 100 | Server load |
| Clue unlock interval | 30 mins - 4 hours | Progressive difficulty |
| Hunt start delay | 15 mins - 7 days | Scheduling window |
| Minor hunt prize limit | $25 | Guardian oversight |
| Minor hunt radius | 2 miles | Safety restriction |
| XP per treasure found | 750 | Higher than regular bounty |
| XP speed bonus (<1hr) | +250 XP | Reward quick finders |
| Creator XP | 500 | Reward hunt creators |
| Popular hunt bonus (20+ hunters) | +500 XP | Viral reward |

---

## 🛠️ Development Commands

```bash
# Start all servers
npm run dev

# Start individual servers
cd visa-server && npm start      # Backend (port 7002)
cd web && npm run dev            # Frontend (port 5173)
npm start                        # AI Server (port 3000)

# Test Visa integration (sandbox)
curl -X POST http://localhost:7002/api/payments/validate \
  -H "Authorization: Bearer <token>" \
  -d '{"cardNumber": "4111111111111111", "cvv": "123", "expiry": "12/26"}'

# Check bounty data
cat visa-server/data/bounties.json | jq '.bounties | length'

# Watch logs
tail -f visa-server/logs/bounties.log
```

---

## 🐛 Common Issues & Solutions

### Issue: "Payment validation failed"
```
Solution:
1. Check Visa API credentials in .env
2. Verify sandbox vs production URLs
3. Test card: 4111111111111111
4. Check certificate paths
```

### Issue: "AI verification returns low score"
```
Solution:
1. Ensure images are high quality
2. Check lighting/angle similarity
3. Add more identifying features to bounty
4. Owner can still manually verify
```

### Issue: "Inventory items not reserving"
```
Solution:
1. Check item status in inventory.json
2. Verify item belongs to user
3. Ensure item not already in trade/bounty
4. Check reservation logic in backend
```

### Issue: "Guardian alerts not showing"
```
Solution:
1. Verify user.childUserId is set
2. Check guardian.isGuardian flag
3. Ensure alert created in guardian route
4. Refresh guardian dashboard
```

---

## 📈 Analytics to Track

```javascript
const BOUNTY_METRICS = {
  // Volume
  totalBountiesPosted: 'Counter',
  activeBounties: 'Gauge',
  completedBounties: 'Counter',
  
  // Success
  averageTimeToCompletion: 'Duration (hours)',
  claimSuccessRate: 'Percentage',
  aiVerificationAccuracy: 'Percentage',
  
  // Financial
  totalMonetaryValue: 'Sum (USD)',
  totalPayouts: 'Sum (USD)',
  averageBountyAmount: 'Average (USD)',
  
  // Engagement
  uniqueClaimers: 'Count',
  viewsPerBounty: 'Average',
  claimsPerBounty: 'Average',
  
  // Quality
  disputeRate: 'Percentage',
  averageRating: 'Stars (1-5)',
  repeatHunterRate: 'Percentage'
};
```

---

## 🚀 Go-Live Checklist

```
Pre-Launch:
□ Visa API production credentials obtained
□ Payment processing tested
□ All data models validated
□ AI verification accuracy >90%
□ Guardian oversight functional
□ Mobile responsive
□ Accessibility audit passed
□ Legal terms updated
□ Privacy policy updated
□ Support documentation ready

Launch Day:
□ Monitor server resources
□ Watch error rates
□ Track first bounty posted
□ Track first successful return
□ Support team ready
□ Social media announcement

Post-Launch (Week 1):
□ Daily metrics review
□ User feedback collection
□ Bug fixes prioritization
□ Performance optimization
□ Feature tweaks based on usage
```

---

## 📞 Support Resources

- **Visa Developer Portal**: https://developer.visa.com
- **Gemini API Docs**: https://ai.google.dev
- **Project Issues**: See GitHub issues or CODEBASE_FIXES.md
- **Architecture**: See LOST_AND_FOUND_ARCHITECTURE.md
- **Data Flows**: See BOUNTY_SYSTEM_FLOWS.md

---

**Last Updated**: October 19, 2025
**Status**: Design Complete, Ready for Implementation
**Estimated Dev Time**: 6-7 weeks (7 phases)

