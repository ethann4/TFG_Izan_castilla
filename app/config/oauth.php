<?php

declare(strict_types=1);

$oauthLocal = __DIR__ . '/oauth.local.php';
if (is_file($oauthLocal)) {
    require_once $oauthLocal;
}

if (!defined('GOOGLE_CLIENT_ID')) define('GOOGLE_CLIENT_ID', '');
if (!defined('GOOGLE_CLIENT_SECRET')) define('GOOGLE_CLIENT_SECRET', '');

if (!defined('APPLE_CLIENT_ID')) define('APPLE_CLIENT_ID', '');
if (!defined('APPLE_TEAM_ID')) define('APPLE_TEAM_ID', '');
if (!defined('APPLE_KEY_ID')) define('APPLE_KEY_ID', '');
if (!defined('APPLE_PRIVATE_KEY')) define('APPLE_PRIVATE_KEY', '');

function oauth_config_value(string $envName, string $fallback): string
{
    $value = getenv($envName);
    return is_string($value) && trim($value) !== '' ? trim($value) : trim($fallback);
}

function google_oauth_config(): array
{
    return [
        'client_id' => oauth_config_value('CDP_GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID),
        'client_secret' => oauth_config_value('CDP_GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET),
    ];
}

function apple_oauth_config(): array
{
    return [
        'client_id' => oauth_config_value('CDP_APPLE_CLIENT_ID', APPLE_CLIENT_ID),
        'team_id' => oauth_config_value('CDP_APPLE_TEAM_ID', APPLE_TEAM_ID),
        'key_id' => oauth_config_value('CDP_APPLE_KEY_ID', APPLE_KEY_ID),
        'private_key' => str_replace('\\n', "\n", oauth_config_value('CDP_APPLE_PRIVATE_KEY', APPLE_PRIVATE_KEY)),
    ];
}

function oauth_redirect_uri(string $provider): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/CDP-Wheels/public/api'));

    return "{$scheme}://{$host}{$scriptDir}/oauth_callback.php?proveedor={$provider}";
}
