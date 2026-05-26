<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/AdministradorModelo.php';

final class AdministradorControlador
{
    private AdministradorModelo $administradores;
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->administradores = new AdministradorModelo($pdo);
    }

    public function iniciarSesion(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password = (string) ($data['password'] ?? '');
        $codigoTotp = preg_replace('/\s+/', '', (string) ($data['totp'] ?? ''));

        if (!$email || $password === '') {
            send_json(['error' => 'Email y contrasena son obligatorios.'], 422);
        }

        if (mb_strlen($password) > 120) {
            send_json(['error' => 'Credenciales incorrectas.'], 401);
        }

        rate_limit_verificar($this->pdo, $email, 'admin');

        $admin = $this->administradores->buscarPorEmail($email);

        if (!$admin || !(bool) $admin['activo'] || !password_verify($password, $admin['password_hash'])) {
            rate_limit_registrar($this->pdo, $email, 'admin', false);
            send_json(['error' => 'Credenciales incorrectas.'], 401);
        }

        if (!empty($admin['totp_activo']) && !empty($admin['totp_secret'])) {
            if ($codigoTotp === '') {
                send_json(['totp_required' => true, 'error' => 'Codigo de verificacion en dos pasos requerido.'], 401);
            }
            if (!totp_verificar((string) $admin['totp_secret'], $codigoTotp)) {
                rate_limit_registrar($this->pdo, $email, 'admin', false);
                send_json(['error' => 'Codigo de verificacion incorrecto.'], 401);
            }
        }

        rate_limit_registrar($this->pdo, $email, 'admin', true);

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

    public function totpEstado(): void
    {
        require_method(['GET']);
        $admin = require_admin();
        $registro = $this->administradores->buscarPorId((int) $admin['id']);
        send_json([
            'activo' => (bool) ($registro['totp_activo'] ?? false),
            'configurado' => !empty($registro['totp_secret']),
        ]);
    }

    public function totpIniciar(): void
    {
        require_method(['POST']);
        $admin = require_admin();
        $secreto = totp_generar_secreto();
        $this->administradores->guardarTotp((int) $admin['id'], $secreto, false);

        send_json([
            'secret' => $secreto,
            'uri' => totp_uri('CDP Customs', (string) $admin['email'], $secreto),
        ]);
    }

    public function totpVerificar(): void
    {
        require_method(['POST']);
        $admin = require_admin();
        $data = read_json_body();
        $codigo = preg_replace('/\s+/', '', (string) ($data['codigo'] ?? ''));

        $registro = $this->administradores->buscarPorId((int) $admin['id']);
        $secreto = (string) ($registro['totp_secret'] ?? '');

        if ($secreto === '') {
            send_json(['error' => 'No hay 2FA configurado. Primero genera un nuevo secreto.'], 422);
        }

        if (!totp_verificar($secreto, $codigo)) {
            send_json(['error' => 'El codigo no es valido. Comprueba la hora del telefono y prueba con el siguiente codigo.'], 401);
        }

        $this->administradores->guardarTotp((int) $admin['id'], $secreto, true);
        send_json(['activo' => true]);
    }

    public function totpDesactivar(): void
    {
        require_method(['POST']);
        $admin = require_admin();
        $data = read_json_body();
        $password = (string) ($data['password'] ?? '');

        $registro = $this->administradores->buscarPorId((int) $admin['id']);
        if (!$registro || !password_verify($password, (string) $registro['password_hash'])) {
            send_json(['error' => 'Contrasena actual incorrecta.'], 401);
        }

        $this->administradores->guardarTotp((int) $admin['id'], null, false);
        send_json(['activo' => false]);
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
