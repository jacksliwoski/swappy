// src/routes/users.js
const express = require('express');
const { 
  findUserById, 
  updateUserProfile,
  addInventoryItem,
  getUserInventory,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../db/filedb');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get user by ID (public info)
router.get('/:id', async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: 'user_not_found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Update user profile (authenticated)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    
    const user = await updateUserProfile(req.params.id, req.body);
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Get user inventory
router.get('/:id/inventory', async (req, res) => {
  try {
    const items = await getUserInventory(req.params.id);
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Add item to inventory (authenticated)
router.post('/:id/inventory', requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    
    const item = await addInventoryItem(req.params.id, req.body);
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Update inventory item (authenticated)
router.put('/:id/inventory/:itemId', requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    
    const item = await updateInventoryItem(req.params.itemId, req.body);
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Delete inventory item (authenticated)
router.delete('/:id/inventory/:itemId', requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    
    await deleteInventoryItem(req.params.itemId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
