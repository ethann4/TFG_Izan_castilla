<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['POST']);

$pdo = get_pdo();
$data = read_json_body();

$nombre = clean_string($data['nombre'] ?? '', 120);
$email = mb_strtolower(clean_string($data['email'] ?? '', 160));
$telefono = nullable_string($data['telefono'] ?? null, 30);
$password = (string) ($data['password'] ?? '');

if ($nombre === '') {
    send_json(['error' => 'El nombre es obligatorio.'], 422);
}

validate_email($email);
validate_password($password);

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare(
        'INSERT INTO clientes (nombre, email, telefono, password_hash, activo)
         VALUES (:nombre, :email, :telefono, :password_hash, 1)'
    );
    $stmt->execute([
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'password_hash' => $hash,
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        send_json(['error' => 'Ya existe una cuenta cliente con ese email.'], 409);
    }

    throw $error;
}

$customer = [
    'id' => (string) $pdo->lastInsertId(),
    'nombre' => $nombre,
    'email' => $email,
    'telefono' => $telefono ?? '',
];

session_regenerate_id(true);
unset($_SESSION['admin_user']);
$_SESSION['cliente_user'] = $customer;

send_json([
    'authenticated' => true,
    'user' => $customer,
], 201);
