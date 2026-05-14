<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    require_admin();

    $stmt = $pdo->prepare('SELECT id, email, nombre, activo, creado_en, ultimo_acceso FROM admin_users ORDER BY creado_en DESC');
    $stmt->execute();
    $records = $stmt->fetchAll();

    foreach ($records as &$record) {
        $record['id'] = (string) $record['id'];
        $record['activo'] = (bool) $record['activo'];
    }

    send_json(['data' => $records]);
}

if ($method === 'POST') {
    require_admin();

    $data = read_json_body();
    $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $nombre = clean_string($data['nombre'] ?? '', 120);
    $password = (string) ($data['password'] ?? '');

    if (!$email || $nombre === '' || $password === '') {
        send_json(['error' => 'Email, nombre y contrasena son obligatorios.'], 422);
    }

    validate_password($password);

    $stmt = $pdo->prepare(
        'INSERT INTO admin_users (email, nombre, password_hash, activo)
         VALUES (:email, :nombre, :password_hash, 1)'
    );
    $stmt->execute([
        'email' => $email,
        'nombre' => $nombre,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    send_json(['ok' => true, 'id' => (string) $pdo->lastInsertId()], 201);
}

send_json(['error' => 'Metodo no permitido.'], 405);
