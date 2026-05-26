<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/ClienteModelo.php';
require_once __DIR__ . '/../config/oauth.php';

final class AccesoSocialControlador
{
    private ?ClienteModelo $clientes = null;

    public function __construct(private ?PDO $pdo = null)
    {
    }

    public function iniciar(): void
    {
        require_method(['GET']);

        $provider = $this->proveedorSolicitado();
        $state = bin2hex(random_bytes(24));
        $_SESSION['oauth_state'] = $state;
        $_SESSION['oauth_provider'] = $provider;

        if ($provider === 'google') {
            $config = google_oauth_config();
            if ($config['client_id'] === '' || $config['client_secret'] === '') {
                $this->volverConError('config_google');
            }

            $params = [
                'client_id' => $config['client_id'],
                'redirect_uri' => oauth_redirect_uri('google'),
                'response_type' => 'code',
                'scope' => 'openid email profile',
                'state' => $state,
                'prompt' => 'select_account',
            ];

            header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params));
            exit;
        }

        $config = apple_oauth_config();
        if ($config['client_id'] === '' || $config['team_id'] === '' || $config['key_id'] === '' || $config['private_key'] === '') {
            $this->volverConError('config_apple');
        }

        $params = [
            'client_id' => $config['client_id'],
            'redirect_uri' => oauth_redirect_uri('apple'),
            'response_type' => 'code',
            'scope' => 'name email',
            'response_mode' => 'form_post',
            'state' => $state,
        ];

        header('Location: https://appleid.apple.com/auth/authorize?' . http_build_query($params));
        exit;
    }

    public function callback(): void
    {
        $provider = $this->proveedorSolicitado();
        $data = $provider === 'apple' ? $_POST : $_GET;

        if (($data['state'] ?? '') !== ($_SESSION['oauth_state'] ?? '') || $provider !== ($_SESSION['oauth_provider'] ?? '')) {
            $this->volverConError('estado');
        }

        if (!empty($data['error'])) {
            $this->volverConError('cancelado');
        }

        $code = (string) ($data['code'] ?? '');
        if ($code === '') {
            $this->volverConError('codigo');
        }

        $profile = $provider === 'google'
            ? $this->perfilGoogle($code)
            : $this->perfilApple($code, $data);

        $cliente = $this->clientes()->buscarOCrearSocial(
            $profile['nombre'],
            $profile['email'],
            $provider,
            $profile['id']
        );

        session_regenerate_id(true);
        unset($_SESSION['admin_user'], $_SESSION['oauth_state'], $_SESSION['oauth_provider']);
        $_SESSION['cliente_user'] = $cliente;

        header('Location: ../cuenta.html?oauth=ok');
        exit;
    }

    private function proveedorSolicitado(): string
    {
        $provider = strtolower((string) ($_GET['proveedor'] ?? $_POST['proveedor'] ?? ''));

        if (!in_array($provider, ['google', 'apple'], true)) {
            $this->volverConError('proveedor');
        }

        return $provider;
    }

    private function clientes(): ClienteModelo
    {
        if (!$this->clientes) {
            $this->clientes = new ClienteModelo($this->pdo ?? get_pdo());
        }

        return $this->clientes;
    }

    private function perfilGoogle(string $code): array
    {
        $config = google_oauth_config();
        $token = $this->postForm('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'redirect_uri' => oauth_redirect_uri('google'),
            'grant_type' => 'authorization_code',
        ]);

        $user = $this->getJson('https://openidconnect.googleapis.com/v1/userinfo', [
            'Authorization: Bearer ' . ($token['access_token'] ?? ''),
        ]);

        if (empty($user['email']) || empty($user['email_verified'])) {
            $this->volverConError('email');
        }

        return [
            'id' => (string) ($user['sub'] ?? ''),
            'email' => mb_strtolower((string) $user['email']),
            'nombre' => clean_string($user['name'] ?? $user['email'], 120),
        ];
    }

    private function perfilApple(string $code, array $callbackData): array
    {
        $config = apple_oauth_config();
        $token = $this->postForm('https://appleid.apple.com/auth/token', [
            'client_id' => $config['client_id'],
            'client_secret' => $this->appleClientSecret($config),
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => oauth_redirect_uri('apple'),
        ]);

        $claims = $this->decodeJwtPayload((string) ($token['id_token'] ?? ''));
        if (($claims['iss'] ?? '') !== 'https://appleid.apple.com' || ($claims['aud'] ?? '') !== $config['client_id']) {
            $this->volverConError('token');
        }

        if (($claims['email_verified'] ?? 'false') !== true && (string) ($claims['email_verified'] ?? 'false') !== 'true') {
            $this->volverConError('email');
        }

        $name = '';
        if (!empty($callbackData['user'])) {
            $appleUser = json_decode((string) $callbackData['user'], true);
            if (is_array($appleUser)) {
                $name = trim((string) ($appleUser['name']['firstName'] ?? '') . ' ' . (string) ($appleUser['name']['lastName'] ?? ''));
            }
        }

        $email = (string) ($claims['email'] ?? '');
        return [
            'id' => (string) ($claims['sub'] ?? ''),
            'email' => mb_strtolower($email),
            'nombre' => clean_string($name !== '' ? $name : $email, 120),
        ];
    }

    private function appleClientSecret(array $config): string
    {
        $header = $this->base64UrlEncode(json_encode(['alg' => 'ES256', 'kid' => $config['key_id']], JSON_THROW_ON_ERROR));
        $payload = $this->base64UrlEncode(json_encode([
            'iss' => $config['team_id'],
            'iat' => time(),
            'exp' => time() + 86400,
            'aud' => 'https://appleid.apple.com',
            'sub' => $config['client_id'],
        ], JSON_THROW_ON_ERROR));
        $unsigned = "{$header}.{$payload}";

        $privateKey = openssl_pkey_get_private($config['private_key']);
        if (!$privateKey || !openssl_sign($unsigned, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            $this->volverConError('firma_apple');
        }

        return $unsigned . '.' . $this->base64UrlEncode($signature);
    }

    private function postForm(string $url, array $fields): array
    {
        return $this->requestJson($url, [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($fields),
        ]);
    }

    private function getJson(string $url, array $headers): array
    {
        return $this->requestJson($url, [
            'method' => 'GET',
            'header' => implode("\r\n", $headers) . "\r\n",
        ]);
    }

    private function requestJson(string $url, array $httpOptions): array
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 12);

            if (($httpOptions['method'] ?? 'GET') === 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $httpOptions['content'] ?? '');
            }

            if (!empty($httpOptions['header'])) {
                $headers = array_filter(array_map('trim', explode("\r\n", (string) $httpOptions['header'])));
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            }

            $raw = curl_exec($ch);
            curl_close($ch);
            $data = is_string($raw) ? json_decode($raw, true) : null;

            if (!is_array($data)) {
                $this->volverConError('conexion');
            }

            return $data;
        }

        $context = stream_context_create(['http' => array_merge(['ignore_errors' => true, 'timeout' => 12], $httpOptions)]);
        $raw = file_get_contents($url, false, $context);
        $data = is_string($raw) ? json_decode($raw, true) : null;

        if (!is_array($data)) {
            $this->volverConError('conexion');
        }

        return $data;
    }

    private function decodeJwtPayload(string $jwt): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) < 2) {
            $this->volverConError('token');
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')) ?: '', true);
        if (!is_array($payload)) {
            $this->volverConError('token');
        }

        return $payload;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function volverConError(string $code): never
    {
        header('Location: ../cuenta.html?oauth=error_' . rawurlencode($code));
        exit;
    }
}
