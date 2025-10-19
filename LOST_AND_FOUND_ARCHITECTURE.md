# 🔍 Lost & Found Bounty System - Architecture Design

## Overview
A **triple-mode bounty system** allowing users to:
1. **Lost & Found**: Offer monetary/inventory rewards to recover lost items
2. **Treasure Hunts**: Create gamified scavenger hunts with prizes (intentionally hidden items)
3. **Money Drops**: Viral social events where users hide cash/prizes with clues for the community

Both traditional bounties (lost items) and treasure hunts use either **monetary rewards** (via Visa Direct) or **inventory item trades**.

---

## 🏗️ System Architecture

### **Current Swappy Stack:**
```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  Location: web/                         │
│  Port: 5173                             │
└─────────────────────────────────────────┘
           ↓ API Calls
┌─────────────────────────────────────────┐
│  Backend (Express + Node.js)            │
│  Location: visa-server/                 │
│  Port: 7002                             │
│  Database: File-based JSON (data/)      │
└─────────────────────────────────────────┘
           ↓ AI Features
┌─────────────────────────────────────────┐
│  AI Server (Express + Gemini)           │
│  Location: src/                         │
│  Port: 3000                             │
└─────────────────────────────────────────┘
```

### **New Components for Bounty System:**
```
┌─────────────────────────────────────────┐
│  FRONTEND ADDITIONS                     │
├─────────────────────────────────────────┤
│  web/src/screens/                       │
│    └─ LostAndFound.tsx (✅ exists)      │
│    └─ CreateBounty.tsx (NEW)            │
│    └─ BountyDetail.tsx (NEW)            │
│    └─ MyBounties.tsx (NEW)              │
│    └─ ClaimBounty.tsx (NEW)             │
│                                         │
│  web/src/components/bounty/             │
│    └─ BountyCard.tsx (NEW)              │
│    └─ BountyFilters.tsx (NEW)           │
│    └─ RewardSelector.tsx (NEW)          │
│    └─ ClaimForm.tsx (NEW)               │
│    └─ VerificationModal.tsx (NEW)       │
│    └─ BountyHunterBadge.tsx (NEW)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BACKEND ADDITIONS                      │
├─────────────────────────────────────────┤
│  visa-server/src/routes/                │
│    └─ bounties.js (NEW)                 │
│                                         │
│  visa-server/src/visa/                  │
│    └─ visaDirect.js (NEW)               │
│    └─ paymentValidation.js (NEW)        │
│    └─ tokenService.js (NEW)             │
│                                         │
│  visa-server/data/                      │
│    └─ bounties.json (NEW)               │
│    └─ claims.json (NEW)                 │
│    └─ bountyHunters.json (NEW)          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  VISA API INTEGRATIONS                  │
├─────────────────────────────────────────┤
│  ✅ Visa Direct API                     │
│     - Instant cash payouts              │
│  ✅ Payment Account Validation          │
│     - Verify payment methods            │
│  ✅ Visa Token Service                  │
│     - Secure identity verification      │
└─────────────────────────────────────────┘
```

---

## 📊 Data Models

### **1. Bounty Model** (`visa-server/data/bounties.json`)
```javascript
{
  "bounties": [
    {
      "id": "bounty_123456",
      "userId": "u_demo_1",
      "status": "active" | "claimed" | "in_verification" | "completed" | "expired" | "cancelled",
      
      // Bounty Type
      "bountyType": "lost_item" | "treasure_hunt",
      
      // Lost Item Details (for bountyType: "lost_item")
      "lostItem": {
        "title": "iPhone 14 Pro - Black",
        "description": "Lost at Central Park near the fountain",
        "category": "electronics",
        "images": ["base64..."],
        "lastSeenLocation": {
          "address": "Central Park, NYC",
          "coordinates": { "lat": 40.785091, "lng": -73.968285 }
        },
        "lastSeenDate": "2025-10-18T15:30:00Z",
        "identifyingFeatures": ["Blue phone case", "Cracked screen protector"]
      },
      
      // Treasure Hunt Details (for bountyType: "treasure_hunt")
      "treasureHunt": {
        "title": "🎮 Epic GameBoy Money Drop!",
        "description": "I've hidden a rare GameBoy with $25 cash inside! First to find it wins!",
        "category": "gaming",
        "prizeImages": ["base64..."], // Images of the prize
        "huntArea": {
          "address": "Downtown Seattle",
          "coordinates": { "lat": 47.6062, "lng": -122.3321 },
          "radiusMiles": 0.5 // Search area
        },
        "clues": [
          {
            "id": "clue_1",
            "text": "Near the place where tech giants were born 🏢",
            "unlockAt": "immediate", // Available immediately
            "revealedAt": "2025-10-19T10:00:00Z"
          },
          {
            "id": "clue_2",
            "text": "Look for the red bench facing the waterfront 🌊",
            "unlockAt": "2025-10-19T12:00:00Z", // Unlocks after 2 hours
            "revealedAt": null
          },
          {
            "id": "clue_3",
            "text": "Behind the 3rd trash can from the coffee shop ☕",
            "unlockAt": "2025-10-19T14:00:00Z", // Progressive hints
            "revealedAt": null
          }
        ],
        "startTime": "2025-10-19T10:00:00Z", // When hunt begins
        "endTime": "2025-10-19T18:00:00Z", // Time limit
        "difficulty": "medium", // easy | medium | hard
        "isPublicEvent": true, // Show on leaderboard/feed
        "maxHunters": 50, // Optional limit
        "huntRules": [
          "Must post photo with item to claim",
          "Public property only",
          "Be respectful of the area"
        ]
      },
      
      // Reward Type & Details
      "rewardType": "monetary" | "inventory",
      
      // If monetary:
      "monetaryReward": {
        "amount": 50.00,
        "currency": "USD",
        "paymentValidated": true,
        "validationToken": "visa_token_abc123"
      },
      
      // If inventory trade:
      "inventoryReward": {
        "offeredItems": [
          {
            "itemId": "item_789",
            "title": "Limited Edition Sneakers",
            "images": ["base64..."],
            "valuation": { "mid": 75 }
          }
        ],
        "totalValue": 75.00,
        "finderCanChoose": true, // Can pick multiple items up to value
        "maxItems": 2
      },
      
      // Bounty Hunter Badges Offered
      "xpReward": 500,
      "badgeEligible": true,
      
      // Treasure Hunt Specific Stats (if bountyType: "treasure_hunt")
      "treasureStats": {
        "activeHunters": 23, // Currently searching
        "totalAttempts": 45,
        "avgTimeToFind": null, // Calculated after completion
        "socialShares": 12,
        "leaderboardRank": 5 // Among active hunts
      },
      
      // Metadata
      "createdAt": "2025-10-19T10:00:00Z",
      "expiresAt": "2025-11-19T10:00:00Z",
      "viewCount": 142,
      "claimCount": 3
    }
  ]
}
```

### **2. Claim Model** (`visa-server/data/claims.json`)
```javascript
{
  "claims": [
    {
      "id": "claim_456789",
      "bountyId": "bounty_123456",
      "claimerId": "u_demo_2",
      "status": "submitted" | "under_review" | "verified" | "rejected" | "completed",
      
      // Claim Details
      "proofOfPossession": {
        "images": ["base64..."],
        "description": "Found near the fountain, matches description",
        "location": "Central Park Fountain Area",
        "foundDate": "2025-10-19T12:00:00Z"
      },
      
      // Verification
      "verificationMethod": "photo_match" | "serial_number" | "owner_confirmation",
      "verificationScore": 0.95, // AI confidence score
      "ownerConfirmed": false,
      
      // For inventory trades, selected items
      "selectedRewardItems": ["item_789"],
      
      // Communication
      "messages": [
        {
          "from": "u_demo_2",
          "to": "u_demo_1",
          "text": "I found your phone!",
          "timestamp": "2025-10-19T12:05:00Z"
        }
      ],
      
      // Meetup coordination (uses existing meetup detection)
      "meetupProposed": false,
      "meetupDetails": null,
      
      "createdAt": "2025-10-19T12:00:00Z",
      "completedAt": null
    }
  ]
}
```

### **3. Bounty Hunter Profile** (`visa-server/data/bountyHunters.json`)
```javascript
{
  "hunters": [
    {
      "userId": "u_demo_2",
      
      // Stats
      "stats": {
        "totalClaims": 15,
        "successfulReturns": 12,
        "successRate": 0.80,
        "totalEarnings": 450.00, // Monetary rewards
        "totalTradeValue": 850.00, // Inventory trades
        "xpEarned": 6000
      },
      
      // Badges
      "badges": [
        {
          "id": "bounty_hunter_bronze",
          "name": "Bronze Hunter",
          "description": "5 successful returns",
          "icon": "🥉",
          "earnedAt": "2025-09-01T00:00:00Z"
        },
        {
          "id": "bounty_hunter_silver",
          "name": "Silver Hunter",
          "icon": "🥈",
          "earnedAt": "2025-10-01T00:00:00Z"
        }
      ],
      
      // Perks
      "perks": {
        "xpMultiplier": 2.0,
        "earlyAccessHours": 24, // See high-value bounties 24h early
        "priorityVerification": true,
        "profileFlair": "⭐ Elite Hunter"
      },
      
      // Reputation
      "rating": 4.8,
      "reviews": [
        {
          "from": "u_demo_1",
          "rating": 5,
          "comment": "Found my phone super fast!",
          "timestamp": "2025-10-19T14:00:00Z"
        }
      ],
      
      "joinedAt": "2025-08-01T00:00:00Z"
    }
  ]
}
```

---

## 🎮 Treasure Hunt System

### **What is a Treasure Hunt?**
A **treasure hunt** (aka "money drop" or "scavenger hunt") is a gamified bounty where a user **intentionally hides** an item or prize with clues for others to find. It's the opposite of a lost item - it's meant to be found!

### **Key Differences from Lost & Found**

| Feature | Lost Item | Treasure Hunt |
|---------|-----------|---------------|
| Intent | Accidental loss | Intentional hiding |
| Location Info | Last seen location | Hunt area + clues |
| Competition | First verified claim | Race to find first |
| Time Limit | 30 days default | Set by creator (1hr - 7 days) |
| Social | Private recovery | Public event |
| Verification | Item matching | Photo proof at location |
| Clues | N/A | Progressive hints |

### **Treasure Hunt Modes**

#### **1. Classic Treasure Hunt** 🗺️
- Creator hides physical item with prize
- Provides cryptic clues
- First finder claims reward
- Great for local communities

**Example**: Hide a lunchbox with $20 at a park, post clues like "Where children play and swings sway"

#### **2. Money Drop** 💸
- Viral social media style
- Creator announces hiding cash/prize
- Time-limited event
- Can attract large crowds
- Real-time updates

**Example**: "I've hidden $100 in downtown! First clue drops in 10 mins! 🏃"

#### **3. Multi-Stage Hunt** 🎯
- Complex hunts with multiple locations
- Each find unlocks next clue
- Higher rewards for completion
- Advanced difficulty

**Example**: Geocaching-style adventure with 5 checkpoints

#### **4. Virtual Treasure Hunt** 📱
- No physical hiding required
- QR codes or location check-ins
- Inventory items as prizes
- Safer for younger users

**Example**: "Check in at these 3 locations in Seattle to win rare trading cards!"

### **Progressive Clue System**

Clues unlock over time to keep hunts fair and exciting:

```javascript
// Clue unlock strategies:

1. IMMEDIATE: All clues visible from start
   - Best for short hunts (1-2 hours)
   - More competitive

2. TIME-BASED: Clues unlock on schedule
   - Clue 1: Start time
   - Clue 2: +2 hours
   - Clue 3: +4 hours
   - Makes hunts last longer

3. ATTEMPT-BASED: New clues after failed claims
   - After 10 attempts, reveal Clue 2
   - After 25 attempts, reveal Clue 3
   - Helps if hunt is too hard

4. HYBRID: Combination of above
   - Most engaging option
```

### **Safety & Moderation for Treasure Hunts**

#### **Location Rules**
- ✅ Public parks, plazas, landmarks
- ✅ Business districts (daytime only)
- ✅ Community centers
- ❌ Private property
- ❌ Dangerous areas (roads, construction)
- ❌ Restricted zones

#### **Guardian Oversight**
- Minors can participate in hunts
- Guardian notified of treasure hunt activity
- Must approve hunts created by child
- Location radius restrictions (e.g., 5 miles from home)
- Time window restrictions (daylight hours only)

#### **Platform Moderation**
- AI scans clues for inappropriate content
- Location validation (must be public)
- Report system for unsafe hunts
- Creator reputation score
- Require prize photo before going live

### **Treasure Hunt XP & Badges**

#### **Creator Rewards**
```javascript
const TREASURE_CREATOR_XP = {
  createHunt: 100,
  huntCompleted: 500,
  popularHunt_50_views: 250,
  popularHunt_100_views: 500,
  viralHunt_500_views: 1000,
  perfectClues_under2hours: 750, // Found quickly, clues were good
  communityEvent: 1000, // 20+ participants
};
```

**New Badge**: 🎪 **Treasure Master**
- Create 10 successful hunts
- Average rating 4.5+
- Profile shows "Event Creator" status
- Can host premium hunts

#### **Hunter Rewards**
```javascript
const TREASURE_HUNTER_XP = {
  joinHunt: 25,
  findTreasure: 750, // More than regular bounty
  firstFind_speedBonus: 250,
  hardHunt_bonus: 500,
  participationAward: 50, // Even if you don't win
};
```

**New Badge**: 🏆 **Speed Runner**
- Find 5 treasures in under 1 hour each
- Profile shows fastest find time
- Leaderboard priority

### **Social & Viral Features**

#### **Live Hunt Feed**
```javascript
{
  "huntFeed": [
    {
      "event": "hunt_started",
      "huntId": "bounty_123",
      "creator": "jack",
      "prize": "$25 + GameBoy",
      "location": "Downtown Seattle",
      "timestamp": "2 mins ago"
    },
    {
      "event": "clue_unlocked",
      "huntId": "bounty_123",
      "clueNumber": 2,
      "timestamp": "30 secs ago"
    },
    {
      "event": "hunter_active",
      "huntId": "bounty_123",
      "hunterCount": 15,
      "message": "15 hunters searching right now! 🔥"
    },
    {
      "event": "treasure_found",
      "huntId": "bounty_123",
      "winner": "anderson",
      "findTime": "47 minutes",
      "timestamp": "just now"
    }
  ]
}
```

#### **Share Features**
- Share hunt link on social media
- Generate shareable clue cards (image)
- Hunt replay (show clues + winner's path)
- Hunt highlights reel
- Creator can stream hunt live

#### **Community Engagement**
- Comment on active hunts
- Guess locations (spoilers hidden)
- Cheer on hunters
- Subscribe to creator's hunts
- Hunt reminders/notifications

### **Treasure Hunt UI Components**

```
TreasureHuntCard (Browse view)
├── Event Badge ("LIVE NOW" or "STARTS IN 2H")
├── Prize preview
├── Location & radius
├── Active hunters count
├── Difficulty rating
├── Time remaining
└── "Join Hunt" button

TreasureHuntDetail (Full view)
├── Prize images & description
├── Creator profile
├── Hunt area map (approximate)
├── Clues section
│   ├── Unlocked clues
│   ├── Locked clues (countdown)
│   └── Hint request button
├── Live activity feed
├── Active hunters list
├── Chat/comments
└── "Claim Found!" button

CreateTreasureHunt (Creator flow)
├── Prize details
│   ├── Upload prize photos
│   ├── Describe prize
│   └── Select reward (monetary/inventory)
├── Hunt setup
│   ├── Set hunt area (map picker)
│   ├── Add clues (min 2, max 5)
│   ├── Schedule start/end time
│   └── Choose difficulty
├── Rules & safety
│   ├── Confirm public location
│   ├── Safety checklist
│   └── Community guidelines
└── Preview & post

ClaimTreasure (Winner flow)
├── Photo proof required
│   └── Must show item + location
├── Location verification
│   └── GPS confirms in hunt area
├── Instant winner announcement
└── Confetti celebration! 🎉
```

### **Monetization Opportunities**

#### **Premium Treasure Hunts**
- Verified creators can host premium hunts
- Higher prize pools ($100+)
- Sponsored by local businesses
- Entry fee option (winner takes pot)
- Platform takes small percentage

#### **Business Partnerships**
- Local businesses sponsor hunts
- Drive foot traffic to location
- "Find hidden QR code at our store"
- Promotional prizes
- Brand awareness

---

## 💡 Real-World Use Cases

### **Treasure Hunt Examples**

#### **1. Birthday Party Treasure Hunt** 🎂
```
Creator: Parent hosting birthday party
Prize: $30 + party favor bags
Area: Local park
Duration: 2 hours
Clues: 3 progressive hints
Participants: 12 kids + parents
Result: Winner gets main prize, all participants earn XP
```

#### **2. YouTuber Money Drop** 💰
```
Creator: Local influencer
Prize: $100 cash
Area: Downtown area (1 mile radius)
Duration: 4 hours
Clues: Real-time updates every 30 mins
Participants: 50+ hunters
Result: Viral video content, massive engagement
```

#### **3. Trading Card Treasure Hunt** 🃏
```
Creator: Collector wanting to give back
Prize: Rare Pokémon cards (inventory trade)
Area: Comic book store district
Duration: All day Saturday
Clues: Comic/gaming trivia clues
Participants: 25 card collectors
Result: Community building, no cash needed
```

#### **4. School Fundraiser Hunt** 🏫
```
Creator: PTA/School group
Prize: $50 gift card
Area: School campus (after hours)
Duration: 1 hour event
Clues: School-themed riddles
Participants: Students & families
Result: Fundraising + community engagement
```

#### **5. Flash Mob Money Drop** ⚡
```
Creator: Anonymous
Prize: $200 cash
Area: City center
Duration: 30 minutes
Clues: Tweet-style rapid-fire hints
Participants: 80+ people
Result: Instant viral sensation
```

#### **6. Weekend Adventure Hunt** 🗺️
```
Creator: Outdoor enthusiast
Prize: Camping gear (inventory) + $75
Area: Nature trail system (3 miles)
Duration: Full weekend
Clues: GPS coordinates + riddles
Participants: 15 adventure seekers
Result: Outdoor activity + exploration
```

### **Lost & Found Examples**

#### **1. Lost Phone at Concert** 📱
```
Poster: Concert attendee
Lost: iPhone 14 Pro
Location: Stadium, Section 204
Reward: $50 monetary
Result: Security finds it, returns in 2 hours
```

#### **2. Lost Retainer at School** 😬
```
Poster: Teen (with guardian approval)
Lost: Orthodontic retainer
Location: School cafeteria
Reward: Rare trading cards (inventory)
Result: Friend finds it next day
```

#### **3. Lost Wallet** 💳
```
Poster: Adult user
Lost: Leather wallet with ID
Location: Coffee shop
Reward: $75 monetary
Result: Good Samaritan returns, earns bounty hunter XP
```

### **Hybrid Use Cases**

#### **Community Cleanup Treasure Hunt** 🌱
```
- Creator hides multiple "treasures" (small prizes)
- Each found treasure = proof of trash collected
- Environmental impact + gamification
- Multiple winners
```

#### **Historical Landmark Tour** 🏛️
```
- Virtual treasure hunt with check-ins
- Visit 5 local landmarks
- Answer trivia at each location
- Educational + engaging
```

#### **Small Business Promo** 🏪
```
- Local businesses hide clues at their locations
- Hunters visit multiple stores
- Prize pool from all businesses
- Drives foot traffic to local economy
```

---

## 🔌 API Endpoints

### **Bounty Management** (Updated for Treasure Hunts)

```
POST   /api/bounties                    Create new bounty
GET    /api/bounties                    List active bounties (filters, search)
GET    /api/bounties/:id                Get bounty details
PATCH  /api/bounties/:id                Update bounty
DELETE /api/bounties/:id                Cancel bounty
GET    /api/bounties/my                 Get user's posted bounties

// Filtering & Search
GET    /api/bounties?bountyType=treasure_hunt  Filter by bounty type
GET    /api/bounties?type=monetary             Filter by reward type
GET    /api/bounties?category=electronics      Filter by category
GET    /api/bounties?location=near:lat,lng     Filter by proximity
GET    /api/bounties?status=active             Filter by status
GET    /api/bounties?sort=reward_high          Sort options
GET    /api/bounties?search=iPhone             Text search

// Treasure Hunt Specific
GET    /api/treasure-hunts/live                Get active hunts happening now
GET    /api/treasure-hunts/upcoming            Get scheduled future hunts
GET    /api/treasure-hunts/feed                Live hunt activity feed
GET    /api/treasure-hunts/:id/clues           Get unlocked clues
POST   /api/treasure-hunts/:id/join            Join a treasure hunt
GET    /api/treasure-hunts/:id/hunters         Get active hunter list
POST   /api/treasure-hunts/:id/hint            Request additional hint (costs XP)
GET    /api/treasure-hunts/leaderboard         Fastest finders
```

### **Claims & Verification**

```
POST   /api/bounties/:id/claim         Submit claim
GET    /api/claims/:id                 Get claim details
POST   /api/claims/:id/verify          Owner verifies claim
POST   /api/claims/:id/reject          Owner rejects claim
GET    /api/claims/my                  Get user's claims
POST   /api/claims/:id/message         Send message about claim
```

### **Payment & Rewards**

```
POST   /api/bounties/validate-payment  Validate payment method (Visa API)
POST   /api/bounties/:id/payout        Process payout (Visa Direct)
POST   /api/bounties/:id/transfer      Transfer inventory items
```

### **Bounty Hunter System**

```
GET    /api/bounty-hunters/:userId     Get hunter profile
GET    /api/bounty-hunters/leaderboard Get top hunters
POST   /api/bounty-hunters/claim-badge Claim earned badge
GET    /api/bounty-hunters/perks       Get active perks
```

---

## 🎨 Frontend Flow

### **User Journey 1: Posting a Bounty**

```
1. Click "Lost & Found" in navigation
   ↓
2. Click "Post Bounty" button
   ↓
3. Fill out "Create Bounty" form:
   - Upload images of lost item
   - Describe item details
   - Mark last seen location on map
   - Add identifying features
   ↓
4. Choose reward type:
   
   A) MONETARY BOUNTY:
      - Enter cash amount ($5 - $500)
      - Validate payment method (Visa API)
      - See estimated payout fee
      - Confirm
   
   B) INVENTORY TRADE:
      - Select items from inventory
      - See total value
      - Allow finder to choose items up to value
      - Preview what finder sees
   ↓
5. Review & Post
   ↓
6. Bounty goes live, user receives confirmation
```

### **User Journey 2: Claiming a Bounty**

```
1. Browse "Active Bounties" list
   ↓
2. Filter by:
   - Location (near me)
   - Reward type
   - Reward value
   - Category
   ↓
3. Click bounty card to view details
   ↓
4. See:
   - Lost item details & images
   - Last seen location & time
   - Reward offered
   - Poster's rating
   ↓
5. If found, click "I Found This!"
   ↓
6. Submit claim form:
   - Upload proof images
   - Describe where/when found
   - Add verification details
   ↓
7. AI analyzes images for match confidence
   ↓
8. Notification sent to owner
   ↓
9. Owner reviews claim:
   - View proof images
   - Message claimer
   - Propose meetup (with guardian oversight)
   ↓
10. Owner verifies return:
    A) MONETARY: Visa Direct instant payout
    B) INVENTORY: Items transferred in-app
    ↓
11. Both parties rate experience
    ↓
12. Claimer earns:
    - XP (500+)
    - Badge progress
    - Reputation points
```

### **User Journey 3: Bounty Hunter Dashboard**

```
1. View profile showing:
   - Total successful returns
   - Success rate %
   - Total earnings (cash + trade value)
   - Active badges
   - XP multiplier
   - Reputation score
   ↓
2. Browse available perks:
   - Early access to high-value bounties
   - Priority verification
   - Profile flair
   ↓
3. View leaderboard:
   - Top hunters this week/month/all-time
   - Compare stats
   ↓
4. Track active claims
```

---

## 🔐 Visa API Integration Points

### **1. Payment Account Validation**
```javascript
// Location: visa-server/src/visa/paymentValidation.js

async function validatePaymentAccount(userId, paymentDetails) {
  // Call Visa Payment Account Validation API
  const response = await visaAPI.post('/payment-account-validation', {
    primaryAccountNumber: paymentDetails.cardNumber,
    cardCvv2Value: paymentDetails.cvv,
    cardExpiryDate: paymentDetails.expiry
  });
  
  return {
    valid: response.status === 'ACCOUNT_VALID',
    token: response.validationToken,
    canPostBounty: response.valid
  };
}
```

**When Used:**
- User tries to post monetary bounty
- Before bounty goes live
- Prevents fake bounties

### **2. Visa Direct (Fast Funds)**
```javascript
// Location: visa-server/src/visa/visaDirect.js

async function sendBountyPayout(claimId, amount, recipientDetails) {
  // Call Visa Direct API for instant payout
  const response = await visaAPI.post('/visadirect/fundstransfer', {
    amount: amount,
    currency: 'USD',
    recipientPrimaryAccountNumber: recipientDetails.cardNumber,
    senderAccountNumber: PLATFORM_ACCOUNT,
    transactionIdentifier: claimId,
    purposeOfPayment: 'Lost & Found Bounty Reward'
  });
  
  return {
    success: response.status === 'SUCCESS',
    transactionId: response.transactionId,
    completedAt: response.timestamp
  };
}
```

**When Used:**
- Owner verifies claim is legitimate
- Instant payment to finder
- No waiting for bank transfers

### **3. Visa Token Service**
```javascript
// Location: visa-server/src/visa/tokenService.js

async function verifyUserIdentity(userId, verificationData) {
  // Use Visa Token Service for secure identity verification
  const response = await visaAPI.post('/vts/verify', {
    userId: userId,
    deviceFingerprint: verificationData.deviceId,
    location: verificationData.location,
    verificationMethod: '3DS' // 3D Secure
  });
  
  return {
    verified: response.status === 'VERIFIED',
    trustScore: response.riskScore,
    canClaim: response.verified && response.riskScore > 0.7
  };
}
```

**When Used:**
- New user posts first bounty
- High-value claims (>$100)
- Suspicious activity detected
- Prevents fraud

---

## 🎮 Gamification System

### **Badge Tiers**
```javascript
const BOUNTY_HUNTER_BADGES = {
  bronze: {
    id: 'bounty_hunter_bronze',
    name: 'Bronze Hunter',
    icon: '🥉',
    requirement: 'Return 5 items',
    perks: {
      xpMultiplier: 1.2,
      profileFlair: '🥉 Bronze Hunter'
    }
  },
  silver: {
    id: 'bounty_hunter_silver',
    name: 'Silver Hunter',
    icon: '🥈',
    requirement: 'Return 15 items',
    perks: {
      xpMultiplier: 1.5,
      earlyAccessHours: 12,
      profileFlair: '🥈 Silver Hunter'
    }
  },
  gold: {
    id: 'bounty_hunter_gold',
    name: 'Gold Hunter',
    icon: '🥇',
    requirement: 'Return 30 items with 85%+ success rate',
    perks: {
      xpMultiplier: 2.0,
      earlyAccessHours: 24,
      priorityVerification: true,
      profileFlair: '🥇 Gold Hunter'
    }
  },
  elite: {
    id: 'bounty_hunter_elite',
    name: 'Elite Hunter',
    icon: '⭐',
    requirement: '50+ returns, 90%+ success rate, 4.5+ rating',
    perks: {
      xpMultiplier: 2.5,
      earlyAccessHours: 48,
      priorityVerification: true,
      customProfileBanner: true,
      profileFlair: '⭐ Elite Hunter'
    }
  }
};
```

### **XP System Integration**
```javascript
// Extends existing XP system in users.json

const BOUNTY_XP_REWARDS = {
  claimSubmitted: 50,
  claimVerified: 500,
  monetaryBounty_0_25: 500,    // $0-25 reward
  monetaryBounty_25_100: 750,   // $25-100 reward
  monetaryBounty_100_plus: 1000, // $100+ reward
  inventoryTrade: 500,
  firstReturn: 1000, // Bonus
  perfectWeek: 2000, // 5+ returns in a week
  highValueItem: 1500 // Item worth $200+
};
```

---

## 🛡️ Safety & Moderation

### **Guardian Oversight Integration**
```javascript
// Extends existing Guardian Dashboard

// New alert types for guardian dashboard:
const BOUNTY_ALERT_TYPES = {
  child_posted_bounty: {
    severity: 'medium',
    message: 'Your child posted a bounty for a lost item',
    requiresApproval: true // If under 13
  },
  child_claiming_bounty: {
    severity: 'medium',
    message: 'Your child is claiming a bounty',
    details: 'May require in-person meetup'
  },
  meetup_proposed: {
    severity: 'high',
    message: 'Meetup proposed for item return',
    requiresApproval: true,
    details: 'Review location and time'
  },
  high_value_transaction: {
    severity: 'high',
    message: 'Bounty involves $100+ or high-value items',
    requiresApproval: true
  }
};
```

### **AI Moderation for Claims**
```javascript
// Location: src/features/bountyVerification.ts

async function verifyClaimImages(bountyImages, claimImages) {
  // Use Gemini Vision API to compare images
  const prompt = `
    Compare these two sets of images:
    1. Lost item (from bounty)
    2. Found item (from claim)
    
    Analyze:
    - Visual similarity (0-1 score)
    - Identifying features match
    - Probability this is the same item
    
    Return JSON: { match: 0.95, confidence: "high", reasoning: "..." }
  `;
  
  const result = await gemini.generateContent({
    prompt,
    images: [...bountyImages, ...claimImages]
  });
  
  return {
    matchScore: result.match,
    autoVerify: result.match > 0.85,
    needsOwnerReview: result.match < 0.85
  };
}
```

### **Fraud Prevention**
```
1. ✅ Payment validation before posting (Visa API)
2. ✅ Identity verification for high-value (Visa Token Service)
3. ✅ AI image matching for claims
4. ✅ Reputation system limits abuse
5. ✅ Guardian approval for minors
6. ✅ Meetup safety (existing system)
7. ✅ Dispute resolution system
8. ✅ Rate limiting on bounty posts
```

---

## 📱 UI Component Hierarchy

```
LostAndFound (Main Page)
├── BountyFilters
│   ├── LocationFilter (map-based)
│   ├── RewardTypeFilter (monetary/inventory)
│   ├── CategoryFilter
│   └── SortOptions
│
├── BountyList
│   └── BountyCard (repeating)
│       ├── ItemImage
│       ├── RewardBadge (💰 or 🔄)
│       ├── LocationTag
│       └── TimePosted
│
└── CreateBountyButton

CreateBounty (Modal/Page)
├── ItemDetailsForm
│   ├── ImageUpload
│   ├── DescriptionField
│   ├── CategorySelect
│   └── IdentifyingFeatures
│
├── LocationPicker
│   ├── Map
│   ├── AddressInput
│   └── DateTimePicker (last seen)
│
├── RewardSelector
│   ├── MonetaryOption
│   │   ├── AmountInput
│   │   └── PaymentValidation
│   │
│   └── InventoryOption
│       ├── InventoryItemSelector
│       ├── TotalValueDisplay
│       └── SelectionPreview
│
└── PostButton

BountyDetail (Full page view)
├── ItemGallery
├── DetailsSection
├── MapView (last seen)
├── RewardDisplay
│   ├── MonetaryAmount OR
│   └── InventoryItems
│
├── PosterProfile
│   ├── Rating
│   ├── VerifiedBadge
│   └── ResponseTime
│
└── ClaimButton (if not owner)

ClaimBounty (Modal)
├── ProofUpload
│   ├── ImageCapture
│   └── DescriptionField
│
├── LocationConfirm
├── VerificationPreview
│   └── AIMatchScore
│
└── SubmitClaimButton

MyBounties (Tab view)
├── ActiveBountiesTab
│   └── BountyWithClaims
│       ├── BountyInfo
│       └── ClaimsList
│
└── HistoryTab
    └── CompletedBounties

BountyHunterProfile
├── StatsGrid
│   ├── TotalReturns
│   ├── SuccessRate
│   ├── TotalEarnings
│   └── XPEarned
│
├── BadgesDisplay
│   └── BadgeCard (repeating)
│       ├── Icon
│       ├── Progress
│       └── Perks
│
├── ActivePerks
│   └── PerkCard
│
└── LeaderboardPreview
```

---

## 🔄 Integration with Existing Systems

### **1. Inventory System** (`visa-server/data/inventory.json`)
```javascript
// When bounty uses inventory reward:
- Mark items as "reserved_for_bounty"
- Prevent trading/deletion while bounty active
- Transfer items when claim verified

// New item status:
item.status = "available" | "reserved_for_bounty" | "in_bounty_transfer"
```

### **2. XP & Gamification** (existing in `users.json`)
```javascript
// Bounty activities add to existing XP system:
user.xp += BOUNTY_XP_REWARDS.claimVerified;
user.bountyHunterMultiplier = badges.includes('gold') ? 2.0 : 1.0;
user.totalXp = user.xp * user.bountyHunterMultiplier;
```

### **3. Messages System** (`visa-server/src/routes/messages.js`)
```javascript
// Extend message types:
message.type = "text" | "trade_offer" | "bounty_claim"

// Bounty claim messages:
{
  type: "bounty_claim",
  bountyId: "bounty_123",
  claimId: "claim_456",
  preview: "I found your iPhone!",
  proofImages: [...],
  actions: ["verify", "reject", "message"]
}
```

### **4. Guardian Dashboard** (`web/src/screens/GuardianDashboard.tsx`)
```javascript
// New alert types added to existing system:
- bounty_posted
- bounty_claimed
- meetup_proposed_bounty
- high_value_bounty
```

### **5. Location & Meetup** (existing meetup detection)
```javascript
// Reuse existing meetup safety features:
- Public location suggestions
- Guardian notification
- Safety tips
- Time window validation
```

---

## 💾 Database Schema Evolution

### **Current:**
```
visa-server/data/
├── users.json
├── inventory.json
├── resets.json
└── (messages handled in-memory)
```

### **After Bounty System:**
```
visa-server/data/
├── users.json (EXTENDED with bountyHunter profile)
├── inventory.json (EXTENDED with bounty reservations)
├── resets.json
├── bounties.json (NEW)
├── claims.json (NEW)
└── bountyTransactions.json (NEW - payment/transfer logs)
```

---

## 🚀 Implementation Phases

### **Phase 1: Core Bounty System** (Week 1-2)
- ✅ Data models & database
- ✅ Backend API endpoints
- ✅ Basic UI (list, create, detail)
- ✅ Monetary bounty flow
- ✅ Simple claim submission

### **Phase 2: Inventory Trade System** (Week 2-3)
- ✅ Inventory selection UI
- ✅ Item reservation logic
- ✅ Transfer mechanism
- ✅ Value calculation

### **Phase 3: Visa Integration** (Week 3-4)
- ✅ Payment Account Validation
- ✅ Visa Direct payouts
- ✅ Visa Token Service
- ✅ Transaction logging

### **Phase 4: AI Verification** (Week 4-5)
- ✅ Gemini Vision for image matching
- ✅ Auto-verification logic
- ✅ Confidence scoring
- ✅ Fraud detection

### **Phase 5: Gamification** (Week 5-6)
- ✅ Badge system
- ✅ XP multipliers
- ✅ Leaderboard
- ✅ Profile flair

### **Phase 6: Safety & Polish** (Week 6-7)
- ✅ Guardian oversight integration
- ✅ Meetup safety flow
- ✅ Dispute resolution
- ✅ UI polish & animations

---

## 📊 Key Metrics to Track

```javascript
const BOUNTY_METRICS = {
  // Volume
  totalBounties: 'Total posted',
  activeBounties: 'Currently active',
  completedBounties: 'Successfully completed',
  
  // Success Rates
  claimSuccessRate: 'Claims that led to returns',
  averageResolutionTime: 'Hours to complete',
  
  // Financial
  totalMonetaryBounties: 'Total $ offered',
  totalPayouts: 'Total $ paid out',
  averageBountyAmount: 'Average reward',
  
  // Engagement
  viewsPerBounty: 'How many see each bounty',
  claimsPerBounty: 'Average claims submitted',
  hunterParticipation: '% users who claim',
  
  // Quality
  verificationAccuracy: 'AI match accuracy',
  disputeRate: 'Claims disputed',
  userSatisfaction: 'Rating after completion'
};
```

---

## 🎯 Success Criteria

### **For Users:**
- ✅ Post bounty in < 3 minutes
- ✅ Browse local bounties easily
- ✅ Clear reward expectations
- ✅ Fast claim verification
- ✅ Instant payouts (Visa Direct)

### **For Platform:**
- ✅ 70%+ claim success rate
- ✅ < 5% dispute rate
- ✅ < 2 hour avg response time
- ✅ High user engagement (30%+ participation)
- ✅ Positive reputation system

### **For Safety:**
- ✅ 100% guardian oversight for minors
- ✅ Secure payments (Visa APIs)
- ✅ Identity verification for high-value
- ✅ Public meetup locations only
- ✅ AI fraud detection

---

## 🔮 Future Enhancements

### **Phase 7+:**
1. **Community Bounties** - Multiple users pool rewards
2. **Recurring Bounties** - For frequently lost items (keys, wallet)
3. **Bounty Alerts** - Push notifications for nearby bounties
4. **AR Scanner** - Use phone camera to ID items in real-time
5. **Insurance Integration** - Verified high-value items
6. **Charity Option** - Donate reward to cause
7. **Professional Finders** - Verified recovery services
8. **Lost Pet Support** - Specialized flow for pets

---

## 💡 Why This Works for Swappy

### **Leverages Existing Systems:**
- ✅ Uses current inventory system
- ✅ Extends gamification/XP
- ✅ Integrates with messages
- ✅ Guardian oversight already built
- ✅ Meetup detection exists

### **Adds New Value:**
- ✅ Real-world utility (find lost items)
- ✅ Visa payment integration (revenue opportunity)
- ✅ Increases engagement (bounty hunting)
- ✅ Community building
- ✅ Differentiates from competitors

### **Perfect for Target Audience (Kids/Teens):**
- ✅ Gamified (badges, XP)
- ✅ Social (help others)
- ✅ Safe (guardian oversight)
- ✅ Flexible (cash OR trade)
- ✅ Instant gratification (Visa Direct)

---

## 📝 Technical Considerations

### **Performance:**
- Index bounties by location (geospatial queries)
- Cache active bounties list
- Optimize image storage/delivery
- Rate limit bounty creation

### **Security:**
- Validate all Visa API calls server-side
- Encrypt payment tokens
- Prevent duplicate claims
- Audit trail for all transactions

### **Scalability:**
- Move to real database (MongoDB/PostgreSQL)
- Implement job queue for payouts
- CDN for images
- WebSocket for real-time updates

### **Mobile:**
- PWA support for photo uploads
- Geolocation for nearby bounties
- Push notifications
- Offline claim drafts

---

This architecture seamlessly integrates the Lost & Found Bounty System into your existing Swappy platform while leveraging Visa's payment infrastructure for secure, instant transactions. Ready to implement when you are! 🚀

