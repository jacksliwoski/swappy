const express = require('express');
const router = express.Router();

// Mock messages store
const mockConversations = {};
const mockMessages = {};

// GET /api/messages/:userId - Get user's conversations
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  // Return mock conversations
  const conversations = [
    {
      id: 'conv-1',
      participants: [
        { id: userId, username: 'You', avatar: '😊', level: 1 },
        { id: 'user-2', username: 'ToyTrader99', avatar: '🚀', level: 3 },
      ],
      lastMessage: {
        id: 'msg-1',
        text: 'Want to trade for my LEGO set?',
        sentAt: new Date().toISOString(),
        fromUserId: 'user-2',
      },
      unreadCount: 1,
    },
  ];

  res.json({ ok: true, conversations });
});

// POST /api/messages - Send a message
router.post('/', (req, res) => {
  const { conversationId, fromUserId, toUserId, text } = req.body;

  if (!text || !fromUserId || !toUserId) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const message = {
    id: `msg-${Date.now()}`,
    conversationId: conversationId || `conv-${fromUserId}-${toUserId}`,
    fromUserId,
    toUserId,
    text,
    sentAt: new Date().toISOString(),
    read: false,
  };

  res.json({ ok: true, message });
});

// PUT /api/messages/:conversationId/read - Mark as read
router.put('/:conversationId/read', (req, res) => {
  const { conversationId } = req.params;
  res.json({ ok: true, conversationId });
});

module.exports = router;
