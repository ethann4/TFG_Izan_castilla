<?php

declare(strict_types=1);

/**
 * Implementacion de TOTP (RFC 6238) sin dependencias externas.
 * Compatible con Google Authenticator, 1Password, Authy, etc.
 */

function totp_base32_encode(string $bytes): string
{
    $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    foreach (str_split($bytes) as $b) {
        $bits .= str_pad(decbin(ord($b)), 8, '0', STR_PAD_LEFT);
    }

    $salida = '';
    foreach (str_split($bits, 5) as $chunk) {
        $chunk = str_pad($chunk, 5, '0');
        $salida .= $alfabeto[bindec($chunk)];
    }

    return $salida;
}

function totp_base32_decode(string $cadena): string
{
    $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $cadena = strtoupper(preg_replace('/[^A-Z2-7]/', '', $cadena));
    $bits = '';

    foreach (str_split($cadena) as $c) {
        $idx = strpos($alfabeto, $c);
        if ($idx === false) continue;
        $bits .= str_pad(decbin($idx), 5, '0', STR_PAD_LEFT);
    }

    $salida = '';
    foreach (str_split($bits, 8) as $chunk) {
        if (strlen($chunk) === 8) {
            $salida .= chr(bindec($chunk));
        }
    }

    return $salida;
}

function totp_generar_secreto(int $bytes = 20): string
{
    return totp_base32_encode(random_bytes($bytes));
}

function totp_codigo(string $secretoBase32, ?int $tiempo = null, int $periodo = 30, int $digitos = 6): string
{
    $tiempo = $tiempo ?? time();
    $contador = (int) floor($tiempo / $periodo);
    $binario = pack('N*', 0) . pack('N*', $contador);

    $clave = totp_base32_decode($secretoBase32);
    $hash = hash_hmac('sha1', $binario, $clave, true);
    $offset = ord($hash[strlen($hash) - 1]) & 0xf;

    $codigo = (
        ((ord($hash[$offset]) & 0x7f) << 24) |
        ((ord($hash[$offset + 1]) & 0xff) << 16) |
        ((ord($hash[$offset + 2]) & 0xff) << 8) |
        (ord($hash[$offset + 3]) & 0xff)
    ) % (10 ** $digitos);

    return str_pad((string) $codigo, $digitos, '0', STR_PAD_LEFT);
}

/**
 * Verifica un codigo de usuario contra el secreto, aceptando deriva
 * de hasta 1 ventana de 30 s en cualquier direccion.
 */
function totp_verificar(string $secretoBase32, string $codigoUsuario, int $ventana = 1): bool
{
    $codigoUsuario = preg_replace('/\s+/', '', $codigoUsuario);
    if (!preg_match('/^\d{6}$/', $codigoUsuario)) return false;

    $tiempo = time();
    for ($i = -$ventana; $i <= $ventana; $i++) {
        $candidato = totp_codigo($secretoBase32, $tiempo + ($i * 30));
        if (hash_equals($candidato, $codigoUsuario)) {
            return true;
        }
    }

    return false;
}

function totp_uri(string $emisor, string $cuenta, string $secretoBase32): string
{
    return sprintf(
        'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
        rawurlencode($emisor),
        rawurlencode($cuenta),
        $secretoBase32,
        rawurlencode($emisor)
    );
}
