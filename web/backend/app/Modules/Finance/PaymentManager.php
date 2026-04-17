<?php

namespace App\Modules\Finance;

use App\Modules\Finance\Gateways\StripeGateway;
use App\Modules\Finance\Gateways\PaystackGateway;
use App\Modules\Finance\Gateways\FlutterwaveGateway;
use App\Modules\Finance\Interfaces\PaymentGatewayInterface;

class PaymentManager
{
    /**
     * Get the appropriate gateway implementation
     *
     * @param string $driver
     * @return PaymentGatewayInterface
     * @throws \Exception
     */
    public function driver(string $driver): PaymentGatewayInterface
    {
        return match ($driver) {
            'stripe' => new StripeGateway(),
            'paystack' => new PaystackGateway(),
            'flutterwave' => new FlutterwaveGateway(),
            default => throw new \Exception("Unsupported payment driver: {$driver}"),
        };
    }
}
