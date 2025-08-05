<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\TokenHelper;
use PayGlocal\Helpers\ValidationHelper;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Capture service for handling capture operations
 */
class CaptureService
{
    /**
     * Initiate capture
     * 
     * @param array $params Capture parameters
     * @param Config $config Configuration object
     * @return mixed Capture response
     * @throws \Exception
     */
    public static function initiateCapture(array $params, Config $config)
    {
        $gid = $params['gid'] ?? '';
        if (empty($gid)) {
            throw new \InvalidArgumentException('GID is required for capture operation');
        }

        // Build endpoint with GID
        $endpoint = Endpoints::buildEndpoint(Endpoints::TRANSACTION_SERVICE['CAPTURE'], ['gid' => $gid]);

        // Remove GID from params as it's now in the URL
        unset($params['gid']);

        // Validate capture data
        ValidationHelper::validatePayload($params, [
            'operation' => 'capture',
            'requiredFields' => ['captureAmount'],
        ]);

        // Generate tokens
        $tokens = TokenHelper::generateTokens($params, $config, 'capture');
        $headers = HeaderHelper::buildJwtHeaders($tokens['jws']);

        // Make API request
        $response = ApiRequestHelper::makePaymentRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => $endpoint,
            'requestData' => $tokens['jwe'],
            'headers' => $headers,
            'operation' => 'capture',
        ]);

        return $response;
    }
}