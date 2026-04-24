// Shared client logic
async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function getMe() {
  const r = await api('/api/me');
  return r.ok ? r.data.user : null;
}

function imgFor(keyword) {
  const map = {
    'professional': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    'visa': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    'travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
    'hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'train': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400',
    'airplane': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    'bus': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    'realestate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    'ambulance': 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400',
    'doctor': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    'taxi': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0729?w=400',
    'banquet': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    'loan': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
    'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'car': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400',
    'government': 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400',
    'documents': 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400',
    'appliances': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    'desktop': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400',
    'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    'hardware': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    'bathroom': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
    'plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
    'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    'carpenter': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    'painting': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400',
    'aircon': 'https://images.unsplash.com/photo-1527089427273-c0b5ce8a6b3f?w=400',
    'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    'deepcleaning': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
    'pestcontrol': 'https://images.unsplash.com/photo-1558618047-f4e80c0a0f13?w=400',
    'laundry': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400',
    'webdesign': 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400',
    'appdevelopment': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    'digitalmarketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400',
    'seo': 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400',
    'socialmedia': 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400',
    'csc': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    'writing': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    'graphicdesign': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
    'photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    'videography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
    'catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    'event': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    'wedding': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    'interior': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
    'moving': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'medicine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    'tutoring': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
    'music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    'spa': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    'carwash': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400',
    'carrepair': 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
    'legal': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
    'accounting': 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400',
    'tax': 'https://images.unsplash.com/photo-1554224155-1a8b4a4e5e4a?w=400',
    'insurance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    'petcare': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    'gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'security': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
  };
  const k = (keyword || 'service').split(',')[0].trim().toLowerCase();
  return map[k] || `https://loremflickr.com/400/250/${encodeURIComponent(k)}?lock=${Math.abs(hashCode(k))%1000}`;
}
function hashCode(str){let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return h;}

function serviceCardHTML(s) {
  return `
    <div class="card" data-name="${s.name.toLowerCase()}" data-category="${s.category}">
      <img src="${imgFor(s.keyword)}" alt="${s.name}" style="width:100%;height:180px;object-fit:cover;border-radius:10px 10px 0 0;" onerror="this.src='https://placehold.co/400x250/1a1a2e/ffffff?text=${encodeURIComponent(s.name)}'">
      <div class="card-body">
        <span class="badge">${s.category}</span>
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        <button class="btn-book" onclick="openBooking('${s.name.replace(/'/g, "\\'")}')">Book Now</button>
      </div>
    </div>
  `;
}

function buildNavbar(active) {
  return `
  <nav class="navbar">
    <a href="index.html" class="brand">
      <img src="logo.png" id="site-logo" style="height:50px;border-radius:8px;">
      <div class="brand-text">
        <strong>Universal Services</strong>
        <small>Your One Stop Solution</small>
      </div>
    </a>
    <button class="nav-toggle" onclick="document.getElementById('nav-links').classList.toggle('open')">&#9776;</button>
    <div class="nav-links" id="nav-links">
      <a href="index.html" ${active==='home'?'style="color:#e94560"':''}>Home</a>
      <a href="services.html" ${active==='services'?'style="color:#e94560"':''}>Services</a>
      <a href="index.html#about">About</a>
      <a href="index.html#contact">Contact</a>
      <span id="nav-auth"></span>
    </div>
  </nav>`;
}

async function renderNavbar(active) {
  const el = document.getElementById('navbar');
  if (!el) return;
  el.innerHTML = buildNavbar(active);
  const me = await getMe();
  const slot = document.getElementById('nav-auth');
  if (me) {
    slot.innerHTML = `<a href="dashboard.html">Dashboard</a> <a href="#" class="btn-nav" onclick="logout(event)">Logout</a>`;
  } else {
    slot.innerHTML = `<a href="login.html">Login</a> <a href="register.html" class="btn-nav">Register</a>`;
  }
}

async function logout(e) {
  if (e) e.preventDefault();
  await api('/api/logout', { method: 'POST' });
  window.location.href = 'index.html';
}

function buildFooter() {
  return `
  <footer id="contact">
    <div class="foot-grid">
      <div>
        <h4>Universal Services</h4>
        <p>Your one stop solution for every service you need — from home repairs to travel bookings, we deliver trust and convenience.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p>Gorakhpur<br>Uttar Pradesh</p>
        <p>+91 63065 84463</p>
        <p>universalservicesbharat@gamil.com</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <a href="index.html">Home</a>
        <a href="services.html">Services</a>
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      </div>
      <div>
        <h4>Follow Us</h4>
        <div class="social">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Twitter">t</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="LinkedIn">in</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">&copy; 2026 Universal Services. All rights reserved.</div>
  </footer>`;
}

function renderFooter() {
  const el = document.getElementById('footer');
  if (el) el.innerHTML = buildFooter();
}

// Booking modal
function ensureBookingModal() {
  if (document.getElementById('booking-modal')) return;
  const m = document.createElement('div');
  m.className = 'modal-backdrop';
  m.id = 'booking-modal';
  m.innerHTML = `
    <div class="modal">
      <h3>Book a Service</h3>
      <div id="booking-form-area">
        <div class="form-group"><label>Service</label><input type="text" id="bk-service" readonly></div>
        <div class="form-group"><label>Your Name</label><input type="text" id="bk-name" readonly></div>
        <div class="form-group"><label>Mobile</label><input type="text" id="bk-mobile" readonly></div>
        <div class="form-group"><label>Preferred Date</label><input type="date" id="bk-date"></div>
        <div class="form-group"><label>Special Requirements (optional)</label><textarea id="bk-msg" rows="3"></textarea></div>
        <div class="error-msg" id="bk-err"></div>
        <div class="modal-actions">
          <button class="btn btn-dark" onclick="closeBooking()">Cancel</button>
          <button class="btn" onclick="submitBooking()">Submit Booking</button>
        </div>
      </div>
      <div id="booking-success" style="display:none;text-align:center;padding:20px 0;">
        <h3 style="color:#16a34a;margin-bottom:10px;">Booking Confirmed!</h3>
        <p>We will contact you soon.</p>
        <button class="btn mt-30" onclick="closeBooking()">Close</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

async function openBooking(serviceName) {
  ensureBookingModal();
  const me = await getMe();
  if (!me) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('bk-service').value = serviceName;
  document.getElementById('bk-name').value = me.name;
  document.getElementById('bk-mobile').value = me.mobile;
  document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];
  document.getElementById('bk-date').value = '';
  document.getElementById('bk-msg').value = '';
  document.getElementById('bk-err').textContent = '';
  document.getElementById('booking-form-area').style.display = '';
  document.getElementById('booking-success').style.display = 'none';
  document.getElementById('booking-modal').classList.add('show');
}

function closeBooking() {
  document.getElementById('booking-modal').classList.remove('show');
}

async function submitBooking() {
  const body = {
    service_name: document.getElementById('bk-service').value,
    preferred_date: document.getElementById('bk-date').value,
    message: document.getElementById('bk-msg').value
  };
  const r = await api('/api/book', { method: 'POST', body });
  if (!r.ok) {
    document.getElementById('bk-err').textContent = r.data.error || 'Booking failed';
    return;
  }
  document.getElementById('booking-form-area').style.display = 'none';
  document.getElementById('booking-success').style.display = 'block';
}
