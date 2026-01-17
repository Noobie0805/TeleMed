import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { symptomCheckerHandler } from './src/controllers/symptomChecker.controller.js';
import { chatHandler } from './src/controllers/chat.controller.js';
import { cacheMiddleware } from './src/middlewares/cache.redis.js';
import { internalAuth } from './src/middlewares/internalAuth.middleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*'
}));


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'AI Service running', timestamp: new Date().toISOString() });
});

// AI Routes (Phase 1.2: Internal API only)
app.post('/symptomChecker', cacheMiddleware(600), internalAuth, symptomCheckerHandler);

app.post('/chat', cacheMiddleware(60), internalAuth, chatHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

app.listen(port, () => {
    console.log(`🚀 AI Service running on http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/health`);
});



