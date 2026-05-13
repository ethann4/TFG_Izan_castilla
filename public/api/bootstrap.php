<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

session_name('cdp_wheels_admin');
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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
    if (!in_array($_SERVER['REQUEST_METHOD'], $allowed, true)) {
        send_json(['error' => 'Metodo no permitido.'], 405);
    }
}

function current_admin(): ?array
{
    return isset($_SESSION['admin_user']) && is_array($_SESSION['admin_user'])
        ? $_SESSION['admin_user']
        : null;
}

function require_admin(): array
{
    $admin = current_admin();

    if (!$admin) {
        send_json(['error' => 'Sesion de administrador requerida.'], 401);
    }

    return $admin;
}

function clean_string(mixed $value, int $maxLength = 255): string
{
    $text = trim((string) ($value ?? ''));
    if (mb_strlen($text) > $maxLength) {
        $text = mb_substr($text, 0, $maxLength);
    }

    return $text;
}

function nullable_string(mixed $value, int $maxLength = 255): ?string
{
    $text = clean_string($value, $maxLength);
    return $text === '' ? null : $text;
}

function clean_list(mixed $value): array
{
    if (is_array($value)) {
        return array_values(array_filter(array_map(
            static fn ($item) => clean_string($item, 500),
            $value
        )));
    }

    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    if (is_array($decoded)) {
        return clean_list($decoded);
    }

    return array_values(array_filter(array_map(
        static fn ($item) => clean_string($item, 500),
        preg_split('/\r\n|\r|\n|,/', $value) ?: []
    )));
}

function decode_json_list(mixed $value): array
{
    if (is_array($value)) {
        return $value;
    }

    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function normalize_product_record(array $record): array
{
    foreach (['galeria', 'acabados', 'compatibilidad', 'especificaciones'] as $field) {
        $record[$field] = decode_json_list($record[$field] ?? null);
    }

    $record['id'] = (string) $record['id'];
    $record['activo'] = (bool) ($record['activo'] ?? false);
    $record['precio'] = isset($record['precio']) ? (float) $record['precio'] : 0;
    $record['precio_anterior'] = isset($record['precio_anterior']) ? (float) $record['precio_anterior'] : null;
    $record['stock'] = isset($record['stock']) ? (int) $record['stock'] : 0;

    return $record;
}

function fetch_product_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM productos WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $record = $stmt->fetch();

    return $record ? normalize_product_record($record) : null;
}

function product_payload(array $data, bool $creating): array
{
    $fields = [
        'slug' => ['string', 160],
        'marca' => ['string', 80],
        'marca_filtro' => ['string', 80],
        'modelo' => ['string', 120],
        'modelo_filtro' => ['string', 160],
        'nombre' => ['string', 180],
        'descripcion' => ['text', 3000],
        'descripcion_corta' => ['text', 1000],
        'material' => ['string', 120],
        'color' => ['string', 120],
        'precio' => ['float', null],
        'precio_anterior' => ['nullable_float', null],
        'etiqueta' => ['string', 80],
        'valoracion' => ['string', 20],
        'imagen_principal' => ['text', 1000],
        'galeria' => ['json_list', null],
        'acabados' => ['json_list', null],
        'compatibilidad' => ['json_list', null],
        'especificaciones' => ['json_list', null],
        'tags' => ['text', 1000],
        'stock' => ['int', null],
        'activo' => ['bool', null],
    ];

    $defaults = [
        'marca_filtro' => '',
        'modelo' => '',
        'modelo_filtro' => '',
        'descripcion' => '',
        'descripcion_corta' => '',
        'material' => '',
        'color' => '',
        'precio_anterior' => null,
        'etiqueta' => 'Nuevo',
        'valoracion' => '4.8',
        'imagen_principal' => '',
        'galeria' => [],
        'acabados' => [],
        'compatibilidad' => [],
        'especificaciones' => [],
        'tags' => '',
        'stock' => 0,
        'activo' => true,
    ];

    $payload = [];

    foreach ($fields as $field => [$type, $limit]) {
        if (!array_key_exists($field, $data)) {
            if (!$creating || !array_key_exists($field, $defaults)) {
                continue;
            }

            $value = $defaults[$field];
        } else {
            $value = $data[$field];
        }

        $payload[$field] = match ($type) {
            'string' => clean_string($value, (int) $limit),
            'text' => clean_string($value, (int) $limit),
            'float' => (float) $value,
            'nullable_float' => $value === null || $value === '' ? null : (float) $value,
            'int' => (int) $value,
            'bool' => filter_var($value, FILTER_VALIDATE_BOOL) ? 1 : 0,
            'json_list' => json_encode(clean_list($value), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            default => $value,
        };
    }

    return $payload;
}
