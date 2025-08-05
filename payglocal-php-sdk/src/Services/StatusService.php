<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Status service for handling status check operations
 */
class StatusService
{
    /**
     * Check transaction status
     * 
     * @param array $params Status parameters
     * @param Config $config Configuration object
     * @return mixed Status response
     * @throws \Exception
     */
    public static function initiateCheckStatus(array $params, Config $config)
    {
        $gid = $params['gid'] ?? '';
        if (empty($gid)) {
            throw new \InvalidArgumentException('GID is required for status check operation');
        }

        // Build endpoint with GID
        $endpoint = Endpoints::buildEndpoint(Endpoints::TRANSACTION_SERVICE['STATUS'], ['gid' => $gid]);

        // Build headers for GET request
        $headers = HeaderHelper::buildApiKeyHeaders($config->apiKey);

        // Make GET request
        $response = ApiRequestHelper::makeGetRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => $endpoint,
            'headers' => $headers,
            'operation' => 'status-check',
        ]);

        return $response;
    }
}