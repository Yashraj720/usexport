const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, 'database.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    preferred_date TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || '8uuniversalservices2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: 'Admin login required' });
  next();
}

app.post('/api/register', (req, res) => {
  const { name, mobile, email, password } = req.body || {};
  if (!name || !mobile || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (!/^\d{10}$/.test(mobile)) return res.status(400).json({ error: 'Mobile must be 10 digits' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)').run(name, mobile, email, hash);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { id: user.id, name: user.name, mobile: user.mobile, email: user.email };
  res.json({ success: true, user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: req.session.user });
});

app.post('/api/book', requireLogin, (req, res) => {
  const { service_name, preferred_date, message } = req.body || {};
  if (!service_name) return res.status(400).json({ error: 'Service name required' });
  const u = req.session.user;
  const info = db.prepare('INSERT INTO bookings (user_id, service_name, customer_name, mobile, preferred_date, message) VALUES (?, ?, ?, ?, ?, ?)')
    .run(u.id, service_name, u.name, u.mobile, preferred_date || '', message || '');
  res.json({ success: true, id: info.lastInsertRowid });
});

app.get('/api/my-bookings', requireLogin, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(req.session.user.id);
  res.json({ bookings: rows });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'admin123') {
    req.session.admin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const pending = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='Pending'").get().c;
  const confirmed = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='Confirmed'").get().c;
  res.json({ totalUsers, totalBookings, pending, confirmed });
});

app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, u.email as user_email FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json({ bookings: rows });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, name, mobile, email, password, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users: rows });
});

app.put('/api/admin/booking/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['Pending', 'Confirmed', 'Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`Universal Services running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html  (admin / admin123)`);
});
