<?php

namespace PayGlocal\Core;

use PayGlocal\Utils\Logger;
use Exception;
use RuntimeException;

/**
 * HTTP client using cURL with timeout protection
 */
class HttpClient
{
    private const DEFAULT_TIMEOUT = 90; // 90 seconds
    private const USER_AGENT = 'PayGlocal-PHP-SDK/2.0.0';

    /**
     * Make HTTP request with timeout
     * 
     * @param string $url Request URL
     * @param array $options cURL options
     * @return array Response data and info
     * @throws Exception
     */
    private static function makeRequest(string $url, array $options): array
    {
        $ch = curl_init();
        
        // Default cURL options
        $defaultOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => self::DEFAULT_TIMEOUT,
            CURLOPT_CONNECTTIMEOUT => 30,
            CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_HEADER => false,
            CURLOPT_HTTPHEADER => [],
        ];
        
        // Merge with provided options
        $curlOptions = $options + $defaultOptions;
        
        curl_setopt_array($ch, $curlOptions);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $info = curl_getinfo($ch);
        
        curl_close($ch);
        
        if ($response === false) {
            throw new RuntimeException("cURL Error: {$error}");
        }
        
        if ($httpCode >= 400) {
            $errorData = $response ?: 'Unknown error';
            throw new RuntimeException("HTTP {$httpCode}: {$errorData}", $httpCode);
        }
        
        // Try to decode JSON response
        $decodedResponse = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $response = $decodedResponse;
        }
        
        return [
            'data' => $response,
            'info' => $info,
            'status' => $httpCode
        ];
    }

    /**
     * Make POST request
     * 
     * @param string $url Request URL
     * @param mixed $data Request payload
     * @param array $headers Request headers
     * @return mixed Response data
     * @throws Exception
     */
    public static function post(string $url, $data = null, array $headers = [])
    {
        try {
            Logger::logRequest('POST', $url, $headers, $data);
            
            $options = [
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => self::formatHeaders($headers),
            ];
            
            // Handle different data types
            if (is_string($data)) {
                $options[CURLOPT_POSTFIELDS] = $data;
                if (!isset($headers['Content-Type'])) {
                    $options[CURLOPT_HTTPHEADER][] = 'Content-Type: text/plain';
                }
            } elseif ($data !== null) {
                $options[CURLOPT_POSTFIELDS] = json_encode($data);
                if (!isset($headers['Content-Type'])) {
                    $options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
                }
            }
            
            $result = self::makeRequest($url, $options);
            Logger::logResponse('POST', $url, $result['status'], $result['data']);
            
            return $result['data'] ?? [];
        } catch (Exception $error) {
            Logger::error("POST request failed: {$url}", ['error' => $error->getMessage()]);
            
            if ($error->getCode() >= 400) {
                throw new RuntimeException("API Error {$error->getCode()}: {$error->getMessage()}", $error->getCode());
            } else {
                throw new RuntimeException("Network Error: {$error->getMessage()}");
            }
        }
    }

    /**
     * Make GET request
     * 
     * @param string $url Request URL
     * @param array $headers Request headers
     * @return mixed Response data
     * @throws Exception
     */
    public static function get(string $url, array $headers = [])
    {
        try {
            Logger::logRequest('GET', $url, $headers);
            
            $options = [
                CURLOPT_HTTPGET => true,
                CURLOPT_HTTPHEADER => self::formatHeaders($headers),
            ];
            
            $result = self::makeRequest($url, $options);
            Logger::logResponse('GET', $url, $result['status'], $result['data']);
            
            return $result['data'] ?? [];
        } catch (Exception $error) {
            Logger::error("GET request failed: {$url}", ['error' => $error->getMessage()]);
            
            if ($error->getCode() >= 400) {
                throw new RuntimeException("API Error {$error->getCode()}: {$error->getMessage()}", $error->getCode());
            } else {
                throw new RuntimeException("Network Error: {$error->getMessage()}");
            }
        }
    }

    /**
     * Make PUT request
     * 
     * @param string $url Request URL
     * @param mixed $data Request payload
     * @param array $headers Request headers
     * @return mixed Response data
     * @throws Exception
     */
    public static function put(string $url, $data = null, array $headers = [])
    {
        try {
            Logger::logRequest('PUT', $url, $headers, $data);
            
            $options = [
                CURLOPT_CUSTOMREQUEST => 'PUT',
                CURLOPT_HTTPHEADER => self::formatHeaders($headers),
            ];
            
            // Handle different data types
            if (is_string($data)) {
                $options[CURLOPT_POSTFIELDS] = $data;
                if (!isset($headers['Content-Type'])) {
                    $options[CURLOPT_HTTPHEADER][] = 'Content-Type: text/plain';
                }
            } elseif ($data !== null) {
                $options[CURLOPT_POSTFIELDS] = json_encode($data);
                if (!isset($headers['Content-Type'])) {
                    $options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
                }
            }
            
            $result = self::makeRequest($url, $options);
            Logger::logResponse('PUT', $url, $result['status'], $result['data']);
            
            return $result['data'] ?? [];
        } catch (Exception $error) {
            Logger::error("PUT request failed: {$url}", ['error' => $error->getMessage()]);
            
            if ($error->getCode() >= 400) {
                throw new RuntimeException("API Error {$error->getCode()}: {$error->getMessage()}", $error->getCode());
            } else {
                throw new RuntimeException("Network Error: {$error->getMessage()}");
            }
        }
    }

    /**
     * Format headers array for cURL
     * 
     * @param array $headers Headers array
     * @return array Formatted headers
     */
    private static function formatHeaders(array $headers): array
    {
        $formatted = [];
        foreach ($headers as $key => $value) {
            $formatted[] = "{$key}: {$value}";
        }
        return $formatted;
    }
}