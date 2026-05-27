<?php

declare(strict_types=1);

final class VolanteGeneradoModelo
{
    public function __construct(private PDO $pdo)
    {
        $this->asegurarEstructura();
    }

    public function listarPorCliente(int $clienteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT *
             FROM volantes_generados
             WHERE cliente_id = :cliente_id
             ORDER BY creado_en DESC'
        );
        $stmt->execute(['cliente_id' => $clienteId]);

        return $stmt->fetchAll();
    }

    public function listarTodos(): array
    {
        $stmt = $this->pdo->query(
            'SELECT v.*, c.nombre AS cliente_nombre, c.email AS cliente_email
             FROM volantes_generados v
             LEFT JOIN clientes c ON c.id = v.cliente_id
             ORDER BY v.creado_en DESC'
        );

        return $stmt->fetchAll();
    }

    public function crear(int $clienteId, array $payload): string
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO volantes_generados (
                cliente_id,
                titulo,
                marca,
                modelo,
                precio_total,
                configuracion_json,
                resumen_json,
                precio_json,
                visual_json,
                boceto_3d,
                estado,
                actualizado_en
             ) VALUES (
                :cliente_id,
                :titulo,
                :marca,
                :modelo,
                :precio_total,
                :configuracion_json,
                :resumen_json,
                :precio_json,
                :visual_json,
                :boceto_3d,
                :estado,
                NOW()
             )'
        );
        $stmt->execute([
            'cliente_id' => $clienteId,
            'titulo' => $payload['titulo'],
            'marca' => $payload['marca'],
            'modelo' => $payload['modelo'],
            'precio_total' => $payload['precio_total'],
            'configuracion_json' => $payload['configuracion_json'],
            'resumen_json' => $payload['resumen_json'],
            'precio_json' => $payload['precio_json'],
            'visual_json' => $payload['visual_json'],
            'boceto_3d' => $payload['boceto_3d'],
            'estado' => $payload['estado'],
        ]);

        return (string) $this->pdo->lastInsertId();
    }

    public function asociarSolicitud(int $id, int $clienteId, int $solicitudId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE volantes_generados
             SET solicitud_id = :solicitud_id,
                 estado = :estado,
                 actualizado_en = NOW()
             WHERE id = :id AND cliente_id = :cliente_id'
        );
        $stmt->execute([
            'id' => $id,
            'cliente_id' => $clienteId,
            'solicitud_id' => $solicitudId,
            'estado' => 'solicitud_enviada',
        ]);
    }

    private function asegurarEstructura(): void
    {
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS volantes_generados (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              cliente_id INT UNSIGNED NOT NULL,
              titulo VARCHAR(180) NOT NULL,
              marca VARCHAR(80) NOT NULL DEFAULT \'\',
              modelo VARCHAR(120) NOT NULL DEFAULT \'\',
              precio_total DECIMAL(10,2) NOT NULL DEFAULT 0,
              configuracion_json LONGTEXT NOT NULL,
              resumen_json LONGTEXT NULL,
              precio_json LONGTEXT NULL,
              visual_json LONGTEXT NULL,
              boceto_3d LONGTEXT NULL,
              estado VARCHAR(40) NOT NULL DEFAULT \'guardado\',
              solicitud_id INT UNSIGNED NULL,
              creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              actualizado_en DATETIME NULL,
              INDEX idx_volantes_generados_cliente (cliente_id),
              INDEX idx_volantes_generados_estado (estado)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );

        $columnas = $this->columnasSolicitud();
        $this->agregarColumnaSolicitud($columnas, 'volante_generado_id', 'INT UNSIGNED NULL');
        $this->agregarColumnaSolicitud($columnas, 'boceto_3d', 'LONGTEXT NULL');
        $this->agregarColumnaSolicitud($columnas, 'configuracion_json', 'LONGTEXT NULL');
        $this->agregarColumnaSolicitud($columnas, 'resumen_json', 'LONGTEXT NULL');
        $this->agregarColumnaSolicitud($columnas, 'precio_total', 'DECIMAL(10,2) NULL');
    }

    private function columnasSolicitud(): array
    {
        $stmt = $this->pdo->query('SHOW COLUMNS FROM solicitudes');
        $columnas = [];

        foreach ($stmt->fetchAll() as $columna) {
            $columnas[(string) $columna['Field']] = true;
        }

        return $columnas;
    }

    private function agregarColumnaSolicitud(array &$columnas, string $nombre, string $definicion): void
    {
        if (isset($columnas[$nombre])) {
            return;
        }

        $this->pdo->exec("ALTER TABLE solicitudes ADD COLUMN {$nombre} {$definicion}");
        $columnas[$nombre] = true;
    }
}
