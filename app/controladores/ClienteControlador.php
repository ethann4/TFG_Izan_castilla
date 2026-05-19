<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/ClienteModelo.php';
require_once __DIR__ . '/../modelos/AdministradorModelo.php';

final class ClienteControlador
{
    private ClienteModelo $clientes;
    private AdministradorModelo $administradores;

    public function __construct(PDO $pdo)
    {
        $this->clientes = new ClienteModelo($pdo);
        $this->administradores = new AdministradorModelo($pdo);
    }

    public function registrar(): void
    {
        require_method(['POST']);

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

        try {
            $cliente = $this->clientes->crear($nombre, $email, $telefono, $password);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                send_json(['error' => 'Ya existe una cuenta cliente con ese email.'], 409);
            }

            throw $error;
        }

        session_regenerate_id(true);
        unset($_SESSION['admin_user']);
        $_SESSION['cliente_user'] = $cliente;

        send_json([
            'authenticated' => true,
            'user' => $cliente,
        ], 201);
    }

    public function iniciarSesion(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $email = mb_strtolower(clean_string($data['email'] ?? '', 160));
        $password = (string) ($data['password'] ?? '');

        validate_email($email);

        if ($password === '') {
            send_json(['error' => 'La contrasena es obligatoria.'], 422);
        }

        $record = $this->clientes->buscarPorEmail($email);
        $admin = $this->administradores->buscarPorEmail($email);
        $clienteValido = $record && (bool) $record['activo'] && password_verify($password, $record['password_hash']);
        $adminValido = $admin && (bool) $admin['activo'] && password_verify($password, $admin['password_hash']);

        if (!$clienteValido && !$adminValido) {
            send_json(['error' => 'Email o contrasena de cliente incorrectos.'], 401);
        }

        if ($adminValido && !$record) {
            $cliente = $this->clientes->crear((string) $admin['nombre'], $email, null, $password);
            $record = $this->clientes->buscarPorEmail($email);
        } elseif ($adminValido && $record && !(bool) $record['activo']) {
            send_json(['error' => 'La cuenta cliente esta desactivada.'], 401);
        } else {
            $cliente = normalize_customer_record($record);
        }

        if ($adminValido && $record && !$clienteValido) {
            $this->clientes->actualizarPassword((int) $record['id'], $password);
            $cliente = normalize_customer_record($record);
        }

        session_regenerate_id(true);
        $_SESSION['cliente_user'] = $cliente;

        if ($adminValido) {
            $_SESSION['admin_user'] = [
                'id' => (string) $admin['id'],
                'email' => (string) $admin['email'],
                'nombre' => (string) $admin['nombre'],
            ];
            $this->administradores->actualizarUltimoAcceso((int) $admin['id']);
        } else {
            unset($_SESSION['admin_user']);
        }

        $this->clientes->actualizarUltimoAcceso((int) $record['id']);

        send_json([
            'authenticated' => true,
            'user' => $cliente,
        ]);
    }

    public function sesion(): void
    {
        require_method(['GET']);

        $cliente = current_customer();

        send_json([
            'authenticated' => (bool) $cliente,
            'user' => $cliente,
        ]);
    }

    public function cerrarSesion(): void
    {
        require_method(['POST']);

        unset($_SESSION['cliente_user']);

        send_json(['ok' => true]);
    }

    public function accesoAdministrador(): void
    {
        require_method(['GET']);

        $cliente = current_customer();

        if (!$cliente) {
            send_json([
                'has_admin_access' => false,
                'admin_authenticated' => false,
            ]);
        }

        $tieneAcceso = $this->clientes->tieneAccesoAdministrador($cliente['email']);
        $admin = current_admin();
        $adminActivo = $tieneAcceso && admin_email_matches_customer($admin, $cliente['email']);

        send_json([
            'has_admin_access' => $tieneAcceso,
            'admin_authenticated' => $adminActivo,
        ]);
    }
}
