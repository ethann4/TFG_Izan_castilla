<?php

declare(strict_types=1);

function send_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

set_exception_handler(static function (Throwable $error): never {
    send_json(['error' => 'Error de servidor: ' . $error->getMessage()], 500);
});

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return $_POST;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        send_json(['error' => 'JSON invalido.'], 400);
    }

    return $data;
}

function require_method(array $allowed): void
{
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($metodo, $allowed, true)) {
        send_json(['error' => 'Metodo no permitido.'], 405);
    }

    if (in_array($metodo, ['POST', 'PATCH', 'PUT', 'DELETE'], true) && function_exists('require_csrf_token')) {
        require_csrf_token();
    }
}
