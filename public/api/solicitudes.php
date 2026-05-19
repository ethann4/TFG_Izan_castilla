<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/SolicitudControlador.php';

(new SolicitudControlador(get_pdo()))->manejar($_SERVER['REQUEST_METHOD']);
