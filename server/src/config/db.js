import mongoose from 'mongoose';
import { env } from './env.js';
import { seedDemoUsers } from '../utils/seedData.js';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    console.log(`[DB] Attempting MongoDB connection to: ${env.MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);

    // Try standard URI with short timeout for quick fallback
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`[DB] MongoDB Connected Successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    await seedDemoUsers();
    return { type: 'standard', host: mongoose.connection.host };
  } catch (err) {
    console.warn(`[DB] Standard MongoDB connection failed: ${err.message}`);

    if (env.isDev) {
      console.log('[DB] Development mode active: Initializing in-memory MongoDB fallback...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServerInstance.getUri();

        await mongoose.connect(memoryUri);
        console.log(`[DB] In-Memory MongoDB Initialized & Connected at: ${memoryUri}`);
        await seedDemoUsers();
        return { type: 'in-memory', host: 'in-memory-db' };
      } catch (memErr) {
        console.error(`[DB] Failed to initialize in-memory fallback MongoDB: ${memErr.message}`);
        throw memErr;
      }
    } else {
      console.error('[DB] Fatal Database Error in production environment.');
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
      console.log('[DB] In-Memory MongoDB Server Stopped.');
    }
    console.log('[DB] Database Disconnected.');
  } catch (err) {
    console.error(`[DB] Error during disconnection: ${err.message}`);
  }
};
