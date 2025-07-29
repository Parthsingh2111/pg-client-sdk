/**
 * Validate required fields.
 * @param {Object} data - Data to validate
 * @param {string[]} fields - Required fields
 */
function validateRequiredFields(data, fields) {
  for (const field of fields) {
    const keys = field.split('.');
    let value = data;
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
  // Validation successful - no need for console log in production
}

/**
 * Validate email format.
 * @param {string} email - Email to validate
 * @returns {string} Validated email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}
// console.log('✅ Email format is valid:', email);
/**
 * Sanitize input to prevent injection.
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  return input.replace(/[<>&;]/g, '');
}

module.exports = { validateRequiredFields, validateEmail, sanitizeInput };