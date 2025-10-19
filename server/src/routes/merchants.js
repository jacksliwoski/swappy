const express = require('express');
const router = express.Router();

// Stub: returns a few “safe trade” locations (extend later)
router.get('/safe-spots', (_req, res) => {
  res.json({
    ok: true,
    spots: [
      { id: 'm1', name: 'City Police Lobby', address: '123 Main St', hours: '24/7' },
      { id: 'm2', name: 'Mall Security Desk', address: '500 Center Ave', hours: '10-21' }
    ]
  });
});

module.exports = router;
