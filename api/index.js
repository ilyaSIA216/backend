// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Уберите эту строку если не используете pg

const app = express();
app.use(cors());
app.use(express.json());

// Диагностика
console.log('🚀 SiaMatch Backend starting with Node.js', process.version);

// ============ ВАРИАНТ 1: С БАЗОЙ ДАННЫХ ============
// Раскомментируйте если хотите использовать базу

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Проверка подключения к базе
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.log('⚠️ Database error:', err.message));
*/

// ============ ВАРИАНТ 2: БЕЗ БАЗЫ (проще) ============
const useDatabase = false; // поменяйте на true если подключили базу

// КОРЕНЬ
app.get('/', (req, res) => {
  res.json({
    service: 'SiaMatch Backend API',
    status: 'running ✅',
    version: '2.0.0',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    database: useDatabase ? 'connected' : 'test mode',
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      register: 'POST /api/register',
      users: 'GET /api/users/:city',
      swipe: 'POST /api/swipe'
    }
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SiaMatch Backend',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    database: useDatabase ? 'checking...' : 'test mode'
  });
});

// РЕГИСТРАЦИЯ
app.post('/api/register', (req, res) => {
  console.log('📝 Registration:', req.body);
  
  res.json({
    success: true,
    message: 'User registered successfully',
    data: req.body,
    userId: Date.now(),
    timestamp: new Date().toISOString()
  });
});

// ПОЛЬЗОВАТЕЛИ
app.get('/api/users/:city', (req, res) => {
  const { city } = req.params;
  
  const users = [
    {
      id: 1,
      username: 'user1_' + city,
      first_name: 'Алексей',
      age: 27,
      city: city,
      gender: 'male',
      bio: 'Инженер, люблю технологии'
    },
    {
      id: 2,
      username: 'user2_' + city,
      first_name: 'Мария',
      age: 24,
      city: city,
      gender: 'female',
      bio: 'Дизайнер, увлекаюсь искусством'
    },
    {
      id: 3,
      username: 'user3_' + city,
      first_name: 'Дмитрий',
      age: 30,
      city: city,
      gender: 'male',
      bio: 'Предприниматель, путешественник'
    }
  ];
  
  res.json({
    success: true,
    city: city,
    count: users.length,
    users: users
  });
});

// СВАЙП
app.post('/api/swipe', (req, res) => {
  const { swiperId, targetId, liked } = req.body;
  
  const isMatch = liked && Math.random() > 0.7;
  
  res.json({
    success: true,
    isMatch: isMatch,
    message: isMatch ? 'Мэтч! ❤️' : 'Свайп сохранен',
    data: req.body
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.path,
    method: req.method,
    available: ['GET /', 'GET /api/health', 'POST /api/register', 'GET /api/users/:city', 'POST /api/swipe']
  });
});

// Экспорт для Vercel
module.exports = app;
