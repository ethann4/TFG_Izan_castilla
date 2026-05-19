<?php

declare(strict_types=1);

final class SolicitudModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function listar(): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM solicitudes ORDER BY creado_en DESC');
        $stmt->execute();
        $records = $stmt->fetchAll();

        foreach ($records as &$record) {
            $record['id'] = (string) $record['id'];
        }

        return $records;
    }

    public function crear(array $payload): string
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO solicitudes (nombre, email, telefono, modelo_coche, material, presupuesto, mensaje, estado, origen)
             VALUES (:nombre, :email, :telefono, :modelo_coche, :material, :presupuesto, :mensaje, :estado, :origen)'
        );
        $stmt->execute($payload);

        return (string) $this->pdo->lastInsertId();
    }
}
