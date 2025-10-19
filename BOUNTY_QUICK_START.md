# 🚀 Lost & Found Bounty System - Quick Start

## ⚡ **Get Started in 3 Minutes**

### **Step 1: Start All Servers**

Open 3 terminal windows:

**Terminal 1** - AI Server (Port 3000):
```bash
npm start
```
Wait for: `🚀 Swappy server running at http://localhost:3000`

**Terminal 2** - Data/API Server (Port 7002):
```bash
cd visa-server
npm start
```
Wait for: `[swappy] listening on http://localhost:7002`

**Terminal 3** - Frontend (Port 5173):
```bash
cd web
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### **Step 2: Open in Browser**

Navigate to: **http://localhost:5173**

### **Step 3: Sign In**

Use demo account:
- **Email:** `jack@swappy.demo`
- **Password:** `password123`

---

## 🎮 **Test the Features**

### **Test 1: Browse Treasure Hunts** (30 seconds)

1. Click **"Lost & Found Bounty"** in the menu
2. You should see 1 demo treasure hunt:
   - 🎮 Epic GameBoy Money Drop!
   - $25 reward
   - Downtown Seattle
   - 5 active hunters

3. Click the card to view details
4. See the clues (some locked, some unlocked)
5. See the reward and hunt area

**✅ Success:** You can browse and view bounties!

---

### **Test 2: Create Treasure Hunt** (2 minutes)

1. Click **"+ Create Bounty"** button
2. Select **"🎮 Treasure Hunt"** (already selected)
3. Fill in:
   - **Title:** "My First Treasure Hunt!"
   - **Description:** "Hidden prize in the park!"
   - **Hunt Area:** "Central Park, NYC"
   - **Search Radius:** 0.5 miles
   - **Duration:** 4 hours
   - **Clue 1:** "Near the big fountain ⛲"
   - **Clue 2:** "Under the red bench 🪑"
   - **Clue 3:** "Behind the oak tree 🌳" (optional)

4. Reward section:
   - Keep **"💰 Cash Reward"** selected
   - **Amount:** $25
   - (Payment validation happens automatically in mock mode)

5. Click **"Create Treasure Hunt"**

6. You'll be redirected to your new bounty detail page!

**✅ Success:** Your treasure hunt is live!

---

### **Test 3: View Your Bounty** (1 minute)

You should be on the detail page now. Check:

- [x] Title displays correctly
- [x] Description shows
- [x] Location is visible
- [x] All 3 clues are listed (1 unlocked, 2 locked)
- [x] $25 reward displayed
- [x] "This is your bounty" message (since you created it)

Navigate back to Lost & Found main page:
- Your bounty should appear in the list!

**✅ Success:** Bounty created and visible!

---

### **Test 4: Claim a Bounty** (2 minutes)

To fully test claiming, you need 2 accounts. But here's the flow:

1. Sign out (or use incognito window)
2. Sign in as **Anderson:**
   - Email: `anderson@swappy.demo`
   - Password: `password123`

3. Go to Lost & Found
4. Click on **Jack's** treasure hunt (the one you just created)
5. Click **"🎯 I Found It!"** button
6. Write description: "Found it near the fountain!"
7. Click **"Submit Claim"**
8. You'll see success message!

**In a real scenario:**
- Jack would get notified
- Jack reviews and clicks "Verify"
- Anderson gets instant $25 payout via Visa Direct
- Anderson earns 750 XP + badge progress

**✅ Success:** Claim system works!

---

## 📊 **Check the Data**

Open these files to see your data persisting:

```
visa-server/data/bounties.json    - Your created bounties
visa-server/data/claims.json      - Submitted claims
visa-server/data/bountyHunters.json - Hunter stats
```

---

## 🎯 **Quick Feature Checklist**

Try these to explore all features:

### **Bounty Types**
- [ ] Create treasure hunt
- [ ] Create lost item bounty
- [ ] Toggle between hunt/lost item mode

### **Reward Types**
- [ ] Post with cash reward
- [ ] Post with inventory trade reward

### **Browsing**
- [ ] View "All Bounties" tab
- [ ] View "Treasure Hunts" tab  
- [ ] View "Lost Items" tab
- [ ] Click a bounty card

### **Details**
- [ ] View full bounty details
- [ ] See progressive clues (locked/unlocked)
- [ ] Check reward amount
- [ ] See creator profile

### **Actions**
- [ ] Create your own bounty
- [ ] Submit a claim
- [ ] View active hunter count

---

## 🐛 **Troubleshooting**

### **"Bounty not found" error**
- Make sure visa-server is running on port 7002
- Check terminal for any errors
- Restart visa-server: `cd visa-server && npm start`

### **"Failed to load bounties"**
- Check that you're signed in
- Open browser console (F12) for errors
- Verify API server is running

### **Payment validation fails**
- This is expected in mock mode with invalid cards
- Use card: `4111111111111111` (demo card)
- Or set `MOCK_VISA_API=true` in `.env`

### **Clues don't unlock**
- Clues unlock based on time
- Clue 2: 2 hours after hunt starts
- Clue 3: 4 hours after hunt starts
- For testing, modify the `unlockAt` times in bounty data

---

## 💰 **Visa API Modes**

### **Mock Mode** (Current - Safe for Testing)
```bash
# In visa-server/.env
MOCK_VISA_API=true
```

- Simulates successful payments
- No real money transferred
- Perfect for development
- Transaction IDs start with "VD_MOCK_"

### **Production Mode** (When Ready)
```bash
# In visa-server/.env
MOCK_VISA_API=false
VISA_USER_ID=your_actual_id
VISA_PASSWORD=your_actual_password
VISA_CERT_PATH=path/to/cert.pem
VISA_KEY_PATH=path/to/key.pem
```

- Real Visa Direct payouts
- Real payment validation
- Real transaction logs
- **Use with caution!**

---

## 🎨 **UI Features to Notice**

### **Hover Effects**
- Hover over bounty cards → lifts up
- Border changes to brand color
- Shadow increases

### **Status Badges**
- 🎮 TREASURE HUNT (purple)
- 📦 LOST ITEM (blue)
- ACTIVE / COMPLETED states

### **Progressive Disclosure**
- Locked clues show 🔒
- Unlocked clues show 🔓
- Time-based reveals

### **Responsive Design**
- Works on desktop
- Works on tablet
- Works on mobile

---

## 📚 **API Endpoints to Test**

### **Using curl or Postman:**

**List all treasure hunts:**
```bash
curl http://localhost:7002/api/bounties?bountyType=treasure_hunt \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get specific bounty:**
```bash
curl http://localhost:7002/api/bounties/bounty_demo_1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create bounty:**
```bash
curl -X POST http://localhost:7002/api/bounties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bountyType": "treasure_hunt",
    "treasureHunt": {...},
    "rewardType": "monetary",
    "monetaryReward": {...}
  }'
```

Get your token from: localStorage after signing in, or from network tab.

---

## 🎉 **Success Metrics**

You'll know it's working when:

- ✅ You see the demo treasure hunt
- ✅ You can create your own bounty
- ✅ Your bounty appears in the list
- ✅ You can click and view details
- ✅ Clues show with lock/unlock states
- ✅ Claims can be submitted
- ✅ Data persists in JSON files

---

## 🆘 **Need Help?**

### **Check Logs**

**AI Server logs:**
```bash
# Terminal 1 output
[Bounty AI] Verifying claim...
```

**API Server logs:**
```bash
# Terminal 2 output
[Bounties API] Creating bounty: {...}
[Bounties API] Bounty created: bounty_xxx
```

**Browser Console:**
```bash
# Open DevTools (F12) → Console
[Bounties] Fetching bounties with filters: {...}
[Bounties] Received result: {...}
```

### **Restart Everything**

If something's broken:
1. Stop all 3 terminals (Ctrl+C)
2. Delete `visa-server/data/bounties.json`
3. Restart all servers
4. Refresh browser

### **Check Documentation**

- `BOUNTY_SYSTEM_COMPLETE.md` - Full implementation details
- `LOST_AND_FOUND_ARCHITECTURE.md` - Architecture & API specs
- `BOUNTY_SYSTEM_FLOWS.md` - User flows
- `BOUNTY_QUICK_REFERENCE.md` - API reference

---

## 🚀 **Next: Go Live!**

When ready for production:

1. **Set up real Visa credentials**
   - Get production API keys
   - Add certificates
   - Set `MOCK_VISA_API=false`

2. **Deploy servers**
   - AI Server (port 3000)
   - API Server (port 7002)
   - Frontend (build & deploy)

3. **Configure domains**
   - Update CORS settings
   - Set production URLs
   - Enable HTTPS

4. **Test with real money**
   - Start with small amounts ($1-5)
   - Verify payouts work
   - Check transaction logs

5. **Launch! 🎊**
   - Announce to users
   - Create first treasure hunt
   - Watch it go viral!

---

## 💡 **Pro Tips**

1. **Create exciting treasure hunts**
   - Use emojis in clues (makes them fun!)
   - Start with easy clue, end with hard
   - Test the hunt yourself first

2. **Perfect for events**
   - Birthday parties
   - School events
   - Community gatherings
   - Promotional campaigns

3. **Build reputation**
   - Complete hunts fairly
   - Verify claims quickly
   - Rate participants
   - Build trust in community

4. **Go viral**
   - Record the hunt
   - Post on social media
   - Share with local groups
   - Create regular events

---

**Happy Treasure Hunting! 🗺️💰🎮**

---

**Created:** October 19, 2025  
**Status:** ✅ Ready to Test  
**Time to Get Started:** 3 minutes  
**Fun Factor:** 🌟🌟🌟🌟🌟

