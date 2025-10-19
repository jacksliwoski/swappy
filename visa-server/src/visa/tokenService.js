/**
 * Visa Token Service (VTS)
 * Provides identity verification and fraud prevention
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const VISA_VTS_BASE_URL = process.env.VISA_VTS_BASE_URL || 'https://sandbox.api.visa.com';
const VISA_USER_ID = process.env.VISA_USER_ID;
const VISA_PASSWORD = process.env.VISA_PASSWORD;
const VISA_VTS_API_KEY = process.env.VISA_VTS_API_KEY;
const VISA_CERT_PATH = process.env.VISA_CERT_PATH;
const VISA_KEY_PATH = process.env.VISA_KEY_PATH;

/**
 * Verify user identity for high-value transactions
 * @param {Object} verificationData
 * @param {string} verificationData.userId - User ID
 * @param {string} verificationData.deviceId - Device fingerprint
 * @param {Object} verificationData.location - User location
 * @param {string} verificationData.verificationMethod - Verification method (e.g., '3DS')
 * @returns {Promise<Object>} Verification result
 */
async function verifyUserIdentity(verificationData) {
  const { userId, deviceId, location, verificationMethod = '3DS' } = verificationData;

  console.log('[Token Service] Verifying user identity:', { userId, method: verificationMethod });

  // Mock mode for development
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    console.log('[Token Service] MOCK MODE - Simulating identity verification');
    
    // Simulate verification with high trust score
    const trustScore = 0.85 + Math.random() * 0.1; // 0.85-0.95
    
    return {
      verified: trustScore > 0.7,
      trustScore,
      riskScore: trustScore,
      canClaim: trustScore > 0.7,
      status: trustScore > 0.7 ? 'VERIFIED' : 'FAILED',
      verificationMethod,
      deviceTrusted: true,
      timestamp: new Date().toISOString()
    };
  }

  // Real Visa VTS API call
  try {
    const requestBody = {
      userId,
      deviceFingerprint: deviceId,
      location,
      verificationMethod
    };

    const response = await makeVisaRequest('/vts/v1/verify', 'POST', requestBody);

    const verified = response.status === 'VERIFIED';
    const riskScore = response.riskScore || 0.5;

    return {
      verified,
      trustScore: riskScore,
      riskScore,
      canClaim: verified && riskScore > 0.7,
      status: response.status,
      verificationMethod,
      deviceTrusted: response.deviceTrusted || false,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Token Service] Identity verification failed:', error.message);
    return {
      verified: false,
      trustScore: 0,
      riskScore: 0,
      canClaim: false,
      status: 'ERROR',
      verificationMethod,
      deviceTrusted: false,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Perform fraud check for suspicious activity
 * @param {Object} fraudData
 * @param {string} fraudData.userId - User ID
 * @param {string} fraudData.transactionType - Type of transaction
 * @param {number} fraudData.amount - Transaction amount
 * @returns {Promise<Object>} Fraud check result
 */
async function performFraudCheck(fraudData) {
  const { userId, transactionType, amount } = fraudData;

  console.log('[Token Service] Performing fraud check:', { userId, type: transactionType, amount });

  // Mock mode
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    // Simulate fraud score (lower is better)
    const fraudScore = Math.random() * 0.3; // 0-0.3 = low fraud risk
    
    return {
      safe: fraudScore < 0.5,
      fraudScore,
      riskLevel: fraudScore < 0.2 ? 'low' : fraudScore < 0.5 ? 'medium' : 'high',
      allowTransaction: fraudScore < 0.5,
      timestamp: new Date().toISOString()
    };
  }

  // Real Visa fraud check API
  try {
    const response = await makeVisaRequest('/vts/v1/fraudcheck', 'POST', fraudData);
    
    return {
      safe: response.fraudScore < 0.5,
      fraudScore: response.fraudScore,
      riskLevel: response.riskLevel,
      allowTransaction: response.allowed,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Token Service] Fraud check failed:', error.message);
    // On error, be cautious and flag as medium risk
    return {
      safe: false,
      fraudScore: 0.5,
      riskLevel: 'medium',
      allowTransaction: false,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Make authenticated request to Visa API
 * @param {string} endpoint 
 * @param {string} method 
 * @param {Object} body 
 * @returns {Promise<Object>}
 */
function makeVisaRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(VISA_VTS_BASE_URL).hostname,
      path: endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: `${VISA_USER_ID}:${VISA_PASSWORD}`
    };

    // Add API key if provided
    if (VISA_VTS_API_KEY) {
      options.headers['X-API-KEY'] = VISA_VTS_API_KEY;
    }

    // Add certificates if provided
    if (VISA_CERT_PATH && VISA_KEY_PATH) {
      options.cert = fs.readFileSync(path.resolve(VISA_CERT_PATH));
      options.key = fs.readFileSync(path.resolve(VISA_KEY_PATH));
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response from Visa API'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = {
  verifyUserIdentity,
  performFraudCheck
};

