<?php

declare(strict_types=1);

final class AdministradorModelo
{
    public function __construct(private PDO $pdo)
    {
    }

    public function buscarPorEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, email, nombre, password_hash, activo, totp_secret, totp_activo FROM admin_users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $record = $stmt->fetch();

        return $record ?: null;
    }

    public function buscarPorId(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, email, nombre, password_hash, activo, totp_secret, totp_activo FROM admin_users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch();

        return $record ?: null;
    }

    public function guardarTotp(int $id, ?string $secreto, bool $activo): void
    {
        $stmt = $this->pdo->prepare('UPDATE admin_users SET totp_secret = :secreto, totp_activo = :activo WHERE id = :id');
        $stmt->execute([
            ':id' => $id,
            ':secreto' => $secreto,
            ':activo' => $activo ? 1 : 0,
        ]);
    }

    public function listar(): array
    {
        $stmt = $this->pdo->prepare('SELECT id, email, nombre, activo, creado_en, ultimo_acceso FROM admin_users ORDER BY creado_en DESC');
        $stmt->execute();
        $records = $stmt->fetchAll();

        foreach ($records as &$record) {
            $record['id'] = (string) $record['id'];
            $record['activo'] = (bool) $record['activo'];
        }

        return $records;
    }

    public function crear(string $email, string $nombre, string $password): string
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO admin_users (email, nombre, password_hash, activo)
             VALUES (:email, :nombre, :password_hash, 1)'
        );
        $stmt->execute([
            'email' => $email,
            'nombre' => $nombre,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        return (string) $this->pdo->lastInsertId();
    }

    public function actualizarUltimoAcceso(int $id): void
    {
        $update = $this->pdo->prepare('UPDATE admin_users SET ultimo_acceso = NOW() WHERE id = :id');
        $update->execute(['id' => $id]);
    }
}
