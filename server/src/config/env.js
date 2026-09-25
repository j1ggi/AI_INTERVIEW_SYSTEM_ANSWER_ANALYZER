import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mockvue',
  JWT_SECRET: process.env.JWT_SECRET || 'mockvue_super_secure_jwt_secret_key_viva_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '36500d',
  AI_PROVIDER: process.env.AI_PROVIDER || 'fallback',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
  CV_MONITORING_MODE: process.env.CV_MONITORING_MODE || 'client',
  CV_SERVICE_URL: process.env.CV_SERVICE_URL || 'http://localhost:8000',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
