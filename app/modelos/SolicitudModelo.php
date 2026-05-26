<?php

declare(strict_types=1);

final class SolicitudModelo
{
    private array $columnas = [];

    public function __construct(private PDO $pdo)
    {
        $this->columnas = $this->cargarColumnas();
    }

    public function listar(): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM solicitudes ORDER BY creado_en DESC');
        $stmt->execute();
        $records = $stmt->fetchAll();

        foreach ($records as &$record) {
            $record['id'] = (string) $record['id'];
        }

        return $records;
    }

    public function crear(array $payload): string
    {
        $permitidas = [
            'nombre',
            'email',
            'telefono',
            'modelo_coche',
            'material',
            'presupuesto',
            'mensaje',
            'estado',
            'origen',
            'volante_generado_id',
            'boceto_3d',
            'configuracion_json',
            'resumen_json',
            'precio_total',
        ];

        $filtradas = [];
        foreach ($permitidas as $columna) {
            if (array_key_exists($columna, $payload) && $this->tieneColumna($columna)) {
                $filtradas[$columna] = $payload[$columna];
            }
        }

        $columnas = array_keys($filtradas);
        $campos = implode(', ', $columnas);
        $parametros = ':' . implode(', :', $columnas);
        $stmt = $this->pdo->prepare("INSERT INTO solicitudes ({$campos}) VALUES ({$parametros})");
        $stmt->execute($filtradas);

        return (string) $this->pdo->lastInsertId();
    }

    public function actualizarEstado(int $id, string $estado): void
    {
        $stmt = $this->pdo->prepare('UPDATE solicitudes SET estado = :estado WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'estado' => $estado,
        ]);
    }

    private function cargarColumnas(): array
    {
        $stmt = $this->pdo->query('SHOW COLUMNS FROM solicitudes');
        $columnas = [];

        foreach ($stmt->fetchAll() as $columna) {
            $columnas[(string) $columna['Field']] = true;
        }

        return $columnas;
    }

    private function tieneColumna(string $columna): bool
    {
        return isset($this->columnas[$columna]);
    }
}
