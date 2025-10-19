const express = require('express');
const { store, ensureUser } = require('../db/memory');
const router = express.Router();

// CREATE
router.post('/', (req, res) => {
  const { ownerId, title, category, price } = req.body || {};
  if (!ownerId || !title) {
    return res.status(400).json({ ok: false, error: 'ownerId and title required' });
  }
  const id = String(store.seq.listing++);
  const item = {
    id,
    ownerId,
    title,
    category: category || 'misc',
    price: Number(price ?? 0),
    createdAt: new Date().toISOString()
  };
  store.listings.set(id, item);

  // track stat
  ensureUser(ownerId).stats.listingsCreated++;

  res.json({ ok: true, listing: item });
});

// LIST ALL
router.get('/', (_req, res) => {
  res.json({ ok: true, listings: Array.from(store.listings.values()) });
});

// GET ONE
router.get('/:id', (req, res) => {
  const item = store.listings.get(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
  res.json({ ok: true, listing: item });
});

module.exports = router;
