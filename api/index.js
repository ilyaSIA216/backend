// api/index.js - Обновленная версия
module.exports = async (req, res) => {
  // Устанавливаем заголовки
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Обрабатываем OPTIONS запросы (для CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    return res.end();
  }
  
  // Обрабатываем разные URL
  const url = req.url.split('?')[0]; // Убираем query параметры
  
  if (url === '/' || url === '') {
    return res.end(JSON.stringify({
      success: true,
      message: '🚀 SiaMatch Backend работает!',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      endpoints: [
        'GET /',
        'GET /api/health',
        'GET /api/users/:city',
        'POST /api/register',
        'POST /api/swipe'
      ]
    }, null, 2));
  }
  
  if (url === '/api/health') {
    return res.end(JSON.stringify({
      status: 'OK',
      service: 'SiaMatch Backend',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    }, null, 2));
  }
  
  if (url.startsWith('/api/users/')) {
    const city = url.split('/')[3] || 'Moscow';
    return res.end(JSON.stringify({
      success: true,
      city: city,
      users: [
        { id: 1, name: 'Алексей', age: 28, city: city, gender: 'male' },
        { id: 2, name: 'Анна', age: 25, city: city, gender: 'female' },
        { id: 3, name: 'Максим', age: 30, city: city, gender: 'male' }
      ],
      count: 3,
      timestamp: new Date().toISOString()
    }, null, 2));
  }
  
  // POST маршруты
  if (req.method === 'POST') {
    if (url === '/api/register') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const data = body ? JSON.parse(body) : {};
        return res.end(JSON.stringify({
          success: true,
          message: 'Пользователь зарегистрирован',
          data: data,
          userId: Date.now(),
          timestamp: new Date().toISOString()
        }, null, 2));
      });
      return;
    }
    
    if (url === '/api/swipe') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const data = body ? JSON.parse(body) : {};
        return res.end(JSON.stringify({
          success: true,
          message: 'Свайп сохранен',
          isMatch: Math.random() > 0.7,
          data: data,
          timestamp: new Date().toISOString()
        }, null, 2));
      });
      return;
    }
  }
  
  // Если ничего не подошло - 404
  res.statusCode = 404;
  res.end(JSON.stringify({
    error: 'Not Found',
    path: req.url,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/users/:city',
      'POST /api/register',
      'POST /api/swipe'
    ],
    timestamp: new Date().toISOString()
  }, null, 2));
};
