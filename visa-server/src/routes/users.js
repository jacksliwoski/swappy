const express = require('express');
const { ensureUser } = require('../db/memory');
const { pav } = require('../visaClient');

const router = express.Router();

// Get user profile (xp/level/stats)
router.get('/:id', (req, res) => {
  const u = ensureUser(req.params.id);
  res.json({ ok: true, user: u });
});

// Get public user profile
router.get('/:id/public', (req, res) => {
  const u = ensureUser(req.params.id);
  // Return public info only
  res.json({
    ok: true,
    user: {
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
    },
  });
});

// Get user inventory
router.get('/:id/inventory', (req, res) => {
  // Mock inventory
  const mockInventory = [
    {
      id: 'inv-1',
      userId: req.params.id,
      images: ['https://via.placeholder.com/300x300/14b8a6/white?text=Item+1'],
      title: 'My Cool Toy',
      category: 'toys',
      condition: 'good',
      valuation: { estimate: { low: 20, mid: 30, high: 40 }, explanation: 'Good condition toy' },
      addedAt: new Date().toISOString(),
    },
  ];
  res.json({ ok: true, inventory: mockInventory });
});

// Add item to inventory
router.post('/:id/inventory', (req, res) => {
  const item = {
    id: `inv-${Date.now()}`,
    userId: req.params.id,
    ...req.body,
    addedAt: new Date().toISOString(),
  };
  res.json({ ok: true, item });
});

// Update inventory item
router.put('/:id/inventory/:itemId', (req, res) => {
  res.json({ ok: true, item: { id: req.params.itemId, ...req.body } });
});

// Delete inventory item
router.delete('/:id/inventory/:itemId', (req, res) => {
  res.json({ ok: true, itemId: req.params.itemId });
});

// Get user badges
router.get('/:id/badges', (req, res) => {
  const mockBadges = [
    {
      id: 'badge-1',
      name: 'First Swap!',
      description: 'Completed your first trade',
      icon: '🎉',
      earnedAt: new Date().toISOString(),
    },
  ];
  res.json({ ok: true, badges: mockBadges });
});

// Get user quests
router.get('/:id/quests', (req, res) => {
  const mockQuests = [
    {
      id: 'quest-1',
      title: 'Trade 2 different categories this week',
      description: 'Complete trades in at least 2 different categories',
      xpReward: 15,
      progress: 1,
      target: 2,
      completed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  res.json({ ok: true, quests: mockQuests });
});

// Award XP
router.post('/:id/xp', (req, res) => {
  const { xp, reason } = req.body;
  const u = ensureUser(req.params.id);
  u.xp = (u.xp || 0) + xp;
  res.json({ ok: true, user: u, xpAwarded: xp, reason });
});

// Visa PAV for a user (account verification)
router.post('/:id/pav', async (req, res) => {
  try {
    const { pan, expMonth, expYear } = req.body || {};
    if (!pan || !expMonth || !expYear) {
      return res.status(400).json({ ok: false, error: 'pan, expMonth, expYear required' });
    }
    const out = await pav(pan, expMonth, expYear);
    const ok = out.status >= 200 && out.status < 300 && !out.error;
    res.status(ok ? 200 : (out.status || 500)).json({ ok, pav: out });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'pav_failed', detail: String(e) });
  }
});

module.exports = router;
