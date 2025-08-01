const { validationError } = require('../utils/errorHandler');

/**
 * Validate YYYYMMDD format for startDate
 * @param {string} dateStr - Date string in YYYYMMDD format
 * @returns {boolean} True if valid
 * @throws {Error} If date is invalid
 */
function validateStartDateFormat(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    throw validationError('startDate', 'Date must be a non-empty string');
  }

  if (!/^\d{8}$/.test(dateStr)) {
    throw validationError('startDate', `Invalid format: ${dateStr}. Use 'YYYYMMDD' format.`);
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 // basic check; you can make this stricter if needed
  ) {
    throw validationError('startDate', `Invalid value: ${dateStr}`);
  }

  return true;
}

/**
 * Convert Date object to YYYYMMDD format
 * @param {Date} date - Date object
 * @returns {string} Date in YYYYMMDD format
 */
function formatDateToYYYYMMDD(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw validationError('date', 'Invalid date object');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * Convert YYYYMMDD string to Date object
 * @param {string} dateStr - Date string in YYYYMMDD format
 * @returns {Date} Date object
 */
function parseYYYYMMDDToDate(dateStr) {
  validateStartDateFormat(dateStr);

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);

  return new Date(year, month, day);
}

/**
 * Check if a date is in the future
 * @param {string} dateStr - Date string in YYYYMMDD format
 * @returns {boolean} True if date is in the future
 */
function isDateInFuture(dateStr) {
  const date = parseYYYYMMDDToDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return date > today;
}

/**
 * Validate start date for SI operations
 * @param {string} startDate - Start date in YYYYMMDD format
 * @param {string} siType - SI type ('FIXED' or 'VARIABLE')
 * @returns {boolean} True if valid
 */
function validateSiStartDate(startDate, siType) {
  if (!startDate) {
    if (siType === 'FIXED') {
      throw validationError('startDate', 'startDate is required for FIXED SI type');
    }
    return true; // VARIABLE type doesn't require startDate
  }

  if (siType === 'VARIABLE') {
    throw validationError('startDate', 'startDate should not be included for VARIABLE SI type');
  }

  validateStartDateFormat(startDate);
  return true;
}

module.exports = {
  validateStartDateFormat,
  formatDateToYYYYMMDD,
  parseYYYYMMDDToDate,
  isDateInFuture,
  validateSiStartDate
}; 