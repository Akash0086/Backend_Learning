import express from 'express';
import { db } from '../db/connection.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'price:asc'
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    if (minPrice && isNaN(parseFloat(minPrice))) {
      return res.status(400).json({ error: 'Invalid minPrice' });
    }

    if (maxPrice && isNaN(parseFloat(maxPrice))) {
      return res.status(400).json({ error: 'Invalid maxPrice' });
    }

    const validSortFields = ['price', 'created_at', 'name'];
    let sortField = 'price', sortOrder = 'ASC';

    if (sortBy) {
      const [field, order] = sortBy.split(':');
      if (!validSortFields.includes(field) || !['asc', 'desc'].includes(order)) {
        return res.status(400).json({ error: 'Invalid sortBy format. Use price:asc, etc.' });
      }
      sortField = field;
      sortOrder = order.toUpperCase();
    }

    // Build WHERE clause
    let where = 'WHERE 1=1';
    const params = [];

    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }

    if (minPrice) {
      where += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      where += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      where += ' AND LOWER(name) LIKE ?';
      params.push(`%${search.toLowerCase()}%`);
    }

    const offset = (page - 1) * limit;

    // Total count query
    const [totalRows] = await db.query(`SELECT COUNT(*) AS count FROM products ${where}`, params);
    const totalItems = totalRows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    // Data query
    const [rows] = await db.query(
      `SELECT * FROM products ${where} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      metadata: {
        page,
        limit,
        totalItems,
        totalPages
      },
      data: rows
    });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
