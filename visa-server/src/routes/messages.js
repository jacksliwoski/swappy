const express = require('express');
const { store } = require('../db/memory');
const { requireAuth } = require('../middleware/auth');
const { findUserById } = require('../db/filedb');
const router = express.Router();

// GET /api/messages/:userId - Get user's conversations
router.get('/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  
  console.log('[Messages API] Getting conversations for user:', userId);
  console.log('[Messages API] store.messages exists:', !!store.messages);
  console.log('[Messages API] store.messages size:', store.messages ? store.messages.size : 0);

  if (!store.messages) {
    console.log('[Messages API] No messages store, returning empty');
    return res.json({ ok: true, conversations: [] });
  }

  // Get all messages for this user
  const userMessages = Array.from(store.messages.values())
    .filter(msg => msg.fromUserId === userId || msg.toUserId === userId)
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  console.log('[Messages API] Found', userMessages.length, 'messages for user');

  // Group by conversation
  const conversationsMap = new Map();

  // Fetch current user data
  const currentUser = await findUserById(userId);
  const currentUserData = {
    id: userId,
    username: currentUser?.username || 'User',
    avatar: currentUser?.avatar || '😊',
    level: currentUser?.level || 1,
  };

  for (const msg of userMessages) {
    const convId = msg.conversationId;
    
    if (!conversationsMap.has(convId)) {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      
      // Fetch other user data
      const otherUserData = await findUserById(otherUserId);
      const otherUser = {
        id: otherUserId,
        username: otherUserData?.username || (otherUserId === 'u_demo_2' ? 'Anderson' : 'User'),
        avatar: otherUserData?.avatar || (otherUserId === 'u_demo_2' ? '🎮' : '😊'),
        level: otherUserData?.level || 1,
      };
      
      conversationsMap.set(convId, {
        id: convId,
        participants: [
          currentUserData,
          otherUser,
        ],
        lastMessage: msg,
        unreadCount: 0,
      });
    }
  }

  const conversations = Array.from(conversationsMap.values());
  
  console.log('[Messages API] Returning', conversations.length, 'conversations');

  res.json({ ok: true, conversations });
});

// POST /api/messages/ensure - Ensure or create a conversation between two users
router.post('/ensure', requireAuth, async (req, res) => {
  try {
    const { userA, userB } = req.body || {};
    if (!userA || !userB) return res.status(400).json({ ok: false, error: 'userA and userB required' });

    // Conversation id deterministic for demo: conv-<smaller>-<larger>
    const convId = userA < userB ? `conv-${userA}-${userB}` : `conv-${userB}-${userA}`;

    // Ensure at least an empty conversation exists in store.messages (no-op)
    if (!store.messages) store.messages = new Map();

    return res.json({ ok: true, conversationId: convId });
  } catch (err) {
    console.error('[Messages API] ensure conversation error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to ensure conversation' });
  }
});

// GET /api/messages/:userId/:conversationId - Get messages for a conversation
router.get('/:userId/:conversationId', requireAuth, (req, res) => {
  const { userId, conversationId } = req.params;

  if (!store.messages) {
    return res.json({ ok: true, messages: [] });
  }

  // Get all messages for this conversation
  const messages = Array.from(store.messages.values())
    .filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  res.json({ ok: true, messages });
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

  // Save message to store
  if (!store.messages) {
    store.messages = new Map();
  }
  store.messages.set(message.id, message);

  console.log('[Messages API] Saved text message:', message.id);
  console.log('[Messages API] Total messages in store:', store.messages.size);

  res.json({ ok: true, message });
});

// PUT /api/messages/:conversationId/read - Mark as read
router.put('/:conversationId/read', (req, res) => {
  const { conversationId } = req.params;
  res.json({ ok: true, conversationId });
});

module.exports = router;
