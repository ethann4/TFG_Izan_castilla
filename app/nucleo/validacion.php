<?php

declare(strict_types=1);

function validate_slug(string $slug): void
{
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
        send_json(['error' => 'El slug solo puede contener minusculas, numeros y guiones.'], 422);
    }
}

function validate_email(string $email): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(['error' => 'Email no valido.'], 422);
    }
}

function validate_password(string $password): void
{
    if (mb_strlen($password) < 8) {
        send_json(['error' => 'La contrasena debe tener al menos 8 caracteres.'], 422);
    }

    if (mb_strlen($password) > 120) {
        send_json(['error' => 'La contrasena es demasiado larga.'], 422);
    }
}

function clean_string(mixed $value, int $maxLength = 255): string
{
    $text = trim((string) ($value ?? ''));
    if (mb_strlen($text) > $maxLength) {
        $text = mb_substr($text, 0, $maxLength);
    }

    return $text;
}

function nullable_string(mixed $value, int $maxLength = 255): ?string
{
    $text = clean_string($value, $maxLength);
    return $text === '' ? null : $text;
}

function clean_list(mixed $value): array
{
    if (is_array($value)) {
        return array_values(array_filter(array_map(
            static fn ($item) => clean_string($item, 500),
            $value
        )));
    }

    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    if (is_array($decoded)) {
        return clean_list($decoded);
    }

    return array_values(array_filter(array_map(
        static fn ($item) => clean_string($item, 500),
        preg_split('/\r\n|\r|\n|,/', $value) ?: []
    )));
}

function decode_json_list(mixed $value): array
{
    if (is_array($value)) {
        return $value;
    }

    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}
