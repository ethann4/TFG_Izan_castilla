<?php

declare(strict_types=1);

/**
 * Calculo de coste de envio segun codigo postal espanol.
 *
 * Tarifas planas por CCAA:
 *  - Peninsula           9.90 €
 *  - Baleares           18.00 €
 *  - Canarias           28.00 €
 *  - Ceuta / Melilla    32.00 €
 *  - Resto / desconocido 14.90 € (fallback peninsular plus)
 */

function envio_zona_por_cp(string $cp): array
{
    $cp = preg_replace('/\D+/', '', $cp);
    $prefijo = (int) substr(str_pad($cp, 5, '0', STR_PAD_LEFT), 0, 2);

    if ($prefijo === 7) {
        return ['zona' => 'baleares',  'coste' => 18.00, 'label' => 'Islas Baleares'];
    }

    if ($prefijo === 35 || $prefijo === 38) {
        return ['zona' => 'canarias',  'coste' => 28.00, 'label' => 'Islas Canarias'];
    }

    if ($prefijo === 51 || $prefijo === 52) {
        return ['zona' => 'ceuta_melilla', 'coste' => 32.00, 'label' => 'Ceuta / Melilla'];
    }

    if ($prefijo >= 1 && $prefijo <= 50) {
        return ['zona' => 'peninsula', 'coste' => 9.90,  'label' => 'Peninsula'];
    }

    return ['zona' => 'desconocida', 'coste' => 14.90, 'label' => 'Envio estandar'];
}
