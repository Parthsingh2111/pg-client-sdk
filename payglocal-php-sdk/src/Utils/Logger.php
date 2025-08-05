<?php

namespace PayGlocal\Utils;

/**
 * Enhanced Logger for PayGlocal SDK
 * Provides structured logging with different levels and formatting
 */
class Logger
{
    private static array $levels = [
        'error' => 0,
        'warn' => 1,
        'info' => 2,
        'debug' => 3
    ];

    private static string $level = 'info';

    /**
     * Set log level
     * 
     * @param string $level Log level
     */
    public static function setLevel(string $level): void
    {
        $normalized = strtolower($level);
        if (array_key_exists($normalized, self::$levels)) {
            self::$level = $normalized;
        } else {
            echo "[LOGGER] Invalid log level \"{$level}\", defaulting to \"info\"\n";
            self::$level = 'info';
        }
    }

    /**
     * Check if a log level should be output
     * 
     * @param string $level Log level to check
     * @return bool Whether to log
     */
    private static function shouldLog(string $level): bool
    {
        return self::$levels[$level] <= self::$levels[self::$level];
    }

    /**
     * Get current timestamp
     * 
     * @return string ISO timestamp
     */
    private static function getTimestamp(): string
    {
        return date('c');
    }

    /**
     * Format log message with timestamp and level
     * 
     * @param string $level Log level
     * @param string $message Message
     * @param mixed $data Additional data
     * @return string Formatted message
     */
    private static function formatMessage(string $level, string $message, $data = null): string
    {
        $timestamp = self::getTimestamp();
        $levelUpper = strtoupper($level);
        $formatted = "[{$timestamp}] [{$levelUpper}] {$message}";
        
        if ($data !== null) {
            $formatted .= ' ' . json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        }
        
        return $formatted;
    }

    /**
     * Log error message
     * 
     * @param string $message Message
     * @param mixed $data Additional data
     */
    public static function error(string $message, $data = null): void
    {
        if (self::shouldLog('error')) {
            echo self::formatMessage('error', $message, $data) . "\n";
        }
    }

    /**
     * Log warning message
     * 
     * @param string $message Message
     * @param mixed $data Additional data
     */
    public static function warn(string $message, $data = null): void
    {
        if (self::shouldLog('warn')) {
            echo self::formatMessage('warn', $message, $data) . "\n";
        }
    }

    /**
     * Log info message
     * 
     * @param string $message Message
     * @param mixed $data Additional data
     */
    public static function info(string $message, $data = null): void
    {
        if (self::shouldLog('info')) {
            echo self::formatMessage('info', $message, $data) . "\n";
        }
    }

    /**
     * Log debug message
     * 
     * @param string $message Message
     * @param mixed $data Additional data
     */
    public static function debug(string $message, $data = null): void
    {
        if (self::shouldLog('debug')) {
            echo self::formatMessage('debug', $message, $data) . "\n";
        }
    }

    /**
     * Log request details
     * 
     * @param string $method HTTP method
     * @param string $url Request URL
     * @param array $headers Request headers
     * @param mixed $data Request data
     */
    public static function logRequest(string $method, string $url, array $headers = [], $data = null): void
    {
        if (self::shouldLog('debug')) {
            $sanitizedHeaders = self::sanitizeHeaders($headers);
            $sanitizedData = self::sanitizeData($data);
            
            self::debug("HTTP Request", [
                'method' => $method,
                'url' => $url,
                'headers' => $sanitizedHeaders,
                'data' => $sanitizedData
            ]);
        }
    }

    /**
     * Log response details
     * 
     * @param string $method HTTP method
     * @param string $url Request URL
     * @param int $status Response status
     * @param mixed $data Response data
     */
    public static function logResponse(string $method, string $url, int $status, $data = null): void
    {
        if (self::shouldLog('debug')) {
            $sanitizedData = self::sanitizeData($data);
            
            self::debug("HTTP Response", [
                'method' => $method,
                'url' => $url,
                'status' => $status,
                'data' => $sanitizedData
            ]);
        }
    }

    /**
     * Log configuration (sanitized)
     * 
     * @param object $config Configuration object
     */
    public static function logConfig($config): void
    {
        if (self::shouldLog('info')) {
            $sanitizedConfig = [
                'merchantId' => $config->merchantId ?? 'not set',
                'baseUrl' => $config->baseUrl ?? 'not set',
                'logLevel' => $config->logLevel ?? 'not set',
                'tokenExpiration' => $config->tokenExpiration ?? 'not set',
                'apiKey' => !empty($config->apiKey ?? '') ? '[REDACTED]' : 'not set',
                'publicKeyId' => $config->publicKeyId ?? 'not set',
                'privateKeyId' => $config->privateKeyId ?? 'not set',
                'payglocalPublicKey' => !empty($config->payglocalPublicKey ?? '') ? '[REDACTED]' : 'not set',
                'merchantPrivateKey' => !empty($config->merchantPrivateKey ?? '') ? '[REDACTED]' : 'not set'
            ];
            
            self::info("PayGlocal SDK Configuration", $sanitizedConfig);
        }
    }

    /**
     * Sanitize headers for logging
     * 
     * @param array $headers Headers array
     * @return array Sanitized headers
     */
    private static function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = ['authorization', 'x-gl-token', 'x-gl-signature'];
        $sanitized = [];
        
        foreach ($headers as $key => $value) {
            if (in_array(strtolower($key), $sensitiveHeaders)) {
                $sanitized[$key] = '[REDACTED]';
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }

    /**
     * Sanitize data for logging
     * 
     * @param mixed $data Data to sanitize
     * @return mixed Sanitized data
     */
    private static function sanitizeData($data)
    {
        if (is_array($data) || is_object($data)) {
            $data = json_decode(json_encode($data), true); // Convert to array
            return self::sanitizeArray($data);
        }
        
        return $data;
    }

    /**
     * Recursively sanitize array data
     * 
     * @param array $data Array data
     * @return array Sanitized array
     */
    private static function sanitizeArray(array $data): array
    {
        $sensitiveKeys = ['token', 'signature', 'key', 'secret', 'password', 'cvv', 'pin'];
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = self::sanitizeArray($value);
            } elseif (in_array(strtolower($key), $sensitiveKeys)) {
                $sanitized[$key] = '[REDACTED]';
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
}