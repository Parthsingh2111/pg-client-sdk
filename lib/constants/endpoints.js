/**
 * PayGlocal API Endpoints
 */

const ENDPOINTS = {
  // Payment endpoints
  PAYMENT: {
    INITIATE: '/gl/v1/payments/initiate/paycollect',
  },
  
  // Transaction endpoints
  TRANSACTION_SERVICE: {
    STATUS: '/gl/v1/payments/{gid}/status',
    REFUND: '/gl/v1/payments/{gid}/refund',
    CAPTURE: '/gl/v1/payments/{gid}/capture',
    AUTH_REVERSAL: '/gl/v1/payments/{gid}/auth-reversal',
  },
  
  // Standing Instruction endpoints
  SI_SERVICE: {
    MODIFY: '/gl/v1/payments/si/modify',
    STATUS: '/gl/v1/payments/si/status',
    SALE: '/gl/v1/payments/si/sale',
  },
};

/**
 * Build endpoint URL with parameters
 * @param {string} endpoint - Base endpoint
 * @param {Object} params - URL parameters
 * @returns {string} Complete endpoint URL
 */
function buildEndpoint(endpoint, params = {}) {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value);
  });
  return url;
}

module.exports = {
  ENDPOINTS,
  buildEndpoint,
}; 