-- =============================================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL - TECHFIX API (TALLER DE REPARACIÓN)
-- Este script puede ser ejecutado directamente en DBeaver o psql
-- =============================================================================

-- 1. Eliminar tablas previas si existen (en orden inverso de dependencias)
DROP TABLE IF EXISTS repair_items CASCADE;
DROP TABLE IF EXISTS repair_orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tabla de Usuarios (Admins, Técnicos, Clientes)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'technician', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Inventario (Repuestos y Servicios de Servicio Técnico)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('repuesto', 'servicio')),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Órdenes de Reparación de Celulares y Dispositivos
CREATE TABLE repair_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(30) UNIQUE NOT NULL, -- Ej: REP-2026-001
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    technician_id INT REFERENCES users(id) ON DELETE SET NULL,
    device_brand VARCHAR(50) NOT NULL, -- Ej: Apple, Samsung, Xiaomi, Motorola
    device_model VARCHAR(100) NOT NULL, -- Ej: iPhone 13 Pro, Galaxy S22
    serial_imei VARCHAR(50), -- Número de serie o IMEI del celular
    fault_description TEXT NOT NULL, -- Descripción de la falla dada por el cliente
    status VARCHAR(30) NOT NULL DEFAULT 'recibido' 
        CHECK (status IN ('recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado', 'cancelado')),
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00 CHECK (estimated_cost >= 0),
    final_cost NUMERIC(10, 2) DEFAULT 0.00 CHECK (final_cost >= 0),
    repair_notes TEXT, -- Notas internas del técnico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Detalle de la Orden (Repuestos y Servicios aplicados a la reparación)
CREATE TABLE repair_items (
    id SERIAL PRIMARY KEY,
    repair_order_id INT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
    inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ÍNDICES PARA OPTIMIZAR BÚSQUEDAS EN DBEAVER / API
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_repair_orders_customer ON repair_orders(customer_id);
CREATE INDEX idx_repair_orders_technician ON repair_orders(technician_id);
CREATE INDEX idx_repair_orders_status ON repair_orders(status);
CREATE INDEX idx_repair_orders_order_number ON repair_orders(order_number);
CREATE INDEX idx_repair_orders_imei ON repair_orders(serial_imei);
CREATE INDEX idx_inventory_type ON inventory(type);

-- =============================================================================
-- TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE `updated_at`
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_repair_orders_timestamp BEFORE UPDATE ON repair_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
