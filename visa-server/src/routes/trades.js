const express = require('express');
const { store, addXp } = require('../db/memory');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// OPEN TRADE
router.post('/open', (req, res) => {
  const { buyerId, sellerId, listingId } = req.body || {};
  if (!buyerId || !sellerId || !listingId) {
    return res.status(400).json({ ok: false, error: 'buyerId, sellerId, listingId required' });
  }
  if (!store.listings.get(String(listingId))) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }
  const id = String(store.seq.trade++);
  const trade = {
    id,
    buyerId,
    sellerId,
    listingId: String(listingId),
    status: 'open',
    createdAt: new Date().toISOString()
  };
  store.trades.set(id, trade);
  res.json({ ok: true, trade });
});

// COMPLETE TRADE (awards XP)
router.post('/complete', (req, res) => {
  const { tradeId } = req.body || {};
  const trade = store.trades.get(String(tradeId));
  if (!trade) return res.status(404).json({ ok: false, error: 'trade_not_found' });
  if (trade.status === 'completed') return res.json({ ok: true, trade });

  trade.status = 'completed';
  trade.completedAt = new Date().toISOString();

  // award XP to both sides
  const SELLER_XP = 50;
  const BUYER_XP = 30;
  const seller = addXp(trade.sellerId, SELLER_XP);
  const buyer = addXp(trade.buyerId, BUYER_XP);

  res.json({ ok: true, trade, xpAwards: { seller, buyer } });
});

// ====================================
// OFFER-BASED TRADING SYSTEM
// ====================================

// PROPOSE A TRADE OFFER
router.post('/propose', requireAuth, (req, res) => {
  const trade = req.body;
  
  if (!trade || !trade.fromUserId || !trade.toUserId) {
    return res.status(400).json({ ok: false, error: 'Invalid trade data' });
  }

  // Generate trade ID
  const tradeId = 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Create trade offer
  const tradeOffer = {
    ...trade,
    id: tradeId,
    status: 'proposed',
    proposedAt: new Date().toISOString(),
  };

  // Store trade offer
  if (!store.tradeOffers) {
    store.tradeOffers = new Map();
  }
  store.tradeOffers.set(tradeId, tradeOffer);

  // Create a message notification for the recipient
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const message = {
    id: messageId,
    conversationId: [trade.fromUserId, trade.toUserId].sort().join('_'),
    fromUserId: trade.fromUserId,
    toUserId: trade.toUserId,
    text: null,
    tradeOffer: {
      trade: tradeOffer,
    },
    sentAt: new Date().toISOString(),
    read: false,
  };

  if (!store.messages) {
    store.messages = new Map();
  }
  store.messages.set(messageId, message);

  res.json({ ok: true, tradeId, trade: tradeOffer });
});

// GET TRADES FOR A USER
router.get('/', requireAuth, (req, res) => {
  const userId = req.query.userId || req.user.id;
  
  if (!store.tradeOffers) {
    return res.json({ ok: true, trades: [] });
  }

  const trades = Array.from(store.tradeOffers.values())
    .filter(trade => trade.fromUserId === userId || trade.toUserId === userId)
    .sort((a, b) => new Date(b.proposedAt) - new Date(a.proposedAt));

  res.json({ ok: true, trades });
});

// GET A SPECIFIC TRADE
router.get('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  if (!store.tradeOffers) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  const trade = store.tradeOffers.get(id);
  if (!trade) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  res.json({ ok: true, trade });
});

// ACCEPT A TRADE OFFER
router.put('/:id/accept', requireAuth, (req, res) => {
  const { id } = req.params;
  
  if (!store.tradeOffers) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  const trade = store.tradeOffers.get(id);
  if (!trade) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  if (trade.status !== 'proposed' && trade.status !== 'countered') {
    return res.status(400).json({ ok: false, error: 'Trade cannot be accepted in current status' });
  }

  // Update trade status
  trade.status = 'accepted';
  trade.respondedAt = new Date().toISOString();
  store.tradeOffers.set(id, trade);

  // Award XP to both users
  const XP_FOR_TRADE = 50;
  addXp(trade.fromUserId, XP_FOR_TRADE);
  addXp(trade.toUserId, XP_FOR_TRADE);

  // Create acceptance message
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const message = {
    id: messageId,
    conversationId: [trade.fromUserId, trade.toUserId].sort().join('_'),
    fromUserId: trade.toUserId,
    toUserId: trade.fromUserId,
    text: `✅ Trade offer accepted!`,
    sentAt: new Date().toISOString(),
    read: false,
  };
  store.messages.set(messageId, message);

  res.json({ ok: true, trade });
});

// DECLINE A TRADE OFFER
router.put('/:id/decline', requireAuth, (req, res) => {
  const { id } = req.params;
  
  if (!store.tradeOffers) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  const trade = store.tradeOffers.get(id);
  if (!trade) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  if (trade.status !== 'proposed' && trade.status !== 'countered') {
    return res.status(400).json({ ok: false, error: 'Trade cannot be declined in current status' });
  }

  // Update trade status
  trade.status = 'declined';
  trade.respondedAt = new Date().toISOString();
  store.tradeOffers.set(id, trade);

  // Create decline message
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const message = {
    id: messageId,
    conversationId: [trade.fromUserId, trade.toUserId].sort().join('_'),
    fromUserId: trade.toUserId,
    toUserId: trade.fromUserId,
    text: `❌ Trade offer declined.`,
    sentAt: new Date().toISOString(),
    read: false,
  };
  store.messages.set(messageId, message);

  res.json({ ok: true, trade });
});

// COUNTER A TRADE OFFER
router.post('/:id/counter', requireAuth, (req, res) => {
  const { id } = req.params;
  const counterOffer = req.body;
  
  if (!store.tradeOffers) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  const originalTrade = store.tradeOffers.get(id);
  if (!originalTrade) {
    return res.status(404).json({ ok: false, error: 'trade_not_found' });
  }

  if (originalTrade.status !== 'proposed' && originalTrade.status !== 'countered') {
    return res.status(400).json({ ok: false, error: 'Trade cannot be countered in current status' });
  }

  // Mark original as countered
  originalTrade.status = 'countered';
  originalTrade.respondedAt = new Date().toISOString();
  store.tradeOffers.set(id, originalTrade);

  // Create new counter offer
  const counterTradeId = 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const counterTrade = {
    ...counterOffer,
    id: counterTradeId,
    status: 'countered',
    counterOfferTo: id,
    proposedAt: new Date().toISOString(),
  };
  store.tradeOffers.set(counterTradeId, counterTrade);

  // Create counter offer message
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const message = {
    id: messageId,
    conversationId: [counterTrade.fromUserId, counterTrade.toUserId].sort().join('_'),
    fromUserId: counterTrade.fromUserId,
    toUserId: counterTrade.toUserId,
    text: null,
    tradeOffer: {
      trade: counterTrade,
    },
    sentAt: new Date().toISOString(),
    read: false,
  };
  store.messages.set(messageId, message);

  res.json({ ok: true, tradeId: counterTradeId, trade: counterTrade });
});

module.exports = router;
