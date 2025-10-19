// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { config } = require('./config');

const app = express();

// ensure data dirs exist
const dataDir = path.join(__dirname, '..', 'data');
const outboxDir = path.join(dataDir, 'outbox');
for (const d of [dataDir, outboxDir]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

app.use(cors({ origin: config.corsOrigin, credentials: true }));
// Increase body size limit to handle base64-encoded images (default is 100kb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// health
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now(), mock: config.mock }));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

app.use((_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));

app.listen(config.port, () => {
  console.log(`[swappy] listening on http://localhost:${config.port} (MOCK=${config.mock})`);
});
