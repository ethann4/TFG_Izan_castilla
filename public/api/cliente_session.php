<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['GET']);

$customer = current_customer();

send_json([
    'authenticated' => (bool) $customer,
    'user' => $customer,
]);
