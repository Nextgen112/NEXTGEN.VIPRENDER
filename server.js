import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs'; // no warnings, lighter than bcrypt
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'super-secret-session-key',
  resave: false,
  saveUninitialized: true
}));

// ✅ User list (username + password hash)
const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('admin123', 10) },
  { username: 'vipuser', passwordHash: bcrypt.hashSync('ngh2025', 10) }
];

// ✅ IP allowlist (in memory)
let allowedIps = [
  '62.201.239.232', '62.201.243.131', '185.244.153.5'
];

// ✅ Middleware to block routes unless IP is allowed
app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace('::ffff:', '').split(',')[0];

  // Always allow login routes
  if (req.path.startsWith('/panel') || req.path.startsWith('/login') || req.path.startsWith('/update-ip') || req.path.startsWith('/logout')) {
    return next();
  }

  // Allow allowed IPs for everything else (e.g., VIP.js, homepage)
  if (allowedIps.includes(ip)) return next();

  // Block access
  console.warn(`❌ Unauthorized IP tried to access: ${ip}`);
  return res.status(403).send(`
    <div style="text-align:center; margin-top:100px;">
      <h1>🚫 Access Denied</h1>
      <p>Your IP (${ip}) is not authorized to access this server.</p>
      <a href="/panel">🔐 Login to authorize</a>
    </div>
  `);
});

// ✅ Redirect / to /panel
app.get('/', (req, res) => {
  res.redirect('/panel');
});

// ✅ Login + Update Panel
app.get('/panel', (req, res) => {
  if (req.session.user) {
    return res.send(`
      <div style="text-align:center; font-family:Arial;">
        <h2>✅ Logged in as ${req.session.user}</h2>
        <form method="POST" action="/update-ip">
          <button type="submit">✅ Add My IP to Allowlist</button>
        </form>
        <form method="POST" action="/logout" style="margin-top:10px;">
          <button type="submit">Logout</button>
        </form>
      </div>
    `);
  }

  res.send(`
    <form method="POST" action="/login" style="text-align:center; font-family:Arial; margin-top:100px;">
      <h2>🔐 Admin Login</h2>
      <input name="username" placeholder="Username" required /><br><br>
      <input name="password" type="password" placeholder="Password" required /><br><br>
      <button type="submit">Login</button>
    </form>
  `);
});

// ✅ Handle login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.send(`<p style="color:red;text-align:center;">❌ Invalid credentials. <a href="/panel">Try again</a></p>`);
  }
  req.session.user = username;
  res.redirect('/panel');
});

// ✅ Add IP to allowlist
app.post('/update-ip', (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace('::ffff:', '').split(',')[0];
  if (!allowedIps.includes(ip)) {
    allowedIps.push(ip);
    console.log(`✅ ${req.session.user} added IP: ${ip}`);
  }

  res.send(`
    <div style="text-align:center; font-family:Arial;">
      <h2>✅ Your IP (${ip}) is now whitelisted!</h2>
      <p>You can now access WarCommander.js</p>
      <a href="/VIP.js" target="_blank">▶ Open VIP.js</a><br><br>
      <a href="/panel">🔙 Back to Panel</a>
    </div>
  `);
});

// ✅ Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/panel');
  });
});

// ✅ Serve protected file
app.get('/VIP.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'VIP.js'));
});

// ✅ Example dummy WarCommander.js (just rename it as needed)
app.get('/WarCommander.js', (req, res) => {
  res.send(`console.log("✅ WarCommander.js Loaded");`);
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
