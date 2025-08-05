<?php

namespace PayGlocal\Helpers;

/**
 * HTTP header building helper
 */
class HeaderHelper
{
    /**
     * Build JWT headers for authenticated requests
     * 
     * @param string $jws JWS token
     * @param array $customHeaders Additional custom headers
     * @return array Headers array
     */
    public static function buildJwtHeaders(string $jws, array $customHeaders = []): array
    {
        $headers = [
            'Content-Type' => 'text/plain',
            'x-gl-token' => $jws,
        ];
        
        return array_merge($headers, $customHeaders);
    }

    /**
     * Build API key headers for simple authentication
     * 
     * @param string $apiKey API key
     * @param array $customHeaders Additional custom headers
     * @return array Headers array
     */
    public static function buildApiKeyHeaders(string $apiKey, array $customHeaders = []): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $apiKey,
        ];
        
        return array_merge($headers, $customHeaders);
    }
}