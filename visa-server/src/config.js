// CommonJS config
require('dotenv').config({ path: __dirname + '/../.env' });

const config = {
  port: Number(process.env.PORT || 7002),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  visaBaseUrl: process.env.VISA_BASE_URL || 'https://sandbox.api.visa.com',
  visaClientCrt: process.env.VISA_CLIENT_CRT,
  visaClientKey: process.env.VISA_CLIENT_KEY,
  visaRootCa: process.env.VISA_ROOT_CA,

  visaUsername: process.env.VISA_USERNAME || '',
  visaPassword: process.env.VISA_PASSWORD || '',
  visaPavPath:
    process.env.VISA_PAV_PATH ||
    '/paymentaccountvalidation/v5/accountverification',

  mock: (process.env.MOCK || 'true').toLowerCase() === 'true',
};

module.exports = { config };
