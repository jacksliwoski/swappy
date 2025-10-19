# Bounty System Demo Data Guide

## Overview

This document explains the demo data structure for Swappy's Lost & Found Bounty system, including all bounties, claims, and transactions for demonstration purposes.

---

## Demo User Accounts

### Regular Users:

| Username | Email | Password | User ID | Description |
|----------|-------|----------|---------|-------------|
| Jack | jack@swappy.demo | password123 | u_demo_1 | Active bounty creator |
| Anderson | anderson@swappy.demo | password123 | u_demo_2 | Active bounty hunter |
| (Third User) | N/A | N/A | u_demo_3 | Additional demo user |

### Guardian Account:

| Username | Email | Password | User ID | Description |
|----------|-------|----------|---------|-------------|
| Mike Anderson (Parent) | mike.anderson@example.com | guardian123 | guardian_anderson | Guardian monitoring child |

---

## Demo Bounties (9 Total)

### 1. 🎮 Epic GameBoy Money Drop (bounty_demo_1)
- **Type:** Treasure Hunt
- **Status:** Active
- **Creator:** Jack (u_demo_1)
- **Reward:** $25 USD (monetary)
- **Location:** Downtown Seattle, WA
- **Difficulty:** Medium
- **Clues:** 3 progressive clues
- **Active Hunters:** 5
- **View Count:** 24

### 2. 📱 iPhone 14 Pro - Black (bounty_demo_2)
- **Type:** Lost Item
- **Status:** Active
- **Creator:** Anderson (u_demo_2)
- **Reward:** $75 USD (monetary)
- **Last Seen:** Pike Place Market
- **Identifying Features:** Blue case with "JD" initials, cracked screen protector
- **Claims:** 2 claims submitted
- **View Count:** 42

### 3. 🃏 Limited Edition Pokémon Card Binder (bounty_demo_3)
- **Type:** Lost Item
- **Status:** Active
- **Creator:** Jack (u_demo_1)
- **Reward:** Inventory trade (Nike Dunks OR Skateboard)
- **Last Seen:** Gas Works Park
- **Identifying Features:** Blue binder with Charizard sticker
- **View Count:** 67

### 4. 🎃 Halloween Candy Money Drop (bounty_demo_4)
- **Type:** Treasure Hunt
- **Status:** ✅ Completed
- **Creator:** u_demo_3
- **Reward:** $10 USD (monetary)
- **Location:** Fremont, Seattle
- **Winner:** Anderson (u_demo_2)
- **Find Time:** 47 minutes
- **View Count:** 89

### 5. 🎒 Backpack with School Supplies (bounty_demo_5)
- **Type:** Lost Item
- **Status:** Active
- **Creator:** Anderson (u_demo_2)
- **Reward:** $20 USD (monetary)
- **Last Seen:** University District bus
- **Identifying Features:** Blue JanSport, name tag "Anderson", water bottle with soccer stickers
- **View Count:** 15

### 6. 💎 Mystery Gift Card Hunt (bounty_demo_6)
- **Type:** Treasure Hunt
- **Status:** Active
- **Creator:** Jack (u_demo_1)
- **Reward:** $50 Amazon gift card (monetary)
- **Location:** Capitol Hill, Seattle
- **Difficulty:** Hard
- **Clues:** 3 progressive clues (unlocking over time)
- **Active Hunters:** 23
- **View Count:** 156

### 7. 🎧 Airpods Pro (2nd Gen) (bounty_demo_7)
- **Type:** Lost Item
- **Status:** In Verification
- **Creator:** u_demo_3
- **Reward:** $40 USD (monetary)
- **Last Seen:** LA Fitness, Ballard
- **Identifying Features:** White case with dent, engraved "SK"
- **Claims:** 1 claim under review
- **View Count:** 28

### 8. 🪖 Kid's Bike Helmet - Purple with Stars (bounty_demo_8)
- **Type:** Lost Item
- **Status:** Active
- **Creator:** Guardian (guardian_anderson)
- **Reward:** $15 USD (monetary)
- **Last Seen:** Green Lake Park
- **Identifying Features:** Purple helmet, star stickers, phone number inside
- **View Count:** 12

### 9. 💻 MacBook Pro 14" - HIGH VALUE (bounty_demo_9_high_value)
- **Type:** Lost Item
- **Status:** Active
- **Creator:** Jack (u_demo_1)
- **Reward:** $250 USD (monetary) 🔒 Requires Identity Verification
- **Last Seen:** Seattle Central Library
- **Identifying Features:** Space gray, Swappy stickers
- **Claims:** 3 claims (requires additional verification)
- **View Count:** 201

---

## Demo Claims (7 Total)

### Claim Demo 1 - Submitted
- **Claim ID:** claim_demo_1
- **Bounty:** iPhone 14 Pro (bounty_demo_2)
- **Claimer:** Jack (u_demo_1)
- **Status:** Submitted
- **Verification Score:** 0.87 (87% match)
- **Messages:** 2 messages exchanged
- **Description:** "Found phone at Pike Place Market with blue case and 'JD' initials"

### Claim Demo 2 - Rejected
- **Claim ID:** claim_demo_2
- **Bounty:** iPhone 14 Pro (bounty_demo_2)
- **Claimer:** u_demo_3
- **Status:** Rejected
- **Verification Score:** 0.45 (low match)
- **Rejection Reason:** "Item doesn't match description - wrong color case"

### Claim Demo 3 - Completed ✅
- **Claim ID:** claim_demo_3
- **Bounty:** Halloween Candy Hunt (bounty_demo_4)
- **Claimer:** Anderson (u_demo_2)
- **Status:** Completed
- **Payout:** $10 USD processed
- **Transaction ID:** txn_demo_1
- **Rating:** 5 stars
- **Review:** "Super fun treasure hunt! Great Halloween activity!"

### Claim Demo 4 - Under Review
- **Claim ID:** claim_demo_4
- **Bounty:** Airpods Pro (bounty_demo_7)
- **Claimer:** Anderson (u_demo_2)
- **Status:** Under Review
- **Verification Score:** 0.95 (high confidence)
- **Messages:** 3 messages (serial number verification in progress)
- **Meetup Proposed:** Yes (Starbucks on Market St)

### Claim Demo 5 - High Value Verification Pending
- **Claim ID:** claim_demo_5
- **Bounty:** MacBook Pro (bounty_demo_9_high_value)
- **Claimer:** Anderson (u_demo_2)
- **Status:** Submitted (identity verification required)
- **Identity Verification:** Pending
- **Fraud Check:** Pending
- **High Value Item:** Yes ($250)

### Claim Demo 6 - Rejected (Low Verification)
- **Claim ID:** claim_demo_6
- **Bounty:** MacBook Pro (bounty_demo_9_high_value)
- **Claimer:** u_demo_3
- **Status:** Rejected
- **Verification Score:** 0.32 (low)
- **Rejection Reason:** "Insufficient verification details, AI match score too low"

### Claim Demo 7 - Verified (Inventory Trade)
- **Claim ID:** claim_demo_7
- **Bounty:** Pokémon Card Binder (bounty_demo_3)
- **Claimer:** Anderson (u_demo_2)
- **Status:** Verified
- **Verification Score:** 1.0 (perfect match)
- **Selected Reward:** Limited Edition Nike Dunks
- **Meetup:** Approved by guardian

---

## Demo Transactions (10 Total)

### Transaction Categories:

#### ✅ Successful Transactions (7):
1. **txn_demo_1** - Payout ($10) for Halloween hunt
2. **txn_demo_2** - Payment validation ($25) for GameBoy hunt
3. **txn_demo_3** - Payment validation ($75) for iPhone bounty
4. **txn_demo_4** - Payment validation ($250) for MacBook (high-value)
5. **txn_demo_6** - Payment validation ($50) for gift card hunt
6. **txn_demo_9** - Payment validation ($40) for Airpods
7. **txn_demo_10** - Payment validation ($20) for backpack

#### ⏳ Pending Transactions (1):
8. **txn_demo_5** - Identity verification for MacBook claim ($250)

#### ❌ Failed/Blocked Transactions (2):
9. **txn_demo_7_failed** - Payment validation failed (invalid CVV)
10. **txn_demo_8_fraud_detected** - Blocked due to high fraud score (0.92)

### Transaction Details:

#### Example: Successful Payout (txn_demo_1)
```json
{
  "id": "txn_demo_1",
  "type": "payout",
  "amount": 10,
  "currency": "USD",
  "status": "SUCCESS",
  "visaService": "Visa Direct",
  "processingTime": "2.3s",
  "fees": {
    "platformFee": 0.50,
    "visaProcessingFee": 0.25,
    "totalFees": 0.75
  },
  "securityChecks": {
    "paymentValidation": "passed",
    "fraudCheck": "passed",
    "identityVerification": "not_required"
  }
}
```

#### Example: Fraud Detection (txn_demo_8_fraud_detected)
```json
{
  "id": "txn_demo_8_fraud_detected",
  "type": "fraud_check",
  "amount": 500,
  "status": "BLOCKED",
  "fraudScore": 0.92,
  "riskLevel": "high",
  "flaggedReasons": [
    "unusual_location",
    "high_value_anomaly",
    "new_device",
    "rapid_succession"
  ]
}
```

---

## Testing Scenarios

### Scenario 1: Complete Bounty Workflow (Lost Item)
1. Sign in as **Jack** (jack@swappy.demo / password123)
2. Navigate to Lost & Found
3. View **bounty_demo_2** (iPhone)
4. See 2 claims submitted
5. Review claim details and messages
6. Verify or reject claims

### Scenario 2: Treasure Hunt Participation
1. Sign in as **Anderson** (anderson@swappy.demo / password123)
2. Browse active treasure hunts
3. View **bounty_demo_6** (Mystery Gift Card Hunt)
4. See progressive clues
5. Active hunters count: 23
6. Submit claim when found

### Scenario 3: High-Value Item Security
1. View **bounty_demo_9_high_value** (MacBook $250)
2. Notice "Requires Identity Verification" badge
3. Submit claim
4. Identity verification triggered
5. Fraud check performed
6. Additional documentation required

### Scenario 4: Inventory Trade Bounty
1. View **bounty_demo_3** (Pokémon Card Binder)
2. See inventory reward options:
   - Option 1: Limited Edition Nike Dunks ($150 value)
   - Option 2: Pro Skateboard Deck ($75 value)
3. Finder can choose one item
4. No monetary transaction needed

### Scenario 5: Guardian Oversight
1. Sign in as **Guardian** (mike.anderson@example.com / guardian123)
2. View Guardian Dashboard
3. See child's bounty activity
4. Monitor meetup proposals
5. Approve/reject high-value transactions

---

## Data Relationships

### Bounty → Claims → Transactions Flow:

```
bounty_demo_4 (Halloween Hunt)
    ↓
claim_demo_3 (Anderson found it)
    ↓
txn_demo_1 (Payout $10 processed)
    ↓
COMPLETED ✅
```

### Bounty with Multiple Claims:

```
bounty_demo_2 (iPhone)
    ├── claim_demo_1 (Jack) - Submitted
    └── claim_demo_2 (u_demo_3) - Rejected
```

### High-Value Security Flow:

```
bounty_demo_9_high_value (MacBook $250)
    ├── txn_demo_4 (Payment Validation) ✅
    ├── claim_demo_5 (Pending Identity Verification) ⏳
    │   └── txn_demo_5 (Identity Check in Progress)
    └── claim_demo_6 (Rejected - Low Match) ❌
```

---

## Mock Visa API Responses

### When MOCK_VISA_API=true:

All Visa API calls return simulated responses:

#### Payment Validation:
- Cards starting with "4" → Valid (Visa cards)
- All others → Invalid
- Returns mock token: `VAL_MOCK_[timestamp]`

#### Visa Direct Payout:
- Always returns SUCCESS
- Mock transaction ID: `VD_MOCK_[timestamp]`
- Processing time: 1-3 seconds (simulated)

#### Identity Verification:
- Random trust score: 0.85-0.95
- Random fraud score: 0.0-0.3
- Simulates device fingerprinting

---

## Resetting Demo Data

To reset all bounty data to initial demo state:

```bash
# Navigate to project root
cd swappy

# Backup current data (optional)
cp visa-server/data/bounties.json visa-server/data/bounties.backup.json
cp visa-server/data/claims.json visa-server/data/claims.backup.json
cp visa-server/data/bountyTransactions.json visa-server/data/bountyTransactions.backup.json

# The demo data is already seeded in the files
# Just restart the server to use fresh demo data
```

---

## File Locations

- **Bounties:** `visa-server/data/bounties.json`
- **Claims:** `visa-server/data/claims.json`
- **Transactions:** `visa-server/data/bountyTransactions.json`
- **Bounty Hunters:** `visa-server/data/bountyHunters.json`

---

## API Endpoints for Demo Data

### List All Bounties:
```
GET /api/bounties
GET /api/bounties?bountyType=treasure_hunt
GET /api/bounties?bountyType=lost_item
GET /api/bounties?status=active
```

### Get Specific Bounty:
```
GET /api/bounties/bounty_demo_1
```

### List Claims for Bounty:
```
GET /api/bounties/bounty_demo_2/claims
```

### View Transaction History:
```
GET /api/transactions?bountyId=bounty_demo_4
```

---

## Notes

1. All demo data uses mock Visa tokens (VAL_MOCK_*)
2. No real payment processing occurs in demo mode
3. Timestamps are set to October 2025 for demo purposes
4. All user IDs are prefixed with `u_demo_` or `guardian_`
5. Demo users can access all bounties regardless of creator

---

**Last Updated:** October 2025
**Document Version:** 1.0
**Maintained By:** Swappy Development Team
