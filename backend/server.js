// backend/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const linksRouter = require('./routes/links');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0', uptime_seconds: Math.floor(process.uptime()) });
});

// API
app.use('/api/links', linksRouter);

/**
 * Redirect route - GET /:code
 * - increments click count
 * - updates last_clicked
 * - 302 redirect to target_url
 * - 404 if not found
 *
 * Note: skip reserved paths like 'api', 'healthz', 'static' etc.
 */
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;

  // Reserved - allow other routes to match
  const reserved = ['api', 'healthz', 'favicon.ico', 'robots.txt', 'static'];
  if (reserved.includes(code)) return next();

  try {
    const r = await db.query('SELECT id, target_url FROM links WHERE code = $1', [code]);
    if (r.rows.length === 0) {
      return res.status(404).send('Not found');
    }

    // update counters — do this asynchronously but ensure it completes before redirect ideally
    await db.query('UPDATE links SET total_clicks = total_clicks + 1, last_clicked = now() WHERE code = $1', [code]);

    const target = r.rows[0].target_url;
    return res.redirect(302, target);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

// Serve frontend static files (production build placed in backend/static)
const staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath));

// Serve index.html for SPA routes (e.g., /code/:code)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TinyLink server listening on port ${PORT}`);
});
