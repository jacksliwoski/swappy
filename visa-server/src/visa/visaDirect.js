/**
 * Visa Direct API Integration
 * Handles instant payouts for bounty rewards
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const VISA_DIRECT_BASE_URL = process.env.VISA_DIRECT_BASE_URL || 'https://sandbox.api.visa.com';
const VISA_USER_ID = process.env.VISA_USER_ID;
const VISA_PASSWORD = process.env.VISA_PASSWORD;
const VISA_CERT_PATH = process.env.VISA_CERT_PATH;
const VISA_KEY_PATH = process.env.VISA_KEY_PATH;

/**
 * Send instant payout via Visa Direct
 * @param {Object} payoutData 
 * @param {string} payoutData.recipientPAN - Recipient's card number
 * @param {number} payoutData.amount - Amount to send
 * @param {string} payoutData.currency - Currency code (e.g., 'USD')
 * @param {string} payoutData.transactionId - Unique transaction ID
 * @param {string} payoutData.senderAccountNumber - Platform account number
 * @returns {Promise<Object>} Payout result
 */
async function sendPayout(payoutData) {
  const {
    recipientPAN,
    amount,
    currency = 'USD',
    transactionId,
    senderAccountNumber = process.env.PLATFORM_ACCOUNT_NUMBER || '4111111111111111'
  } = payoutData;

  console.log('[Visa Direct] Initiating payout:', {
    amount,
    currency,
    transactionId,
    recipient: `****${recipientPAN.slice(-4)}`
  });

  // For demo/development, return mock success
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    console.log('[Visa Direct] MOCK MODE - Simulating successful payout');
    return {
      success: true,
      transactionId: `VD_MOCK_${Date.now()}`,
      amount,
      currency,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      message: 'Mock payout successful'
    };
  }

  // Real Visa Direct API call
  try {
    const requestBody = {
      amount,
      currency,
      senderAccountNumber,
      recipientPrimaryAccountNumber: recipientPAN,
      transactionIdentifier: transactionId,
      localTransactionDateTime: new Date().toISOString(),
      purposeOfPayment: 'Swappy Bounty Reward'
    };

    const response = await makeVisaRequest('/visadirect/v1/pullfundstransactions', 'POST', requestBody);

    return {
      success: response.responseCode === '00',
      transactionId: response.transactionIdentifier,
      amount,
      currency,
      status: response.responseCode === '00' ? 'SUCCESS' : 'FAILED',
      timestamp: new Date().toISOString(),
      message: response.responseMessage || 'Payout processed'
    };
  } catch (error) {
    console.error('[Visa Direct] Payout failed:', error.message);
    throw new Error(`Visa Direct payout failed: ${error.message}`);
  }
}

/**
 * Get payout transaction status
 * @param {string} transactionId 
 * @returns {Promise<Object>}
 */
async function getPayoutStatus(transactionId) {
  console.log('[Visa Direct] Checking payout status:', transactionId);

  // Mock mode
  if (process.env.MOCK_VISA_API === 'true' || !VISA_USER_ID) {
    return {
      transactionId,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const response = await makeVisaRequest(`/visadirect/v1/pullfundstransactions/${transactionId}`, 'GET');
    return {
      transactionId: response.transactionIdentifier,
      status: response.transactionStatus,
      timestamp: response.transactionDateTime
    };
  } catch (error) {
    console.error('[Visa Direct] Status check failed:', error.message);
    throw error;
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
      hostname: new URL(VISA_DIRECT_BASE_URL).hostname,
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
  sendPayout,
  getPayoutStatus
};

