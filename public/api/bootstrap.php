<?php

declare(strict_types=1);

$base = __DIR__ . '/../../app';

require_once $base . '/config/database.php';
require_once $base . '/nucleo/sesion.php';
require_once $base . '/nucleo/respuesta.php';
require_once $base . '/nucleo/autenticacion.php';
require_once $base . '/nucleo/validacion.php';
require_once $base . '/nucleo/producto.php';
require_once $base . '/nucleo/csrf.php';
require_once $base . '/nucleo/rate_limit.php';
require_once $base . '/nucleo/envio.php';
require_once $base . '/nucleo/totp.php';

// Publica el token CSRF en cookie no-HttpOnly para que el JS lo
// pueda leer y reenviar como header X-CSRF-Token.
csrf_publicar_cookie();
