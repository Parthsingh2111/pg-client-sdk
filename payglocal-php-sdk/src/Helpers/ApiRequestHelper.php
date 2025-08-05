<?php

namespace PayGlocal\Helpers;

use PayGlocal\Core\HttpClient;
use PayGlocal\Utils\Logger;
use Exception;

/**
 * API request helper
 */
class ApiRequestHelper
{
    /**
     * Make payment request to PayGlocal API
     * 
     * @param array $params Request parameters
     * @return mixed Response data
     * @throws Exception
     */
    public static function makePaymentRequest(array $params)
    {
        $baseUrl = $params['baseUrl'];
        $endpoint = $params['endpoint'];
        $requestData = $params['requestData'];
        $headers = $params['headers'];
        $operation = $params['operation'] ?? 'payment';
        
        $url = rtrim($baseUrl, '/') . $endpoint;
        
        try {
            Logger::info("Initiating {$operation} request", ['url' => $url]);
            
            $response = HttpClient::post($url, $requestData, $headers);
            
            Logger::info("{$operation} request completed successfully");
            
            return $response;
        } catch (Exception $error) {
            Logger::error("{$operation} request failed", [
                'error' => $error->getMessage(),
                'url' => $url
            ]);
            throw $error;
        }
    }

    /**
     * Make GET request to PayGlocal API
     * 
     * @param array $params Request parameters
     * @return mixed Response data
     * @throws Exception
     */
    public static function makeGetRequest(array $params)
    {
        $baseUrl = $params['baseUrl'];
        $endpoint = $params['endpoint'];
        $headers = $params['headers'];
        $operation = $params['operation'] ?? 'request';
        
        $url = rtrim($baseUrl, '/') . $endpoint;
        
        try {
            Logger::info("Initiating {$operation} GET request", ['url' => $url]);
            
            $response = HttpClient::get($url, $headers);
            
            Logger::info("{$operation} GET request completed successfully");
            
            return $response;
        } catch (Exception $error) {
            Logger::error("{$operation} GET request failed", [
                'error' => $error->getMessage(),
                'url' => $url
            ]);
            throw $error;
        }
    }

    /**
     * Make PUT request to PayGlocal API
     * 
     * @param array $params Request parameters
     * @return mixed Response data
     * @throws Exception
     */
    public static function makePutRequest(array $params)
    {
        $baseUrl = $params['baseUrl'];
        $endpoint = $params['endpoint'];
        $requestData = $params['requestData'];
        $headers = $params['headers'];
        $operation = $params['operation'] ?? 'request';
        
        $url = rtrim($baseUrl, '/') . $endpoint;
        
        try {
            Logger::info("Initiating {$operation} PUT request", ['url' => $url]);
            
            $response = HttpClient::put($url, $requestData, $headers);
            
            Logger::info("{$operation} PUT request completed successfully");
            
            return $response;
        } catch (Exception $error) {
            Logger::error("{$operation} PUT request failed", [
                'error' => $error->getMessage(),
                'url' => $url
            ]);
            throw $error;
        }
    }
}