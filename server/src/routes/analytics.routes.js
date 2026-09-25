import express from 'express';
import {
  getOverview,
  getPerformance,
  logMonitoringEvent,
  getMonitoringEvents,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All analytics endpoints require valid JWT

router.get('/overview', getOverview);
router.get('/performance', getPerformance);
router.post('/interviews/:id/monitoring', logMonitoringEvent);
router.get('/interviews/:id/monitoring', getMonitoringEvents);

export default router;
