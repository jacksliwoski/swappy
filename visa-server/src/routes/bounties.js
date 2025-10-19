const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { findUserById } = require('../db/filedb');
const { validatePaymentAccount } = require('../visa/paymentValidation');
const { sendPayout } = require('../visa/visaDirect');
const { verifyUserIdentity, performFraudCheck } = require('../visa/tokenService');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// File paths
const bountiesFile = path.join(__dirname, '../../data/bounties.json');
const claimsFile = path.join(__dirname, '../../data/claims.json');
const huntersFile = path.join(__dirname, '../../data/bountyHunters.json');
const transactionsFile = path.join(__dirname, '../../data/bountyTransactions.json');

// Helper to read/write JSON files
async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
    return file.includes('bounties') ? { bounties: {}, byId: {}, byUser: {}, active: [], demo: {} } :
           file.includes('claims') ? { claims: {}, byId: {}, byBounty: {}, byUser: {} } :
           file.includes('hunters') ? { hunters: {}, byId: {} } :
           { transactions: {}, byId: {}, byBounty: {}, byUser: {} };
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// GET /api/bounties - List all bounties with filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { bountyType, type, category, location, status, sort, search } = req.query;
    
    console.log('[Bounties API] Fetching bounties with filters:', req.query);
    
    const db = await readJson(bountiesFile);
    
    // Get all bounties (including demo)
    let allBounties = [
      ...Object.values(db.bounties || {}),
      ...Object.values(db.demo || {})
    ];
    
    // Apply filters
    if (bountyType) {
      allBounties = allBounties.filter(b => b.bountyType === bountyType);
    }
    if (type) { // monetary or inventory
      allBounties = allBounties.filter(b => b.rewardType === type);
    }
    if (category) {
      allBounties = allBounties.filter(b => {
        if (b.bountyType === 'treasure_hunt') {
          return b.treasureHunt?.category === category;
        }
        return b.lostItem?.category === category;
      });
    }
    if (status) {
      allBounties = allBounties.filter(b => b.status === status);
    } else {
      // Default to active only
      allBounties = allBounties.filter(b => b.status === 'active');
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allBounties = allBounties.filter(b => {
        const title = b.bountyType === 'treasure_hunt' ? b.treasureHunt?.title : b.lostItem?.title;
        const desc = b.bountyType === 'treasure_hunt' ? b.treasureHunt?.description : b.lostItem?.description;
        return (title && title.toLowerCase().includes(searchLower)) ||
               (desc && desc.toLowerCase().includes(searchLower));
      });
    }
    
    // Enrich with user data
    for (const bounty of allBounties) {
      const user = await findUserById(bounty.userId);
      if (user) {
        bounty.creator = {
          id: user.id,
          username: user.username,
          avatar: user.avatar || '😊',
          level: user.level || 1
        };
      }
    }
    
    // Sort
    if (sort === 'reward_high') {
      allBounties.sort((a, b) => {
        const amountA = a.monetaryReward?.amount || 0;
        const amountB = b.monetaryReward?.amount || 0;
        return amountB - amountA;
      });
    } else if (sort === 'reward_low') {
      allBounties.sort((a, b) => {
        const amountA = a.monetaryReward?.amount || 0;
        const amountB = b.monetaryReward?.amount || 0;
        return amountA - amountB;
      });
    } else {
      // Default: newest first
      allBounties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    console.log('[Bounties API] Returning', allBounties.length, 'bounties');
    
    res.json({ ok: true, bounties: allBounties });
  } catch (error) {
    console.error('[Bounties API] Error fetching bounties:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch bounties' });
  }
});

// GET /api/bounties/:id - Get specific bounty
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readJson(bountiesFile);
    
    let bounty = db.bounties[id] || db.byId[id] || db.demo[id];
    
    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }
    
    // Enrich with user data
    const user = await findUserById(bounty.userId);
    if (user) {
      bounty = {
        ...bounty,
        creator: {
          id: user.id,
          username: user.username,
          avatar: user.avatar || '😊',
          level: user.level || 1
        }
      };
    }
    
    // Increment view count
    bounty.viewCount = (bounty.viewCount || 0) + 1;
    if (db.bounties[id]) {
      db.bounties[id].viewCount = bounty.viewCount;
      await writeJson(bountiesFile, db);
    }
    
    res.json({ ok: true, bounty });
  } catch (error) {
    console.error('[Bounties API] Error fetching bounty:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch bounty' });
  }
});

// POST /api/bounties - Create new bounty
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    const bountyData = req.body;
    
    console.log('[Bounties API] Creating bounty:', { userId: currentUser.id, type: bountyData.bountyType });
    
    // Validate payment if monetary reward
    if (bountyData.rewardType === 'monetary') {
      const { paymentMethod } = bountyData.monetaryReward || {};
      
      if (!paymentMethod) {
        return res.status(400).json({ ok: false, error: 'Payment method required for monetary bounty' });
      }
      
      const validation = await validatePaymentAccount({
        cardNumber: paymentMethod.cardNumber,
        cvv: paymentMethod.cvv,
        expiry: paymentMethod.expiry
      });
      
      if (!validation.valid) {
        return res.status(400).json({ ok: false, error: 'Payment validation failed', details: validation });
      }
      
      bountyData.monetaryReward.paymentValidated = true;
      bountyData.monetaryReward.validationToken = validation.validationToken;
      // Don't store card details
      delete bountyData.monetaryReward.paymentMethod;
    }
    
    // Create bounty
    const bountyId = `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const bounty = {
      id: bountyId,
      userId: currentUser.id,
      status: 'active',
      ...bountyData,
      createdAt: now,
      expiresAt: bountyData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 0,
      claimCount: 0
    };
    
    // Initialize treasure hunt stats if treasure hunt
    if (bounty.bountyType === 'treasure_hunt') {
      bounty.treasureStats = {
        activeHunters: 0,
        totalAttempts: 0,
        avgTimeToFind: null,
        socialShares: 0,
        leaderboardRank: null
      };
    }
    
    // Save bounty
    const db = await readJson(bountiesFile);
    db.bounties[bountyId] = bounty;
    db.byId[bountyId] = bounty;
    
    if (!db.byUser[currentUser.id]) {
      db.byUser[currentUser.id] = [];
    }
    db.byUser[currentUser.id].push(bountyId);
    
    if (bounty.status === 'active') {
      db.active.push(bountyId);
    }
    
    await writeJson(bountiesFile, db);
    
    console.log('[Bounties API] Bounty created:', bountyId);
    
    res.json({ ok: true, bounty });
  } catch (error) {
    console.error('[Bounties API] Error creating bounty:', error);
    res.status(500).json({ ok: false, error: 'Failed to create bounty' });
  }
});

// POST /api/bounties/:id/claim - Submit a claim
router.post('/:id/claim', requireAuth, async (req, res) => {
  try {
    const { id: bountyId } = req.params;
    const currentUser = req.user;
    const claimData = req.body;
    
    console.log('[Bounties API] Submitting claim:', { bountyId, userId: currentUser.id });
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.demo[bountyId];
    
    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }
    
    if (bounty.userId === currentUser.id) {
      return res.status(400).json({ ok: false, error: 'Cannot claim your own bounty' });
    }
    
    if (bounty.status !== 'active') {
      return res.status(400).json({ ok: false, error: 'Bounty is not active' });
    }
    
    // Create claim
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const claim = {
      id: claimId,
      bountyId,
      claimerId: currentUser.id,
      status: 'submitted',
      proofOfPossession: claimData.proofOfPossession || {},
      selectedRewardItems: claimData.selectedRewardItems || [],
      verificationMethod: bounty.bountyType === 'treasure_hunt' ? 'location_proof' : 'photo_match',
      verificationScore: null,
      ownerConfirmed: false,
      messages: [],
      createdAt: now,
      completedAt: null
    };
    
    // For treasure hunts, auto-verify if location is valid
    if (bounty.bountyType === 'treasure_hunt') {
      // TODO: Add GPS verification logic
      claim.verificationScore = 0.95; // High confidence for location match
      claim.status = 'verified';
    }
    
    // Save claim
    const claimsDb = await readJson(claimsFile);
    claimsDb.claims[claimId] = claim;
    claimsDb.byId[claimId] = claim;
    
    if (!claimsDb.byBounty[bountyId]) {
      claimsDb.byBounty[bountyId] = [];
    }
    claimsDb.byBounty[bountyId].push(claimId);
    
    if (!claimsDb.byUser[currentUser.id]) {
      claimsDb.byUser[currentUser.id] = [];
    }
    claimsDb.byUser[currentUser.id].push(claimId);
    
    await writeJson(claimsFile, claimsDb);
    
    // Update bounty claim count
    bounty.claimCount = (bounty.claimCount || 0) + 1;
    if (bountiesDb.bounties[bountyId]) {
      bountiesDb.bounties[bountyId].claimCount = bounty.claimCount;
      await writeJson(bountiesFile, bountiesDb);
    }
    
    console.log('[Bounties API] Claim submitted:', claimId);
    
    res.json({ ok: true, claim });
  } catch (error) {
    console.error('[Bounties API] Error submitting claim:', error);
    res.status(500).json({ ok: false, error: 'Failed to submit claim' });
  }
});

// POST /api/bounties/:id/verify - Verify and complete claim (owner only)
router.post('/:id/verify', requireAuth, async (req, res) => {
  try {
    const { id: bountyId } = req.params;
    const currentUser = req.user;
    const { claimId, confirmed, rating, review } = req.body;
    
    console.log('[Bounties API] Verifying claim:', { bountyId, claimId, confirmed });
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.demo[bountyId];
    
    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }
    
    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only bounty creator can verify' });
    }
    
    // Get claim
    const claimsDb = await readJson(claimsFile);
    const claim = claimsDb.claims[claimId] || claimsDb.byId[claimId];
    
    if (!claim) {
      return res.status(404).json({ ok: false, error: 'Claim not found' });
    }
    
    if (!confirmed) {
      // Rejected
      claim.status = 'rejected';
      claimsDb.claims[claimId] = claim;
      await writeJson(claimsFile, claimsDb);
      return res.json({ ok: true, claim });
    }
    
    // Verified - process payout
    claim.status = 'completed';
    claim.ownerConfirmed = true;
    claim.completedAt = new Date().toISOString();
    claim.rating = rating;
    claim.review = review;
    
    let payout = null;
    
    if (bounty.rewardType === 'monetary') {
      // TODO: Get claimer's payment info
      // For now, mock the payout
      payout = await sendPayout({
        recipientPAN: '4111111111111111', // Would come from claimer's profile
        amount: bounty.monetaryReward.amount,
        currency: bounty.monetaryReward.currency,
        transactionId: claimId,
        senderAccountNumber: process.env.PLATFORM_ACCOUNT_NUMBER
      });
      
      // Save transaction
      const transactionsDb = await readJson(transactionsFile);
      const transactionId = `txn_${Date.now()}`;
      transactionsDb.transactions[transactionId] = {
        id: transactionId,
        bountyId,
        claimId,
        type: 'payout',
        amount: bounty.monetaryReward.amount,
        currency: bounty.monetaryReward.currency,
        visaTransactionId: payout.transactionId,
        status: payout.status,
        timestamp: payout.timestamp
      };
      await writeJson(transactionsFile, transactionsDb);
    } else if (bounty.rewardType === 'inventory') {
      // TODO: Transfer inventory items
      console.log('[Bounties API] Inventory transfer:', claim.selectedRewardItems);
    }
    
    // Update claim
    claimsDb.claims[claimId] = claim;
    await writeJson(claimsFile, claimsDb);
    
    // Update bounty status
    bounty.status = 'completed';
    if (bountiesDb.bounties[bountyId]) {
      bountiesDb.bounties[bountyId].status = 'completed';
      await writeJson(bountiesDb, bountiesDb);
    }
    
    // Update bounty hunter stats
    const huntersDb = await readJson(huntersFile);
    let hunter = huntersDb.hunters[claim.claimerId] || huntersDb.byId[claim.claimerId];
    
    if (!hunter) {
      hunter = {
        userId: claim.claimerId,
        stats: {
          totalClaims: 0,
          successfulReturns: 0,
          successRate: 0,
          totalEarnings: 0,
          totalTradeValue: 0,
          xpEarned: 0
        },
        badges: [],
        perks: {},
        rating: 0,
        reviews: [],
        joinedAt: new Date().toISOString()
      };
    }
    
    hunter.stats.totalClaims++;
    hunter.stats.successfulReturns++;
    hunter.stats.successRate = hunter.stats.successfulReturns / hunter.stats.totalClaims;
    
    if (bounty.rewardType === 'monetary') {
      hunter.stats.totalEarnings += bounty.monetaryReward.amount;
    }
    
    const xpReward = bounty.xpReward || (bounty.bountyType === 'treasure_hunt' ? 750 : 500);
    hunter.stats.xpEarned += xpReward;
    
    huntersDb.hunters[claim.claimerId] = hunter;
    huntersDb.byId[claim.claimerId] = hunter;
    await writeJson(huntersFile, huntersDb);
    
    console.log('[Bounties API] Claim verified and payout processed');
    
    res.json({
      ok: true,
      claim,
      payout,
      xpAwarded: xpReward,
      badgeProgress: {
        current: hunter.stats.successfulReturns,
        next: hunter.stats.successfulReturns < 5 ? 'bronze' : hunter.stats.successfulReturns < 15 ? 'silver' : 'gold',
        remaining: hunter.stats.successfulReturns < 5 ? (5 - hunter.stats.successfulReturns) : hunter.stats.successfulReturns < 15 ? (15 - hunter.stats.successfulReturns) : (30 - hunter.stats.successfulReturns)
      }
    });
  } catch (error) {
    console.error('[Bounties API] Error verifying claim:', error);
    res.status(500).json({ ok: false, error: 'Failed to verify claim' });
  }
});

// GET /api/bounties/my - Get user's posted bounties
router.get('/my', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    const db = await readJson(bountiesFile);
    
    const userBountyIds = db.byUser[currentUser.id] || [];
    const bounties = userBountyIds.map(id => db.bounties[id] || db.byId[id]).filter(Boolean);
    
    res.json({ ok: true, bounties });
  } catch (error) {
    console.error('[Bounties API] Error fetching user bounties:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch bounties' });
  }
});

module.exports = router;

