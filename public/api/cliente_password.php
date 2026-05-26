<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/ClienteControlador.php';

(new ClienteControlador(get_pdo()))->cambiarPassword();
