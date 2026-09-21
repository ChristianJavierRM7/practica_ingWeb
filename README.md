# 📱 TechFix API - Sistema de Tienda de Tecnología y Reparación de Celulares

API REST completa para la gestión integral de una tienda de tecnología y taller de servicio técnico de celulares y dispositivos electrónicos. Construida con **Node.js**, **Express**, **PostgreSQL** y **DBeaver**.

---

## 🌟 Características Principales

- 🔐 **Autenticación y Autorización JWT**: Sistema de inicio de sesión con encriptación **bcrypt** y control de acceso basado en roles (`admin`, `technician`, `customer`).
- 🛠️ **Órdenes de Reparación de Celulares**: Registro de recepción de equipos con marca, modelo, serie/IMEI, falla reportada, cambio de estados (`recibido` ➔ `en_diagnostico` ➔ `en_reparacion` ➔ `listo` ➔ `entregado` ➔ `cancelado`).
- 📦 **Control de Inventario y Servicios**: Catálogo de repuestos (pantallas, baterías, pines de carga) y servicios técnicos con **descuento automático de stock** al vincular repuestos a la reparación.
- 👥 **Gestión Completa de Usuarios (CRUD)**: Administradores, técnicos y clientes.
- 📊 **Dashboard y Estadísticas**: Métricas en tiempo real de equipos en taller, ingresos totales y alertas de bajo stock.
- 🗄️ **Base de Datos PostgreSQL Integrada con DBeaver**: Scripts SQL limpios para la creación de tablas, índices, claves foráneas y disparadores (triggers).

---

## 🚀 Guía de Configuración e Instalación

### 1. Requisitos Previos
- **Node.js** (v18 o superior)
- **PostgreSQL** instalado localmente o en un contenedor
- **DBeaver** (Administrador de base de datos)

---

### 2. Configurar la Base de Datos en DBeaver

1. Abre **DBeaver** y conéctate a tu servidor de PostgreSQL.
2. Crea una nueva base de datos llamada `techfix_db`:
   - Clic derecho en *Databases* ➔ *Create New Database* ➔ Nombre: `techfix_db`.
3. Abre una pestaña del **Editor SQL** en DBeaver sobre la base de datos `techfix_db`.
4. Abre y ejecuta el archivo [`database/schema.sql`](./database/schema.sql):
   - Presiona `Ctrl + Script` o el botón de ejecutar script completo (**Alt + X**).
   - *Esto creará las tablas `users`, `inventory`, `repair_orders` y `repair_items` junto a los índices y triggers.*
5. Abre y ejecuta el archivo [`database/seed.sql`](./database/seed.sql) para cargar los datos de prueba iniciales:
   - *Cargará usuarios de prueba con contraseñas encriptadas, repuestos en inventario y órdenes iniciales.*

---

### 3. Configurar Variables de Entorno (`.env`)

Revisa el archivo `.env` en la raíz del proyecto y ajusta las credenciales según tu instalación local de PostgreSQL:

```env
PORT=3000
NODE_ENV=development

# Configuración de PostgreSQL (coincidente con tu sesión en DBeaver)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=techfix_db

# Secreto JWT
JWT_SECRET=super_secret_techfix_jwt_key_2026
JWT_EXPIRES_IN=7d
```

---

### 4. Iniciar la API

Instala las dependencias y ejecuta el servidor de desarrollo:

```bash
# Iniciar en modo desarrollo con auto-reload
npm run dev

# O iniciar en modo producción
npm start
```

El servidor estará escuchando en `http://localhost:3000`.

---

## 🔑 Credenciales de Prueba Iniciales (Seed Data)

| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| 👑 **Admin** | `admin@techfix.com` | `admin123` | Acceso total a todas las funciones y usuarios. |
| 🛠️ **Técnico** | `tecnico@techfix.com` | `tecnico123` | Gestión de reparaciones, inventario y cambio de estados. |
| 👤 **Cliente** | `cliente@techfix.com` | `cliente123` | Consulta y registro de sus propios celulares a reparar. |

---

## 📌 Documentación de Endpoints (API Reference)

### 1. Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar nuevo usuario/cliente | Pública |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener Token JWT | Pública |
| `GET` | `/api/auth/me` | Obtener datos del usuario autenticado | Bearer Token |

#### Ejemplo payload Registro:
```json
{
  "name": "Pedro Gómez",
  "email": "pedro@gmail.com",
  "password": "mi_password_seguro",
  "phone": "+573009998877",
  "role": "customer"
}
```

---

### 2. Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/users` | Listar usuarios (Filtros: `role`, `q`) | `admin`, `technician` |
| `GET` | `/api/users/:id` | Obtener usuario por ID | `admin`, `technician` |
| `POST` | `/api/users` | Crear usuario con rol asignado | `admin` |
| `PUT` | `/api/users/:id` | Actualizar datos de usuario | `admin` |
| `DELETE` | `/api/users/:id` | Eliminar usuario | `admin` |

---

### 3. Inventario y Servicios (`/api/inventory`)

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/inventory` | Listar repuestos y servicios (Filtros: `type`, `q`) | Todos |
| `GET` | `/api/inventory/:id` | Detalle de ítem de inventario | Todos |
| `POST` | `/api/inventory` | Registrar repuesto o servicio | `admin`, `technician` |
| `PUT` | `/api/inventory/:id` | Actualizar precio o stock | `admin`, `technician` |
| `DELETE` | `/api/inventory/:id` | Eliminar del inventario | `admin` |

#### Ejemplo payload Creación de Repuesto:
```json
{
  "name": "Pantalla Samsung Galaxy S23 Ultra",
  "description": "Pantalla AMOLED 120Hz Original con marco",
  "type": "repuesto",
  "unit_price": 185.00,
  "stock": 8
}
```

---

### 4. Órdenes de Reparación (`/api/repairs`)

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/repairs` | Listar órdenes (Filtros: `status`, `q`, `customer_id`) | Todos (Filtrado según rol) |
| `GET` | `/api/repairs/:id` | Ver detalle completo de la orden con repuestos | Todos (Si le pertenece) |
| `POST` | `/api/repairs` | Registrar celular para reparación | Todos |
| `PUT` | `/api/repairs/:id` | Actualizar información técnica u observaciones | `admin`, `technician` |
| `PATCH` | `/api/repairs/:id/status` | Cambiar estado de reparación | `admin`, `technician` |
| `POST` | `/api/repairs/:id/items` | Añadir repuesto/servicio (Descuenta stock) | `admin`, `technician` |
| `DELETE` | `/api/repairs/:id/items/:itemId` | Quitar repuesto (Devuelve stock) | `admin`, `technician` |
| `DELETE` | `/api/repairs/:id` | Eliminar/Cancelar orden de reparación | `admin` |

#### Ejemplo de Creación de Orden de Reparación (`POST /api/repairs`):
```json
{
  "customer_id": 3,
  "technician_id": 2,
  "device_brand": "Apple",
  "device_model": "iPhone 14 Pro Max",
  "serial_imei": "354987123654987",
  "fault_description": "El celular cayó al agua y no enciende. Pantalla en negro.",
  "estimated_cost": 150.00,
  "repair_notes": "Ingresó sin tarjeta SIM. Tapa trasera rayada."
}
```

#### Ejemplo de Cambio de Estado (`PATCH /api/repairs/1/status`):
```json
{
  "status": "en_reparacion"
}
```

---

### 5. Dashboard (`/api/dashboard`)

| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Obtener conteo de órdenes, ingresos y stock bajo | `admin`, `technician` |

---

## 🧪 Pruebas de Funcionamiento

Puedes probar los endpoints directamente usando **Postman**, **ThunderClient** o comandos `curl`:

#### Ejemplo Login con cURL:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@techfix.com", "password": "admin123"}'
```

#### Ejemplo Consultar Reparaciones con Token JWT:
```bash
curl -X GET http://localhost:3000/api/repairs \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```
