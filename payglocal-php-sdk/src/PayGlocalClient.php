<?php

namespace PayGlocal;

use PayGlocal\Core\Config;
use PayGlocal\Utils\Logger;
use PayGlocal\Services\PaymentService;
use PayGlocal\Services\RefundService;
use PayGlocal\Services\CaptureService;
use PayGlocal\Services\StatusService;
use PayGlocal\Services\ReversalService;
use PayGlocal\Services\SiService;

/**
 * PayGlocalClient for interacting with PayGlocal API
 * 
 * A production-ready, secure, and modular PHP SDK for integrating with the PayGlocal payment gateway.
 * This SDK provides a comprehensive solution for all payment operations including API key payments,
 * JWT-based payments, standing instructions (SI), auth payments, captures, refunds, reversals, and status checks.
 */
class PayGlocalClient
{
    private Config $config;

    /**
     * Constructor
     * 
     * @param array $config Configuration options
     * @throws \InvalidArgumentException
     */
    public function __construct(array $config = [])
    {
        $this->config = new Config($config);
        
        // Set logger level
        Logger::setLevel($this->config->logLevel);
        
        // Log configuration
        Logger::logConfig($this->config);
        Logger::info('PayGlocalClient initialized successfully');
    }

    /**
     * Initiate API Key Payment
     * 
     * @param array $params Payment parameters
     * @return mixed Payment response
     * @throws \Exception
     */
    public function initiateApiKeyPayment(array $params)
    {
        return PaymentService::initiateApiKeyPayment($params, $this->config);
    }

    /**
     * Initiate JWT Payment (Recommended)
     * 
     * @param array $params Payment parameters
     * @return mixed Payment response
     * @throws \Exception
     */
    public function initiateJwtPayment(array $params)
    {
        return PaymentService::initiateJwtPayment($params, $this->config);
    }

    /**
     * Initiate Standing Instruction Payment
     * 
     * @param array $params SI payment parameters
     * @return mixed Payment response
     * @throws \Exception
     */
    public function initiateSiPayment(array $params)
    {
        return PaymentService::initiateSiPayment($params, $this->config);
    }

    /**
     * Initiate Auth Payment
     * 
     * @param array $params Auth payment parameters
     * @return mixed Payment response
     * @throws \Exception
     */
    public function initiateAuthPayment(array $params)
    {
        return PaymentService::initiateAuthPayment($params, $this->config);
    }

    /**
     * Initiate Refund
     * 
     * @param array $params Refund parameters
     * @return mixed Refund response
     * @throws \Exception
     */
    public function initiateRefund(array $params)
    {
        return RefundService::initiateRefund($params, $this->config);
    }

    /**
     * Initiate Capture
     * 
     * @param array $params Capture parameters
     * @return mixed Capture response
     * @throws \Exception
     */
    public function initiateCapture(array $params)
    {
        return CaptureService::initiateCapture($params, $this->config);
    }

    /**
     * Initiate Auth Reversal
     * 
     * @param array $params Reversal parameters
     * @return mixed Reversal response
     * @throws \Exception
     */
    public function initiateAuthReversal(array $params)
    {
        return ReversalService::initiateAuthReversal($params, $this->config);
    }

    /**
     * Check Transaction Status
     * 
     * @param array $params Status parameters
     * @return mixed Status response
     * @throws \Exception
     */
    public function initiateCheckStatus(array $params)
    {
        return StatusService::initiateCheckStatus($params, $this->config);
    }

    /**
     * Pause Standing Instruction
     * 
     * @param array $params SI pause parameters
     * @return mixed SI pause response
     * @throws \Exception
     */
    public function initiatePauseSI(array $params)
    {
        return SiService::initiatePauseSI($params, $this->config);
    }

    /**
     * Activate Standing Instruction
     * 
     * @param array $params SI activate parameters
     * @return mixed SI activate response
     * @throws \Exception
     */
    public function initiateActivateSI(array $params)
    {
        return SiService::initiateActivateSI($params, $this->config);
    }

    /**
     * Get current configuration
     * 
     * @return Config Configuration object
     */
    public function getConfig(): Config
    {
        return $this->config;
    }
}