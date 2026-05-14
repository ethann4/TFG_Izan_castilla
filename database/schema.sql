CREATE DATABASE IF NOT EXISTS cdp_wheels
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cdp_wheels;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  marca VARCHAR(80) NOT NULL,
  marca_filtro VARCHAR(80) NOT NULL DEFAULT '',
  modelo VARCHAR(120) NOT NULL DEFAULT '',
  modelo_filtro VARCHAR(160) NOT NULL DEFAULT '',
  nombre VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  descripcion_corta TEXT NULL,
  material VARCHAR(120) NOT NULL DEFAULT '',
  color VARCHAR(120) NOT NULL DEFAULT '',
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_anterior DECIMAL(10,2) NULL,
  etiqueta VARCHAR(80) NOT NULL DEFAULT 'Nuevo',
  valoracion VARCHAR(20) NOT NULL DEFAULT '4.8',
  imagen_principal TEXT NULL,
  galeria LONGTEXT NULL,
  acabados LONGTEXT NULL,
  compatibilidad LONGTEXT NULL,
  especificaciones LONGTEXT NULL,
  tags TEXT NULL,
  stock INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL,
  INDEX idx_productos_activo (activo),
  INDEX idx_productos_marca (marca_filtro),
  INDEX idx_productos_modelo (modelo_filtro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS solicitudes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NULL,
  modelo_coche VARCHAR(80) NULL,
  material VARCHAR(80) NULL,
  presupuesto VARCHAR(80) NULL,
  mensaje TEXT NOT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'pendiente',
  origen VARCHAR(80) NOT NULL DEFAULT 'formulario_contacto',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_solicitudes_estado (estado),
  INDEX idx_solicitudes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

INSERT INTO admin_users (email, nombre, password_hash)
VALUES ('volantescas@gmail.com', 'Administrador CDP', '$2y$10$w3nQCBxf3qHNRMPju8nRxexi4o0Q7NMojnYUXMuDv3U3d0nSYqPpi')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  password_hash = VALUES(password_hash),
  activo = 1;
