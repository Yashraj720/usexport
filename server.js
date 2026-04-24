const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Create tables
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      service_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      preferred_date TEXT,
      message TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
})();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Auth middlewares
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: 'Admin login required' });
  next();
}

// ✅ REGISTER
app.post('/api/register', async (req, res) => {
  const { name, mobile, email, password } = req.body;

  if (!name || !mobile || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const hash = bcrypt.hashSync(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (name, mobile, email, password) VALUES ($1,$2,$3,$4)',
      [name, mobile, email, hash]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Email already registered' });
  }
});

// ✅ LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email
  };

  res.json({ success: true, user: req.session.user });
});

// ✅ LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ✅ CURRENT USER
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: req.session.user });
});

// ✅ BOOK SERVICE
app.post('/api/book', requireLogin, async (req, res) => {
  const { service_name, preferred_date, message } = req.body;
  const u = req.session.user;

  const result = await pool.query(
    `INSERT INTO bookings 
     (user_id, service_name, customer_name, mobile, preferred_date, message)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [u.id, service_name, u.name, u.mobile, preferred_date || '', message || '']
  );

  res.json({ success: true, id: result.rows[0].id });
});

// ✅ USER BOOKINGS
app.get('/api/my-bookings', requireLogin, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
    [req.session.user.id]
  );

  res.json({ bookings: result.rows });
});

// ✅ ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    req.session.admin = true;
    return res.json({ success: true });
  }

  res.status(401).json({ error: 'Invalid admin credentials' });
});

// ✅ ADMIN STATS
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const users = await pool.query('SELECT COUNT(*) FROM users');
  const bookings = await pool.query('SELECT COUNT(*) FROM bookings');
  const pending = await pool.query("SELECT COUNT(*) FROM bookings WHERE status='Pending'");
  const confirmed = await pool.query("SELECT COUNT(*) FROM bookings WHERE status='Confirmed'");

  res.json({
    totalUsers: users.rows[0].count,
    totalBookings: bookings.rows[0].count,
    pending: pending.rows[0].count,
    confirmed: confirmed.rows[0].count
  });
});

// ✅ ADMIN BOOKINGS
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, u.email as user_email 
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `);

  res.json({ bookings: result.rows });
});

// ✅ ADMIN USERS
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, mobile, email, created_at FROM users ORDER BY created_at DESC'
  );

  res.json({ users: result.rows });
});

// ✅ UPDATE BOOKING STATUS
app.put('/api/admin/booking/:id', requireAdmin, async (req, res) => {
  const { status } = req.body;

  await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2',
    [status, req.params.id]
  );

  res.json({ success: true });
});

// Routes
app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
);

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});