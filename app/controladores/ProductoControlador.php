<?php

declare(strict_types=1);

require_once __DIR__ . '/../modelos/ProductoModelo.php';

final class ProductoControlador
{
    private ProductoModelo $productos;

    public function __construct(PDO $pdo)
    {
        $this->productos = new ProductoModelo($pdo);
    }

    public function manejar(string $metodo): void
    {
        if ($metodo === 'GET') {
            $this->listarOBuscar();
        }

        if ($metodo === 'POST') {
            $this->crear();
        }

        if ($metodo === 'PATCH' || $metodo === 'PUT') {
            $this->actualizar();
        }

        if ($metodo === 'DELETE') {
            $this->eliminar();
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }

    private function listarOBuscar(): void
    {
        $esAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
        $slug = nullable_string($_GET['slug'] ?? null, 160);

        if ($esAdmin) {
            require_admin();
        }

        if ($slug) {
            send_json(['data' => $this->productos->buscarPorSlug($slug, !$esAdmin)]);
        }

        send_json(['data' => $this->productos->listar(!$esAdmin)]);
    }

    private function crear(): void
    {
        require_admin();

        $data = read_json_body();
        foreach (['slug', 'marca', 'nombre'] as $field) {
            if (clean_string($data[$field] ?? '') === '') {
                send_json(['error' => "El campo {$field} es obligatorio."], 422);
            }
        }

        send_json(['data' => $this->productos->crear($data)], 201);
    }

    private function actualizar(): void
    {
        require_admin();

        $data = read_json_body();
        $id = (int) ($_GET['id'] ?? $data['id'] ?? 0);

        if ($id <= 0) {
            send_json(['error' => 'ID de producto no valido.'], 422);
        }

        send_json(['data' => $this->productos->actualizar($id, $data)]);
    }

    private function eliminar(): void
    {
        require_admin();

        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            send_json(['error' => 'ID de producto no valido.'], 422);
        }

        $this->productos->eliminar($id);
        send_json(['ok' => true]);
    }

    public function limpiarDuplicados(string $metodo): void
    {
        require_admin();

        if ($metodo === 'GET') {
            send_json(['data' => $this->productos->detectarDuplicados()]);
        }

        if ($metodo === 'POST') {
            $eliminados = $this->productos->eliminarDuplicados();
            send_json(['ok' => true, 'eliminados' => $eliminados]);
        }

        send_json(['error' => 'Metodo no permitido.'], 405);
    }
}
