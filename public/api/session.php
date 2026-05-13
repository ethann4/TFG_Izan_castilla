<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['GET']);

$admin = current_admin();

send_json([
    'authenticated' => (bool) $admin,
    'user' => $admin,
]);
