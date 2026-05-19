<?php

declare(strict_types=1);

final class ProductoModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function listar(bool $soloActivos): array
    {
        $sql = $soloActivos
            ? 'SELECT * FROM productos WHERE activo = 1 ORDER BY creado_en DESC'
            : 'SELECT * FROM productos ORDER BY creado_en DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        return array_map('normalize_product_record', $stmt->fetchAll());
    }

    public function buscarPorSlug(string $slug, bool $soloActivos): ?array
    {
        $sql = $soloActivos
            ? 'SELECT * FROM productos WHERE slug = :slug AND activo = 1 LIMIT 1'
            : 'SELECT * FROM productos WHERE slug = :slug LIMIT 1';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['slug' => $slug]);
        $record = $stmt->fetch();

        return $record ? normalize_product_record($record) : null;
    }

    public function buscarPorId(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM productos WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch();

        return $record ? normalize_product_record($record) : null;
    }

    public function crear(array $datos): array
    {
        $payload = product_payload($datos, true);
        validate_product_payload($payload, true);
        $columns = array_keys($payload);
        $placeholders = array_map(static fn ($column) => ':' . $column, $columns);

        $stmt = $this->pdo->prepare(sprintf(
            'INSERT INTO productos (%s) VALUES (%s)',
            implode(', ', $columns),
            implode(', ', $placeholders)
        ));
        $stmt->execute($payload);

        return $this->buscarPorId((int) $this->pdo->lastInsertId()) ?? [];
    }

    public function actualizar(int $id, array $datos): ?array
    {
        $payload = product_payload($datos, false);
        unset($payload['id']);
        validate_product_payload($payload, false);

        if (!$payload) {
            send_json(['error' => 'No hay campos para actualizar.'], 422);
        }

        $setSql = array_map(static fn ($column) => "{$column} = :{$column}", array_keys($payload));
        $setSql[] = 'actualizado_en = NOW()';
        $payload['id'] = $id;

        $stmt = $this->pdo->prepare(sprintf(
            'UPDATE productos SET %s WHERE id = :id',
            implode(', ', $setSql)
        ));
        $stmt->execute($payload);

        return $this->buscarPorId($id);
    }

    public function eliminar(int $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM productos WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
