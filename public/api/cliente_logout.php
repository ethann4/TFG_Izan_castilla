<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['POST']);

unset($_SESSION['cliente_user']);

send_json(['ok' => true]);
