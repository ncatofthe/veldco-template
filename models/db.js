const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_URL || 'postgresql://hatss@localhost:5432/veldco'
});

pool.on('error', (err) => {
  console.error('DB pool error:', err);
});

// Query helper w/ promise
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };

