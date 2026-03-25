const express = require('express');
const { query } = require('../models/db');
const router = express.Router();

// Home - real DB data
router.get('/', async (req, res) => {
  try {
    const pathname = req.path;
    const [productsRes, catsRes, newsRes] = await Promise.all([
      query('SELECT * FROM api_products ORDER BY is_new DESC, is_hit DESC LIMIT 6'),
      query('SELECT * FROM categories'),
      query('SELECT * FROM news ORDER BY date DESC LIMIT 3')
    ]);
    res.render('index', { 
      title: 'Veld Co - Главная', 
      pathname,
      products: productsRes.rows,
      categories: catsRes.rows,
      news: newsRes.rows
    });
  } catch (err) {
    console.error('Home query error:', err);
    res.render('index', { title: 'Veld Co - Главная', pathname: '/', products: [], categories: [], news: [] });
  }
});

// Catalog w/ filters/pag
router.get(['/catalog', '/catalog/:category'], async (req, res) => {
  try {
    const { category } = req.params || {};
    const { page = 1, limit = 12, priceMin, priceMax, sort = 'popular', brand } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    let params = [], paramIdx = 1;
    if (category) {
      where += ` AND c.slug = $${paramIdx++}`;
      params.push(category);
    }
    if (priceMin) {
      where += ` AND p.price >= $${paramIdx++}`;
      params.push(priceMin);
    }
    if (priceMax) {
      where += ` AND p.price <= $${paramIdx++}`;
      params.push(priceMax);
    }
    if (brand) {
      where += ` AND b.slug = $${paramIdx++}`;
      params.push(brand);
    }

    const sortOrder = sort === 'price-asc' ? 'p.price ASC' : sort === 'price-desc' ? 'p.price DESC' : 'p.is_hit DESC, p.created_at DESC';

    const productsQuery = `
      SELECT * FROM api_products p
      ${where}
      ORDER BY ${sortOrder}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [productsRes, countRes, catsRes, brandsRes] = await Promise.all([
      query(productsQuery, params),
      query(`SELECT COUNT(*)::int FROM api_products p ${where}`, params.slice(0, -2)),
      query('SELECT * FROM categories'),
      query('SELECT * FROM brands')
    ]);

    const pages = Math.ceil(countRes.rows[0].count / limit);
    const queryStr = Object.entries(req.query).map(([k,v]) => `${k}=${v}`).join('&');

    res.render('catalog', { 
      title: category ? `Каталог - ${category}` : 'Каталог товаров',
      products: productsRes.rows,
      categories: catsRes.rows,
      brands: brandsRes.rows,
      pagination: { page: parseInt(page), pages, queryStr },
      filters: req.query,
      category
    });
  } catch (err) {
    console.error('Catalog query error:', err);
    res.render('catalog', { title: 'Каталог', products: [], categories: [], brands: [] });
  }
});

// Other pages - stub for now, add content
router.get('/brands', async (req, res) => {
  const brandsRes = await query('SELECT * FROM brands');
  res.render('brands', { title: 'Бренды', brands: brandsRes.rows });
});
router.get('/about', (req, res) => res.render('about', { title: 'О компании' }));
router.get('/wholesale', (req, res) => res.render('wholesale', { title: 'Опт' }));
router.get('/contacts', (req, res) => res.render('contacts', { title: 'Контакты' }));

module.exports = router;


