// src/config.js
require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 7010),
  mock: String(process.env.MOCK || 'false').toLowerCase() === 'true',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 30),
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  // mailer: write emails to files, no SMTP needed
  outboxDir: process.env.OUTBOX_DIR || 'data/outbox',

  // Visa API configuration
  visaBaseUrl: process.env.VISA_BASE_URL,
  visaClientCrt: process.env.VISA_CLIENT_CRT,
  visaClientKey: process.env.VISA_CLIENT_KEY,
  visaRootCa: process.env.VISA_ROOT_CA,
  visaUsername: process.env.VISA_USERNAME,
  visaPassword: process.env.VISA_PASSWORD,
  visaPavPath: process.env.VISA_PAV_PATH
};

module.exports = { config };
