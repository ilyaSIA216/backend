// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 SiaMatch Backend starting with Node.js', process.version);

// Подключение к Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Проверка подключения
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected to Supabase'))
  .catch(err => console.log('⚠️ Database warning:', err.message));

// КОРЕНЬ
app.get('/', async (req, res) => {
  try {
    // Проверяем подключение к базе
    const dbCheck = await pool.query('SELECT NOW() as time');
    
    res.json({
      service: 'SiaMatch Backend API',
      status: 'running ✅',
      version: '2.0.0',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        time: dbCheck.rows[0].time
      },
      endpoints: {
        root: 'GET /',
        health: 'GET /api/health',
        register: 'POST /api/register',
        users: 'GET /api/users/:city',
        swipe: 'POST /api/swipe'
      }
    });
  } catch (error) {
    res.json({
      service: 'SiaMatch Backend API',
      status: 'running (database error)',
      error: error.message,
      database: false
    });
  }
});

// HEALTH CHECK с проверкой базы
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as db_time');
    
    res.json({
      status: 'OK',
      service: 'SiaMatch Backend',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        time: dbResult.rows[0].db_time
      },
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      service: 'SiaMatch Backend',
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// РЕГИСТРАЦИЯ (рабочая версия)
app.post('/api/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  
  const { telegramId, username, firstName, city, age, gender } = req.body;
  
  if (!telegramId) {
    return res.status(400).json({ error: 'telegramId is required' });
  }
  
  try {
    // Сначала проверим, существует ли таблица users
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Таблица не существует, создаем тестовую запись
      console.log('⚠️ Table "users" does not exist, using test mode');
      return res.json({
        success: true,
        message: 'Table not found - test registration',
        userId: Date.now(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Таблица существует, вставляем данные
    const result = await pool.query(
      `INSERT INTO users (telegram_id, username, first_name, city, age, gender) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (telegram_id) DO UPDATE SET
       username = $2, first_name = $3, city = $4, age = $5, gender = $6,
       updated_at = NOW()
       RETURNING id, created_at`,
      [telegramId, username, firstName, city, age, gender]
    );
    
    console.log('✅ User registered:', result.rows[0]);
    
    res.json({ 
      success: true, 
      userId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      hint: 'Check if users table exists in Supabase'
    });
  }
});

// ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ
app.get('/api/users/:city', async (req, res) => {
  const { city } = req.params;
  const { userId } = req.query;
  
  console.log(`🌆 Getting users for city: ${city}`);
  
  try {
    // Проверяем таблицу
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Возвращаем тестовых пользователей
      const testUsers = [
        {
          id: 1,
          username: 'test_user_1',
          first_name: 'Тестовый',
          age: 25,
          city: city,
          gender: 'male',
          bio: 'Тестовый пользователь 1'
        },
        {
          id: 2,
          username: 'test_user_2',
          first_name: 'Тестовая',
          age: 23,
          city: city,
          gender: 'female',
          bio: 'Тестовый пользователь 2'
        }
      ];
      
      return res.json({
        success: true,
        city: city,
        count: testUsers.length,
        users: testUsers,
        note: 'Test data - users table not found in database'
      });
    }
    
    // Получаем реальных пользователей
    let query, params;
    
    if (userId) {
      query = `
        SELECT id, username, first_name, age, city, gender, bio, created_at
        FROM users 
        WHERE city ILIKE $1 AND id != $2
        ORDER BY RANDOM() 
        LIMIT 20`;
      params = [`%${city}%`, userId];
    } else {
      query = `
        SELECT id, username, first_name, age, city, gender, bio, created_at
        FROM users 
        WHERE city ILIKE $1
        ORDER BY RANDOM() 
        LIMIT 20`;
      params = [`%${city}%`];
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      city: city,
      count: result.rows.length,
      users: result.rows
    });
    
  } catch (error) {
    console.error('💥 Users fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// СВАЙП
app.post('/api/swipe', async (req, res) => {
  console.log('💖 Swipe attempt:', req.body);
  
  const { swiperId, targetId, liked } = req.body;
  
  if (!swiperId || !targetId || liked === undefined) {
    return res.status(400).json({ 
      error: 'swiperId, targetId, and liked are required' 
    });
  }
  
  try {
    // Проверяем таблицу swipes
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'swipes'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Таблица не существует, возвращаем тестовый ответ
      const isMatch = liked && Math.random() > 0.7;
      return res.json({
        success: true,
        isMatch: isMatch,
        message: isMatch ? 'Match! (test mode)' : 'Swipe recorded (test mode)',
        note: 'swipes table not found'
      });
    }
    
    // Сохраняем свайп
    await pool.query(
      `INSERT INTO swipes (swiper_id, target_id, liked) 
       VALUES ($1, $2, $3)
       ON CONFLICT (swiper_id, target_id) DO UPDATE SET
       liked = $3, created_at = NOW()`,
      [swiperId, targetId, liked]
    );
    
    // Проверяем на мэтч
    let isMatch = false;
    if (liked) {
      const mutualCheck = await pool.query(
        `SELECT 1 FROM swipes 
         WHERE swiper_id = $1 AND target_id = $2 AND liked = true`,
        [targetId, swiperId]
      );
      
      isMatch = mutualCheck.rows.length > 0;
      
      if (isMatch) {
        // Создаем запись о мэтче (если таблица существует)
        try {
          await pool.query(
            `INSERT INTO matches (user1_id, user2_id) 
             VALUES ($1, $2)
             ON CONFLICT (user1_id, user2_id) DO NOTHING`,
            [Math.min(swiperId, targetId), Math.max(swiperId, targetId)]
          );
        } catch (matchError) {
          console.log('⚠️ Matches table might not exist:', matchError.message);
        }
      }
    }
    
    res.json({ 
      success: true, 
      isMatch: isMatch,
      message: isMatch ? 'It\'s a match! 🎉' : 'Swipe recorded'
    });
    
  } catch (error) {
    console.error('💥 Swipe error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/register',
      'GET /api/users/:city',
      'POST /api/swipe'
    ]
  });
});

module.exports = app;
