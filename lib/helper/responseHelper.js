/**
 * Response Helper for PayGlocal SDK
 * Returns raw responses from PayGlocal API without any processing
 * This ensures the SDK doesn't make assumptions about response structure
 * and allows consumers to handle the actual PayGlocal response format
 */

/**
 * Return the complete raw response from PayGlocal API
 * This approach ensures the SDK doesn't make assumptions about response structure
 * and allows consumers to handle response formatting as needed
 * @param {Object} response - Complete API response from PayGlocal
 * @returns {Object} Complete raw response
 */
function getRawResponse(response) {
  return response;
}

// All response extraction functions now return the raw response
function extractStandardPaymentResponse(response) { 
  return getRawResponse(response); 
}

function extractAuthPaymentResponse(response) { 
  return getRawResponse(response); 
}

function extractStandardResponse(response) { 
  return getRawResponse(response); 
}

function extractSiResponse(response, standingInstruction) { 
  return getRawResponse(response); 
}

function extractPaymentResponse(response, options = {}) { 
  return getRawResponse(response); 
}

// Keep the URL extraction functions for internal use if needed
function extractPaymentUrl(response) {
  return response?.data?.redirectUrl ||
         response?.data?.redirect_url ||
         response?.data?.payment_link ||
         response?.redirectUrl ||
         response?.redirect_url ||
         response?.payment_link ||
         null;
}

function extractStatusUrl(response) {
  return response?.data?.statusUrl ||
         response?.data?.status_url ||
         response?.statusUrl ||
         response?.status_url ||
         null;
}

module.exports = {
  getRawResponse,
  extractPaymentUrl,
  extractStatusUrl,
  extractPaymentResponse,
  extractStandardPaymentResponse,
  extractAuthPaymentResponse,
  extractStandardResponse,
  extractSiResponse
}; 