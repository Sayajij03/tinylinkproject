// backend/routes/links.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const validUrl = require('valid-url');

// code pattern: alphanumeric 6-8 chars
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// Helpers
function genCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

/**
 * Create link
 * POST /api/links
 * body: { target_url: string, code?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { target_url, code } = req.body;
    if (!target_url || typeof target_url !== 'string') {
      return res.status(400).json({ error: 'target_url is required' });
    }

    if (!validUrl.isWebUri(target_url)) {
      return res.status(400).json({ error: 'Invalid URL. Use full URL including http:// or https://' });
    }

    let shortCode = code && String(code).trim();

    if (shortCode) {
      if (!CODE_REGEX.test(shortCode)) {
        return res.status(400).json({ error: 'Custom code must be 6-8 alphanumeric characters' });
      }
      // check existing
      const r = await db.query('SELECT id FROM links WHERE code = $1', [shortCode]);
      if (r.rows.length > 0) {
        return res.status(409).json({ error: 'Code already exists' });
      }
    } else {
      // generate unique
      let tries = 0;
      do {
        shortCode = genCode(6);
        const r = await db.query('SELECT id FROM links WHERE code = $1', [shortCode]);
        if (r.rows.length === 0) break;
        tries++;
      } while (tries < 10);

      if (!shortCode) return res.status(500).json({ error: 'Unable to generate code' });
    }

    const insert = await db.query(
      `INSERT INTO links (code, target_url) VALUES ($1, $2) RETURNING code, target_url, created_at, total_clicks, last_clicked`,
      [shortCode, target_url]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('POST /api/links error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/links
 * Optional query: q (search)
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let sql = 'SELECT code, target_url, created_at, total_clicks, last_clicked FROM links';
    let params = [];
    if (q) {
      sql += ' WHERE code ILIKE $1 OR target_url ILIKE $1';
      params.push(`%${q}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const r = await db.query(sql, params);
    return res.json({ links: r.rows });
  } catch (err) {
    console.error('GET /api/links error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/links/:code - return stats for code
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const r = await db.query(
      'SELECT code, target_url, created_at, total_clicks, last_clicked FROM links WHERE code = $1',
      [code]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(r.rows[0]);
  } catch (err) {
    console.error('GET /api/links/:code error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/links/:code
 */
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const r = await db.query('DELETE FROM links WHERE code = $1 RETURNING id', [code]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/links/:code error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
