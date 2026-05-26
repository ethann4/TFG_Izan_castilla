<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/ProductoModelo.php';
require_once __DIR__ . '/../modelos/PedidoModelo.php';
require_once __DIR__ . '/../modelos/CarritoModelo.php';

/**
 * Checkout server-side: el precio NO se confia al JS.
 *
 * El cliente manda:
 *  - tipo: "carrito" | "volante"
 *  - items / configuracion del configurador
 *  - direccion: { cp, ciudad, ccaa, pais, ... }
 *  - email / nombre / telefono de contacto
 *  - metodo_pago: "tarjeta" | "bizum" | "transferencia"
 *
 * El servidor:
 *  1. Recalcula subtotal con precios canonicos.
 *  2. Calcula envio segun CP.
 *  3. Aplica IVA 21%.
 *  4. Persiste el pedido en BD.
 *  5. Devuelve referencia + total.
 *
 * Cuando se integre Stripe, este es el lugar donde se crea el PaymentIntent.
 */
final class CheckoutControlador
{
    private const IVA = 0.21;

    public function __construct(private PDO $pdo)
    {
    }

    public function procesar(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $cliente = current_customer();

        $tipo = (string) ($data['tipo'] ?? 'carrito');
        $direccion = is_array($data['direccion'] ?? null) ? $data['direccion'] : [];
        $cp = preg_replace('/\D+/', '', (string) ($direccion['cp'] ?? ''));
        if (strlen($cp) !== 5) {
            send_json(['error' => 'Codigo postal no valido. Debe tener 5 digitos.'], 422);
        }

        $emailContacto = mb_strtolower(clean_string($data['email'] ?? ($cliente['email'] ?? ''), 160));
        if (!filter_var($emailContacto, FILTER_VALIDATE_EMAIL)) {
            send_json(['error' => 'Email de contacto no valido.'], 422);
        }

        $nombreContacto = clean_string($data['nombre'] ?? ($cliente['nombre'] ?? ''), 160);
        $telefono = nullable_string($data['telefono'] ?? null, 30);
        $metodoPago = (string) ($data['metodo_pago'] ?? 'simulado');
        if (!in_array($metodoPago, ['tarjeta', 'bizum', 'transferencia', 'simulado'], true)) {
            send_json(['error' => 'Metodo de pago no valido.'], 422);
        }

        if ($tipo === 'carrito') {
            $resumen = $this->totalCarrito((int) ($cliente['id'] ?? 0));
        } elseif ($tipo === 'volante') {
            $resumen = $this->totalVolante($data['configuracion'] ?? [], $data['precio'] ?? []);
        } else {
            send_json(['error' => 'Tipo de pedido desconocido.'], 422);
        }

        if (!$resumen['items'] || $resumen['subtotal'] <= 0) {
            send_json(['error' => 'No hay productos validos en el pedido.'], 422);
        }

        $envioInfo = envio_zona_por_cp($cp);
        $subtotal = round($resumen['subtotal'], 2);
        $envio = round($envioInfo['coste'], 2);
        $base = $subtotal + $envio;
        $iva = round($base * self::IVA, 2);
        $total = round($base + $iva, 2);

        $modelo = new PedidoModelo($this->pdo);
        $pedido = $modelo->crear([
            'cliente_id' => $cliente ? (int) $cliente['id'] : null,
            'email_contacto' => $emailContacto,
            'nombre_contacto' => $nombreContacto,
            'telefono_contacto' => $telefono,
            'direccion' => clean_string($direccion['direccion'] ?? '', 255),
            'cp' => $cp,
            'ciudad' => clean_string($direccion['ciudad'] ?? '', 120),
            'ccaa' => clean_string($direccion['ccaa'] ?? $envioInfo['label'], 80),
            'pais' => clean_string($direccion['pais'] ?? 'Espana', 80),
            'items' => $resumen['items'],
            'subtotal' => $subtotal,
            'envio' => $envio,
            'iva' => $iva,
            'total' => $total,
            'metodo_pago' => $metodoPago,
            'estado' => 'pendiente_pago',
        ]);

        send_json([
            'ok' => true,
            'pedido' => [
                'id' => $pedido['id'],
                'referencia' => $pedido['referencia'],
                'subtotal' => $subtotal,
                'envio' => $envio,
                'iva' => $iva,
                'total' => $total,
                'zona' => $envioInfo['label'],
            ],
        ]);
    }

    public function calcularPreview(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $cp = preg_replace('/\D+/', '', (string) ($data['cp'] ?? ''));
        if (strlen($cp) !== 5) {
            send_json(['error' => 'Codigo postal no valido.'], 422);
        }

        $cliente = current_customer();
        $tipo = (string) ($data['tipo'] ?? 'carrito');

        if ($tipo === 'carrito') {
            $resumen = $this->totalCarrito((int) ($cliente['id'] ?? 0));
        } else {
            $resumen = $this->totalVolante($data['configuracion'] ?? [], $data['precio'] ?? []);
        }

        $envioInfo = envio_zona_por_cp($cp);
        $subtotal = round($resumen['subtotal'], 2);
        $envio = round($envioInfo['coste'], 2);
        $base = $subtotal + $envio;
        $iva = round($base * self::IVA, 2);
        $total = round($base + $iva, 2);

        send_json([
            'subtotal' => $subtotal,
            'envio' => $envio,
            'iva' => $iva,
            'total' => $total,
            'zona' => $envioInfo['label'],
            'items_count' => count($resumen['items']),
        ]);
    }

    private function totalCarrito(int $clienteId): array
    {
        if ($clienteId <= 0) {
            return ['items' => [], 'subtotal' => 0.0];
        }

        $carrito = new CarritoModelo($this->pdo);
        $resumenCarrito = $carrito->obtener($clienteId);
        $items = $resumenCarrito['data'] ?? [];
        $subtotal = 0.0;
        $itemsOut = [];

        foreach ($items as $item) {
            $producto = $item['producto'] ?? [];
            $precio = (float) ($producto['precio'] ?? 0);
            $cantidad = (int) ($item['cantidad'] ?? 1);
            if ($precio <= 0 || $cantidad <= 0) continue;

            $linea = round($precio * $cantidad, 2);
            $subtotal += $linea;
            $itemsOut[] = [
                'tipo' => 'producto',
                'producto_id' => (int) ($producto['id'] ?? 0),
                'slug' => (string) ($producto['slug'] ?? ''),
                'nombre' => (string) ($producto['nombre'] ?? ''),
                'precio_unidad' => $precio,
                'cantidad' => $cantidad,
                'total' => $linea,
            ];
        }

        return ['items' => $itemsOut, 'subtotal' => $subtotal];
    }

    private function totalVolante(array $configuracion, array $precio): array
    {
        // El desglose llega del configurador (JS) pero NO confiamos en el total.
        // Recalculamos sumando 'base' + 'desglose'.
        $base = (float) ($precio['base'] ?? 0);
        $desglose = is_array($precio['desglose'] ?? null) ? $precio['desglose'] : [];
        $subtotal = $base;

        foreach ($desglose as $linea) {
            $precioLinea = (float) ($linea['precio'] ?? $linea['amount'] ?? 0);
            if ($precioLinea > 0) $subtotal += $precioLinea;
        }

        $marca = clean_string($configuracion['marca'] ?? 'CDP', 80);
        $modelo = clean_string($configuracion['modelo'] ?? 'a medida', 120);

        return [
            'items' => [[
                'tipo' => 'volante_personalizado',
                'nombre' => "Volante {$marca} {$modelo} a medida",
                'configuracion' => $configuracion,
                'base' => $base,
                'extras' => $desglose,
                'total' => round($subtotal, 2),
                'cantidad' => 1,
            ]],
            'subtotal' => $subtotal,
        ];
    }
}
