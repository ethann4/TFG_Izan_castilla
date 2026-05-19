<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/AdministradorModelo.php';

final class AdministradorControlador
{
    private AdministradorModelo $administradores;

    public function __construct(PDO $pdo)
    {
        $this->administradores = new AdministradorModelo($pdo);
    }

    public function iniciarSesion(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password = (string) ($data['password'] ?? '');

        if (!$email || $password === '') {
            send_json(['error' => 'Email y contrasena son obligatorios.'], 422);
        }

        if (mb_strlen($password) > 120) {
            send_json(['error' => 'Credenciales incorrectas.'], 401);
        }

        $admin = $this->administradores->buscarPorEmail($email);

        if (!$admin || !(bool) $admin['activo'] || !password_verify($password, $admin['password_hash'])) {
            send_json(['error' => 'Credenciales incorrectas.'], 401);
        }

        $user = [
            'id' => (string) $admin['id'],
            'email' => $admin['email'],
            'nombre' => $admin['nombre'],
        ];

        session_regenerate_id(true);
        unset($_SESSION['cliente_user']);
        $_SESSION['admin_user'] = $user;

        $this->administradores->actualizarUltimoAcceso((int) $admin['id']);

        send_json([
            'authenticated' => true,
            'user' => $user,
        ]);
    }

    public function sesion(): void
    {
        require_method(['GET']);

        $admin = current_admin();

        send_json([
            'authenticated' => (bool) $admin,
            'user' => $admin,
        ]);
    }

    public function cerrarSesion(): void
    {
        require_method(['POST']);

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }

        session_destroy();

        send_json(['ok' => true]);
    }

    public function usuarios(string $metodo): void
    {
        if ($metodo === 'GET') {
            require_admin();
            send_json(['data' => $this->administradores->listar()]);
        }

        if ($metodo === 'POST') {
            require_admin();

            $data = read_json_body();
            $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
            $nombre = clean_string($data['nombre'] ?? '', 120);
            $password = (string) ($data['password'] ?? '');

            if (!$email || $nombre === '' || $password === '') {
                send_json(['error' => 'Email, nombre y contrasena son obligatorios.'], 422);
            }

            validate_password($password);

            send_json(['ok' => true, 'id' => $this->administradores->crear($email, $nombre, $password)], 201);
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }
}
