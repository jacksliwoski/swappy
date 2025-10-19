const express = require('express');
const router = express.Router();

// Placeholder safety/guardian endpoints
router.get('/criteria', (_req, res) => {
  res.json({
    ok: true,
    criteria: [
      '≥ 8 yrs old',
      'Item ≤ $250 value',
      'Local trades only (no shipping)',
      'Guardian account required for minors'
    ]
  });
});

module.exports = router;
