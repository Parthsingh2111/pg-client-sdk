<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\TokenHelper;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Reversal service for handling auth reversal operations
 */
class ReversalService
{
    /**
     * Initiate auth reversal
     * 
     * @param array $params Reversal parameters
     * @param Config $config Configuration object
     * @return mixed Reversal response
     * @throws \Exception
     */
    public static function initiateAuthReversal(array $params, Config $config)
    {
        $gid = $params['gid'] ?? '';
        if (empty($gid)) {
            throw new \InvalidArgumentException('GID is required for auth reversal operation');
        }

        // Build endpoint with GID
        $endpoint = Endpoints::buildEndpoint(Endpoints::TRANSACTION_SERVICE['AUTH_REVERSAL'], ['gid' => $gid]);

        // Remove GID from params as it's now in the URL
        unset($params['gid']);

        // Generate tokens (even if params is empty, we need to send encrypted empty object)
        $tokens = TokenHelper::generateTokens($params ?: [], $config, 'auth-reversal');
        $headers = HeaderHelper::buildJwtHeaders($tokens['jws']);

        // Make API request
        $response = ApiRequestHelper::makePaymentRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => $endpoint,
            'requestData' => $tokens['jwe'],
            'headers' => $headers,
            'operation' => 'auth-reversal',
        ]);

        return $response;
    }
}