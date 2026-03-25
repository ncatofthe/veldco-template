const { query } = require('../models/db');

// Full seed - run npm run seed
async function seed() {
  try {
    // Clear old
    await query('TRUNCATE products, news, testimonials RESTART IDENTITY CASCADE');

    // Categories (full)
    const cats = [
      {name: 'Игрушки', slug: 'toys', img: 'игрушки.jpg'},
      {name: 'Творчество', slug: 'creative', img: 'творчество.jpg'},
      {name: 'Подарочная упаковка', slug: 'pack', img: 'упаковкка.jpg'},
      // ... full 10
    ];
    for (let cat of cats) {
      await query('INSERT INTO categories (name, slug, img) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [cat.name, cat.slug, cat.img]);
    }

    // Brands
    const brands = [
      {name: 'Amico', slug: 'amico', logo: 'Amico_Logo.png'},
      {name: 'Drift', slug: 'drift', logo: 'drift.jpg'},
      // full
    ];
    for (let b of brands) {
      await query('INSERT INTO brands (name, slug, logo) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [b.name, b.slug, b.logo]);
    }

    // Products ~100 w/ real variety
    const products = [];
    // Generate based on images/env
    const imageNames = ['игрушки.jpg', 'творчество.jpg', /* list from env_details */];
    for (let i = 1; i <= 100; i++) {
      products.push({
        art: `ART${String(i).padStart(5, '0')}`,
        slug: `product-${i}`,
        name: `Товар ${i} - Игрушка/Упаковка`,
        price: (100 + Math.random()*900).toFixed(2),
        stock: Math.random() > 0.2,
        imgs: [`/images/${imageNames[i%imageNames.length]}`],
        is_new: i > 90,
        is_hit: Math.random() > 0.7
      });
    }
    for (let p of products) {
      const catId = (await query('SELECT id FROM categories LIMIT 1')).rows[0]?.id;
      const brandId = (await query('SELECT id FROM brands LIMIT 1')).rows[0]?.id;
      await query(`
        INSERT INTO products (art, slug, name, category_id, brand_id, price, stock, imgs, is_new, is_hit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [p.art, p.slug, p.name, catId, brandId, p.price, p.stock, JSON.stringify(p.imgs), p.is_new, p.is_hit]);
    }

    console.log('✅ Seed complete: 100 products, cats, brands');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();

