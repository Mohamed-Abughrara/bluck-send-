const db = require('../db');
const { parse } = require('csv-parse/sync');

// ─── List (paginated) ─────────────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const userId = req.user.id;

    const all = db.findWhere('recipients', (r) => r.user_id === userId);
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit);

    res.json({ total, page, limit, items });
  } catch (err) {
    next(err);
  }
}

// ─── Create one ───────────────────────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const { name, email, custom_fields = {}, tags = [] } = req.body;
    const userId = req.user.id;

    // Prevent duplicate email per user
    const existing = db.findWhere('recipients', (r) => r.user_id === userId && r.email === email.toLowerCase());
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Recipient with this email already exists' });
    }

    const recipient = await db.insert('recipients', {
      user_id: userId,
      name,
      email: email.toLowerCase(),
      custom_fields,
      tags,
    });

    res.status(201).json(recipient);
  } catch (err) {
    next(err);
  }
}

// ─── Bulk CSV import ──────────────────────────────────────────────────────────
async function bulkCreate(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const userId = req.user.id;
    const csvContent = req.file.buffer.toString('utf-8');

    let rows;
    try {
      rows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid CSV format', details: parseErr.message });
    }

    const added = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = (row.email || '').toLowerCase().trim();
      const name = (row.name || '').trim();

      if (!email || !name) {
        errors.push({ row: i + 2, reason: 'Missing name or email' });
        continue;
      }

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ row: i + 2, reason: `Invalid email: ${email}` });
        continue;
      }

      // Skip duplicates
      const dup = db.findWhere('recipients', (r) => r.user_id === userId && r.email === email);
      if (dup.length > 0) {
        errors.push({ row: i + 2, reason: `Duplicate email: ${email}` });
        continue;
      }

      // Any extra CSV columns go into custom_fields
      const { name: _n, email: _e, tags: rawTags, ...rest } = row;
      const tags = rawTags ? rawTags.split(';').map((t) => t.trim()).filter(Boolean) : [];

      try {
        const rec = await db.insert('recipients', {
          user_id: userId,
          name,
          email,
          custom_fields: rest,
          tags,
        });
        added.push(rec);
      } catch (dbErr) {
        errors.push({ row: i + 2, reason: dbErr.message });
      }
    }

    res.status(201).json({
      added: added.length,
      errors_count: errors.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = db.findById('recipients', id);
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const { name, email, custom_fields, tags } = req.body;
    const updated = await db.update('recipients', id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email.toLowerCase() }),
      ...(custom_fields !== undefined && { custom_fields }),
      ...(tags !== undefined && { tags }),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = db.findById('recipients', id);
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    await db.remove('recipients', id);
    res.json({ message: 'Recipient deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, bulkCreate, update, remove };
