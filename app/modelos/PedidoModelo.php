<?php

declare(strict_types=1);

final class PedidoModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function crear(array $datos): array
    {
        $referencia = 'CDP-' . strtoupper(bin2hex(random_bytes(4))) . '-' . date('ymd');

        $stmt = $this->pdo->prepare(
            'INSERT INTO pedidos
              (referencia, cliente_id, email_contacto, nombre_contacto, telefono_contacto,
               direccion, cp, ciudad, ccaa, pais,
               items_json, subtotal, envio, iva, total, metodo_pago, estado)
             VALUES
              (:referencia, :cliente_id, :email, :nombre, :telefono,
               :direccion, :cp, :ciudad, :ccaa, :pais,
               :items, :subtotal, :envio, :iva, :total, :metodo, :estado)'
        );
        $stmt->execute([
            ':referencia' => $referencia,
            ':cliente_id' => $datos['cliente_id'] ?? null,
            ':email' => $datos['email_contacto'],
            ':nombre' => $datos['nombre_contacto'] ?? '',
            ':telefono' => $datos['telefono_contacto'] ?? null,
            ':direccion' => $datos['direccion'] ?? '',
            ':cp' => $datos['cp'] ?? '',
            ':ciudad' => $datos['ciudad'] ?? '',
            ':ccaa' => $datos['ccaa'] ?? '',
            ':pais' => $datos['pais'] ?? 'Espana',
            ':items' => json_encode($datos['items'], JSON_UNESCAPED_UNICODE),
            ':subtotal' => $datos['subtotal'],
            ':envio' => $datos['envio'],
            ':iva' => $datos['iva'],
            ':total' => $datos['total'],
            ':metodo' => $datos['metodo_pago'] ?? 'simulado',
            ':estado' => $datos['estado'] ?? 'pendiente_pago',
        ]);

        return [
            'id' => (int) $this->pdo->lastInsertId(),
            'referencia' => $referencia,
        ];
    }

    public function marcarPagado(int $id): void
    {
        $stmt = $this->pdo->prepare('UPDATE pedidos SET estado = "pagado", pagado_en = NOW() WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }
}
