# 🔄 Lost & Found Bounty System - Data Flows

## 1. Treasure Hunt Flow (Money Drop Style)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TREASURE HUNT / MONEY DROP FLOW              │
└─────────────────────────────────────────────────────────────────┘

👤 Creator (Jack) - Wants to create viral money drop
  │
  ├──[1] Creates Treasure Hunt
  │     ├─> Type: treasure_hunt
  │     ├─> Prize: $50 cash + rare trading card
  │     ├─> Location: "Downtown Seattle" (0.5 mile radius)
  │     ├─> Start time: Today 3:00 PM
  │     ├─> Duration: 4 hours
  │     └─> Adds 3 clues:
  │          ├─ Clue 1 (immediate): "Near the place where tech giants were born 🏢"
  │          ├─ Clue 2 (unlocks +1 hour): "Look for the red bench facing water 🌊"
  │          └─ Clue 3 (unlocks +2 hours): "Behind 3rd trash can from coffee shop ☕"
  │
  ├──[2] Payment validation (Visa API)
  │     └─> ✅ $50 verified and held
  │
  ├──[3] Safety checks
  │     ├─> AI scans clues for inappropriate content ✅
  │     ├─> Location verified as public area ✅
  │     └─> Time window is during daylight ✅
  │
  └──[4] Hunt goes LIVE at scheduled time
        └─> Push notifications sent to nearby users
             └─> "🎮 New treasure hunt starting NOW! $50 prize!"

  │
  │
👥 Hunters (15 people join within first 10 minutes)
  │
  ├──[5] Browse "Live Hunts" tab
  │     └─> See hunt card:
  │          ├─ "💰 $50 Cash Money Drop - Downtown Seattle"
  │          ├─ Status: "🔴 LIVE NOW"
  │          ├─ Time remaining: 3h 50m
  │          ├─ Active hunters: 15
  │          └─> Click "Join Hunt"
  │
  ├──[6] Hunt detail page opens
  │     ├─> Prize images shown
  │     ├─> Map with hunt radius
  │     ├─> Clue #1 revealed: "Near the place where tech giants..."
  │     ├─> Clue #2 & #3: 🔒 LOCKED (countdown timers)
  │     ├─> Live feed: "Anderson joined!" "Sarah joined!"
  │     └─> Chat: Hunters discussing theories
  │
  ├──[7] Hunters search IRL
  │     ├─> Some head to Microsoft campus
  │     ├─> Others try Amazon headquarters
  │     └─> Real-time activity updates in app
  │
  ├──[8] 1 hour passes → Clue #2 unlocks
  │     └─> Push notification: "🔓 New clue unlocked!"
  │          └─> "Look for the red bench facing water"
  │
  ├──[9] Hunters narrow down location
  │     └─> Waterfront + tech campus = specific park
  │
  ├──[10] 2 hours pass → Clue #3 unlocks
  │      └─> "Behind 3rd trash can from coffee shop"
  │           └─> Multiple hunters converge on area
  │
  │
🏆 Winner (Anderson) finds it first!
  │
  ├──[11] 2h 47m elapsed - Anderson spots hidden envelope
  │      └─> Opens envelope: $50 cash + rare card inside!
  │
  ├──[12] Submits claim with proof
  │      ├─> Photo of envelope at location
  │      ├─> GPS confirms inside hunt radius ✅
  │      ├─> Timestamp shows hunt still active ✅
  │      └─> Selfie with prize
  │
  ├──[13] INSTANT VERIFICATION
  │      ├─> Location match: ✅
  │      ├─> Time valid: ✅
  │      ├─> First claim: ✅ (wins!)
  │      └─> Claim status: "verified"
  │
  ├──[14] Winner announced to all hunters
  │      └─> "🎉 Anderson found the treasure in 2h 47m!"
  │           ├─> Hunt ends immediately
  │           ├─> All hunters notified
  │           └─> Confetti animation 🎊
  │
  ├──[15] Visa Direct payout to Creator's card
  │      └─> Creator physically hands cash to winner
  │           └─> (Platform holds creator accountable)
  │
  ├──[16] XP & Badge rewards
  │      ├─> Anderson: +750 XP (treasure found)
  │      │            +250 XP (speed bonus)
  │      │            +1000 XP total
  │      │   └─> Progress: 4/5 finds to 🏆 Speed Runner badge
  │      │
  │      └─> Creator (Jack): +500 XP (hunt completed)
  │                          +250 XP (popular - 15 participants)
  │                          +750 XP total
  │          └─> Progress: 7/10 hunts to 🎪 Treasure Master
  │
  ├──[17] Hunt recap generated
  │      ├─> Total participants: 15
  │      ├─> Winner: Anderson (2h 47m)
  │      ├─> Clues used: All 3
  │      ├─> Map of hunter movements
  │      └─> Shareable highlight reel
  │
  └──[18] Ratings & reviews
        ├─> Anderson rates hunt: ⭐⭐⭐⭐⭐ "Epic clues!"
        ├─> Other hunters rate: Average 4.8/5
        └─> Creator gains reputation

💾 Data Updated:
   ├─ bounties.json: 
   │   └─ status → "completed"
   │   └─ treasureStats.avgTimeToFind = 167 minutes
   │   └─ treasureStats.totalAttempts = 15
   ├─ users.json: XP updated for all participants
   ├─ bountyHunters.json:
   │   └─ Anderson: successfulReturns++, fastestFind updated
   └─ bountyTransactions.json: payout logged

🔥 Viral Potential:
   - Hunters share on social media
   - Creator posts recap video
   - Next hunt gets 50+ participants
   - Local news picks up story
   - Community engagement 📈
```

---

## 2. Monetary Bounty Flow (Lost Item)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONETARY BOUNTY LIFECYCLE                    │
└─────────────────────────────────────────────────────────────────┘

👤 User (Lost Item Owner)
  │
  ├──[1] Posts Bounty with $50 reward
  │     └─> Upload images, location, details
  │
  ├──[2] Validate Payment Method
  │     └─> Visa Payment Account Validation API
  │          ├─ Check card validity
  │          ├─ Verify sufficient funds
  │          └─ Generate validation token
  │               └─> ✅ Bounty goes LIVE
  │
  ├──[3] Bounty visible to all users
  │     └─> Filtered by location, category
  │
  │
👤 Finder (Bounty Hunter)
  │
  ├──[4] Finds item, submits claim
  │     ├─> Upload proof images
  │     ├─> Describe where/when found
  │     └─> AI analyzes images
  │          └─> Match score: 0.92 (high confidence)
  │
  ├──[5] Owner receives notification
  │     └─> Reviews claim in Messages tab
  │
  ├──[6] Owner & Finder coordinate return
  │     ├─> Message back and forth
  │     ├─> Propose meetup (with guardian oversight)
  │     └─> Meetup safety alerts triggered
  │
  ├──[7] Item returned, Owner verifies
  │     └─> Clicks "Confirm Return" button
  │
  ├──[8] INSTANT PAYOUT via Visa Direct
  │     ├─> Visa Direct API called
  │     ├─> $50 transferred to Finder's card
  │     └─> ⚡ Completes in < 30 seconds
  │
  ├──[9] XP & Badges awarded
  │     ├─> Finder: +500 XP
  │     ├─> Badge progress updated
  │     └─> Reputation score increased
  │
  └──[10] Both parties rate experience
        └─> Builds trust scores

💾 Data Updated:
   ├─ bounties.json: status → "completed"
   ├─ claims.json: status → "verified"
   ├─ bountyTransactions.json: new payout record
   ├─ users.json: XP updated, badges earned
   └─ bountyHunters.json: stats incremented
```

---

## 2. Inventory Trade Bounty Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  INVENTORY TRADE BOUNTY LIFECYCLE               │
└─────────────────────────────────────────────────────────────────┘

👤 User (Lost Item Owner)
  │
  ├──[1] Posts Bounty with inventory reward
  │     ├─> Lost: iPhone
  │     └─> Offers: Limited Edition Sneakers ($75 value)
  │          └─> Items marked as "reserved_for_bounty"
  │
  ├──[2] Bounty visible showing trade items
  │     └─> Finders can preview reward items
  │
  │
👤 Finder
  │
  ├──[3] Browses bounties, sees sneakers
  │     └─> "Perfect! I want those sneakers"
  │
  ├──[4] Finds iPhone, submits claim
  │     └─> Same verification process
  │
  ├──[5] Owner verifies claim
  │     └─> Confirms finder gets sneakers
  │
  ├──[6] IN-APP INVENTORY TRANSFER
  │     ├─> Sneakers moved from Owner to Finder
  │     ├─> inventory.json updated
  │     │    └─> item.ownerId changed
  │     │    └─> item.status → "available"
  │     └─> ✅ Trade completes instantly
  │
  ├──[7] XP & Badges awarded (same as monetary)
  │
  └──[8] Ratings exchanged

💾 Data Updated:
   ├─ bounties.json: status → "completed"
   ├─ claims.json: status → "verified"
   ├─ inventory.json: ownership transferred
   ├─ users.json: XP updated
   └─ bountyHunters.json: totalTradeValue += 75
```

---

## 3. High-Value Bounty with Identity Verification

```
┌─────────────────────────────────────────────────────────────────┐
│              HIGH-VALUE BOUNTY ($100+) WITH EXTRA SECURITY       │
└─────────────────────────────────────────────────────────────────┘

👤 Owner Posts $200 Bounty
  │
  ├──[1] System detects high-value
  │     └─> threshold: $100+
  │
  ├──[2] Visa Token Service Identity Verification
  │     ├─> 3D Secure challenge
  │     ├─> Device fingerprinting
  │     └─> Risk scoring
  │          ├─> Trust score: 0.85 ✅
  │          └─> Bounty approved
  │
  ├──[3] If user is minor (under 18):
  │     └─> Guardian Alert triggered
  │          ├─> "Anderson wants to post $200 bounty"
  │          ├─> Requires guardian approval
  │          └─> Guardian reviews in dashboard
  │
  │
👤 Finder Claims High-Value Bounty
  │
  ├──[4] System requires enhanced verification
  │     ├─> Visa Token Service identity check
  │     ├─> AI image analysis (stricter threshold)
  │     └─> Manual owner review required
  │
  ├──[5] Owner confirms + additional checks
  │     ├─> Video call option
  │     ├─> Serial number verification
  │     └─> Guardian oversight (if minor)
  │
  ├──[6] Payout with audit trail
  │     ├─> Visa Direct with transaction ID
  │     ├─> Full logging to bountyTransactions.json
  │     └─> Both parties KYC validated
  │
  └──[7] Extended rating period
        └─> 48 hours to report issues

🛡️ Security Layers:
   ├─ Payment validation
   ├─ Identity verification (both parties)
   ├─ Guardian oversight (minors)
   ├─ Enhanced AI matching
   ├─ Audit trail
   └─ Extended dispute window
```

---

## 4. Guardian Oversight Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GUARDIAN ALERT SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

🧒 Child (Anderson) takes bounty-related action
  │
  ├──[1] TRIGGER CONDITIONS:
  │     ├─ Posts any bounty
  │     ├─ Claims bounty from stranger
  │     ├─ Meetup proposed for return
  │     └─ High-value transaction ($50+)
  │
  ├──[2] Alert created in Guardian Dashboard
  │     ├─> Type: "bounty_posted"
  │     ├─> Severity: "medium"
  │     └─> RequiresApproval: true
  │
  │
👨‍👩‍👧 Guardian (Mike Anderson) receives notification
  │
  ├──[3] Views alert in Guardian Dashboard
  │     ├─> Child: Anderson
  │     ├─> Action: "Posted $25 bounty for lost GameBoy"
  │     └─> Details: Full bounty information
  │          ├─ Item details
  │          ├─ Reward amount
  │          └─ Payment method used
  │
  ├──[4] Guardian reviews and decides:
  │     │
  │     ├─ [Option A] APPROVE
  │     │   └─> Bounty goes live
  │     │        └─> Child notified
  │     │
  │     ├─ [Option B] REJECT
  │     │   └─> Bounty cancelled
  │     │        ├─> Payment validation voided
  │     │        └─> Child receives explanation
  │     │
  │     └─ [Option C] MODIFY
  │         └─> Request changes (lower amount, etc.)
  │              └─> Child makes adjustments
  │                   └─> Re-submit for approval
  │
  └──[5] Ongoing monitoring
        └─> Guardian sees all claim activity
             ├─ Who's claiming
             ├─ Messages exchanged
             ├─ Meetup proposals
             └─ Final completion

📊 Guardian Dashboard Shows:
   ├─ Active bounties posted by child
   ├─ Claims child is pursuing
   ├─ Total exposure (money/items at risk)
   ├─ Safety score for each transaction
   └─ History of completed bounties
```

---

## 5. AI Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-POWERED CLAIM VERIFICATION                │
└─────────────────────────────────────────────────────────────────┘

Finder submits claim with proof images
  │
  ├──[1] Images sent to Gemini Vision API
  │     │
  │     ├─> ORIGINAL BOUNTY IMAGES (from owner):
  │     │    ├─ iPhone_front.jpg
  │     │    ├─ iPhone_back.jpg
  │     │    └─ iPhone_case.jpg
  │     │
  │     └─> CLAIM PROOF IMAGES (from finder):
  │          ├─ found_phone_1.jpg
  │          ├─ found_phone_2.jpg
  │          └─ serial_number.jpg
  │
  ├──[2] AI Analysis Prompt:
  │     """
  │     Compare these images and determine if they show the same item.
  │     
  │     Original item features:
  │     - Black iPhone 14 Pro
  │     - Blue phone case with scratches
  │     - Cracked screen protector (top left)
  │     - Serial: F2LY8QXXX
  │     
  │     Analyze found item for:
  │     1. Device model match
  │     2. Case visual similarity
  │     3. Damage pattern match
  │     4. Serial number if visible
  │     5. Overall probability score (0-1)
  │     
  │     Return JSON with confidence level.
  │     """
  │
  ├──[3] AI Response:
  │     {
  │       "matchScore": 0.94,
  │       "confidence": "high",
  │       "reasoning": [
  │         "Device model matches exactly",
  │         "Case color and scratch patterns identical",
  │         "Screen damage in same location",
  │         "Serial number partially visible, matches format"
  │       ],
  │       "concerns": [],
  │       "recommendation": "auto_verify"
  │     }
  │
  ├──[4] Decision Logic:
  │     │
  │     ├─ IF matchScore >= 0.90:
  │     │   └─> AUTO-VERIFY ✅
  │     │        ├─ Owner notified of high-confidence match
  │     │        ├─ Claim status: "verified"
  │     │        └─> Expedited to payout
  │     │
  │     ├─ ELSE IF matchScore 0.70-0.89:
  │     │   └─> NEEDS OWNER REVIEW ⚠️
  │     │        ├─ Show AI analysis to owner
  │     │        ├─ Owner makes final decision
  │     │        └─> Owner can ask for more proof
  │     │
  │     └─ ELSE matchScore < 0.70:
  │         └─> LIKELY NOT A MATCH ❌
  │              ├─ Claim rejected automatically
  │              ├─ Finder can appeal with more evidence
  │              └─> Prevents fraud
  │
  └──[5] Learning System:
        └─> Owner feedback trains model
             ├─ "Yes, this was my item" → Reinforce
             ├─ "No, not my item" → Flag false positive
             └─> Improves accuracy over time

🎯 AI Accuracy Metrics:
   ├─ Target: 95%+ correct auto-verifications
   ├─ False positive rate: < 2%
   ├─ Owner override rate: Track and learn
   └─ Continuous improvement
```

---

## 6. Badge Progression Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                BOUNTY HUNTER BADGE PROGRESSION                  │
└─────────────────────────────────────────────────────────────────┘

👤 New User (No Badge)
  │
  ├──[1] First successful return
  │     └─> +1000 XP (first-time bonus)
  │          └─> Achievement unlocked notification
  │
  ├──[2] 5 successful returns
  │     └─> 🥉 BRONZE HUNTER
  │          ├─ Badge awarded
  │          ├─ Perks unlocked:
  │          │   └─ 1.2x XP multiplier
  │          └─ Profile flair: "🥉 Bronze Hunter"
  │
  ├──[3] 15 successful returns
  │     └─> 🥈 SILVER HUNTER
  │          ├─ Perks unlocked:
  │          │   ├─ 1.5x XP multiplier
  │          │   └─ Early access: 12 hours
  │          └─> See high-value bounties before others
  │
  ├──[4] 30 returns + 85% success rate
  │     └─> 🥇 GOLD HUNTER
  │          ├─ Elite status
  │          ├─ Perks unlocked:
  │          │   ├─ 2.0x XP multiplier
  │          │   ├─ Early access: 24 hours
  │          │   └─ Priority verification
  │          └─> Claims reviewed first
  │
  └──[5] 50+ returns + 90% success + 4.5★ rating
        └─> ⭐ ELITE HUNTER
             ├─ Legendary status
             ├─ Perks unlocked:
             │   ├─ 2.5x XP multiplier
             │   ├─ Early access: 48 hours
             │   ├─ Priority verification
             │   └─ Custom profile banner
             └─> Top 1% of hunters

📊 Progression Tracking:
   ├─ Real-time stats on profile
   ├─ Progress bars to next badge
   ├─ Notifications on milestones
   └─ Leaderboard position

💰 Badge Value:
   Bronze Hunter over 10 bounties:
     Base XP: 500 × 10 = 5,000
     With multiplier: 5,000 × 1.2 = 6,000
     Bonus XP earned: +1,000
   
   Elite Hunter over 10 bounties:
     Base XP: 500 × 10 = 5,000
     With multiplier: 5,000 × 2.5 = 12,500
     Bonus XP earned: +7,500 🚀
```

---

## 7. Early Access System (Badge Perk)

```
┌─────────────────────────────────────────────────────────────────┐
│               EARLY ACCESS TO HIGH-VALUE BOUNTIES               │
└─────────────────────────────────────────────────────────────────┘

Owner posts $150 bounty (high-value)
  │
  ├──[1] System detects threshold: $100+
  │     └─> Triggers early access period
  │
  ├──[2] Visibility Tiers:
  │     │
  │     ├─ T-48h: ⭐ ELITE HUNTERS only
  │     │   └─> 5 Elite hunters see it first
  │     │        └─> Best chance to claim
  │     │
  │     ├─ T-24h: 🥇 GOLD HUNTERS join
  │     │   └─> 50 Gold+ hunters now see it
  │     │        └─> Still competitive advantage
  │     │
  │     ├─ T-12h: 🥈 SILVER HUNTERS join
  │     │   └─> 200 Silver+ hunters can see it
  │     │        └─> Getting crowded
  │     │
  │     └─ T-0h: 🌍 PUBLIC (all users)
  │         └─> Everyone sees it now
  │              └─> Likely already claimed by Elite
  │
  └──[3] Incentivizes badge progression
        └─> "Become Elite to see best bounties first!"

🎯 Why This Works:
   ├─ Rewards dedicated hunters
   ├─ Higher success rates for badged users
   ├─ Creates aspirational goals
   └─ Distributes high-value bounties fairly
```

---

## 8. Dispute Resolution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISPUTE RESOLUTION PROCESS                   │
└─────────────────────────────────────────────────────────────────┘

Issue Occurs:
  │
  ├─ SCENARIO A: Finder claims wrong item
  │   Owner: "This isn't my phone!"
  │
  ├─ SCENARIO B: Owner won't verify legitimate return
  │   Finder: "I returned it but they won't confirm!"
  │
  └─ SCENARIO C: Payment issue
      Finder: "I didn't receive the bounty!"

  │
  ├──[1] Either party opens dispute
  │     └─> Within 48 hours of completion
  │          └─> Claim status: "disputed"
  │
  ├──[2] Evidence collection
  │     ├─> Original bounty details
  │     ├─> Claim proof images
  │     ├─> Message history
  │     ├─> AI match analysis
  │     └─> Photos of returned item
  │
  ├──[3] Platform review
  │     ├─> AI re-analyzes images
  │     ├─> Message sentiment analysis
  │     ├─> Guardian input (if minor)
  │     └─> User history/ratings
  │
  ├──[4] Resolution options:
  │     │
  │     ├─ REFUND OWNER
  │     │   └─> If finder clearly wrong item
  │     │        └─> Finder loses XP/rating
  │     │
  │     ├─ PAY FINDER
  │     │   └─> If owner unfairly withheld
  │     │        └─> Owner loses reputation
  │     │
  │     ├─ SPLIT BOUNTY
  │     │   └─> If partial return/unclear
  │     │        └─> Compromise solution
  │     │
  │     └─ ESCALATE TO HUMAN REVIEW
  │         └─> Complex cases
  │              └─> Final decision by support team
  │
  └──[5] Account actions
        ├─> Repeated disputes → warnings
        ├─> Fraud detected → ban
        └─> Good faith errors → education

📊 Dispute Prevention:
   ├─ Clear evidence requirements
   ├─ AI pre-verification
   ├─ Guardian oversight
   ├─ Rating system
   └─ Transparent process
```

---

## 9. Complete User Journey Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  TYPICAL BOUNTY LIFECYCLE TIMELINE              │
└─────────────────────────────────────────────────────────────────┘

DAY 1 - Monday 9:00 AM
  📱 Owner loses iPhone at park
  
  9:30 AM
  ├─> Owner posts bounty: $50 monetary
  ├─> Payment validated ✅
  └─> Bounty goes live
  
  10:00 AM - 6:00 PM
  └─> 45 users view bounty
       └─> 3 users save it to watchlist

DAY 2 - Tuesday 2:00 PM
  🔍 Finder discovers phone on bench
  
  2:15 PM
  ├─> Opens Swappy app
  ├─> Browses "Nearby Bounties"
  └─> Sees iPhone bounty (0.5 miles away)
  
  2:20 PM
  ├─> Submits claim with photos
  └─> AI match score: 0.93 ✅
  
  2:21 PM
  └─> Owner receives notification
  
  2:30 PM - 3:00 PM
  ├─> Owner & Finder message
  ├─> Confirm it's the right phone
  └─> Plan meetup at coffee shop (public)
  
  3:00 PM
  └─> Guardian alert sent (if applicable)
       └─> "Meetup proposed for bounty return"

DAY 2 - Tuesday 4:00 PM
  🤝 Meetup happens
  
  4:15 PM
  ├─> Owner receives phone
  ├─> Verifies serial number
  └─> Confirms in app: "Return Verified"
  
  4:16 PM ⚡
  └─> Visa Direct instant payout
       ├─ $50 → Finder's card
       └─ ✅ Transaction ID: VD_abc123
  
  4:17 PM
  └─> XP & Badge updates
       ├─ Finder: +500 XP
       ├─ Progress: 3/5 returns to Bronze
       └─ Notification: "2 more returns to earn 🥉!"

DAY 2 - Tuesday 5:00 PM
  ⭐ Both parties rate experience
  
  Owner rates Finder: ★★★★★
  └─> "Super fast and honest!"
  
  Finder rates Owner: ★★★★★
  └─> "Easy meetup, quick verification!"

TOTAL TIME: 31 hours from loss to recovery
TOTAL INTERACTIONS: 8 messages
PAYOUT TIME: < 30 seconds
SUCCESS! 🎉
```

---

## 10. System Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│               HOW BOUNTY SYSTEM CONNECTS TO EXISTING            │
└─────────────────────────────────────────────────────────────────┘

Bounty System (NEW)
  │
  ├──[Integrates with]─> Inventory System
  │                      ├─ Item selection for trade bounties
  │                      ├─ Reservation logic
  │                      └─ Transfer mechanism
  │
  ├──[Integrates with]─> Messages System
  │                      ├─ Bounty claim messages
  │                      ├─ Claim action buttons
  │                      └─ Return coordination
  │
  ├──[Integrates with]─> XP & Gamification
  │                      ├─ XP rewards for returns
  │                      ├─ Badge progression
  │                      └─ Multipliers for hunters
  │
  ├──[Integrates with]─> Guardian Dashboard
  │                      ├─ New alert types
  │                      ├─ Approval workflows
  │                      └─ Activity monitoring
  │
  ├──[Integrates with]─> Meetup Detection
  │                      ├─ Safety suggestions
  │                      ├─ Public location tips
  │                      └─ Guardian notifications
  │
  ├──[Integrates with]─> User Authentication
  │                      ├─ Identity verification
  │                      ├─ Payment validation
  │                      └─ Age restrictions
  │
  └──[Integrates with]─> AI Systems
                         ├─ Image matching (Gemini Vision)
                         ├─ Fraud detection
                         └─ Auto-verification

External APIs (NEW)
  │
  ├─> Visa Direct API
  │    └─ Instant payouts
  │
  ├─> Payment Account Validation
  │    └─ Verify payment methods
  │
  └─> Visa Token Service
       └─ Identity verification
```

---

This comprehensive flow documentation shows exactly how data moves through the system, how different components interact, and what the user experience looks like at every step! Ready to implement when you give the green light. 🚀

