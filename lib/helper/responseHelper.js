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


function extractPaymentResponse(response) { 
  return response
}


module.exports = {
  extractPaymentResponse,
}; 