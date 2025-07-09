import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Hardcoded users
const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('admin123', 10) },
  { username: 'vipuser', passwordHash: bcrypt.hashSync('ngh2025', 10) }
];

// IP allowlist (can be stored in file/db later)
let allowedIps = [
  '62.201.239.232', '62.201.243.131', '185.244.153.5',
  '216.144.248.25', '216.144.248.23', '216.144.248.21',
  '31.18.96.242'
];

// Middleware to check IP allowlist
app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace('::ffff:', '').split(',')[0];
  if (req.path.startsWith('/panel') || req.path.startsWith('/login') || req.path.startsWith('/update-ip') || req.path.startsWith('/logout')) {
    return next();
  }
  console.log(`🔍 Access attempt from IP: ${ip}`);
  if (allowedIps.includes(ip)) return next();
  return res.status(403).send(`
    <div style="text-align:center; margin-top:100px;">
      <h1>🚫 Access Denied</h1>
      <p>Your IP (${ip}) is not authorized.</p>
      <a href="/panel">🔐 Login to authorize</a>
    </div>
  `);
});

// Static files (optional)
app.use(express.static(__dirname));

// Login panel
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

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.send(`<p style="color:red;text-align:center;">❌ Invalid credentials. <a href="/panel">Try again</a></p>`);
  }
  req.session.user = username;
  res.redirect('/panel');
});

// Add IP to allowlist
app.post('/update-ip', (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace('::ffff:', '').split(',')[0];
  if (!allowedIps.includes(ip)) {
    allowedIps.push(ip);
    console.log(`✅ IP ${ip} added by ${req.session.user}`);
  }
  res.send(`<p style="text-align:center;">✅ Your IP (${ip}) is now allowed. <a href="/">Go Home</a></p>`);
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/panel');
  });
});

// Home
app.get('/', (req, res) => {
  res.send(`
    <div style="text-align:center; margin-top:100px; font-family:Arial;">
      <h1>🚀 War Commander Server Online</h1>
      <p>Welcome, soldier.</p>
    </div>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
