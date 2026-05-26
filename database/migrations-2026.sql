-- Migracion incremental sobre schema.sql.
-- Ejecutar despues de schema.sql en cdp_wheels.

USE cdp_wheels;

-- Tokens de recuperacion de contrasena (cliente)
CREATE TABLE IF NOT EXISTS cliente_password_resets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  usado_en DATETIME NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token_hash (token_hash),
  INDEX idx_cliente_password_resets_cliente (cliente_id),
  CONSTRAINT fk_password_resets_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Intentos de login para rate limit (cliente y admin)
CREATE TABLE IF NOT EXISTS intentos_login (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  identificador VARCHAR(190) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
  exito TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_intentos_identificador (identificador, creado_en),
  INDEX idx_intentos_ip (ip, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Columnas TOTP para admin_users
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64) NULL AFTER password_hash,
  ADD COLUMN IF NOT EXISTS totp_activo TINYINT(1) NOT NULL DEFAULT 0 AFTER totp_secret;

-- Pedidos (registro real, antes de meter Stripe)
CREATE TABLE IF NOT EXISTS pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referencia VARCHAR(40) NOT NULL UNIQUE,
  cliente_id INT UNSIGNED NULL,
  email_contacto VARCHAR(160) NOT NULL,
  nombre_contacto VARCHAR(160) NOT NULL DEFAULT '',
  telefono_contacto VARCHAR(30) NULL,
  direccion VARCHAR(255) NOT NULL DEFAULT '',
  cp VARCHAR(10) NOT NULL DEFAULT '',
  ciudad VARCHAR(120) NOT NULL DEFAULT '',
  ccaa VARCHAR(80) NOT NULL DEFAULT '',
  pais VARCHAR(80) NOT NULL DEFAULT 'Espana',
  items_json LONGTEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  envio DECIMAL(10,2) NOT NULL DEFAULT 0,
  iva DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(30) NOT NULL DEFAULT 'simulado',
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente_pago',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pagado_en DATETIME NULL,
  INDEX idx_pedidos_cliente (cliente_id),
  INDEX idx_pedidos_estado (estado),
  CONSTRAINT fk_pedidos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
