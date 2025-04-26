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

// ✅ IP Allowlist Middleware
const allowedIps = ['62.201.240.35', '127.0.0.1']; // Add your IP here

app.use((req, res, next) => {
  const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const cleanIp = requestIp.replace('::ffff:', ''); // Remove IPv6 prefix if exists
  if (allowedIps.includes(cleanIp)) {
    next();
  } else {
    res.status(403).send('Access Denied 🚫');
  }
});

// Serve WarCommander.js
app.use(express.static(__dirname));

// Default route
app.get('/', (req, res) => {
  res.send('WarCommander backend is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
