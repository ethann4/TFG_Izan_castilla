<?php

declare(strict_types=1);

/**
 * Helper de proteccion CSRF.
 *
 * El token vive en sesion. Los endpoints mutadores (POST/PATCH/DELETE)
 * deben llamar a require_csrf_token() antes de leer el body.
 * El cliente JS lee el token desde la cookie no-HttpOnly `cdp_csrf`
 * (espejo del token de sesion) y lo manda en el header `X-CSRF-Token`.
 */

const CDP_CSRF_SESSION_KEY = 'csrf_token';
const CDP_CSRF_COOKIE = 'cdp_csrf';
const CDP_CSRF_HEADER = 'HTTP_X_CSRF_TOKEN';

function csrf_token_actual(): string
{
    if (empty($_SESSION[CDP_CSRF_SESSION_KEY])) {
        $_SESSION[CDP_CSRF_SESSION_KEY] = bin2hex(random_bytes(24));
    }

    return (string) $_SESSION[CDP_CSRF_SESSION_KEY];
}

function csrf_publicar_cookie(): void
{
    $token = csrf_token_actual();
    $params = [
        'expires' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => false, // el JS necesita leer este
        'samesite' => 'Lax',
    ];

    if (($_COOKIE[CDP_CSRF_COOKIE] ?? null) !== $token) {
        setcookie(CDP_CSRF_COOKIE, $token, $params);
        $_COOKIE[CDP_CSRF_COOKIE] = $token;
    }
}

function require_csrf_token(): void
{
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($metodo, ['GET', 'HEAD', 'OPTIONS'], true)) {
        return;
    }

    $enviado = trim((string) ($_SERVER[CDP_CSRF_HEADER] ?? ''));
    $esperado = csrf_token_actual();

    if ($enviado === '' || !hash_equals($esperado, $enviado)) {
        send_json(['error' => 'Token CSRF invalido. Recarga la pagina e intenta de nuevo.'], 419);
    }
}
