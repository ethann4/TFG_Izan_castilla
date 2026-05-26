<?php

declare(strict_types=1);

final class ClienteModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    public function buscarPorId(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, nombre, email, telefono, password_hash, activo FROM clientes WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch();

        return $record ?: null;
    }

    public function buscarPorEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, nombre, email, telefono, password_hash, activo FROM clientes WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $record = $stmt->fetch();

        return $record ?: null;
    }

    public function crear(string $nombre, string $email, ?string $telefono, string $password): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO clientes (nombre, email, telefono, password_hash, activo)
             VALUES (:nombre, :email, :telefono, :password_hash, 1)'
        );
        $stmt->execute([
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        return [
            'id' => (string) $this->pdo->lastInsertId(),
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono ?? '',
        ];
    }

    public function actualizarPassword(int $id, string $password): void
    {
        $stmt = $this->pdo->prepare('UPDATE clientes SET password_hash = :password_hash WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
    }

    public function buscarOCrearSocial(string $nombre, string $email, string $proveedor, string $proveedorId): array
    {
        $record = $this->buscarPorEmail($email);

        if ($record) {
            $this->actualizarUltimoAcceso((int) $record['id']);
            return normalize_customer_record($record);
        }

        $nombreFinal = $nombre !== '' ? $nombre : ucfirst($proveedor) . ' ' . mb_substr($proveedorId, 0, 8);
        $passwordInterno = bin2hex(random_bytes(24));

        return $this->crear($nombreFinal, $email, null, $passwordInterno);
    }

    public function actualizarUltimoAcceso(int $id): void
    {
        $update = $this->pdo->prepare('UPDATE clientes SET ultimo_acceso = NOW() WHERE id = :id');
        $update->execute(['id' => $id]);
    }

    public function tieneAccesoAdministrador(string $email): bool
    {
        $stmt = $this->pdo->prepare('SELECT id FROM admin_users WHERE email = :email AND activo = 1 LIMIT 1');
        $stmt->execute(['email' => $email]);

        return (bool) $stmt->fetchColumn();
    }

    public function listarTodos(): array
    {
        $stmt = $this->pdo->query(
            'SELECT id, nombre, email, telefono, activo, creado_en, ultimo_acceso
             FROM clientes
             ORDER BY creado_en DESC'
        );

        return $stmt->fetchAll();
    }

    public function actualizarActivo(int $id, bool $activo): void
    {
        $stmt = $this->pdo->prepare('UPDATE clientes SET activo = :activo WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'activo' => $activo ? 1 : 0,
        ]);
    }
}
