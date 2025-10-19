// server/src/visaClient.js
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const { config } = require('./config');

// --- HTTPS (mTLS) agent using your cert + key ---
const httpsAgent = new https.Agent({
  cert: fs.readFileSync(config.visaClientCrt),
  key: fs.readFileSync(config.visaClientKey),
  ca: config.visaRootCa ? fs.readFileSync(config.visaRootCa) : undefined, // usually undefined on macOS
  rejectUnauthorized: !config.visaRootCa, // allow system trust store if no CA provided
});

// --- Axios client with base URL + auth ---
const client = axios.create({
  baseURL: config.visaBaseUrl,                 // https://sandbox.api.visa.com
  httpsAgent,
  timeout: 15000,
  headers: { 'content-type': 'application/json', accept: 'application/json' },
  auth: { username: config.visaUsername, password: config.visaPassword }, // HTTP Basic
});

// Helpers
function sixDigitTrace() {
  // Visa wants a 6-digit STAN (systemsTraceAuditNumber)
  return String(Math.floor(100000 + Math.random() * 900000));
}
function rrn12() {
  // 12-char retrieval reference number (simple demo format)
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(-2);
  const ddd = String(
    Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000)
  ).padStart(3, '0'); // day of year
  const hhmm = String(now.getUTCHours()).padStart(2, '0') + String(now.getUTCMinutes()).padStart(2, '0');
  return `${y}${ddd}${hhmm}000`; // simple, valid length 12
}

/**
 * Payment Account Validation – Card Validation (v1)
 * Required: primaryAccountNumber, cardExpiryDate, acquiringBin, acquirerCountryCode
 */
async function pav(pan, expMonth, expYear) {
  const urlPath = config.visaPavPath || '/pav/v1/cardvalidation';

  const body = {
    systemsTraceAuditNumber: sixDigitTrace(),                 // recommended
    retrievalReferenceNumber: rrn12(),                        // recommended
    primaryAccountNumber: String(pan),
    cardExpiryDate: {
      month: String(expMonth).padStart(2, '0'),
      year: String(expYear),
    },
    acquiringBin: process.env.VISA_ACQUIRING_BIN,            // <-- from .env
    acquirerCountryCode: process.env.VISA_ACQUIRER_COUNTRY_CODE, // <-- from .env (e.g., "840")
    // Minimal cardAcceptor; add more fields if your project requires
    cardAcceptor: {
      name: 'Swappy Demo',
      idCode: 'SWAPPY01',
      address: {
        country: process.env.VISA_ACQUIRER_COUNTRY_CODE || '840',
      },
    },
  };

  // basic sanity so we fail clearly before calling Visa
  for (const f of ['acquiringBin', 'acquirerCountryCode']) {
    if (!body[f]) {
      return { error: true, status: 400, data: { message: `Missing ${f}. Set VISA_${f.toUpperCase()} in .env` } };
    }
  }

  try {
    const resp = await client.post(urlPath, body);
    const ok = resp.status >= 200 && resp.status < 300;
    return ok ? { error: false, status: resp.status, data: resp.data } :
                { error: true, status: resp.status, data: resp.data };
  } catch (e) {
    return {
      error: true,
      status: (e.response && e.response.status) || 500,
      data: (e.response && e.response.data) || { message: String(e) },
    };
  }
}

module.exports = { pav };
