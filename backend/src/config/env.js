// quiet: true désactive les messages promotionnels affichés par dotenv sur stdout
require('dotenv').config({ quiet: true });

function parseOrigins(value) {
  if (!value) return [];
  return value.split(',').map((origin) => origin.trim());
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  appName: process.env.APP_NAME || 'backend-api',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  cors: {
    origins: parseOrigins(process.env.CORS_ORIGIN),
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
  authRateLimit: {
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  mongodb: {
    // En test, isole la suite Jest dans une base dédiée pour ne jamais toucher aux données de dev.
    uri:
      (process.env.NODE_ENV || 'development') === 'test'
        ? process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
        : process.env.MONGODB_URI,
  },

  otp: {
    expiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM || `"${process.env.APP_NAME || 'backend-api'}" <no-reply@example.com>`,
  },

  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '10kb',

  logLevel: process.env.LOG_LEVEL || 'info',

  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isTest: (process.env.NODE_ENV || 'development') === 'test',
};

function validateEnv() {
  const required = [];

  if (!process.env.MONGODB_URI) required.push('MONGODB_URI');

  if (env.isProduction) {
    if (!process.env.JWT_SECRET) required.push('JWT_SECRET');
    if (!process.env.JWT_REFRESH_SECRET) required.push('JWT_REFRESH_SECRET');
    if (!process.env.COOKIE_SECRET) required.push('COOKIE_SECRET');
  }

  if (required.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${required.join(', ')}`
    );
  }
}

module.exports = { env, validateEnv };
