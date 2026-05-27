<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/VolanteGeneradoControlador.php';

(new VolanteGeneradoControlador(get_pdo()))->listarAdmin();
