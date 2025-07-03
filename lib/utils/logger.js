// lib/utils/logger.js

class Logger {
  constructor(level = 'info') {
    this.level = level;
  }

  info(message) {
    if (this.level === 'info' || this.level === 'debug') {
      console.log(`[INFO] ${message}`);
    }
  }

  debug(message) {
    if (this.level === 'debug') {
      console.debug(`[DEBUG] ${message}`);
    }
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
  }
}

const logger = new Logger(process.env.PAYGLOCAL_LOG_LEVEL || 'info');

module.exports = { logger };







