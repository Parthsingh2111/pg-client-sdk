/**
 * Build JWT headers with token
 * @param {string} jws - JWS token
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object
 */
function buildJwtHeaders(jws, customHeaders = {}) {
  return {
    'Content-Type': 'text/plain',
    'x-gl-token-external': jws,
    ...customHeaders
  };
}

/**
 * Build API key headers
 * @param {string} apiKey - API key
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object
 */
function buildApiKeyHeaders(apiKey, customHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'x-gl-auth': apiKey,
    ...customHeaders
  };
}

/**
 * Build JSON headers
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object
 */
function buildJsonHeaders(customHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    ...customHeaders
  };
}

/**
 * Build headers for SI operations with method override
 * @param {string} jws - JWS token
 * @param {string} method - HTTP method to override
 * @param {Object} customHeaders - Additional custom headers
 * @returns {Object} Headers object
 */
function buildSiHeaders(jws, method = 'PUT', customHeaders = {}) {
  return {
    'Content-Type': 'text/plain',
    'x-gl-token-external': jws,
    'x-http-method-override': method,
    ...customHeaders
  };
}

/**
 * Merge headers with custom headers
 * @param {Object} baseHeaders - Base headers
 * @param {Object} customHeaders - Custom headers to merge
 * @returns {Object} Merged headers object
 */
function mergeHeaders(baseHeaders, customHeaders = {}) {
  return {
    ...baseHeaders,
    ...customHeaders
  };
}

module.exports = {
  buildJwtHeaders,
  buildApiKeyHeaders,
  buildJsonHeaders,
  buildSiHeaders,
  mergeHeaders
}; 