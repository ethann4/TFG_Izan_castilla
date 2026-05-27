<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/VolanteGeneradoModelo.php';
require_once __DIR__ . '/../modelos/SolicitudModelo.php';

final class VolanteGeneradoControlador
{
    private VolanteGeneradoModelo $volantes;
    private SolicitudModelo $solicitudes;

    public function __construct(private PDO $pdo)
    {
        $this->volantes = new VolanteGeneradoModelo($pdo);
        $this->solicitudes = new SolicitudModelo($pdo);
    }

    public function manejar(string $metodo): void
    {
        if ($metodo === 'GET') {
            $this->listar();
        }

        if ($metodo === 'POST') {
            $this->guardar();
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }

    public function listarAdmin(): void
    {
        require_admin();
        $registros = $this->volantes->listarTodos();

        send_json([
            'data' => array_map([$this, 'normalizarRegistro'], $registros),
        ]);
    }

    private function listar(): void
    {
        $cliente = require_customer();
        $registros = $this->volantes->listarPorCliente((int) $cliente['id']);

        send_json([
            'data' => array_map([$this, 'normalizarRegistro'], $registros),
        ]);
    }

    private function guardar(): void
    {
        $cliente = require_customer();
        $data = read_json_body();

        $resumen = $this->leerBloque($data['resumen'] ?? [], 'resumen');
        $configuracion = $this->leerBloque($data['configuracion'] ?? [], 'configuracion');
        $precio = $this->leerBloque($data['precio'] ?? [], 'precio');
        $visual = $this->leerBloque($data['visual'] ?? [], 'visual');
        $boceto = $this->limpiarBoceto($data['boceto_3d'] ?? null);
        $precioTotal = (float) ($precio['total'] ?? $resumen['precio_total'] ?? 0);

        $marca = clean_string($resumen['marca'] ?? $configuracion['marca'] ?? '', 80);
        $modelo = clean_string($resumen['modelo'] ?? $configuracion['modelo'] ?? '', 120);
        $titulo = clean_string($data['titulo'] ?? '', 180);

        if ($marca === '' || $modelo === '') {
            send_json(['error' => 'Faltan marca o modelo del volante.'], 422);
        }

        if ($titulo === '') {
            $titulo = trim("Volante {$marca} {$modelo}");
        }

        $crearSolicitud = filter_var($data['crear_solicitud'] ?? false, FILTER_VALIDATE_BOOL);
        $payload = [
            'titulo' => $titulo,
            'marca' => $marca,
            'modelo' => $modelo,
            'precio_total' => $precioTotal,
            'configuracion_json' => $this->codificar($configuracion),
            'resumen_json' => $this->codificar($resumen),
            'precio_json' => $this->codificar($precio),
            'visual_json' => $this->codificar($visual),
            'boceto_3d' => $boceto,
            'estado' => $crearSolicitud ? 'solicitud_enviada' : 'guardado',
        ];

        $this->pdo->beginTransaction();

        try {
            $volanteId = (int) $this->volantes->crear((int) $cliente['id'], $payload);
            $solicitudId = null;

            if ($crearSolicitud) {
                $solicitudId = (int) $this->solicitudes->crear($this->crearPayloadSolicitud(
                    $cliente,
                    $volanteId,
                    $payload,
                    $resumen
                ));
                $this->volantes->asociarSolicitud($volanteId, (int) $cliente['id'], $solicitudId);
            }

            $this->pdo->commit();
        } catch (Throwable $error) {
            $this->pdo->rollBack();
            throw $error;
        }

        send_json([
            'ok' => true,
            'id' => (string) $volanteId,
            'solicitud_id' => $solicitudId ? (string) $solicitudId : null,
            'mensaje' => $crearSolicitud
                ? 'Solicitud enviada. El diseno queda guardado en Cuenta > Volantes generados y en el panel de administrador.'
                : 'Diseno guardado. Podras verlo desde Cuenta > Volantes generados.',
        ], 201);
    }

    private function crearPayloadSolicitud(array $cliente, int $volanteId, array $payload, array $resumen): array
    {
        $detalles = [
            "Compra solicitada desde el configurador 3D.",
            "Volante: {$payload['marca']} {$payload['modelo']}",
            "Aro: " . ($resumen['aro'] ?? ''),
            "Agarres: " . ($resumen['agarres'] ?? ''),
            "Costuras: " . ($resumen['costuras'] ?? ''),
            "Logo: " . ($resumen['logo'] ?? ''),
            "Pantalla RPM: " . ($resumen['pantallaRpm'] ?? ''),
            "Levas: " . ($resumen['levas'] ?? ''),
            "Marcador: " . ($resumen['marcador'] ?? ''),
        ];

        return [
            'nombre' => clean_string($cliente['nombre'] ?? 'Cliente', 80),
            'email' => clean_string($cliente['email'] ?? '', 120),
            'telefono' => nullable_string($cliente['telefono'] ?? null, 30),
            'modelo_coche' => clean_string("{$payload['marca']} {$payload['modelo']}", 80),
            'material' => clean_string(trim(($resumen['aro'] ?? '') . ' / ' . ($resumen['agarres'] ?? '')), 80),
            'presupuesto' => number_format((float) $payload['precio_total'], 2, ',', '.') . ' EUR',
            'mensaje' => trim(implode("\n", array_filter($detalles))),
            'estado' => 'pendiente',
            'origen' => 'configurador_3d',
            'volante_generado_id' => $volanteId,
            'boceto_3d' => $payload['boceto_3d'],
            'configuracion_json' => $payload['configuracion_json'],
            'resumen_json' => $payload['resumen_json'],
            'precio_total' => $payload['precio_total'],
        ];
    }

    private function leerBloque(mixed $value, string $nombre): array
    {
        if (is_array($value)) {
            return $value;
        }

        send_json(['error' => "El bloque {$nombre} no es valido."], 422);
    }

    private function limpiarBoceto(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $boceto = trim($value);
        if (strlen($boceto) > 5000000) {
            send_json(['error' => 'El boceto 3D es demasiado grande.'], 422);
        }

        if (!preg_match('/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/', $boceto)) {
            send_json(['error' => 'El boceto 3D no tiene un formato valido.'], 422);
        }

        return $boceto;
    }

    private function codificar(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function normalizarRegistro(array $registro): array
    {
        foreach (['configuracion_json', 'resumen_json', 'precio_json', 'visual_json'] as $campo) {
            $registro[$campo] = $this->decodificar($registro[$campo] ?? null);
        }

        $registro['id'] = (string) $registro['id'];
        $registro['cliente_id'] = (string) $registro['cliente_id'];
        $registro['solicitud_id'] = isset($registro['solicitud_id']) ? (string) $registro['solicitud_id'] : null;
        $registro['precio_total'] = isset($registro['precio_total']) ? (float) $registro['precio_total'] : 0;

        return $registro;
    }

    private function decodificar(mixed $value): array
    {
        if (!is_string($value) || trim($value) === '') {
            return [];
        }

        $data = json_decode($value, true);
        return is_array($data) ? $data : [];
    }
}
