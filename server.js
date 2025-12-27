require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK ✅', 
    message: 'Telegram Dating Backend готов!', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/api/test', (req, res) => {
  res.json({ received: req.body, telegram: true });
});

// Telegram WebApp validation (для frontend)
app.post('/api/validate', (req, res) => {
  res.json({ valid: true, userId: req.body.user?.id || 'test' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dating Backend на http://localhost:${PORT}`);
  console.log('✅ Готов к работе с Telegram Mini App!');
});
