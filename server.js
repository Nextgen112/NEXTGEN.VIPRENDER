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
const allowedIps = ['62.201.240.35', '127.0.0.1']; // Your real IP and local IP

app.use((req, res, next) => {
  const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const cleanIp = requestIp.replace('::ffff:', '').split(',')[0]; // Remove IPv6 prefix + take first IP if multiple

  console.log("Request from IP:", cleanIp); // Debug print

  if (allowedIps.includes(cleanIp)) {
    next();
  } else {
    res.status(403).send('🚫 Access Denied 🚫<br>Contact admin on Discord: <a href="https://discord.gg/tHSMDZQD" target="_blank">Join Here</a>');
  }
});

// Serve static files (your WarCommander.js etc)
app.use(express.static(__dirname));

// Default homepage
app.get('/', (req, res) => {
  res.send('WarCommander backend is running 🚀');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
