import express from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    success: true,
    service: 'MockVue API Engine',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'none',
      host: mongoose.connection.host || 'none',
    },
    ai: {
      configuredProvider: env.AI_PROVIDER,
      model: env.AI_MODEL,
      hasApiKey: Boolean(env.AI_API_KEY),
    },
    monitoring: {
      mode: env.CV_MONITORING_MODE,
    },
    environment: env.NODE_ENV,
  });
});

export default router;
