const express = require('express');
const { ensureUser } = require('../db/memory');
const router = express.Router();

// Mock discover/browse endpoint
// GET /api/discover?category=&condition=&tradeValue=&search=
router.get('/', (req, res) => {
  const { category, condition, tradeValue, search, sort } = req.query;

  // TODO: Implement filtering logic
  // For now, return mock items from different users
  const mockItems = [
    {
      id: 'item-1',
      userId: 'user-2',
      user: { id: 'user-2', username: 'ToyTrader99', avatar: '🚀', level: 3 },
      images: ['https://via.placeholder.com/300x300/14b8a6/white?text=LEGO+Set'],
      title: 'LEGO City Space Station',
      description: 'Complete set with all pieces and minifigs',
      category: 'toys',
      condition: 'good',
      valuation: { estimate: { low: 45, mid: 60, high: 75 }, explanation: 'Popular LEGO set in good condition' },
      addedAt: new Date().toISOString(),
    },
    {
      id: 'item-2',
      userId: 'user-3',
      user: { id: 'user-3', username: 'GameMaster', avatar: '🎮', level: 5 },
      images: ['https://via.placeholder.com/300x300/c084fc/white?text=Nintendo+Game'],
      title: 'Pokemon Card Collection',
      description: '50+ cards including holos',
      category: 'games',
      condition: 'ln',
      valuation: { estimate: { low: 80, mid: 100, high: 120 }, explanation: 'Valuable Pokemon cards in great condition' },
      addedAt: new Date().toISOString(),
    },
    {
      id: 'item-3',
      userId: 'user-4',
      user: { id: 'user-4', username: 'BikeKid', avatar: '🚴', level: 2 },
      images: ['https://via.placeholder.com/300x300/fb7185/white?text=Skateboard'],
      title: 'Pro Skateboard Deck',
      description: 'Barely used, cool graphics',
      category: 'sports',
      condition: 'ln',
      valuation: { estimate: { low: 35, mid: 50, high: 65 }, explanation: 'Quality skateboard in excellent condition' },
      addedAt: new Date().toISOString(),
    },
  ];

  res.json({ ok: true, items: mockItems });
});

module.exports = router;
