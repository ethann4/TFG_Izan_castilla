<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];
$customer = require_customer();
$customerId = (int) $customer['id'];

function cart_quantity(mixed $value, int $default = 1): int
{
    $quantity = (int) ($value ?? $default);

    if ($quantity < 1) {
        return 0;
    }

    return min($quantity, 20);
}

function resolve_cart_product_id(PDO $pdo, array $data): int
{
    $id = (int) ($data['producto_id'] ?? $data['product_id'] ?? $data['id'] ?? 0);
    $slug = nullable_string($data['slug'] ?? null, 160);

    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT id FROM productos WHERE id = :id AND activo = 1 LIMIT 1');
        $stmt->execute(['id' => $id]);
        $productId = $stmt->fetchColumn();

        if ($productId) {
            return (int) $productId;
        }
    }

    if ($slug) {
        $stmt = $pdo->prepare('SELECT id FROM productos WHERE slug = :slug AND activo = 1 LIMIT 1');
        $stmt->execute(['slug' => $slug]);
        $productId = $stmt->fetchColumn();

        if ($productId) {
            return (int) $productId;
        }
    }

    send_json(['error' => 'Producto no disponible para anadir a la cesta.'], 404);
}

function fetch_cart(PDO $pdo, int $customerId): array
{
    $stmt = $pdo->prepare(
        'SELECT ci.id AS carrito_item_id, ci.cantidad AS carrito_cantidad, p.*
         FROM carrito_items ci
         INNER JOIN productos p ON p.id = ci.producto_id
         WHERE ci.cliente_id = :cliente_id
         ORDER BY COALESCE(ci.actualizado_en, ci.creado_en) DESC, ci.id DESC'
    );
    $stmt->execute(['cliente_id' => $customerId]);

    $items = [];
    $totalQuantity = 0;
    $total = 0.0;

    foreach ($stmt->fetchAll() as $record) {
        $itemId = (string) $record['carrito_item_id'];
        $quantity = (int) $record['carrito_cantidad'];
        unset($record['carrito_item_id'], $record['carrito_cantidad']);

        $product = normalize_product_record($record);
        $lineTotal = $quantity * (float) $product['precio'];

        $items[] = [
            'id' => $itemId,
            'cantidad' => $quantity,
            'line_total' => $lineTotal,
            'producto' => $product,
        ];

        $totalQuantity += $quantity;
        $total += $lineTotal;
    }

    return [
        'data' => $items,
        'item_count' => count($items),
        'total_quantity' => $totalQuantity,
        'total' => $total,
    ];
}

function send_cart(PDO $pdo, int $customerId): never
{
    send_json(fetch_cart($pdo, $customerId));
}

if ($method === 'GET') {
    send_cart($pdo, $customerId);
}

if ($method === 'POST') {
    $data = read_json_body();
    $productId = resolve_cart_product_id($pdo, $data);
    $quantity = cart_quantity($data['cantidad'] ?? $data['quantity'] ?? 1);

    if ($quantity <= 0) {
        send_json(['error' => 'La cantidad debe ser al menos 1.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO carrito_items (cliente_id, producto_id, cantidad, actualizado_en)
         VALUES (:cliente_id, :producto_id, :cantidad, NOW())
         ON DUPLICATE KEY UPDATE
           cantidad = LEAST(cantidad + VALUES(cantidad), 20),
           actualizado_en = NOW()'
    );
    $stmt->execute([
        'cliente_id' => $customerId,
        'producto_id' => $productId,
        'cantidad' => $quantity,
    ]);

    send_cart($pdo, $customerId);
}

if ($method === 'PATCH' || $method === 'PUT') {
    $data = read_json_body();
    $itemId = (int) ($data['item_id'] ?? $data['carrito_item_id'] ?? 0);
    $quantity = cart_quantity($data['cantidad'] ?? $data['quantity'] ?? 1);

    if ($quantity <= 0) {
        if ($itemId > 0) {
            $stmt = $pdo->prepare('DELETE FROM carrito_items WHERE id = :id AND cliente_id = :cliente_id');
            $stmt->execute(['id' => $itemId, 'cliente_id' => $customerId]);
            send_cart($pdo, $customerId);
        }

        $productId = resolve_cart_product_id($pdo, $data);
        $stmt = $pdo->prepare('DELETE FROM carrito_items WHERE producto_id = :producto_id AND cliente_id = :cliente_id');
        $stmt->execute(['producto_id' => $productId, 'cliente_id' => $customerId]);
        send_cart($pdo, $customerId);
    }

    if ($itemId > 0) {
        $stmt = $pdo->prepare(
            'UPDATE carrito_items SET cantidad = :cantidad, actualizado_en = NOW()
             WHERE id = :id AND cliente_id = :cliente_id'
        );
        $stmt->execute([
            'cantidad' => $quantity,
            'id' => $itemId,
            'cliente_id' => $customerId,
        ]);
        send_cart($pdo, $customerId);
    }

    $productId = resolve_cart_product_id($pdo, $data);
    $stmt = $pdo->prepare(
        'UPDATE carrito_items SET cantidad = :cantidad, actualizado_en = NOW()
         WHERE producto_id = :producto_id AND cliente_id = :cliente_id'
    );
    $stmt->execute([
        'cantidad' => $quantity,
        'producto_id' => $productId,
        'cliente_id' => $customerId,
    ]);

    send_cart($pdo, $customerId);
}

if ($method === 'DELETE') {
    $data = array_merge($_GET, read_json_body());

    if (isset($data['all']) && filter_var($data['all'], FILTER_VALIDATE_BOOL)) {
        $stmt = $pdo->prepare('DELETE FROM carrito_items WHERE cliente_id = :cliente_id');
        $stmt->execute(['cliente_id' => $customerId]);
        send_cart($pdo, $customerId);
    }

    $itemId = (int) ($data['item_id'] ?? $data['carrito_item_id'] ?? 0);
    if ($itemId > 0) {
        $stmt = $pdo->prepare('DELETE FROM carrito_items WHERE id = :id AND cliente_id = :cliente_id');
        $stmt->execute(['id' => $itemId, 'cliente_id' => $customerId]);
        send_cart($pdo, $customerId);
    }

    $productId = resolve_cart_product_id($pdo, $data);
    $stmt = $pdo->prepare('DELETE FROM carrito_items WHERE producto_id = :producto_id AND cliente_id = :cliente_id');
    $stmt->execute(['producto_id' => $productId, 'cliente_id' => $customerId]);

    send_cart($pdo, $customerId);
}

send_json(['error' => 'Metodo no permitido.'], 405);
