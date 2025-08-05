<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\TokenHelper;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Standing Instruction service for handling SI operations
 */
class SiService
{
    /**
     * Pause Standing Instruction
     * 
     * @param array $params SI pause parameters
     * @param Config $config Configuration object
     * @return mixed SI pause response
     * @throws \Exception
     */
    public static function initiatePauseSI(array $params, Config $config)
    {
        // Validate required fields
        if (empty($params['siId'])) {
            throw new \InvalidArgumentException('siId is required for SI pause operation');
        }

        // Add action to params
        $params['action'] = 'PAUSE';

        // Generate tokens
        $tokens = TokenHelper::generateTokens($params, $config, 'si-pause');
        $headers = HeaderHelper::buildJwtHeaders($tokens['jws']);

        // Make API request
        $response = ApiRequestHelper::makePutRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => Endpoints::SI_SERVICE['MODIFY'],
            'requestData' => $tokens['jwe'],
            'headers' => $headers,
            'operation' => 'si-pause',
        ]);

        return $response;
    }

    /**
     * Activate Standing Instruction
     * 
     * @param array $params SI activate parameters
     * @param Config $config Configuration object
     * @return mixed SI activate response
     * @throws \Exception
     */
    public static function initiateActivateSI(array $params, Config $config)
    {
        // Validate required fields
        if (empty($params['siId'])) {
            throw new \InvalidArgumentException('siId is required for SI activate operation');
        }

        // Add action to params
        $params['action'] = 'ACTIVATE';

        // Generate tokens
        $tokens = TokenHelper::generateTokens($params, $config, 'si-activate');
        $headers = HeaderHelper::buildJwtHeaders($tokens['jws']);

        // Make API request
        $response = ApiRequestHelper::makePutRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => Endpoints::SI_SERVICE['MODIFY'],
            'requestData' => $tokens['jwe'],
            'headers' => $headers,
            'operation' => 'si-activate',
        ]);

        return $response;
    }
}