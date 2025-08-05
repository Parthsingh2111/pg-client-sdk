<?php

namespace PayGlocal\Constants;

/**
 * PayGlocal API Endpoints
 */
class Endpoints
{
    // Payment endpoints
    const PAYMENT = [
        'INITIATE' => '/gl/v1/payments/initiate/paycollect',
    ];
    
    // Transaction endpoints
    const TRANSACTION_SERVICE = [
        'STATUS' => '/gl/v1/payments/{gid}/status',
        'REFUND' => '/gl/v1/payments/{gid}/refund',
        'CAPTURE' => '/gl/v1/payments/{gid}/capture',
        'AUTH_REVERSAL' => '/gl/v1/payments/{gid}/auth-reversal',
    ];
    
    // Standing Instruction endpoints
    const SI_SERVICE = [
        'MODIFY' => '/gl/v1/payments/si/modify',
        'STATUS' => '/gl/v1/payments/si/status',
    ];

    /**
     * Build endpoint URL with parameters
     * 
     * @param string $endpoint Base endpoint
     * @param array $params URL parameters
     * @return string Complete endpoint URL
     */
    public static function buildEndpoint(string $endpoint, array $params = []): string
    {
        $url = $endpoint;
        foreach ($params as $key => $value) {
            $url = str_replace('{' . $key . '}', $value, $url);
        }
        return $url;
    }
}