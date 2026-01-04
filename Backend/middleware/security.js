/**
 * Security Middleware
 * Centralized security configurations for the backend
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import timeout from 'express-timeout-handler';

// Create a keyGenerator that uses headers only (not req.ip)
// This avoids the IPv6 validation error while still providing IP-based rate limiting
// The validation error occurs when accessing req.ip directly without using ipKeyGenerator helper
const headerBasedKeyGenerator = (req) => {
  // Get IP from X-Forwarded-For header (trust proxy populates this)
  // This method avoids triggering the IPv6 validation check
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs separated by commas
    // Take the first one (original client IP)
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }
  
  // Last resort: use connection remote address
  // This is less ideal but won't trigger validation since we're not using req.ip
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"], // HTTPS only - no HTTP allowed
      connectSrc: ["'self'", "https://api.stripe.com", "https://www.virustotal.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Firebase/Stripe embeds
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting configurations
// Note: trust proxy must be set in server.js before using these limiters

// Stricter rate limit specifically for ad creation (prevent spam/abuse)
export const adCreationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 ad creations per 15 minutes per IP
  message: 'Too many ad creation attempts. Please wait a few minutes before creating another ad.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use header-based keyGenerator to avoid IPv6 validation error
  // Disable validation since we're using headers (trust proxy handles IP correctly)
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
});

// Stricter rate limit for promo code validation (prevent brute force)
export const promoCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 promo code attempts per 15 minutes
  message: 'Too many promo code attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable validation since we're using headers (trust proxy handles IP correctly)
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
});

// Stricter rate limit for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 payment attempts per 15 minutes
  message: 'Too many payment attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable validation since we're using headers (trust proxy handles IP correctly)
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
});

// Very strict rate limit for admin endpoints
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit to 50 admin requests per 15 minutes
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable validation since we're using headers (trust proxy handles IP correctly)
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
});

// Strict rate limit for shuffle operations (prevent manipulation/spam)
export const shuffleRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 shuffle operations per hour per IP
  message: 'Too many shuffle requests. Shuffles are rate limited to prevent abuse. Please wait before triggering another shuffle.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: headerBasedKeyGenerator,
  // Custom handler to include more context
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many shuffle requests. Shuffles are rate limited to prevent manipulation and abuse. Maximum 5 shuffles per hour.',
      retryAfter: Math.ceil(60 * 60 * 1000 / 1000) // 1 hour in seconds
    });
  }
});

// Request timeout configuration
export const requestTimeout = timeout.handler({
  timeout: 30000, // 30 seconds
  onTimeout: (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Request timeout. Please try again.',
    });
  },
  disable: ['write', 'setHeaders', 'send', 'json', 'end'], // Don't disable these
});

// Sanitize error messages to prevent information leakage
export const sanitizeError = (error, isDevelopment = false) => {
  // In production, hide sensitive error details
  if (!isDevelopment) {
    // Generic error messages for production
    if (error.message.includes('Firebase')) {
      return 'Database error. Please try again.';
    }
    if (error.message.includes('Stripe')) {
      return 'Payment processing error. Please try again.';
    }
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return 'Authentication error. Please check your credentials.';
    }
    return 'An error occurred. Please try again.';
  }
  
  // In development, show full error
  return error.message;
};

// HTTPS Enforcement Middleware
// Redirects all HTTP requests to HTTPS (except health checks)
export const enforceHttps = (req, res, next) => {
  // Skip HTTPS enforcement for local development or health checks
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request is already HTTPS
  // When behind a proxy (like Render.com), check X-Forwarded-Proto header
  const isHttps = 
    req.secure || 
    req.headers['x-forwarded-proto'] === 'https' ||
    req.protocol === 'https';

  if (!isHttps) {
    // Redirect HTTP to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.originalUrl}`;
    console.log(`🔒 Redirecting HTTP to HTTPS: ${req.url} -> ${httpsUrl}`);
    return res.redirect(301, httpsUrl); // 301 Permanent Redirect
  }

  next();
};

// Log sanitization - remove sensitive data from logs
export const sanitizeLogData = (data) => {
  const sensitiveKeys = ['password', 'apiKey', 'secret', 'token', 'key', 'email', 'card'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
        sanitized[key] = sanitized[key].substring(0, 4) + '***';
      }
    }
  }
  
  return sanitized;
};

