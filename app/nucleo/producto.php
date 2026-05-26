<?php

declare(strict_types=1);

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
        'habilitar_color_detalle' => ['bool', null],
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
        'habilitar_color_detalle' => false,
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

function validate_product_payload(array $payload, bool $creating): void
{
    if (($creating || array_key_exists('slug', $payload)) && clean_string($payload['slug'] ?? '') === '') {
        send_json(['error' => 'El slug es obligatorio.'], 422);
    }

    if (isset($payload['slug'])) {
        validate_slug((string) $payload['slug']);
    }

    foreach (['marca', 'nombre'] as $requiredField) {
        if (($creating || array_key_exists($requiredField, $payload)) && clean_string($payload[$requiredField] ?? '') === '') {
            send_json(['error' => "El campo {$requiredField} es obligatorio."], 422);
        }
    }

    if (array_key_exists('precio', $payload) && (float) $payload['precio'] < 0) {
        send_json(['error' => 'El precio no puede ser negativo.'], 422);
    }

    if (array_key_exists('precio_anterior', $payload) && $payload['precio_anterior'] !== null && (float) $payload['precio_anterior'] < 0) {
        send_json(['error' => 'El precio anterior no puede ser negativo.'], 422);
    }

    if (array_key_exists('stock', $payload) && (int) $payload['stock'] < 0) {
        send_json(['error' => 'El stock no puede ser negativo.'], 422);
    }
}
