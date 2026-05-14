<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method(['GET']);

$pdo = get_pdo();
$customer = current_customer();

if (!$customer) {
    send_json([
        'has_admin_access' => false,
        'admin_authenticated' => false,
    ]);
}

$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE email = :email AND activo = 1 LIMIT 1');
$stmt->execute(['email' => $customer['email']]);
$hasAdminAccess = (bool) $stmt->fetchColumn();

unset($_SESSION['admin_user']);

send_json([
    'has_admin_access' => $hasAdminAccess,
    'admin_authenticated' => false,
]);
