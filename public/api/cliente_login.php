<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['POST']);

$pdo = get_pdo();
$data = read_json_body();

$email = mb_strtolower(clean_string($data['email'] ?? '', 160));
$password = (string) ($data['password'] ?? '');

validate_email($email);

if ($password === '') {
    send_json(['error' => 'La contrasena es obligatoria.'], 422);
}

$stmt = $pdo->prepare('SELECT id, nombre, email, telefono, password_hash, activo FROM clientes WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$customerRecord = $stmt->fetch();

if (!$customerRecord || !(bool) $customerRecord['activo'] || !password_verify($password, $customerRecord['password_hash'])) {
    send_json(['error' => 'Email o contrasena de cliente incorrectos.'], 401);
}

$customer = normalize_customer_record($customerRecord);

session_regenerate_id(true);
unset($_SESSION['admin_user']);
$_SESSION['cliente_user'] = $customer;

$update = $pdo->prepare('UPDATE clientes SET ultimo_acceso = NOW() WHERE id = :id');
$update->execute(['id' => $customerRecord['id']]);

send_json([
    'authenticated' => true,
    'user' => $customer,
]);
