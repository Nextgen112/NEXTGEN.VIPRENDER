import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simple route to check server is alive
app.get('/', (req, res) => {
  res.send('WarCommander backend is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
