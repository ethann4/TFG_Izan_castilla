<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/SolicitudModelo.php';

final class SolicitudControlador
{
    private SolicitudModelo $solicitudes;

    public function __construct(PDO $pdo)
    {
        $this->solicitudes = new SolicitudModelo($pdo);
    }

    public function manejar(string $metodo): void
    {
        if ($metodo === 'GET') {
            require_admin();
            send_json(['data' => $this->solicitudes->listar()]);
        }

        if ($metodo === 'POST') {
            $this->crear();
        }

        if ($metodo === 'PATCH') {
            $this->actualizar();
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }

    private function crear(): void
    {
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

        send_json(['ok' => true, 'id' => $this->solicitudes->crear($payload)], 201);
    }

    private function actualizar(): void
    {
        require_admin();

        $data = read_json_body();
        $id = (int) ($data['id'] ?? 0);
        $estado = clean_string($data['estado'] ?? '', 40);
        $permitidos = ['pendiente', 'confirmada', 'rechazada'];

        if ($id <= 0 || !in_array($estado, $permitidos, true)) {
            send_json(['error' => 'Estado de solicitud no valido.'], 422);
        }

        $this->solicitudes->actualizarEstado($id, $estado);

        send_json(['ok' => true]);
    }
}
