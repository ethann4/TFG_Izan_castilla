<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/ProductoControlador.php';

(new ProductoControlador(get_pdo()))->limpiarDuplicados($_SERVER['REQUEST_METHOD']);
