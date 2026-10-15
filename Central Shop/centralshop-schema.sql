-- =====================================================
-- CentralShop - Esquema de base de datos (MySQL 8)
-- Compatible con Clever Cloud (la BD ya viene creada:
-- omite CREATE DATABASE / USE si no tienes permisos)
-- =====================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE roles (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rol_id TINYINT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  estado ENUM('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE tiendas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  logo_url VARCHAR(255),
  estado ENUM('pendiente','aprobada','suspendida') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tiendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  padre_id INT UNSIGNED NULL,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT fk_categorias_padre FOREIGN KEY (padre_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tienda_id INT UNSIGNED NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL CHECK (precio >= 0),
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  estado ENUM('borrador','activo','agotado','inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_tienda FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FULLTEXT KEY ft_productos (nombre, descripcion),
  KEY idx_productos_precio (precio)
) ENGINE=InnoDB;

CREATE TABLE producto_imagenes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id INT UNSIGNED NOT NULL,
  url VARCHAR(255) NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_img_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE direcciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  alias VARCHAR(50),
  departamento VARCHAR(80) NOT NULL,
  ciudad VARCHAR(80) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  referencia VARCHAR(200),
  telefono_contacto VARCHAR(20),
  CONSTRAINT fk_dir_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carritos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carrito_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  UNIQUE KEY uq_carrito_producto (carrito_id, producto_id),
  CONSTRAINT fk_ci_carrito FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  direccion_id INT UNSIGNED NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  costo_envio DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','pagado','preparando','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ped_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_ped_direccion FOREIGN KEY (direccion_id) REFERENCES direcciones(id),
  KEY idx_pedidos_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE pedido_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  tienda_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','preparando','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_pi_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_pi_tienda FOREIGN KEY (tienda_id) REFERENCES tiendas(id)
) ENGINE=InnoDB;

CREATE TABLE pagos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL UNIQUE,
  metodo ENUM('tarjeta','pse','efectivo_contraentrega','billetera') NOT NULL,
  estado ENUM('pendiente','aprobado','rechazado','reembolsado') NOT NULL DEFAULT 'pendiente',
  monto DECIMAL(12,2) NOT NULL,
  referencia_pasarela VARCHAR(100),
  pagado_en DATETIME NULL,
  CONSTRAINT fk_pagos_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE envios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL UNIQUE,
  transportadora VARCHAR(80),
  guia VARCHAR(60),
  estado ENUM('preparando','en_transito','entregado','devuelto') NOT NULL DEFAULT 'preparando',
  enviado_en DATETIME NULL,
  entregado_en DATETIME NULL,
  CONSTRAINT fk_envios_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE resenas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  calificacion TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_resena (usuario_id, producto_id),
  CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favoritos (
  usuario_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, producto_id),
  CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  mensaje VARCHAR(255) NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_not_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- Datos iniciales
INSERT INTO roles (nombre) VALUES ('administrador'), ('vendedor'), ('cliente');

INSERT INTO categorias (nombre) VALUES
('Tecnología'), ('Hogar'), ('Moda'), ('Deportes'), ('Belleza'), ('Alimentos');
