<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    require_admin();

    $stmt = $pdo->prepare('SELECT * FROM solicitudes ORDER BY creado_en DESC');
    $stmt->execute();
    $records = $stmt->fetchAll();

    foreach ($records as &$record) {
        $record['id'] = (string) $record['id'];
    }

    send_json(['data' => $records]);
}

if ($method === 'POST') {
    $data = read_json_body();

    $nombre = clean_string($data['nombre'] ?? '', 80);
    $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $telefono = nullable_string($data['telefono'] ?? null, 30);
    $mensaje = clean_string($data['mensaje'] ?? '', 1000);

    if ($nombre === '' || !$email || $mensaje === '') {
        send_json(['error' => 'Nombre, email y mensaje son obligatorios.'], 422);
    }

    if ($telefono !== null && !preg_match('/^[0-9+\s().-]{6,30}$/', $telefono)) {
        send_json(['error' => 'El telefono no tiene un formato valido.'], 422);
    }

    $payload = [
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'modelo_coche' => nullable_string($data['modelo_coche'] ?? null, 80),
        'material' => nullable_string($data['material'] ?? null, 80),
        'presupuesto' => nullable_string($data['presupuesto'] ?? null, 80),
        'mensaje' => $mensaje,
        'estado' => nullable_string($data['estado'] ?? null, 40) ?? 'pendiente',
        'origen' => nullable_string($data['origen'] ?? null, 80) ?? 'formulario_contacto',
    ];

    $stmt = $pdo->prepare(
        'INSERT INTO solicitudes (nombre, email, telefono, modelo_coche, material, presupuesto, mensaje, estado, origen)
         VALUES (:nombre, :email, :telefono, :modelo_coche, :material, :presupuesto, :mensaje, :estado, :origen)'
    );
    $stmt->execute($payload);

    send_json(['ok' => true, 'id' => (string) $pdo->lastInsertId()], 201);
}

send_json(['error' => 'Metodo no permitido.'], 405);
