<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../../app/controladores/AdministradorControlador.php';

$controlador = new AdministradorControlador(get_pdo());
$accion = $_GET['accion'] ?? 'estado';

switch ($accion) {
    case 'iniciar':
        $controlador->totpIniciar();
        break;
    case 'verificar':
        $controlador->totpVerificar();
        break;
    case 'desactivar':
        $controlador->totpDesactivar();
        break;
    default:
        $controlador->totpEstado();
}
