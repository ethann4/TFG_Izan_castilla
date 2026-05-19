<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/CarritoControlador.php';

(new CarritoControlador(get_pdo()))->manejar($_SERVER['REQUEST_METHOD']);
