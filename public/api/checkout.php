<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/CheckoutControlador.php';

$controlador = new CheckoutControlador(get_pdo());

$accion = $_GET['accion'] ?? 'procesar';
if ($accion === 'preview') {
    $controlador->calcularPreview();
} else {
    $controlador->procesar();
}
