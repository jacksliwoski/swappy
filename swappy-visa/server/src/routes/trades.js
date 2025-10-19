const express = require('express');
const { store, addXp } = require('../db/memory');
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

module.exports = router;
