<?php

declare(strict_types=1);

function current_admin(): ?array
{
    if (!isset($_SESSION['admin_user']) || !is_array($_SESSION['admin_user'])) {
        return null;
    }

    $admin = $_SESSION['admin_user'];
    $customer = isset($_SESSION['cliente_user']) && is_array($_SESSION['cliente_user'])
        ? $_SESSION['cliente_user']
        : null;

    if (
        $customer
        && mb_strtolower((string) ($admin['email'] ?? '')) !== mb_strtolower((string) ($customer['email'] ?? ''))
    ) {
        unset($_SESSION['admin_user']);
        return null;
    }

    return $admin;
}

function admin_email_matches_customer(?array $admin, string $customerEmail): bool
{
    return $admin
        && mb_strtolower((string) ($admin['email'] ?? '')) === mb_strtolower($customerEmail);
}

function clear_mismatched_admin_session(string $customerEmail): void
{
    if (!admin_email_matches_customer(current_admin(), $customerEmail)) {
        unset($_SESSION['admin_user']);
    }
}

function require_admin(): array
{
    $admin = current_admin();

    if (!$admin) {
        send_json(['error' => 'Sesion de administrador requerida.'], 401);
    }

    return $admin;
}

function current_customer(): ?array
{
    return isset($_SESSION['cliente_user']) && is_array($_SESSION['cliente_user'])
        ? $_SESSION['cliente_user']
        : null;
}

function require_customer(): array
{
    $customer = current_customer();

    if (!$customer) {
        send_json(['error' => 'Sesion de cliente requerida.'], 401);
    }

    return $customer;
}

function normalize_customer_record(array $record): array
{
    return [
        'id' => (string) $record['id'],
        'nombre' => (string) $record['nombre'],
        'email' => (string) $record['email'],
        'telefono' => $record['telefono'] ?? '',
    ];
}
