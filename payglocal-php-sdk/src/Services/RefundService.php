<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\TokenHelper;
use PayGlocal\Helpers\ValidationHelper;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Refund service for handling refund operations
 */
class RefundService
{
    /**
     * Initiate refund
     * 
     * @param array $params Refund parameters
     * @param Config $config Configuration object
     * @return mixed Refund response
     * @throws \Exception
     */
    public static function initiateRefund(array $params, Config $config)
    {
        $gid = $params['gid'] ?? '';
        if (empty($gid)) {
            throw new \InvalidArgumentException('GID is required for refund operation');
        }

        // Build endpoint with GID
        $endpoint = Endpoints::buildEndpoint(Endpoints::TRANSACTION_SERVICE['REFUND'], ['gid' => $gid]);

        // Remove GID from params as it's now in the URL
        unset($params['gid']);

        // Validate refund data
        ValidationHelper::validatePayload($params, [
            'operation' => 'refund',
            'requiredFields' => ['refundAmount'],
        ]);

        // Generate tokens
        $tokens = TokenHelper::generateTokens($params, $config, 'refund');
        $headers = HeaderHelper::buildJwtHeaders($tokens['jws']);

        // Make API request
        $response = ApiRequestHelper::makePaymentRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => $endpoint,
            'requestData' => $tokens['jwe'],
            'headers' => $headers,
            'operation' => 'refund',
        ]);

        return $response;
    }
}