const express = require('express');
const { query } = require('../models/db');
const router = express.Router();

// Products API w/ full filter/pag
router.get('/products', async (req, res) => {
  try {
    const { category, brand, priceMin, priceMax, page = 1, limit = 12, sort = 'popular' } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    let params = [], paramIdx = 1;
    if (category) {
      where += ` AND c.slug = $${paramIdx++}`;
      params.push(category);
    }
    if (brand) {
      where += ` AND b.slug = $${paramIdx++}`;
      params.push(brand);
    }
    if (priceMin) {
      where += ` AND p.price >= $${paramIdx++}`;
      params.push(parseFloat(priceMin));
    }
    if (priceMax) {
      where += ` AND p.price <= $${paramIdx++}`;
      params.push(parseFloat(priceMax));
    }

    const sortField = sort === 'price-asc' ? 'p.price ASC' : sort === 'price-desc' ? 'p.price DESC' : 'p.is_hit DESC NULLS LAST, p.created_at DESC';

    const productsQuery = `
      SELECT * FROM api_products p
      ${where}
      ORDER BY ${sortField}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [products, count] = await Promise.all([
      query(productsQuery, params),
      query(`SELECT COUNT(*)::int FROM api_products p ${where}`, params.slice(0, -2))
    ]);

    res.json({
      products: products.rows,
      pagination: { page: parseInt(page), pages: Math.ceil(count.rows[0].count / limit), total: count.rows[0].count }
    });
  } catch (err) {
    console.error('API products error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM api_products WHERE slug = $1', [req.params.slug]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Product not found' });
  }
});

router.get('/categories', async (req, res) => {
  const { rows } = await query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

router.get('/brands', async (req, res) => {
  const { rows } = await query('SELECT * FROM brands ORDER BY name');
  res.json(rows);
});

// Orders (opт cart submit)
router.post('/orders', async (req, res) => {
  try {
    const { client_name, company, inn, email, phone, items, total } = req.body;
    const { rows } = await query(
      'INSERT INTO orders (client_name, company, inn, email, phone, items, total) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [client_name, company, inn, email, phone, JSON.stringify(items), parseFloat(total)]
    );
    res.json({ success: true, orderId: rows[0].id });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Order failed' });
  }
});

// 1C Bulk import (upsert)
router.post('/products/bulk-import', async (req, res) => {
  try {
    const { products } = req.body; // array [{"art":"123", "name":"...", "price":350, ...}]
    let imported = 0;
    for (let p of products) {
      await query(`
        INSERT INTO products (art, name, price, description, category_id, brand_id, imgs, slug)
        VALUES ($1, $2, $3, $4, (SELECT id FROM categories WHERE slug=$5), (SELECT id FROM brands WHERE slug=$6), $7, $8)
        ON CONFLICT (art) DO UPDATE SET price=EXCLUDED.price, name=EXCLUDED.name, updated_at=NOW()
      `, [p.art, p.name, p.price, p.description || '', p.category_slug || 'toys', p.brand_slug || 'fabrika', JSON.stringify(p.imgs || []), p.slug || p.art]);
      imported++;
    }
    res.json({ success: true, imported });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Import failed' });
  }
});

module.exports = router;


