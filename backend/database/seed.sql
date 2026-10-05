-- =============================================================================
-- SCRIPT DE DATOS DE PRUEBA (SEED) - TECHFIX API
-- Ejecutar en DBeaver después de ejecutar schema.sql
-- =============================================================================

-- Contraseñas encriptadas:
-- admin@techfix.com    -> admin123
-- tecnico@techfix.com  -> tecnico123
-- cliente@techfix.com  -> cliente123

INSERT INTO users (name, email, password_hash, phone, role) VALUES
('Administrador Principal', 'admin@techfix.com', '$2a$10$ZR/XTCWi1cGE0PJWXrg2m.OYm4EM2NhWEjURxd3xVGnsUBDkbYtTy', '+573001112233', 'admin'),
('Carlos Técnico', 'tecnico@techfix.com', '$2a$10$bXF547bLvHRt/9Pz15pawOX1tk/qH8rhT4Q02oGWmV7rJLkYbE0C', '+573104445566', 'technician'),
('Juan Pérez (Cliente)', 'cliente@techfix.com', '$2a$10$9dl.D2symZrovMLhQ1Jtsecai4uyuwMDBVQHOcQjK6d1sJ1FFliDC', '+573207778899', 'customer'),
('Maria López (Cliente)', 'maria@gmail.com', '$2a$10$9dl.D2symZrovMLhQ1Jtsecai4uyuwMDBVQHOcQjK6d1sJ1FFliDC', '+573158889900', 'customer');

-- Inventario inicial de Repuestos y Servicios
INSERT INTO inventory (name, description, type, unit_price, stock) VALUES
('Pantalla iPhone 13 OLED', 'Módulo de pantalla completo OLED calidad original', 'repuesto', 120.00, 10),
('Batería Samsung Galaxy S22', 'Batería de repuesto 3700mAh original', 'repuesto', 45.00, 15),
('Pin de Carga Tipo C Xiaomi', 'Conector de carga flex para Xiaomi Redmi Note 11', 'repuesto', 15.00, 25),
('Servicio de Diagnóstico General', 'Revisión técnica de software y hardware', 'servicio', 15.00, 999),
('Servicio Mantenimiento Limpieza ultrasónica', 'Limpieza profunda por sulfatación o humedad', 'servicio', 30.00, 999),
('Servicio Cambio de Pantalla y Calibración', 'Mano de obra para sustitución de módulo frontal', 'servicio', 25.00, 999);

-- Órdenes de Reparación Iniciales
INSERT INTO repair_orders 
(order_number, customer_id, technician_id, device_brand, device_model, serial_imei, fault_description, status, estimated_cost, final_cost, repair_notes)
VALUES
('REP-2026-001', 3, 2, 'Apple', 'iPhone 13', '356789012345678', 'Pantalla rota por caída y no da imagen.', 'en_reparacion', 145.00, 145.00, 'Se verificó encendido de tarjeta lógica. Requiere cambio de módulo pantalla.'),
('REP-2026-002', 4, 2, 'Samsung', 'Galaxy S22', '359876543210987', 'La batería dura menos de 2 horas y calienta.', 'recibido', 70.00, 0.00, 'Pendiente de destapar y revisar consumo en fuente.'),
('REP-2026-003', 3, 2, 'Xiaomi', 'Redmi Note 11', '864321098765432', 'No reconoce el cargador, pin flojo.', 'listo', 40.00, 40.00, 'Se reemplazó módulo pin de carga tipo C. Probado carga rápida 100% OK.');

-- Relación de Repuestos y Servicios en la Orden REP-2026-001 (id 1)
INSERT INTO repair_items (repair_order_id, inventory_id, quantity, unit_price) VALUES
(1, 1, 1, 120.00), -- Pantalla iPhone 13
(1, 6, 1, 25.00);  -- Mano de obra cambio de pantalla

-- Relación de Repuestos y Servicios en la Orden REP-2026-003 (id 3)
INSERT INTO repair_items (repair_order_id, inventory_id, quantity, unit_price) VALUES
(3, 3, 1, 15.00), -- Pin de carga
(3, 6, 1, 25.00);  -- Mano de obra
