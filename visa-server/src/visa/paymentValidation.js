/**
 * Visa Payment Account Validation API
 * Validates payment methods before allowing bounty creation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const VISA_PAV_BASE_URL = process.env.VISA_PAV_BASE_URL || 'https://sandbox.api.visa.com';
const VISA_USER_ID = process.env.VISA_USER_ID;
const VISA_PASSWORD = process.env.VISA_PASSWORD;
const VISA_CERT_PATH = process.env.VISA_CERT_PATH;
const VISA_KEY_PATH = process.env.VISA_KEY_PATH;

/**
 * Validate a payment account before creating bounty
 * @param {Object} paymentData
 * @param {string} paymentData.cardNumber - Primary account number
 * @param {string} paymentData.cvv - Card verification value
 * @param {string} paymentData.expiry - Expiration date (MMYY)
 * @returns {Promise<Object>} Validation result
 */
async function validatePaymentAccount(paymentData) {
  const { cardNumber, cvv, expiry } = paymentData;

  console.log('[Payment Validation] Validating account:', {
    card: `****${cardNumber.slice(-4)}`,
    expiry
  });

  // Mock mode for development
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    console.log('[Payment Validation] MOCK MODE - Simulating validation');
    
    // Simulate validation based on card number
    const isValid = cardNumber.startsWith('4'); // Visa cards start with 4
    
    return {
      valid: isValid,
      validationToken: isValid ? `VAL_MOCK_${Date.now()}` : null,
      canPostBounty: isValid,
      responseCode: isValid ? 'ACCOUNT_VALID' : 'ACCOUNT_INVALID',
      message: isValid ? 'Payment method validated' : 'Invalid card number',
      timestamp: new Date().toISOString()
    };
  }

  // Real Visa PAV API call
  try {
    const requestBody = {
      primaryAccountNumber: cardNumber,
      cardCvv2Value: cvv,
      cardExpiryDate: expiry
    };

    const response = await makeVisaRequest('/pav/v1/accountvalidation', 'POST', requestBody);

    const isValid = response.status === 'ACCOUNT_VALID';

    return {
      valid: isValid,
      validationToken: response.validationToken || null,
      canPostBounty: isValid,
      responseCode: response.status,
      message: response.message || 'Validation complete',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Payment Validation] Validation failed:', error.message);
    return {
      valid: false,
      validationToken: null,
      canPostBounty: false,
      responseCode: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Verify a previously validated token
 * @param {string} validationToken 
 * @returns {Promise<boolean>}
 */
async function verifyValidationToken(validationToken) {
  console.log('[Payment Validation] Verifying token');

  // Mock mode
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    return validationToken && validationToken.startsWith('VAL_');
  }

  try {
    const response = await makeVisaRequest(`/pav/v1/verification/${validationToken}`, 'GET');
    return response.valid === true;
  } catch (error) {
    console.error('[Payment Validation] Token verification failed:', error.message);
    return false;
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
      hostname: new URL(VISA_PAV_BASE_URL).hostname,
      path: endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: `${VISA_USER_ID}:${VISA_PASSWORD}`
    };

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
  validatePaymentAccount,
  verifyValidationToken
};

