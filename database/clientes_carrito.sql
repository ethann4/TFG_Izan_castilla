-- Tablas para registro de clientes y cesta de compra CDP Wheels.
-- Importar en phpMyAdmin si la base cdp_wheels ya existe.

USE cdp_wheels;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefono VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME NULL,
  INDEX idx_clientes_email (email),
  INDEX idx_clientes_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carrito_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL,
  UNIQUE KEY uniq_carrito_cliente_producto (cliente_id, producto_id),
  INDEX idx_carrito_cliente (cliente_id),
  INDEX idx_carrito_producto (producto_id),
  CONSTRAINT fk_carrito_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_carrito_producto
    FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
