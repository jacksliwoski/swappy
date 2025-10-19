const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { findUserById } = require('../db/filedb');
const { validatePaymentAccount } = require('../visa/paymentValidation');
const { sendPayout } = require('../visa/visaDirect');
const { verifyUserIdentity, performFraudCheck } = require('../visa/tokenService');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Debugging: log incoming requests to claims routes to help trace 404s
router.use((req, res, next) => {
  if (req.path.includes('/claims') || req.path.includes('/send-payout')) {
    console.log('[Bounties DBG] Incoming', req.method, req.originalUrl, 'user:', req.user ? req.user.id : 'anon');
  }
  next();
});

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

// GET /api/bounties/my - Get user's posted bounties
router.get('/my', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    console.log('[Bounties API] Fetching user bounties for:', currentUser.id);

    const db = await readJson(bountiesFile);

    const userBountyIds = db.byUser[currentUser.id] || [];
    const bounties = userBountyIds.map(id => db.bounties[id] || db.byId[id]).filter(Boolean);

    console.log('[Bounties API] Found', bounties.length, 'bounties for user:', currentUser.id);

    res.json({ ok: true, bounties });
  } catch (error) {
    console.error('[Bounties API] Error fetching user bounties:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch bounties' });
  }
});

// GET /api/bounties/:id/claims - Get claims for a specific bounty
router.get('/:id/claims', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user || {};
    const dataDir = path.resolve(__dirname, '..', '..', 'data');
    const bountiesPath = path.join(dataDir, 'bounties.json');
    const claimsPath = path.join(dataDir, 'claims.json');
    const usersPath = path.join(dataDir, 'users.json');

    const safeReadJson = async (p) => {
      try {
        const txt = await fs.readFile(p, 'utf8');
        return JSON.parse(txt);
      } catch (err) {
        console.error(`[bounties] failed to read/parse ${p}:`, err && err.message);
        return {};
      }
    };

    const bountiesDb = await safeReadJson(bountiesPath);
    const claimsDb = await safeReadJson(claimsPath);
    const usersDb = await safeReadJson(usersPath);

    // find bounty across possible shapes
    const bounty =
      (bountiesDb.bounties && bountiesDb.bounties[bountyId]) ||
      (bountiesDb.byId && bountiesDb.byId[bountyId]) ||
      bountiesDb[bountyId] ||
      null;

    if (!bounty) return res.status(404).json({ ok: false, error: 'Bounty not found' });

    // Allow owner OR monitoring/watch user to view claims
    const isOwner = bounty.userId && currentUser.id && bounty.userId === currentUser.id;
    const inMonitorLists =
      (Array.isArray(bounty.watchers) && bounty.watchers.includes(currentUser.id)) ||
      (Array.isArray(bounty.monitors) && bounty.monitors.includes(currentUser.id)) ||
      (Array.isArray(bounty.monitoredBy) && bounty.monitoredBy.includes(currentUser.id)) ||
      (Array.isArray(bounty.monitoring) && bounty.monitoring.includes && bounty.monitoring.includes(currentUser.id));

    if (!isOwner && !inMonitorLists) {
      // Still allow if server-side claim ownership implies access (edge-case)
      // but default to forbidden
      return res.status(403).json({ ok: false, error: 'Only bounty owner or monitor can view claims' });
    }

    // Collect claim IDs (prefer index, fallback to scanning)
    let claimIds = [];
    if (claimsDb.byBounty && Array.isArray(claimsDb.byBounty[bountyId]) && claimsDb.byBounty[bountyId].length) {
      claimIds = claimsDb.byBounty[bountyId];
    } else if (claimsDb.claims && typeof claimsDb.claims === 'object' && Object.keys(claimsDb.claims).length) {
      claimIds = Object.keys(claimsDb.claims).filter(cid => {
        const c = claimsDb.claims[cid];
        return c && String(c.bountyId) === String(bountyId);
      });
    } else if (claimsDb.byId && typeof claimsDb.byId === 'object') {
      claimIds = Object.keys(claimsDb.byId).filter(cid => {
        const c = claimsDb.byId[cid];
        return c && String(c.bountyId) === String(bountyId);
      });
    }

    // Build claim objects
    const claims = claimIds
      .map(id => (claimsDb.claims && claimsDb.claims[id]) || (claimsDb.byId && claimsDb.byId[id]) || null)
      .filter(Boolean);

    // Enrich with claimer info when possible
    const getUser = (uid) => {
      if (!uid) return null;
      return (usersDb.users && usersDb.users[uid]) || (usersDb.byId && usersDb.byId[uid]) || usersDb[uid] || null;
    };

    for (const c of claims) {
      const u = getUser(c.claimerId);
      if (u) {
        c.claimer = {
          id: u.id || u.username || c.claimerId,
          username: u.username || u.id || c.claimerId,
          avatar: u.avatar || null
        };
      }
    }

    console.log(`[bounties] returning ${claims.length} claims for bounty ${bountyId}`);
    return res.json({ ok: true, claims });
  } catch (err) {
    console.error('[bounties] error in /:id/claims:', err && err.stack ? err.stack : err);
    return res.status(500).json({ ok: false, error: 'Failed to fetch claims' });
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
    
    await writeJson(bountiesFile, db);
    
    res.status(201).json({ ok: true, bounty });
  } catch (error) {
    console.error('[Bounties API] Error creating bounty:', error);
    res.status(500).json({ ok: false, error: 'Failed to create bounty' });
  }
});

// POST /api/bounties/:id/claims - Create a claim for a bounty
router.post('/:id/claims', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user;
    const { message, proof } = req.body;
    
    console.log('[Bounties API] Creating claim for bounty:', bountyId, 'by user:', currentUser.id);
    
    // Validate request
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Claim message is required' });
    }
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];

    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }

    // Check if already claimed
    const claimsDb = await readJson(claimsFile);
    const userClaims = claimsDb.byUser[currentUser.id] || [];
    if (userClaims.includes(bountyId)) {
      return res.status(400).json({ ok: false, error: 'You have already claimed this bounty' });
    }
    
    // Create claim
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const claim = {
      id: claimId,
      bountyId,
      claimerId: currentUser.id,
      message,
      proof,
      status: 'pending',
      createdAt: now
    };
    
    // Save claim
    if (!claimsDb.claims) {
      claimsDb.claims = {};
    }
    claimsDb.claims[claimId] = claim;
    
    if (!claimsDb.byId) {
      claimsDb.byId = {};
    }
    claimsDb.byId[claimId] = claim;
    
    if (!claimsDb.byBounty) {
      claimsDb.byBounty = {};
    }
    if (!claimsDb.byBounty[bountyId]) {
      claimsDb.byBounty[bountyId] = [];
    }
    claimsDb.byBounty[bountyId].push(claimId);
    
    if (!claimsDb.byUser) {
      claimsDb.byUser = {};
    }
    if (!claimsDb.byUser[currentUser.id]) {
      claimsDb.byUser[currentUser.id] = [];
    }
    claimsDb.byUser[currentUser.id].push(claimId);
    
    await writeJson(claimsFile, claimsDb);
    
    // Update bounty claim count
    bounty.claimCount = (bounty.claimCount || 0) + 1;
    bountiesDb.bounties[bountyId] = bounty;
    bountiesDb.byId[bountyId] = bounty;
    
    await writeJson(bountiesFile, bountiesDb);
    
    res.status(201).json({ ok: true, claim });
  } catch (error) {
    console.error('[Bounties API] Error creating claim:', error);
    res.status(500).json({ ok: false, error: 'Failed to create claim' });
  }
});

// DELETE /api/bounties/:id/claims/:claimId - Delete a claim (owner only)
router.delete('/:id/claims/:claimId', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const claimId = req.params.claimId;
    const currentUser = req.user;

    const bountiesDb = await readJson(bountiesFile);
    const claimsDb = await readJson(claimsFile);

    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];
    if (!bounty) return res.status(404).json({ ok: false, error: 'Bounty not found' });

    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only the bounty creator can delete claims' });
    }

    // Remove claim from main map
    if (claimsDb.claims && claimsDb.claims[claimId]) {
      delete claimsDb.claims[claimId];
    }
    if (claimsDb.byId && claimsDb.byId[claimId]) {
      delete claimsDb.byId[claimId];
    }

    // Remove from byBounty index
    if (claimsDb.byBounty && Array.isArray(claimsDb.byBounty[bountyId])) {
      claimsDb.byBounty[bountyId] = claimsDb.byBounty[bountyId].filter(id => id !== claimId);
      if (claimsDb.byBounty[bountyId].length === 0) delete claimsDb.byBounty[bountyId];
    }

    // Remove from byUser index
    if (claimsDb.byUser) {
      for (const uid of Object.keys(claimsDb.byUser)) {
        claimsDb.byUser[uid] = claimsDb.byUser[uid].filter(id => id !== claimId);
        if (claimsDb.byUser[uid].length === 0) delete claimsDb.byUser[uid];
      }
    }

    await writeJson(claimsFile, claimsDb);

    // Decrement bounty claimCount where present
    if (bountiesDb.bounties && bountiesDb.bounties[bountyId]) {
      bountiesDb.bounties[bountyId].claimCount = Math.max(0, (bountiesDb.bounties[bountyId].claimCount || 1) - 1);
      bountiesDb.byId[bountyId] = bountiesDb.bounties[bountyId];
      await writeJson(bountiesFile, bountiesDb);
    }

    console.log('[Bounties API] Deleted claim', claimId, 'for bounty', bountyId);
    return res.json({ ok: true, claimId });
  } catch (err) {
    console.error('[Bounties API] Error deleting claim:', err);
    return res.status(500).json({ ok: false, error: 'Failed to delete claim' });
  }
});

// POST /api/bounties/:id/award - Award a bounty to a user
router.post('/:id/award', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user;
    const { userId, amount, message } = req.body;
    
    console.log('[Bounties API] Awarding bounty:', bountyId, 'to user:', userId);
    
    // Validate request
    if (!userId) {
      return res.status(400).json({ ok: false, error: 'User ID is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ ok: false, error: 'Award amount must be positive' });
    }
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Award message is required' });
    }
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];

    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }

    // Check if current user is the bounty creator
    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only the bounty creator can award the bounty' });
    }
    
    // Award logic (simplified)
    const award = {
      id: `award_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bountyId,
      userId,
      amount,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Here you would integrate with payment or reward system
    // For now, we just log it
    console.log('[Bounties API] Award details (mock):', award);
    
    res.json({ ok: true, award });
  } catch (error) {
    console.error('[Bounties API] Error awarding bounty:', error);
    res.status(500).json({ ok: false, error: 'Failed to award bounty' });
  }
});

// POST /api/bounties/:id/send-payout - Send payout for a bounty
router.post('/:id/send-payout', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user;
    
    console.log('[Bounties API] Sending payout for bounty:', bountyId);
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];

    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }

    // Check if current user is the bounty creator
    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only the bounty creator can send payout' });
    }
    
    // Payout logic (simplified)
    if (bounty.rewardType === 'monetary') {
      // Integrate with payment system
      const paymentResult = await sendPayout(bountyId, bounty.userId, bounty.monetaryReward.amount);
      
      console.log('[Bounties API] Payment result:', paymentResult);
      
      return res.json({ ok: true, payout: paymentResult });
    } else {
      return res.status(400).json({ ok: false, error: 'Payout not supported for non-monetary bounties' });
    }
  } catch (error) {
    console.error('[Bounties API] Error sending payout:', error);
    res.status(500).json({ ok: false, error: 'Failed to send payout' });
  }
});

// POST /api/bounties/:id/verify-identity - Verify user identity for a bounty
router.post('/:id/verify-identity', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user;
    const { name, idNumber, document } = req.body;
    
    console.log('[Bounties API] Verifying identity for bounty:', bountyId);
    
    // Validate request
    if (!name || !idNumber || !document) {
      return res.status(400).json({ ok: false, error: 'Name, ID number, and document are required' });
    }
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];

    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }

    // Check if current user is the bounty creator
    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only the bounty creator can verify identity' });
    }
    
    // Identity verification logic (mock)
    const verificationResult = await verifyUserIdentity(name, idNumber, document);
    
    console.log('[Bounties API] Identity verification result:', verificationResult);
    
    res.json({ ok: true, verification: verificationResult });
  } catch (error) {
    console.error('[Bounties API] Error verifying identity:', error);
    res.status(500).json({ ok: false, error: 'Failed to verify identity' });
  }
});

// POST /api/bounties/:id/fraud-check - Perform fraud check for a bounty
router.post('/:id/fraud-check', requireAuth, async (req, res) => {
  try {
    const bountyId = req.params.id;
    const currentUser = req.user;
    const { transactionId } = req.body;
    
    console.log('[Bounties API] Performing fraud check for bounty:', bountyId);
    
    // Validate request
    if (!transactionId) {
      return res.status(400).json({ ok: false, error: 'Transaction ID is required' });
    }
    
    // Get bounty
    const bountiesDb = await readJson(bountiesFile);
    const bounty = bountiesDb.bounties[bountyId] || bountiesDb.byId[bountyId] || bountiesDb.demo[bountyId];

    if (!bounty) {
      return res.status(404).json({ ok: false, error: 'Bounty not found' });
    }

    // Check if current user is the bounty creator
    if (bounty.userId !== currentUser.id) {
      return res.status(403).json({ ok: false, error: 'Only the bounty creator can perform fraud check' });
    }
    
    // Fraud check logic (mock)
    const fraudCheckResult = await performFraudCheck(transactionId);
    
    console.log('[Bounties API] Fraud check result:', fraudCheckResult);
    
    res.json({ ok: true, fraudCheck: fraudCheckResult });
  } catch (error) {
    console.error('[Bounties API] Error performing fraud check:', error);
    res.status(500).json({ ok: false, error: 'Failed to perform fraud check' });
  }
});

module.exports = router;

