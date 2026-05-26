<?php

declare(strict_types=1);

/**
 * Rate limit basado en la tabla intentos_login.
 *
 * Bloquea cuando un identificador (email) o IP supera
 * el numero maximo de intentos fallidos en la ventana indicada.
 */

const CDP_RATE_LIMIT_INTENTOS = 5;
const CDP_RATE_LIMIT_VENTANA_MIN = 15;

function rate_limit_obtener_ip(): string
{
    $candidatos = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
        $_SERVER['REMOTE_ADDR'] ?? null,
    ];

    foreach ($candidatos as $valor) {
        if (!$valor) continue;
        $primero = trim(explode(',', (string) $valor)[0]);
        if ($primero !== '') return $primero;
    }

    return '0.0.0.0';
}

function rate_limit_contar(PDO $pdo, string $identificador, string $tipo): int
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM intentos_login
         WHERE (identificador = :id OR ip = :ip)
           AND tipo = :tipo
           AND exito = 0
           AND creado_en >= (NOW() - INTERVAL :ventana MINUTE)'
    );
    $stmt->bindValue(':id', $identificador);
    $stmt->bindValue(':ip', rate_limit_obtener_ip());
    $stmt->bindValue(':tipo', $tipo);
    $stmt->bindValue(':ventana', CDP_RATE_LIMIT_VENTANA_MIN, PDO::PARAM_INT);
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function rate_limit_verificar(PDO $pdo, string $identificador, string $tipo): void
{
    if (rate_limit_contar($pdo, $identificador, $tipo) >= CDP_RATE_LIMIT_INTENTOS) {
        send_json([
            'error' => 'Demasiados intentos fallidos. Espera ' . CDP_RATE_LIMIT_VENTANA_MIN . ' minutos antes de volver a intentarlo.',
        ], 429);
    }
}

function rate_limit_registrar(PDO $pdo, string $identificador, string $tipo, bool $exito): void
{
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO intentos_login (identificador, ip, tipo, exito)
             VALUES (:id, :ip, :tipo, :exito)'
        );
        $stmt->execute([
            ':id' => $identificador,
            ':ip' => rate_limit_obtener_ip(),
            ':tipo' => $tipo,
            ':exito' => $exito ? 1 : 0,
        ]);
    } catch (Throwable $error) {
        // si falla, no bloqueamos el login por un error de logging
    }
}
