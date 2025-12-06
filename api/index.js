// api/index.js - ФОРМАТ ДЛЯ VERCEL SERVERLESS
export default async function handler(req, res) {
  console.log(`📨 ${req.method} ${req.url}`);
  
  // Устанавливаем заголовки
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Обработка разных маршрутов
  const path = req.url.split('?')[0];
  
  if (path === '/' || path === '') {
    return res.status(200).json({
      success: true,
      message: '🚀 SiaMatch Backend РАБОТАЕТ!',
      service: 'Dating App API',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /',
        'GET /api/health',
        'GET /api/users/:city',
        'POST /api/register',
        'POST /api/swipe'
      ]
    });
  }
  
  if (path === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    });
  }
  
  if (path.startsWith('/api/users/')) {
    const city = path.split('/')[3] || 'Moscow';
    return res.status(200).json({
      city: city,
      users: [
        { id: 1, name: 'Анна', age: 25, city: city },
        { id: 2, name: 'Максим', age: 28, city: city }
      ],
      count: 2
    });
  }
  
  // 404 для всех остальных
  return res.status(404).json({
    error: 'Not Found',
    path: req.url,
    method: req.method,
    available: ['/', '/api/health', '/api/users/:city']
  });
}
