import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userOrId) => {
  const payload = typeof userOrId === 'object' && userOrId !== null
    ? {
        id: String(userOrId._id || userOrId.id),
        email: userOrId.email,
        name: userOrId.name,
        role: userOrId.targetRole
      }
    : { id: String(userOrId) };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '36500d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
