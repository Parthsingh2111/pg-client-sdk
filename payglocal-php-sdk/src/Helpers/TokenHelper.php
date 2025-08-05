<?php

namespace PayGlocal\Helpers;

use PayGlocal\Core\Config;
use PayGlocal\Core\Crypto;

/**
 * Token generation helper
 */
class TokenHelper
{
    /**
     * Generate JWE and JWS tokens for payload
     * 
     * @param array $payload Payload data
     * @param Config $config Configuration object
     * @param string $operation Operation type
     * @return array Array with 'jwe' and 'jws' keys
     * @throws \Exception
     */
    public static function generateTokens(array $payload, Config $config, string $operation = 'payment'): array
    {
        // Generate JWE (encrypted payload)
        $jwe = Crypto::generateJWE($payload, $config);
        
        // Generate JWS (signature of JWE)
        $jws = Crypto::generateJWS($jwe, $config);
        
        return [
            'jwe' => $jwe,
            'jws' => $jws
        ];
    }
}