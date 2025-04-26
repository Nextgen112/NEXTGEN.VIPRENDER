// server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

// Enable __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ IP Allowlist
const allowedIps = ['62.201.240.35', '62.201.243.131', '62.201.240.35']; // Your allowed IPs here

app.use((req, res, next) => {
  const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const cleanIp = requestIp.replace('::ffff:', '').split(',')[0];

  console.log("Incoming connection from IP:", cleanIp); // Log every IP trying to connect

  if (allowedIps.includes(cleanIp)) {
    next();
  } else {
    res.status(403).send(`
      <div style="text-align: center; margin-top: 100px; font-family: Arial;">
        <h1>🚫 Access Denied 🚫</h1>
        <p>Your IP is not authorized to access this server.</p>
        <br>
        <a href="https://discord.gg/tHSMDZQD" target="_blank" style="font-size: 18px; color: red;">Join our Discord for Access 💬</a>
      </div>
    `);
  }
});

// ✅ Serve WarCommander.js and other static files
app.use(express.static(__dirname));

// ✅ Home Page Route
app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; margin-top: 100px; font-family: Arial;">
      <h1 style="color: #4CAF50;">🚀 War Commander Backend Online 🚀</h1>
      <h2 style="color: #333;">👾 NEXT Generation Hackers 👾</h2>
      <p style="font-size: 18px;">Welcome to the future of WarCommander domination.<br>Backend server powered by passion and skill!</p>
      <br>
      <a href="https://discord.gg/tHSMDZQD" target="_blank" style="font-size: 20px; color: blue;">💬 Join our Discord 💬</a>
    </div>
  `);
});

// ✅ Health Check Route (optional)
app.get('/status', (req, res) => {
  res.json({
    status: 'ONLINE ✅',
    updated: new Date().toISOString()
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NEXT Generation Hackers server running on port ${PORT}`);
});
