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

        $pdoRate = $this->clientes->pdo();
        rate_limit_verificar($pdoRate, $email, 'cliente');

        $record = $this->clientes->buscarPorEmail($email);
        $admin = $this->administradores->buscarPorEmail($email);
        $clienteValido = $record && (bool) $record['activo'] && password_verify($password, $record['password_hash']);
        $adminValido = $admin && (bool) $admin['activo'] && password_verify($password, $admin['password_hash']);

        if (!$clienteValido && !$adminValido) {
            rate_limit_registrar($pdoRate, $email, 'cliente', false);
            send_json(['error' => 'Email o contrasena de cliente incorrectos.'], 401);
        }
        rate_limit_registrar($pdoRate, $email, 'cliente', true);

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

    public function solicitarRecuperacion(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $email = mb_strtolower(clean_string($data['email'] ?? '', 160));

        // Respuesta uniforme: nunca revelamos si el email existe.
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_json(['ok' => true]);
        }

        $registro = $this->clientes->buscarPorEmail($email);
        if (!$registro || !(bool) $registro['activo']) {
            send_json(['ok' => true]);
        }

        $pdo = $this->clientes->pdo();
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);

        $stmt = $pdo->prepare(
            'INSERT INTO cliente_password_resets (cliente_id, token_hash, expira_en)
             VALUES (:cliente_id, :token, (NOW() + INTERVAL 30 MINUTE))'
        );
        $stmt->execute([
            ':cliente_id' => (int) $registro['id'],
            ':token' => $hash,
        ]);

        // En produccion: enviar email con Brevo/Postmark/SendGrid.
        // Aqui registramos el enlace en el log para poder probar el flujo
        // en local sin sistema de email configurado.
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        $enlace = sprintf('%s://%s/CDP-Wheels/public/restablecer-password.html?token=%s', $proto, $host, $token);
        error_log('[CDP-Wheels][recuperar-password] ' . $email . ' -> ' . $enlace);

        $respuesta = ['ok' => true];
        if (filter_var($_GET['debug'] ?? '', FILTER_VALIDATE_BOOL)) {
            $respuesta['debug_enlace'] = $enlace;
        }

        send_json($respuesta);
    }

    public function restablecerPassword(): void
    {
        require_method(['POST']);

        $data = read_json_body();
        $token = (string) ($data['token'] ?? '');
        $nueva = (string) ($data['password'] ?? '');

        if (strlen($token) < 32) {
            send_json(['error' => 'Token invalido o expirado.'], 422);
        }

        validate_password($nueva);

        $pdo = $this->clientes->pdo();
        $hash = hash('sha256', $token);

        $stmt = $pdo->prepare(
            'SELECT id, cliente_id, expira_en, usado_en
             FROM cliente_password_resets
             WHERE token_hash = :hash
             LIMIT 1'
        );
        $stmt->execute([':hash' => $hash]);
        $registro = $stmt->fetch();

        if (!$registro || $registro['usado_en'] !== null || strtotime((string) $registro['expira_en']) < time()) {
            send_json(['error' => 'El enlace ya no es valido. Solicita uno nuevo.'], 410);
        }

        $this->clientes->actualizarPassword((int) $registro['cliente_id'], $nueva);

        $marcar = $pdo->prepare('UPDATE cliente_password_resets SET usado_en = NOW() WHERE id = :id');
        $marcar->execute([':id' => (int) $registro['id']]);

        // Invalidamos cualquier otro token del mismo cliente.
        $invalida = $pdo->prepare(
            'UPDATE cliente_password_resets SET usado_en = NOW()
             WHERE cliente_id = :id AND usado_en IS NULL'
        );
        $invalida->execute([':id' => (int) $registro['cliente_id']]);

        send_json(['ok' => true]);
    }

    public function cambiarPassword(): void
    {
        require_method(['POST']);

        $cliente = current_customer();
        if (!$cliente) {
            send_json(['error' => 'Sesion de cliente requerida.'], 401);
        }

        $data = read_json_body();
        $actual = (string) ($data['password_actual'] ?? '');
        $nueva = (string) ($data['password_nueva'] ?? '');

        if ($actual === '') {
            send_json(['error' => 'Debes indicar tu contrasena actual.'], 422);
        }

        validate_password($nueva);

        if ($actual === $nueva) {
            send_json(['error' => 'La nueva contrasena debe ser distinta de la actual.'], 422);
        }

        $registro = $this->clientes->buscarPorEmail((string) $cliente['email']);
        if (!$registro || !password_verify($actual, $registro['password_hash'])) {
            send_json(['error' => 'La contrasena actual no es correcta.'], 401);
        }

        $this->clientes->actualizarPassword((int) $registro['id'], $nueva);
        session_regenerate_id(true);

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

    public function listarAdmin(string $metodo): void
    {
        require_admin();

        if ($metodo === 'GET') {
            send_json(['data' => $this->clientes->listarTodos()]);
        }

        if ($metodo === 'PATCH') {
            $data = read_json_body();
            $id = (int) ($data['id'] ?? 0);
            $activo = filter_var($data['activo'] ?? null, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);

            if ($id <= 0 || $activo === null) {
                send_json(['error' => 'Datos de cliente no validos.'], 422);
            }

            $this->clientes->actualizarActivo($id, $activo);
            send_json(['ok' => true]);
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }
}
