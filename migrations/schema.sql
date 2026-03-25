-- Veld Co PostgreSQL Schema + Initial Data
-- Run: createdb veldco; psql veldco -f migrations/schema.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories (slugs for SEO)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  img VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products (1C ready)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  art VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  price DECIMAL(10,2) NOT NULL,
  stock BOOLEAN DEFAULT true,
  description TEXT,
  imgs JSONB DEFAULT '[]'::jsonb,  -- ["img1.jpg", "img2.jpg"]
  meta JSONB DEFAULT '{}'::jsonb,  -- SEO title/desc
  is_new BOOLEAN DEFAULT false,
  is_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders / Cart submits (for опт)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255),
  company VARCHAR(255),
  inn VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  items JSONB NOT NULL,  -- [{"product_id": "uuid", "qty": 5}]
  total DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- News/Blog
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  preview TEXT,
  content TEXT,
  img VARCHAR(255),
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author VARCHAR(255),
  company VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for perf
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_slug ON products(slug);

-- Sample Data (30+ products, real images from /public/images)
INSERT INTO categories (name, slug, img) VALUES
('Игрушки', 'toys', 'игрушки.jpg'),
('Творчество', 'creative', 'творчество.jpg'),
('Подарочная упаковка', 'pack', 'упаковкка.jpg'),
('Товары для праздника', 'party', 'праздник.jpg'),
('Фототовары', 'photo', 'фототовары.jpg'),
('Товары для дома', 'home', 'imageslogo.png'),
('Фикс цена', 'fixed-price', '23_6.jpg');

INSERT INTO brands (name, slug, logo) VALUES
('Amico', 'amico', 'Amico_Logo.png'),
('Drift', 'drift', 'drift.jpg'),
('Hoffmann', 'hoffmann', 'logo_hoffmann-01.png'),
('Ути-Пути', 'uti-puti', 'utiputu.jpg'),
('Фабрика фантазий', 'fabrika', 'фф.jpg');

-- Sample Products (expand to 100+)
INSERT INTO products (art, slug, name, category_id, brand_id, price, description, imgs, is_new, is_hit) VALUES
('12345', 'constructor-gorod', 'Конструктор \"Город\"', (SELECT id FROM categories WHERE slug='toys'), (SELECT id FROM brands WHERE slug='fabrika'), 350.00, 'Яркий конструктор для развития', '["игрушки.jpg"]', true, false),
-- Add more...
('23456', 'kraski-12', 'Набор красок 12 цветов', (SELECT id FROM categories WHERE slug='creative'), (SELECT id FROM brands WHERE slug='amico'), 220.00, 'Качественные акварельные краски', '["творчество.jpg"]', false, true),
-- etc for demo (full seed in utils/seed.js)

INSERT INTO news (title, preview, date) VALUES
('Итоги выставки Мир детства 2025', 'Выставка прошла с большим успехом...', '2025-10-02'),
('День рождения Veld Co 29 лет', 'Спасибо партнерам!', '2025-08-28');

INSERT INTO testimonials (author, company, rating, text) VALUES
('Петрова', 'ИП Петрова', 5, 'Работаем 5 лет, отличный ассортимент!');

-- Views for API queries (perf)
CREATE VIEW api_products AS
SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name, b.slug as brand_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id;

