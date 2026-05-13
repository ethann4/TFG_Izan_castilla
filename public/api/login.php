<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['POST']);

$data = read_json_body();
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = (string) ($data['password'] ?? '');

if (!$email || $password === '') {
    send_json(['error' => 'Email y contrasena son obligatorios.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, email, nombre, password_hash, activo FROM admin_users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$admin = $stmt->fetch();

if (!$admin || !(bool) $admin['activo'] || !password_verify($password, $admin['password_hash'])) {
    send_json(['error' => 'Credenciales incorrectas.'], 401);
}

$user = [
    'id' => (string) $admin['id'],
    'email' => $admin['email'],
    'nombre' => $admin['nombre'],
];

$_SESSION['admin_user'] = $user;

$update = $pdo->prepare('UPDATE admin_users SET ultimo_acceso = NOW() WHERE id = :id');
$update->execute(['id' => $admin['id']]);

send_json([
    'authenticated' => true,
    'user' => $user,
]);
