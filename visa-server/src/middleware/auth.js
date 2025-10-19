// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { config } = require('../config');

function signJwt(payload, opts = {}) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn, ...opts });
}

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'missing_token' });
  try {
    const user = jwt.verify(token, config.jwtSecret);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'invalid_token' });
  }
}

module.exports = { signJwt, requireAuth };
