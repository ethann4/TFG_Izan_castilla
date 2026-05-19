<?php

declare(strict_types=1);

final class CarritoModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function resolverProductoId(array $data): int
    {
        $id = (int) ($data['producto_id'] ?? $data['product_id'] ?? $data['id'] ?? 0);
        $slug = nullable_string($data['slug'] ?? null, 160);

        if ($id > 0) {
            $stmt = $this->pdo->prepare('SELECT id FROM productos WHERE id = :id AND activo = 1 LIMIT 1');
            $stmt->execute(['id' => $id]);
            $productId = $stmt->fetchColumn();

            if ($productId) {
                return (int) $productId;
            }
        }

        if ($slug) {
            $stmt = $this->pdo->prepare('SELECT id FROM productos WHERE slug = :slug AND activo = 1 LIMIT 1');
            $stmt->execute(['slug' => $slug]);
            $productId = $stmt->fetchColumn();

            if ($productId) {
                return (int) $productId;
            }
        }

        send_json(['error' => 'Producto no disponible para anadir a la cesta.'], 404);
    }

    public function obtener(int $clienteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ci.id AS carrito_item_id, ci.cantidad AS carrito_cantidad, p.*
             FROM carrito_items ci
             INNER JOIN productos p ON p.id = ci.producto_id
             WHERE ci.cliente_id = :cliente_id
             ORDER BY COALESCE(ci.actualizado_en, ci.creado_en) DESC, ci.id DESC'
        );
        $stmt->execute(['cliente_id' => $clienteId]);

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

    public function agregar(int $clienteId, int $productoId, int $cantidad): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO carrito_items (cliente_id, producto_id, cantidad, actualizado_en)
             VALUES (:cliente_id, :producto_id, :cantidad, NOW())
             ON DUPLICATE KEY UPDATE
               cantidad = LEAST(cantidad + VALUES(cantidad), 20),
               actualizado_en = NOW()'
        );
        $stmt->execute([
            'cliente_id' => $clienteId,
            'producto_id' => $productoId,
            'cantidad' => $cantidad,
        ]);
    }

    public function actualizarItem(int $clienteId, int $itemId, int $cantidad): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE carrito_items SET cantidad = :cantidad, actualizado_en = NOW()
             WHERE id = :id AND cliente_id = :cliente_id'
        );
        $stmt->execute([
            'cantidad' => $cantidad,
            'id' => $itemId,
            'cliente_id' => $clienteId,
        ]);
    }

    public function actualizarProducto(int $clienteId, int $productoId, int $cantidad): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE carrito_items SET cantidad = :cantidad, actualizado_en = NOW()
             WHERE producto_id = :producto_id AND cliente_id = :cliente_id'
        );
        $stmt->execute([
            'cantidad' => $cantidad,
            'producto_id' => $productoId,
            'cliente_id' => $clienteId,
        ]);
    }

    public function eliminarItem(int $clienteId, int $itemId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM carrito_items WHERE id = :id AND cliente_id = :cliente_id');
        $stmt->execute(['id' => $itemId, 'cliente_id' => $clienteId]);
    }

    public function eliminarProducto(int $clienteId, int $productoId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM carrito_items WHERE producto_id = :producto_id AND cliente_id = :cliente_id');
        $stmt->execute(['producto_id' => $productoId, 'cliente_id' => $clienteId]);
    }

    public function vaciar(int $clienteId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM carrito_items WHERE cliente_id = :cliente_id');
        $stmt->execute(['cliente_id' => $clienteId]);
    }
}
