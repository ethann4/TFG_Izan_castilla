<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/CarritoModelo.php';

final class CarritoControlador
{
    private CarritoModelo $carrito;
    private int $clienteId;

    public function __construct(PDO $pdo)
    {
        $this->carrito = new CarritoModelo($pdo);
        $cliente = require_customer();
        $this->clienteId = (int) $cliente['id'];
    }

    public function manejar(string $metodo): void
    {
        if ($metodo === 'GET') {
            $this->enviarCarrito();
        }

        if ($metodo === 'POST') {
            $this->agregar();
        }

        if ($metodo === 'PATCH' || $metodo === 'PUT') {
            $this->actualizar();
        }

        if ($metodo === 'DELETE') {
            $this->eliminar();
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }

    private function cantidad(mixed $value, int $default = 1): int
    {
        $quantity = (int) ($value ?? $default);

        if ($quantity < 1) {
            return 0;
        }

        return min($quantity, 20);
    }

    private function enviarCarrito(): void
    {
        send_json($this->carrito->obtener($this->clienteId));
    }

    private function agregar(): void
    {
        $data = read_json_body();
        $productoId = $this->carrito->resolverProductoId($data);
        $cantidad = $this->cantidad($data['cantidad'] ?? $data['quantity'] ?? 1);

        if ($cantidad <= 0) {
            send_json(['error' => 'La cantidad debe ser al menos 1.'], 422);
        }

        $this->carrito->agregar($this->clienteId, $productoId, $cantidad);
        $this->enviarCarrito();
    }

    private function actualizar(): void
    {
        $data = read_json_body();
        $itemId = (int) ($data['item_id'] ?? $data['carrito_item_id'] ?? 0);
        $cantidad = $this->cantidad($data['cantidad'] ?? $data['quantity'] ?? 1);

        if ($cantidad <= 0) {
            $this->eliminarSegunDatos($data, $itemId);
            $this->enviarCarrito();
        }

        if ($itemId > 0) {
            $this->carrito->actualizarItem($this->clienteId, $itemId, $cantidad);
            $this->enviarCarrito();
        }

        $productoId = $this->carrito->resolverProductoId($data);
        $this->carrito->actualizarProducto($this->clienteId, $productoId, $cantidad);

        $this->enviarCarrito();
    }

    private function eliminar(): void
    {
        $data = array_merge($_GET, read_json_body());

        if (isset($data['all']) && filter_var($data['all'], FILTER_VALIDATE_BOOL)) {
            $this->carrito->vaciar($this->clienteId);
            $this->enviarCarrito();
        }

        $itemId = (int) ($data['item_id'] ?? $data['carrito_item_id'] ?? 0);
        $this->eliminarSegunDatos($data, $itemId);

        $this->enviarCarrito();
    }

    private function eliminarSegunDatos(array $data, int $itemId): void
    {
        if ($itemId > 0) {
            $this->carrito->eliminarItem($this->clienteId, $itemId);
            return;
        }

        $productoId = $this->carrito->resolverProductoId($data);
        $this->carrito->eliminarProducto($this->clienteId, $productoId);
    }
}
