const express = require('express');
const { ensureUser } = require('../db/memory');
const { pav } = require('../visaClient');

const router = express.Router();

// Get user profile (xp/level/stats)
router.get('/:id', (req, res) => {
  const u = ensureUser(req.params.id);
  res.json({ ok: true, user: u });
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
