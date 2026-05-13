<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
    $slug = nullable_string($_GET['slug'] ?? null, 160);

    if ($isAdmin) {
        require_admin();
    }

    if ($slug) {
        $sql = $isAdmin
            ? 'SELECT * FROM productos WHERE slug = :slug LIMIT 1'
            : 'SELECT * FROM productos WHERE slug = :slug AND activo = 1 LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['slug' => $slug]);
        $record = $stmt->fetch();
        send_json(['data' => $record ? normalize_product_record($record) : null]);
    }

    $sql = $isAdmin
        ? 'SELECT * FROM productos ORDER BY creado_en DESC'
        : 'SELECT * FROM productos WHERE activo = 1 ORDER BY creado_en DESC';
    $records = array_map('normalize_product_record', $pdo->query($sql)->fetchAll());

    send_json(['data' => $records]);
}

if ($method === 'POST') {
    require_admin();

    $data = read_json_body();
    foreach (['slug', 'marca', 'nombre'] as $field) {
        if (clean_string($data[$field] ?? '') === '') {
            send_json(['error' => "El campo {$field} es obligatorio."], 422);
        }
    }

    $payload = product_payload($data, true);
    $columns = array_keys($payload);
    $placeholders = array_map(static fn ($column) => ':' . $column, $columns);

    $stmt = $pdo->prepare(sprintf(
        'INSERT INTO productos (%s) VALUES (%s)',
        implode(', ', $columns),
        implode(', ', $placeholders)
    ));
    $stmt->execute($payload);

    send_json(['data' => fetch_product_by_id($pdo, (int) $pdo->lastInsertId())], 201);
}

if ($method === 'PATCH' || $method === 'PUT') {
    require_admin();

    $data = read_json_body();
    $id = (int) ($_GET['id'] ?? $data['id'] ?? 0);

    if ($id <= 0) {
        send_json(['error' => 'ID de producto no valido.'], 422);
    }

    $payload = product_payload($data, false);
    unset($payload['id']);

    if (!$payload) {
        send_json(['error' => 'No hay campos para actualizar.'], 422);
    }

    $setSql = array_map(static fn ($column) => "{$column} = :{$column}", array_keys($payload));
    $setSql[] = 'actualizado_en = NOW()';
    $payload['id'] = $id;

    $stmt = $pdo->prepare(sprintf(
        'UPDATE productos SET %s WHERE id = :id',
        implode(', ', $setSql)
    ));
    $stmt->execute($payload);

    send_json(['data' => fetch_product_by_id($pdo, $id)]);
}

if ($method === 'DELETE') {
    require_admin();

    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json(['error' => 'ID de producto no valido.'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM productos WHERE id = :id');
    $stmt->execute(['id' => $id]);

    send_json(['ok' => true]);
}

send_json(['error' => 'Metodo no permitido.'], 405);
