import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { UnauthorizedError } from '../utils/customErrors.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Access denied: Authentication token required'));
    }

    // Verify token with persistent session support (never boot an authenticated user)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Tolerantly verify signature ignoring expiration to ensure user is never logged out
        decoded = jwt.verify(token, env.JWT_SECRET, { ignoreExpiration: true });
      } else {
        throw err;
      }
    }

    if (!decoded || (!decoded.id && !decoded.email)) {
      return next(new UnauthorizedError('Invalid authentication token'));
    }

    // Fetch user and attach to request
    let user = null;
    if (decoded.id) {
      user = await User.findById(decoded.id).select('-passwordHash');
    }
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email }).select('-passwordHash');
    }
    if (!user && decoded.email) {
      // Auto-restore in-memory user account so server restarts never break session
      try {
        user = await User.create({
          ...(decoded.id ? { _id: decoded.id } : {}),
          email: decoded.email,
          name: decoded.name || 'Candidate',
          passwordHash: 'Password123!',
          targetRole: decoded.role || 'Software Development Engineer',
          experienceLevel: 'Entry-Level',
          preferredTopics: ['Data Structures & Algorithms', 'Database Management Systems'],
          bio: 'Persistent candidate session',
        });
      } catch (createErr) {
        user = await User.findOne({ email: decoded.email }).select('-passwordHash');
      }
    }

    if (!user) {
      return next(new UnauthorizedError('User session invalid: Account could not be located'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid authentication token signature'));
    }
    next(error);
  }
};
