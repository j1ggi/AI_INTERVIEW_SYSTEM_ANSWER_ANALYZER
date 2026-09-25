import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Structured response
  const response = {
    success: false,
    status: err.status || (statusCode >= 500 ? 'error' : 'fail'),
    message,
    ...(details && { details }),
    ...(env.isDev && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    console.error('[SERVER ERROR]', err);
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl} — route not found on this server.`,
  });
};
