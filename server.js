require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://veld-co.com' : '*'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (preserve existing CSS/JS/images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Veld Co server running on http://localhost:${PORT}`);
  console.log('✅ Static assets served from /public');
  console.log('✅ EJS templates from /views');
});

