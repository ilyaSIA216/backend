#!/bin/bash
echo "🚀 Deploying..."
git pull origin main
npm ci --production
pm2 restart telegram-dating || pm2 start ecosystem.config.js
echo "✅ Deploy complete!"
