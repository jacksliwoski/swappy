const express = require('express');
const cors = require('cors');
const { config } = require('./config');

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// health
app.get('/health', (_req, res) => res.json({ ok: true, mock: config.mock }));

// routes
app.use('/api/listings', require('./routes/listings'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/users', require('./routes/users'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/guardian', require('./routes/guardian'));

// 404
app.use((_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));

app.listen(config.port, () => {
  console.log(`[swappy] listening on http://localhost:${config.port} (MOCK=${config.mock})`);
});
