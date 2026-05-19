<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/AdministradorControlador.php';

(new AdministradorControlador(get_pdo()))->iniciarSesion();
